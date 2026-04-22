import { motion } from "framer-motion";
import { CATEGORIES } from "@/data/feed";

interface CategoryTabsProps {
  active: string;
  onChange: (cat: string) => void;
  hidden: boolean;
}

export const CategoryTabs = ({ active, onChange, hidden }: CategoryTabsProps) => {
  return (
    <motion.nav
      initial={false}
      animate={{ y: hidden ? -120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-[68px] inset-x-0 z-30"
    >
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 py-2 mx-auto max-w-md justify-start">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className="relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-cat"
                    className="absolute inset-0 rounded-full gradient-brand shadow-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${isActive ? "text-white" : "text-white/70"}`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
