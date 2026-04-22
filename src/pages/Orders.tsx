import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, Globe, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";
import { FEED } from "@/data/feed";

type Status = "pending" | "processing" | "shipped" | "delivered";
type DeliveryType = "international" | "country" | "local";

interface Order {
  id: string;
  productId: string;
  status: Status;
  delivery: DeliveryType;
  placedAgo: string;
  etaDays: number;
}

// Demo orders mapped to real feed products
const ORDERS: Order[] = [
  { id: "o-1024", productId: "p6", status: "shipped", delivery: "country", placedAgo: "2d ago", etaDays: 1 },
  { id: "o-1023", productId: "p2", status: "shipped", delivery: "local", placedAgo: "3d ago", etaDays: 0 },
  { id: "o-1022", productId: "p5", status: "processing", delivery: "international", placedAgo: "1d ago", etaDays: 9 },
  { id: "o-1021", productId: "p1", status: "pending", delivery: "country", placedAgo: "4h ago", etaDays: 3 },
  { id: "o-1019", productId: "p4", status: "delivered", delivery: "local", placedAgo: "12d ago", etaDays: 0 },
  { id: "o-1018", productId: "p3", status: "delivered", delivery: "country", placedAgo: "18d ago", etaDays: 0 },
];

const TABS: { key: Status | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-warning/15 text-warning",
  processing: "bg-brand-purple/15 text-brand-purple",
  shipped: "bg-brand-pink/15 text-brand-pink",
  delivered: "bg-success/15 text-success",
};

const DELIVERY_META: Record<DeliveryType, { icon: typeof Globe; label: string }> = {
  international: { icon: Globe, label: "International" },
  country: { icon: Truck, label: "Country-wide" },
  local: { icon: MapPin, label: "Local" },
};

const Orders = () => {
  const [tab, setTab] = useState<Status>("pending");

  useEffect(() => {
    document.title = "Orders — Shopitt";
  }, []);

  const items = useMemo(() => ORDERS.filter((o) => o.status === tab), [tab]);

  return (
    <main className="min-h-[100dvh] bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Orders</h1>
          <span className="h-9 w-9" />
        </div>

        {/* Tabs */}
        <div className="max-w-md mx-auto px-2 pb-2 overflow-x-auto no-scrollbar">
          <div className="relative flex gap-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as Status)}
                  className={`relative shrink-0 px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                    active ? "text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="orders-tab-pill"
                      className="absolute inset-0 rounded-full gradient-brand shadow-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyOrders status={tab} />
        ) : (
          items.map((o, i) => <OrderCard key={o.id} order={o} index={i} />)
        )}
      </div>

      <BottomNav />
    </main>
  );
};

const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const product = FEED.find((p) => p.id === order.productId) ?? FEED[0];
  const D = DELIVERY_META[order.delivery];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl bg-card border border-border/60 overflow-hidden"
    >
      <div className="flex gap-3 p-3">
        <Link
          to={`/p/${product.id}`}
          className="h-20 w-20 rounded-2xl overflow-hidden bg-muted shrink-0"
        >
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold truncate">{product.title}</p>
            <span
              className={`shrink-0 text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            #{order.id} · {order.placedAgo}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-foreground">
              <D.icon className="h-3 w-3 text-brand-pink" />
              {D.label}
            </span>
            {order.etaDays > 0 && (
              <span className="text-muted-foreground">ETA {order.etaDays}d</span>
            )}
          </div>
        </div>
      </div>

      {/* Tracking preview */}
      <div className="px-3 pb-3">
        <TrackingPreview status={order.status} />
        <Link
          to={`/orders/${order.id}`}
          className="mt-3 w-full h-10 rounded-full gradient-brand shadow-brand text-xs font-extrabold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          Track Order <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};

const TrackingPreview = ({ status }: { status: Status }) => {
  const steps: Status[] = ["pending", "processing", "shipped", "delivered"];
  const currentIdx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => {
        const reached = i <= currentIdx;
        return (
          <div key={s} className="flex-1 flex items-center gap-1.5">
            <span
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                reached ? "gradient-brand" : "bg-muted/60"
              }`}
            />
            {i < steps.length - 1 && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${reached ? "bg-brand-pink" : "bg-muted/60"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const EmptyOrders = ({ status }: { status: Status }) => (
  <div className="rounded-3xl glass p-6 text-center">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand shadow-brand">
      <Package className="h-6 w-6 text-white" />
    </span>
    <h3 className="mt-3 text-base font-extrabold">No {status} orders</h3>
    <p className="mt-1 text-xs text-muted-foreground">
      Discover new drops and your future orders will land here.
    </p>
    <Link
      to="/"
      className="mt-4 inline-flex items-center gap-1.5 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-brand active:scale-95 transition-transform"
    >
      <Sparkles className="h-4 w-4" />
      Discover Shopitt feed
    </Link>
  </div>
);

export default Orders;
