import { motion } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface TopNavProps {
  hidden: boolean;
}

export const TopNav = ({ hidden }: TopNavProps) => {
  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? -90 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40"
    >
      <div className="grid grid-cols-3 items-center px-4 py-2.5 max-w-md mx-auto">
        {/* LEFT — Shopitt logo → Home */}
        <div className="flex justify-start">
          <Link to="/" aria-label="Shopitt home" className="inline-flex">
            <span className="rounded-full gradient-brand px-4 py-1.5 text-base font-extrabold text-white tracking-tight shadow-brand">
              Shopitt
            </span>
          </Link>
        </div>

        {/* CENTER — Search → /search */}
        <div className="flex justify-center">
          <Link
            to="/search"
            aria-label="Search Shopitt"
            className="h-10 w-10 rounded-full bg-muted/40 hover:bg-muted/60 transition-colors flex items-center justify-center"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Link>
        </div>

        {/* RIGHT — Chat ONLY → /chats (notification icon removed) */}
        <div className="flex justify-end">
          <Link
            to="/chats"
            aria-label="Messages"
            className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center relative"
          >
            <MessageCircle className="h-5 w-5 text-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-pink animate-pulse-soft" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
};
