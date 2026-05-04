import { supabase } from '@/lib/supabase';

export interface DbPost {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_urls: string[];
  media: string[];
  media_type: string;
  price: number | null;
  stock_quantity: number | null;
  post_type: 'product' | 'service';
  delivery_type: string | null;
  hashtags: string[];
  sizes: string[];
  colors: string[];
  currency: string;
  is_available: boolean;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export async function fetchFeedPosts(limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles (username, avatar_url)`)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: error.message };
  return { data: data as DbPost[], error: null };
}

export async function fetchPostById(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles (username, avatar_url)`)
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbPost, error: null };
}

export async function fetchUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles (username, avatar_url)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as DbPost[], error: null };
}

export async function fetchShortsPosts(limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles (username, avatar_url)`)
    .eq('media_type', 'video')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: error.message };
  return { data: data as DbPost[], error: null };
}

export async function createPost(post: {
  user_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_urls?: string[];
  media_type: string;
  price?: number;
  stock_quantity?: number;
  post_type?: string;
  delivery_type?: string;
  hashtags?: string[];
  sizes?: string[];
  colors?: string[];
  currency?: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...post,
      media: post.media_urls ?? [],
      is_available: true,
      currency: post.currency ?? 'USD',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function incrementViews(_postId: string) {
  // views_count column doesn't exist in actual schema — silently ignore
}

export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .rpc('search_posts', { search_query: query })
    .limit(20);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
