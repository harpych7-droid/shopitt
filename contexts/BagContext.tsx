import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { fetchCartItems, addToCart, removeFromCart, updateCartQuantity, clearCart } from '@/services/cartService';

export interface BagItem {
  id: string;           // post_id
  name: string;         // post title
  price: number;        // price_snapshot (numeric)
  image: string;        // media_url
  quantity: number;
  currency: string;
  selectedSize: string | null;
  selectedColor: string | null;
  dbId?: string;        // bag_items.id for mutations
}

interface BagContextType {
  items: BagItem[];
  totalCount: number;
  addItem: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    currency?: string;
    selectedSize?: string | null;
    selectedColor?: string | null;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearBag: () => void;
  lastAdded: string | null;
  syncWithUser: (userId: string) => Promise<void>;
}

export const BagContext = createContext<BagContextType | undefined>(undefined);

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load bag from Supabase bag_items when user logs in
  const syncWithUser = useCallback(async (userId: string) => {
    setCurrentUserId(userId);
    const { data } = await fetchCartItems(userId);
    if (data && data.length > 0) {
      setItems(data.map(ci => ({
        id: ci.post_id,
        name: ci.post?.title ?? 'Product',
        price: ci.price_snapshot,
        image: ci.post?.media_url ?? (ci.post?.media_urls?.[0] ?? ''),
        quantity: ci.quantity,
        currency: ci.currency,
        selectedSize: ci.selected_size,
        selectedColor: ci.selected_color,
        dbId: ci.id,
      })));
    }
  }, []);

  const addItem = useCallback((newItem: {
    id: string;
    name: string;
    price: number;
    image: string;
    currency?: string;
    selectedSize?: string | null;
    selectedColor?: string | null;
  }) => {
    const key = `${newItem.id}:${newItem.selectedSize ?? ''}:${newItem.selectedColor ?? ''}`;

    setItems(prev => {
      const existing = prev.find(
        i => i.id === newItem.id && i.selectedSize === (newItem.selectedSize ?? null) && i.selectedColor === (newItem.selectedColor ?? null)
      );
      if (existing) {
        if (currentUserId && existing.dbId) {
          updateCartQuantity(existing.dbId, existing.quantity + 1).catch(() => {});
        }
        return prev.map(i =>
          i.id === newItem.id && i.selectedSize === (newItem.selectedSize ?? null) && i.selectedColor === (newItem.selectedColor ?? null)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      // Add to DB
      if (currentUserId) {
        addToCart(currentUserId, {
          post_id: newItem.id,
          price_snapshot: newItem.price,
          currency: newItem.currency ?? 'USD',
          selected_size: newItem.selectedSize ?? undefined,
          selected_color: newItem.selectedColor ?? undefined,
        }).catch(() => {});
      }
      return [...prev, {
        id: newItem.id,
        name: newItem.name,
        price: newItem.price,
        image: newItem.image,
        quantity: 1,
        currency: newItem.currency ?? 'USD',
        selectedSize: newItem.selectedSize ?? null,
        selectedColor: newItem.selectedColor ?? null,
      }];
    });

    setLastAdded(newItem.name);
    setTimeout(() => setLastAdded(null), 2500);
  }, [currentUserId]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.dbId) removeFromCart(item.dbId).catch(() => {});
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems(prev => prev.map(i => {
        if (i.id === id) {
          if (i.dbId) updateCartQuantity(i.dbId, quantity).catch(() => {});
          return { ...i, quantity };
        }
        return i;
      }));
    }
  }, [removeItem]);

  const clearBag = useCallback(() => {
    if (currentUserId) clearCart(currentUserId).catch(() => {});
    setItems([]);
  }, [currentUserId]);

  return (
    <BagContext.Provider value={{
      items, totalCount, addItem, removeItem, updateQuantity,
      clearBag, lastAdded, syncWithUser,
    }}>
      {children}
    </BagContext.Provider>
  );
}
