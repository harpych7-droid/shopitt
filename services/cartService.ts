import { supabase } from '@/lib/supabase';

// Uses the `bag_items` table

export interface CartItem {
  id: string;
  user_id: string;
  post_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  price_snapshot: number;
  currency: string;
  created_at: string;
  // Joined
  post?: {
    title: string;
    media_url: string;
    media_urls: string[];
  };
}

export async function fetchCartItems(userId: string) {
  const { data, error } = await supabase
    .from('bag_items')
    .select(`
      *,
      post:posts (title, media_url, media_urls)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as CartItem[], error: null };
}

export async function addToCart(
  userId: string,
  item: {
    post_id: string;
    price_snapshot: number;
    currency?: string;
    selected_size?: string;
    selected_color?: string;
  }
) {
  // Check if same item+size+color already in bag
  const { data: existing } = await supabase
    .from('bag_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('post_id', item.post_id)
    .eq('selected_size', item.selected_size ?? '')
    .eq('selected_color', item.selected_color ?? '')
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('bag_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from('bag_items').insert({
    user_id: userId,
    post_id: item.post_id,
    price_snapshot: item.price_snapshot,
    currency: item.currency ?? 'USD',
    selected_size: item.selected_size ?? null,
    selected_color: item.selected_color ?? null,
    quantity: 1,
  });
  return { error: error?.message ?? null };
}

export async function removeFromCart(itemId: string) {
  const { error } = await supabase.from('bag_items').delete().eq('id', itemId);
  return { error: error?.message ?? null };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(itemId);
  const { error } = await supabase.from('bag_items').update({ quantity }).eq('id', itemId);
  return { error: error?.message ?? null };
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from('bag_items').delete().eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function getCartCount(userId: string): Promise<number> {
  const { data } = await supabase
    .from('bag_items')
    .select('quantity')
    .eq('user_id', userId);
  return (data ?? []).reduce((sum: number, row: { quantity: number }) => sum + row.quantity, 0);
}
