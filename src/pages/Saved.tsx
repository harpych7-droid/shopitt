import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";
import { FEED } from "@/data/feed";
import { useShopitt } from "@/store/useShopittStore";

const Saved = () => {
  const savedIds = useShopitt((s) => s.saved);
  const items = useMemo(
    () => FEED.filter((f) => savedIds.has(f.id)),
    [savedIds],
  );

  useEffect(() => {
    document.title = "Saved items — Shopitt";
  }, []);

  // Curated "you might love" suggestions if empty
  const suggestions = FEED.slice(0, 4);

  return (
    <main className="min-h-[100dvh] bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/menu" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Saved</h1>
          <span className="h-9 w-9" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4">
        {items.length === 0 ? (
          <>
            <div className="rounded-3xl glass p-6 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand shadow-brand">
                <Bookmark className="h-6 w-6 text-white" />
              </span>
              <h3 className="mt-3 text-base font-extrabold">Save your obsessions ✨</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the bookmark on any drop to keep it here.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-brand active:scale-95 transition-transform"
              >
                <Sparkles className="h-4 w-4" />
                Discover feed
              </Link>
            </div>

            <h2 className="mt-6 text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground mb-2">
              You might love
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  to={`/p/${p.id}`}
                  className="rounded-2xl overflow-hidden bg-card border border-border/60 active:scale-95 transition-transform"
                >
                  <div className="aspect-[4/5] bg-muted">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold truncate">{p.title}</p>
                    <p className="text-sm font-extrabold tabular-nums mt-0.5">
                      {p.currency}{p.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p) => (
              <Link
                key={p.id}
                to={`/p/${p.id}`}
                className="rounded-2xl overflow-hidden bg-card border border-border/60 active:scale-95 transition-transform"
              >
                <div className="aspect-[4/5] bg-muted">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold truncate">{p.title}</p>
                  <p className="text-sm font-extrabold tabular-nums mt-0.5">
                    {p.currency}{p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
};

export default Saved;
