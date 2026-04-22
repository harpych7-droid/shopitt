import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MessageCircle, Sparkles, Pencil } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";

interface Conversation {
  handle: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  online?: boolean;
}

const CHATS: Conversation[] = [
  { handle: "maisonnoir", name: "Maison Noir", preview: "We just dropped the cashmere — want first pick? 🔥", time: "2m", unread: 2, online: true },
  { handle: "voltathletic", name: "Volt Athletic", preview: "Magenta Fade restock lands tomorrow.", time: "1h", unread: 1 },
  { handle: "aureaskin", name: "Aurea Skin", preview: "Your serum shipped. Tracking sent ✨", time: "3h", unread: 0 },
  { handle: "atelierrouge", name: "Atelier Rouge", preview: "Only 2 totes left in your size.", time: "1d", unread: 0 },
  { handle: "echoaudio", name: "Echo Audio", preview: "Thanks for the order! Enjoy the Halo Pro.", time: "2d", unread: 0 },
];

const Chats = () => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = "Chats — Shopitt";
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHATS;
    return CHATS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <main className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Chats</h1>
          <button aria-label="New message" className="h-9 w-9 rounded-full gradient-brand shadow-brand flex items-center justify-center">
            <Pencil className="h-4 w-4 text-white" />
          </button>
        </div>
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-muted/60 border border-border/60 px-4 h-10">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats, sellers, drops"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto pb-32">
        {filtered.length > 0 ? (
          <ul className="px-2 pt-2">
            {filtered.map((c) => (
              <li key={c.handle}>
                <Link
                  to={`/chats/${c.handle}`}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors"
                >
                  <span className="relative shrink-0">
                    <span className="absolute -inset-0.5 rounded-full gradient-brand" />
                    <span className="relative block h-12 w-12 rounded-full bg-background p-[2px]">
                      <span className="block h-full w-full rounded-full gradient-brand flex items-center justify-center text-sm font-black text-white">
                        {c.name[0]}
                      </span>
                    </span>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-xs truncate ${c.unread ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                        {c.preview}
                      </p>
                      {c.unread > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full gradient-brand text-[10px] font-extrabold text-white flex items-center justify-center shadow-brand">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyChats />
        )}
      </div>

      <BottomNav />
    </main>
  );
};

const EmptyChats = () => (
  <div className="px-6 pt-16 text-center">
    <div className="relative mx-auto h-32 w-32">
      <motion.span
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-brand-pink/30 blur-2xl"
      />
      <motion.span
        animate={{ scale: [1.05, 0.95, 1.05] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-3 rounded-full bg-brand-purple/30 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-full w-full rounded-3xl gradient-brand shadow-brand flex items-center justify-center"
      >
        <MessageCircle className="h-12 w-12 text-white" />
      </motion.div>
    </div>

    <h2 className="mt-6 text-xl font-extrabold tracking-tight">No chats yet</h2>
    <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
      Start exploring products 🔥 Sellers reply fast — usually within an hour.
    </p>
    <Link
      to="/"
      className="mt-5 inline-flex items-center gap-1.5 rounded-full gradient-brand px-5 py-3 text-sm font-bold text-white shadow-brand active:scale-95 transition-transform"
    >
      <Sparkles className="h-4 w-4" />
      Discover Shopitt Feed
    </Link>
  </div>
);

export default Chats;
