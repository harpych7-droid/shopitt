import { useSyncExternalStore } from "react";
import type { FeedItem } from "@/data/feed";

type State = {
  liked: Set<string>;
  saved: Set<string>;
  bag: { item: FeedItem; qty: number }[];
  authed: boolean;
  pendingAction: null | { type: "like" | "save" | "buy" | "comment"; itemId?: string };
};

let state: State = {
  liked: new Set(),
  saved: new Set(),
  bag: [],
  authed: false,
  pendingAction: null,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const set = (updater: (s: State) => State) => {
  state = updater(state);
  emit();
};

export const shopitt = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get() {
    return state;
  },
  toggleLike(id: string) {
    set((s) => {
      const liked = new Set(s.liked);
      liked.has(id) ? liked.delete(id) : liked.add(id);
      return { ...s, liked };
    });
  },
  toggleSave(id: string) {
    set((s) => {
      const saved = new Set(s.saved);
      saved.has(id) ? saved.delete(id) : saved.add(id);
      return { ...s, saved };
    });
  },
  addToBag(item: FeedItem) {
    set((s) => {
      const existing = s.bag.find((b) => b.item.id === item.id);
      const bag = existing
        ? s.bag.map((b) => (b.item.id === item.id ? { ...b, qty: b.qty + 1 } : b))
        : [...s.bag, { item, qty: 1 }];
      return { ...s, bag };
    });
  },
  removeFromBag(id: string) {
    set((s) => ({ ...s, bag: s.bag.filter((b) => b.item.id !== id) }));
  },
  updateQty(id: string, qty: number) {
    set((s) => ({
      ...s,
      bag: qty <= 0 ? s.bag.filter((b) => b.item.id !== id) : s.bag.map((b) => (b.item.id === id ? { ...b, qty } : b)),
    }));
  },
  setAuthed(v: boolean) {
    set((s) => ({ ...s, authed: v }));
  },
  setPending(p: State["pendingAction"]) {
    set((s) => ({ ...s, pendingAction: p }));
  },
};

export function useShopitt<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    shopitt.subscribe,
    () => selector(shopitt.get()),
    () => selector(shopitt.get()),
  );
}
