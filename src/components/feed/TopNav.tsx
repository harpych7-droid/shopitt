import { motion } from "framer-motion";
import { Search, Bell, Menu } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 py-2.5 max-w-md mx-auto">
        <Link to="/" aria-label="Shopitt home" className="inline-flex">
          <span className="rounded-full gradient-brand px-4 py-1.5 text-base font-extrabold text-white tracking-tight shadow-brand">
            Shopitt
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/chats" className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center" aria-label="Chats">
            <Search className="h-5 w-5 text-foreground" />
          </Link>
          <Link to="/alerts" className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-pink animate-pulse-soft" />
          </Link>
          <Link to="/menu" className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center" aria-label="Menu">
            <Menu className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
};
