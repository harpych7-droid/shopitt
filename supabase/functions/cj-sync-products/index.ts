import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

async function getCjAccessToken(apiKey: string): Promise<string> {
  // CJ requires email + apiKey to authenticate. The pasted credential is in the
  // form "<email>@<apiKey>". We split on the LAST '@' so the email keeps its '@'.
  const at = apiKey.lastIndexOf("@");
  if (at === -1) {
    throw new Error(
      "CJ_API_KEY must be in the form '<email>@<apiKey>' (got a value without '@').",
    );
  }
  const email = apiKey.slice(0, at);
  const password = apiKey.slice(at + 1);

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let payload: any = {};
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`CJ auth: non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
  const token = payload?.data?.accessToken;
  if (!res.ok || !token) {
    throw new Error(
      `CJ auth failed: status=${res.status} message=${payload?.message ?? "unknown"}`,
    );
  }
  return token as string;
}

async function fetchCjProducts(token: string, pageSize = 20): Promise<any[]> {
  const url = `${CJ_BASE}/product/list?pageNum=1&pageSize=${pageSize}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "CJ-Access-Token": token, "Content-Type": "application/json" },
  });
  const text = await res.text();
  let payload: any = {};
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`CJ list: non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || payload?.result === false) {
    throw new Error(
      `CJ list failed: status=${res.status} message=${payload?.message ?? "unknown"}`,
    );
  }
  const list = payload?.data?.list ?? payload?.data?.content ?? [];
  if (!Array.isArray(list)) {
    throw new Error(`CJ list: unexpected shape, no array at data.list`);
  }
  return list;
}

function transform(systemProfileId: string, raw: any[]) {
  return raw
    .map((p) => {
      const sourceId = String(p?.pid ?? p?.productId ?? p?.id ?? "").trim();
      const title = String(p?.productNameEn ?? p?.productName ?? "").trim();
      const image =
        (typeof p?.productImage === "string" && p.productImage) ||
        (Array.isArray(p?.productImageSet) && p.productImageSet[0]) ||
        (Array.isArray(p?.productImage) && p.productImage[0]) ||
        null;
      const priceRaw = p?.sellPrice ?? p?.productPrice ?? p?.price ?? 0;
      const price = Number(String(priceRaw).split(/[-~]/)[0]) || 0;

      if (!sourceId || !title || !image) return null;

      return {
        seller_id: systemProfileId,
        title: title.slice(0, 500),
        description: String(p?.description ?? "").slice(0, 4000),
        image_url: image,
        price_usd: price,
        source: "cj",
        source_id: sourceId,
        is_system: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const steps: Record<string, unknown> = {};
  try {
    const CJ_API_KEY = Deno.env.get("CJ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SYSTEM_PROFILE_ID = Deno.env.get("SHOPITT_SYSTEM_PROFILE_ID");

    const missing = [
      ["CJ_API_KEY", CJ_API_KEY],
      ["SUPABASE_URL", SUPABASE_URL],
      ["SUPABASE_SERVICE_ROLE_KEY", SERVICE_ROLE],
      ["SHOPITT_SYSTEM_PROFILE_ID", SYSTEM_PROFILE_ID],
    ].filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return json(500, { success: false, error: `Missing env: ${missing.join(", ")}` });
    }

    // 1) Auth
    const token = await getCjAccessToken(CJ_API_KEY!);
    steps.auth = { ok: true, tokenPreview: token.slice(0, 8) + "..." };

    // 2) Fetch
    const raw = await fetchCjProducts(token, 20);
    steps.fetch = { ok: true, count: raw.length };
    if (raw.length === 0) {
      return json(502, { success: false, error: "CJ returned 0 products", steps });
    }

    // 3) Transform
    const rows = transform(SYSTEM_PROFILE_ID!, raw);
    steps.transform = { ok: true, count: rows.length, sample: rows[0] };
    if (rows.length === 0) {
      return json(502, { success: false, error: "Transform produced 0 valid rows", steps });
    }

    // 4) Insert (upsert on source+source_id)
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "source,source_id" })
      .select("id, source_id");

    if (error) {
      steps.insert = { ok: false, error: error.message };
      return json(500, { success: false, error: error.message, steps });
    }
    steps.insert = { ok: true, inserted: data?.length ?? 0 };

    return json(200, { success: true, steps });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[cj-sync-products] error:", msg);
    return json(500, { success: false, error: msg, steps });
  }
});
