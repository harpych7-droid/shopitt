import { useEffect, useMemo, useRef, useState } from "react";
import { TopNav } from "@/components/feed/TopNav";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { HomeFeedCard } from "@/components/feed/HomeFeedCard";
import { FloatingBag } from "@/components/feed/FloatingBag";
import { AuthModal } from "@/components/feed/AuthModal";
import { BagSheet } from "@/components/feed/BagSheet";
import { BottomNav } from "@/components/feed/BottomNav";
import { FEED, CATEGORY_MAP } from "@/data/feed";
import { shopitt } from "@/store/useShopittStore";

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);
  const [navHidden, setNavHidden] = useState(false);
  const [category, setCategory] = useState<string>("All");
  const [authOpen, setAuthOpen] = useState(false);
  const [authAction, setAuthAction] = useState<"like" | "save" | "buy" | "comment" | null>(null);
  const [bagOpen, setBagOpen] = useState(false);

  const items = useMemo(() => {
    const allowed = CATEGORY_MAP[category];
    if (!allowed) return FEED;
    return FEED.filter((f) => allowed.includes(f.category));
  }, [category]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - lastScroll.current;
      if (Math.abs(delta) > 8) {
        setNavHidden(delta > 0 && y > 80);
        lastScroll.current = y;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [category]);

  useEffect(() => {
    document.title = "Shopitt — Shop Drops You Crave";
    const desc = "Shopitt is the social commerce feed for drops you crave. Discover, like, save and buy in one tap.";
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
    <main className="relative min-h-[100dvh] w-full bg-background">
      <TopNav hidden={navHidden} />
      <CategoryTabs active={category} onChange={setCategory} hidden={navHidden} />

      <h1 className="sr-only">Shopitt — Discover drops, shop instantly</h1>

      <div
        ref={scrollRef}
        className="h-[100dvh] w-full overflow-y-auto no-scrollbar"
      >
        {/* Spacer for fixed top nav (54px) + category tabs (~48px) */}
        <div className="h-[108px]" />
        <div className="max-w-md mx-auto pb-28">
          {items.map((item, i) => (
            <HomeFeedCard
              key={item.id}
              item={item}
              index={i}
              onAuthRequired={handleAuthRequired}
            />
          ))}
          {items.length === 0 && (
            <div className="py-20 text-center text-muted-foreground text-sm">
              No drops in this category yet.
            </div>
          )}
        </div>
      </div>

      <FloatingBag onClick={() => setBagOpen(true)} bottomOffset={84} side="left" />
      <BottomNav />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} action={authAction} />
      <BagSheet open={bagOpen} onClose={() => setBagOpen(false)} />
    </main>
  );
};

export default Index;
