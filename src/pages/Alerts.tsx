import { useEffect } from "react";
import { Bell, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";

const NOTIFS = [
  { icon: Sparkles, title: "New drop from @maisonnoir", desc: "Winter Capsule just landed — shop before it's gone.", time: "2m" },
  { icon: Heart, title: "lusaka_drip liked your save", desc: "AirGlide 2 — Magenta Fade", time: "1h" },
  { icon: ShoppingBag, title: "Order shipped", desc: "Halo Pro ANC Headphones — arriving in 24h", time: "3h" },
  { icon: Bell, title: "Restock alert", desc: "Bordeaux Mini Tote is back in stock.", time: "1d" },
];

const Alerts = () => {
  useEffect(() => {
    document.title = "Alerts — Shopitt";
  }, []);

  return (
    <main className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <span className="rounded-full gradient-brand px-4 py-1.5 text-sm font-extrabold text-white shadow-brand">
            Shopitt
          </span>
          <h1 className="text-base font-bold">Alerts</h1>
          <span className="w-[88px]" />
        </div>
      </header>

      <ul className="max-w-md mx-auto px-4 pt-4 pb-32 space-y-2">
        {NOTIFS.map((n, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-2xl bg-card border border-border/60 p-4"
          >
            <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
              <n.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <BottomNav />
    </main>
  );
};

export default Alerts;
