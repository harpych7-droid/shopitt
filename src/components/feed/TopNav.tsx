import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";

interface TopNavProps {
  hidden: boolean;
}

export const TopNav = ({ hidden }: TopNavProps) => {
  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-40 px-4 pt-3"
    >
      <div className="glass-dark rounded-full flex items-center justify-between px-4 py-2.5 mx-auto max-w-md">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-[10px] font-black text-white">
            S
          </div>
          <span className="font-bold tracking-tight text-base">
            shop<span className="text-gradient-brand">itt</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-9 w-9 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center" aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center relative" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-pink animate-pulse-soft" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center" aria-label="Profile">
            <User className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};
