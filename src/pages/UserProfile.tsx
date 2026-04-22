import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, BadgeCheck, MoreHorizontal, MessageCircle, UserPlus, Grid3x3, PlayCircle, Bookmark, Sparkles, Plus } from "lucide-react";
import { BottomNav } from "@/components/feed/BottomNav";
import { FEED } from "@/data/feed";

type Tab = "posts" | "shorts" | "saved";

const UserProfile = () => {
  const { handle } = useParams();
  const username = handle ?? "you_shopitt";
  const isSelf = !handle;
  const [tab, setTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(false);

  // Map: if viewing a brand handle, show their items. Otherwise (self), show empty to demo CTA.
  const posts = useMemo(() => {
    if (isSelf) return [];
    return FEED.filter((f) => f.brandHandle === handle);
  }, [handle, isSelf]);

  const shorts = useMemo(() => (isSelf ? [] : posts.slice(0, 2)), [isSelf, posts]);
  const saved = useMemo(() => FEED.slice(0, isSelf ? 0 : 3), [isSelf]);

  const displayName = isSelf ? "Your Profile" : posts[0]?.brand ?? username;
  const location = isSelf ? "Lusaka, Zambia" : posts[0]?.location ?? "Lusaka";
  const stats = {
    posts: isSelf ? 0 : posts.length || 24,
    followers: isSelf ? 12 : 18420,
    following: isSelf ? 38 : 312,
  };

  useEffect(() => {
    document.title = `@${username} — Shopitt`;
  }, [username]);

  const tabItems = tab === "posts" ? posts : tab === "shorts" ? shorts : saved;

  return (
    <main className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="Back" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-base font-bold truncate">@{username}</h1>
            <BadgeCheck className="h-4 w-4 text-brand-purple fill-brand-purple/20 shrink-0" />
          </div>
          <button aria-label="More" className="h-9 w-9 rounded-full hover:bg-muted/50 flex items-center justify-center">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pb-32">
        {/* PROFILE HEADER */}
        <section className="pt-6">
          <div className="flex items-start gap-4">
            <button
              aria-label="View avatar"
              className="relative shrink-0 active:scale-95 transition-transform"
            >
              <span className="absolute -inset-1 rounded-full gradient-brand animate-glow-pulse" />
              <span className="relative block h-20 w-20 rounded-full bg-background p-[3px]">
                <span className="block h-full w-full rounded-full gradient-brand flex items-center justify-center text-2xl font-black text-white">
                  {displayName[0].toUpperCase()}
                </span>
              </span>
            </button>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-3 gap-2 pt-1">
              {[
                { label: "Posts", value: stats.posts },
                { label: "Followers", value: stats.followers },
                { label: "Following", value: stats.following },
              ].map((s) => (
                <button key={s.label} className="text-center active:scale-95 transition-transform">
                  <div className="text-lg font-extrabold text-foreground tabular-nums">
                    {s.value >= 1000 ? (s.value / 1000).toFixed(1) + "k" : s.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name + bio */}
          <div className="mt-4">
            <h2 className="text-base font-bold text-foreground">{displayName}</h2>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-brand-pink" />
              <span>{location}</span>
            </div>
            <p className="mt-2 text-sm text-foreground/85 leading-snug">
              {isSelf
                ? "Curating drops you crave 🔥 Tap edit to add your bio."
                : "Curated drops · Free delivery in 24h · DM for collabs ✨"}
            </p>
          </div>

          {/* Action row */}
          <div className="mt-4 flex items-center gap-2">
            {isSelf ? (
              <>
                <Link
                  to="/menu"
                  className="flex-1 h-10 rounded-full bg-card border border-border/60 text-sm font-bold flex items-center justify-center hover:bg-muted/40 transition-colors"
                >
                  Edit profile
                </Link>
                <Link
                  to="/seller"
                  className="flex-1 h-10 rounded-full gradient-brand shadow-brand text-sm font-bold text-white flex items-center justify-center"
                >
                  Seller dashboard
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFollowing((v) => !v)}
                  className={`flex-1 h-10 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    following
                      ? "bg-card border border-border/60 text-foreground"
                      : "gradient-brand text-white shadow-brand"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  {following ? "Following" : "Follow"}
                </button>
                <Link
                  to={`/chats/${username}`}
                  className="flex-1 h-10 rounded-full bg-card border border-border/60 text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-muted/40 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              </>
            )}
          </div>
        </section>

        {/* TABS */}
        <div className="mt-6 sticky top-[57px] z-30 bg-background/90 backdrop-blur-xl -mx-4 px-4">
          <div className="grid grid-cols-3 border-b border-border/60">
            {[
              { key: "posts" as const, icon: Grid3x3, label: "Posts" },
              { key: "shorts" as const, icon: PlayCircle, label: "Shorts" },
              { key: "saved" as const, icon: Bookmark, label: "Saved" },
            ].map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="relative flex items-center justify-center gap-1.5 py-3 text-sm font-semibold"
                >
                  <t.icon className={`h-4 w-4 ${active ? "text-brand-pink" : "text-muted-foreground"}`} />
                  <span className={active ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
                  {active && (
                    <motion.span
                      layoutId="profile-tab-underline"
                      className="absolute -bottom-px inset-x-3 h-[2px] gradient-brand rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <section className="mt-3">
          {tabItems.length === 0 ? (
            <EmptyState tab={tab} isSelf={isSelf} />
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {tabItems.map((p) => (
                <Link
                  key={p.id}
                  to={`/p/${p.id}`}
                  className="relative aspect-square overflow-hidden bg-muted active:opacity-80 transition-opacity"
                >
                  <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                  {tab === "shorts" && (
                    <span className="absolute top-1.5 right-1.5">
                      <PlayCircle className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow">
                    {p.currency}
                    {p.price}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
};

const EmptyState = ({ tab, isSelf }: { tab: Tab; isSelf: boolean }) => {
  const copy =
    tab === "posts"
      ? { title: "Start your first drop 🔥", desc: "Post a product or short and watch buyers come to you.", cta: "Create post", to: "/create" }
      : tab === "shorts"
      ? { title: "Your stage awaits 🎬", desc: "Post a 9:16 short — Shorts convert 3x faster.", cta: "Record a short", to: "/create" }
      : { title: "Save your obsessions ✨", desc: "Tap the bookmark on any drop to keep it here.", cta: "Discover feed", to: "/" };

  return (
    <div className="pt-6">
      {/* Animated placeholder grid */}
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
            className="aspect-square rounded-md bg-gradient-to-br from-muted to-muted/40 border border-border/40"
          />
        ))}
      </div>

      {/* CTA card overlapping */}
      <div className="-mt-24 relative z-10 px-4">
        <div className="glass rounded-3xl p-6 text-center shadow-soft">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand shadow-brand mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </span>
          <h3 className="text-lg font-extrabold text-foreground tracking-tight">{copy.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-snug">
            {isSelf ? copy.desc : "This profile hasn't posted here yet."}
          </p>
          <Link
            to={copy.to}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-brand active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
            {copy.cta}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
