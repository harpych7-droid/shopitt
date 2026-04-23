import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jcjarvyyubsoxbhuajdx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QDV6C1bCml2wi3zQjA5lxQ_RfGMi66m";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
