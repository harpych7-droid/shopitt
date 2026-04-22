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
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-[54px] inset-x-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/40"
      aria-label="Categories"
    >
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 py-2 max-w-md mx-auto">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className="relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-cat"
                    className="absolute inset-0 rounded-full gradient-brand shadow-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute inset-0 rounded-full bg-muted/60" />
                )}
                <span className={`relative ${isActive ? "text-white" : "text-foreground/80"}`}>
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
