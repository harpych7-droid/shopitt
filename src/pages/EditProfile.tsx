import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";
import { toast } from "sonner";

const EditProfile = () => {
  const [form, setForm] = useState({
    name: "Your Name",
    handle: "you_shopitt",
    bio: "Curating drops you crave 🔥",
    location: "Lusaka, Zambia",
    website: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Edit profile — Shopitt";
  }, []);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
    }, 500);
  };

  return (
    <main className="min-h-[100dvh] bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/menu" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Edit profile</h1>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full gradient-brand text-white text-xs font-extrabold px-4 h-9 shadow-brand inline-flex items-center gap-1 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Saving" : "Save"}
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Avatar */}
        <section className="flex flex-col items-center gap-3">
          <button className="relative h-24 w-24 rounded-full active:scale-95 transition-transform">
            <span className="absolute -inset-1 rounded-full gradient-brand" />
            <span className="relative block h-full w-full rounded-full bg-background p-[3px]">
              <span className="block h-full w-full rounded-full gradient-brand flex items-center justify-center text-3xl font-black text-white">
                {form.name[0].toUpperCase()}
              </span>
            </span>
            <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center border-4 border-background">
              <Camera className="h-3.5 w-3.5" />
            </span>
          </button>
          <button className="text-xs font-bold text-brand-pink">Change profile photo</button>
        </section>

        {/* Form */}
        <section className="space-y-3">
          {[
            { k: "name" as const, label: "Display name", type: "text" },
            { k: "handle" as const, label: "Username", type: "text", prefix: "@" },
            { k: "bio" as const, label: "Bio", type: "textarea" },
            { k: "location" as const, label: "Location", type: "text" },
            { k: "website" as const, label: "Website", type: "url", placeholder: "https://" },
          ].map((field) => (
            <div key={field.k} className="rounded-2xl bg-card border border-border/60 px-4 py-3">
              <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground">
                {field.label}
              </label>
              <div className="flex items-center gap-1 mt-1">
                {field.prefix && <span className="text-sm font-bold text-muted-foreground">{field.prefix}</span>}
                {field.type === "textarea" ? (
                  <textarea
                    value={form[field.k]}
                    onChange={(e) => update(field.k, e.target.value)}
                    rows={3}
                    className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={form[field.k]}
                    placeholder={field.placeholder}
                    onChange={(e) => update(field.k, e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                )}
              </div>
            </div>
          ))}
        </section>

        <Link
          to="/country"
          className="flex items-center justify-between rounded-2xl bg-card border border-border/60 px-4 py-3.5"
        >
          <span className="text-sm font-semibold">Country</span>
          <span className="text-sm text-muted-foreground">Zambia →</span>
        </Link>
      </div>

      <BottomNav />
    </main>
  );
};

export default EditProfile;
