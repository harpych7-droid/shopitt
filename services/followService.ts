import { supabase } from '@/lib/supabase';

// Uses the `followers` table: follower_id, following_id

export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ following: boolean; error: string | null }> {
  const { data: existing } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { following: false, error: error?.message ?? null };
  } else {
    const { error } = await supabase
      .from('followers')
      .insert({ follower_id: followerId, following_id: followingId });
    return { following: true, error: error?.message ?? null };
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const [followersRes, followingRes] = await Promise.all([
    supabase.from('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('followers').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return {
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}
