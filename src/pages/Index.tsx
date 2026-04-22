import { useEffect, useMemo, useRef, useState } from "react";
import { TopNav } from "@/components/feed/TopNav";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { FeedCard } from "@/components/feed/FeedCard";
import { FloatingBag } from "@/components/feed/FloatingBag";
import { AuthModal } from "@/components/feed/AuthModal";
import { BagSheet } from "@/components/feed/BagSheet";
import { FEED } from "@/data/feed";
import { shopitt } from "@/store/useShopittStore";

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);
  const [navHidden, setNavHidden] = useState(false);
  const [category, setCategory] = useState<string>("For You");
  const [authOpen, setAuthOpen] = useState(false);
  const [authAction, setAuthAction] = useState<"like" | "save" | "buy" | "comment" | null>(null);
  const [bagOpen, setBagOpen] = useState(false);

  const items = useMemo(
    () => (category === "For You" ? FEED : FEED.filter((f) => f.category === category)),
    [category],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - lastScroll.current;
      if (Math.abs(delta) > 6) {
        setNavHidden(delta > 0 && y > 80);
        lastScroll.current = y;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Reset to top when category changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [category]);

  // SEO
  useEffect(() => {
    document.title = "Shopitt — The Social Commerce Feed for Drops You Crave";
    const desc =
      "Shopitt is the immersive social shopping feed. Discover drops, like, save, and buy in one tap.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + "/");
  }, []);

  const handleAuthRequired = (action: "like" | "save" | "buy" | "comment", itemId: string) => {
    shopitt.setPending({ type: action, itemId });
    setAuthAction(action);
    setAuthOpen(true);
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <TopNav hidden={navHidden} />
      <CategoryTabs active={category} onChange={setCategory} hidden={navHidden} />

      <h1 className="sr-only">Shopitt — Discover drops, shop instantly</h1>

      <div
        ref={scrollRef}
        className="feed-snap h-full w-full overflow-y-auto no-scrollbar"
      >
        {items.map((item, i) => (
          <FeedCard
            key={item.id}
            item={item}
            index={i}
            onAuthRequired={handleAuthRequired}
          />
        ))}
        {items.length === 0 && (
          <div className="h-[100dvh] flex items-center justify-center text-white/60 text-sm">
            No drops in this category yet.
          </div>
        )}
      </div>

      <FloatingBag onClick={() => setBagOpen(true)} />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        action={authAction}
      />
      <BagSheet open={bagOpen} onClose={() => setBagOpen(false)} />
    </main>
  );
};

export default Index;
