import { supabase } from '@/lib/supabase';

// ── Post likes (post_likes table) ─────────────────────────────────────────────

export async function toggleLike(userId: string, postId: string): Promise<{ liked: boolean; error: string | null }> {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    return { liked: false, error: error?.message ?? null };
  } else {
    const { error } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId });
    return { liked: true, error: error?.message ?? null };
  }
}

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  return !!data;
}

export async function fetchLikedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { post_id: string }) => r.post_id);
}

export async function getLikesCount(postId: string): Promise<number> {
  const { count } = await supabase
    .from('post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count ?? 0;
}

// ── Saved items (saved_items table) ──────────────────────────────────────────

export async function fetchSavedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('saved_items')
    .select('post_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { post_id: string }) => r.post_id);
}

export async function toggleSave(userId: string, postId: string): Promise<{ saved: boolean; error: string | null }> {
  const { data: existing } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    return { saved: false, error: error?.message ?? null };
  } else {
    const { error } = await supabase
      .from('saved_items')
      .insert({ user_id: userId, post_id: postId });
    return { saved: true, error: error?.message ?? null };
  }
}

export async function fetchSavedPosts(userId: string) {
  const { data, error } = await supabase
    .from('saved_items')
    .select(`post_id, posts (*, profiles (username, avatar_url))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
