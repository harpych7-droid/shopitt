import { supabase } from '@/lib/supabase';

export interface DbNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'follow' | 'order' | 'sold' | 'message';
  entity_id: string | null;
  entity_type: string | null;
  message: string;
  read: boolean;        // mapped from is_read
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  order_id: string | null;
  actor_profile?: { username: string | null; avatar_url: string | null };
}

// Map DB row → DbNotification (normalising is_read → read)
function mapNotification(row: any): DbNotification {
  return {
    ...row,
    // The actual column is `is_read` in the schema; alias `read` for backwards compat
    read: row.is_read ?? row.read ?? false,
    // Build message from title / body if `message` column isn't present
    message: row.message ?? row.body ?? row.title ?? '',
    entity_id: row.post_id ?? row.order_id ?? row.comment_id ?? row.reference_id ?? null,
    entity_type: row.reference_type ?? null,
  };
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor_profile:profiles!notifications_actor_id_fkey (username, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapNotification), error: null };
}

export async function markAllRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function markRead(notifId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notifId);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count ?? 0;
}

export function subscribeToNotifications(userId: string, onNew: (n: DbNotification) => void) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, payload => onNew(mapNotification(payload.new)))
    .subscribe();
}
