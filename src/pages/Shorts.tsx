import { useEffect, useState } from "react";
import { FeedCard } from "@/components/feed/FeedCard";
import { FloatingBag } from "@/components/feed/FloatingBag";
import { AuthModal } from "@/components/feed/AuthModal";
import { BagSheet } from "@/components/feed/BagSheet";
import { BottomNav } from "@/components/feed/BottomNav";
import { FEED } from "@/data/feed";
import { shopitt } from "@/store/useShopittStore";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Shorts = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authAction, setAuthAction] = useState<"like" | "save" | "buy" | "comment" | null>(null);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    document.title = "Shopitt Shorts — Vertical Drops";
  }, []);

  const handleAuthRequired = (action: "like" | "save" | "buy" | "comment", itemId: string) => {
    shopitt.setPending({ type: action, itemId });
    setAuthAction(action);
    setAuthOpen(true);
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Minimal Shorts top bar */}
      <header className="absolute top-0 inset-x-0 z-40 px-4 pt-3 flex items-center justify-between">
        <Link
          to="/"
          aria-label="Back"
          className="h-9 w-9 rounded-full glass-dark flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <span className="text-white font-bold tracking-tight">Shorts</span>
        <span className="h-9 w-9" />
      </header>

      <h1 className="sr-only">Shopitt Shorts</h1>

      <div className="feed-snap h-full w-full overflow-y-auto no-scrollbar">
        {FEED.map((item, i) => (
          <FeedCard
            key={item.id}
            item={item}
            index={i}
            onAuthRequired={handleAuthRequired}
          />
        ))}
      </div>

      {/* Bag in bottom-right safe zone, BELOW the right-side action stack (which sits at bottom-32) */}
      <FloatingBag onClick={() => setBagOpen(true)} bottomOffset={88} side="right" />

      <BottomNav />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} action={authAction} />
      <BagSheet open={bagOpen} onClose={() => setBagOpen(false)} />
    </main>
  );
};

export default Shorts;
