import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, Image as ImageIcon, Send, ShoppingBag, BadgeCheck } from "lucide-react";
import { FEED } from "@/data/feed";

type Msg =
  | { id: string; from: "me" | "them"; kind: "text"; text: string; time: string }
  | { id: string; from: "me" | "them"; kind: "image"; src: string; time: string }
  | { id: string; from: "me" | "them"; kind: "product"; productId: string; time: string };

const ChatThread = () => {
  const { handle = "maisonnoir" } = useParams();
  const product = FEED.find((f) => f.brandHandle === handle) ?? FEED[0];
  const sellerName = product.brand;

  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", from: "them", kind: "text", text: `Hey! Welcome to ${sellerName} 👋`, time: "10:02" },
    { id: "2", from: "them", kind: "product", productId: product.id, time: "10:02" },
    { id: "3", from: "them", kind: "text", text: "This one's selling fast — only a few left in your size.", time: "10:03" },
    { id: "4", from: "me", kind: "text", text: "Looks 🔥 — does it ship to Lusaka in 24h?", time: "10:05" },
    { id: "5", from: "them", kind: "text", text: "Yes! Free delivery in 24h within Lusaka.", time: "10:06" },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `Chat with @${handle} — Shopitt`;
  }, [handle]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), from: "me", kind: "text", text, time: "now" },
    ]);
    setDraft("");
  };

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link to="/chats" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link to={`/u/${handle}`} className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="relative shrink-0">
              <span className="absolute -inset-0.5 rounded-full gradient-brand" />
              <span className="relative block h-9 w-9 rounded-full bg-background p-[2px]">
                <span className="block h-full w-full rounded-full gradient-brand flex items-center justify-center text-xs font-black text-white">
                  {sellerName[0]}
                </span>
              </span>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-foreground truncate">{sellerName}</p>
                <BadgeCheck className="h-3.5 w-3.5 text-brand-purple fill-brand-purple/20" />
              </div>
              <p className="text-[11px] text-success font-semibold">Active now</p>
            </div>
          </Link>
          <button aria-label="Call" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <Phone className="h-4 w-4" />
          </button>
          <button aria-label="Video" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <Video className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="text-center">
            <span className="text-[11px] text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
              Today
            </span>
          </div>

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              {m.kind === "text" && (
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                    m.from === "me"
                      ? "gradient-brand text-white rounded-br-md shadow-brand"
                      : "bg-card border border-border/60 text-foreground rounded-bl-md"
                  }`}
                >
                  {m.text}
                  <span className={`ml-2 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </span>
                </div>
              )}

              {m.kind === "image" && (
                <div className="max-w-[60%] rounded-2xl overflow-hidden border border-border/60">
                  <img src={m.src} alt="shared" className="w-full h-auto" />
                </div>
              )}

              {m.kind === "product" && <ProductShareCard productId={m.productId} fromMe={m.from === "me"} />}
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60 safe-bottom">
        <div className="max-w-md mx-auto px-3 py-2.5 flex items-center gap-2">
          <button aria-label="Send image" className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
            <ImageIcon className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 flex items-center rounded-full bg-muted/60 border border-border/60 px-4 h-11">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={send}
            aria-label="Send"
            disabled={!draft.trim()}
            className="h-10 w-10 rounded-full gradient-brand shadow-brand flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </main>
  );
};

const ProductShareCard = ({ productId, fromMe }: { productId: string; fromMe: boolean }) => {
  const product = FEED.find((f) => f.id === productId);
  if (!product) return null;
  return (
    <Link
      to={`/p/${product.id}`}
      className={`max-w-[80%] rounded-2xl overflow-hidden border border-border/60 bg-card ${
        fromMe ? "rounded-br-md" : "rounded-bl-md"
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <img src={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute top-2 left-2 glass-dark rounded-full px-2.5 py-1 text-[10px] font-bold text-white">
          {product.drop}
        </span>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-bold text-foreground line-clamp-1">{product.title}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-extrabold text-foreground">
            {product.currency}
            {product.price}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full gradient-brand px-3 py-1 text-[11px] font-bold text-white shadow-brand">
            <ShoppingBag className="h-3 w-3" /> View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ChatThread;
