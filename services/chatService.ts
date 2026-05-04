import { supabase } from '@/lib/supabase';

// Uses `conversations` (user_1_id, user_2_id) and `messages` (message_text) tables
// Supabase has DB functions: get_or_create_conversation, send_message, list_chat_conversations, list_conversation_messages

export interface DbConversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message: string | null;
  updated_at: string;
  created_at: string;
  other_user?: { username: string | null; avatar_url: string | null };
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  read_status: boolean;
  created_at: string;
}

export async function fetchConversations(userId: string) {
  // Use the list_chat_conversations DB function if it exists, else fallback
  try {
    const { data, error } = await supabase.rpc('list_chat_conversations', { p_user_id: userId });
    if (!error && data) return { data: data as DbConversation[], error: null };
  } catch (_) {}

  // Fallback: direct query
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as DbConversation[], error: null };
}

export async function fetchMessages(conversationId: string) {
  try {
    const { data, error } = await supabase.rpc('list_conversation_messages', {
      p_conversation_id: conversationId,
    });
    if (!error && data) return { data: data as DbMessage[], error: null };
  } catch (_) {}

  // Fallback
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as DbMessage[], error: null };
}

export async function sendMessage(conversationId: string, senderId: string, messageText: string) {
  try {
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: conversationId,
      p_sender_id: senderId,
      p_message_text: messageText,
    });
    if (!error) return { data: data as DbMessage, error: null };
  } catch (_) {}

  // Fallback: direct insert
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, message_text: messageText })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbMessage, error: null };
}

export async function getOrCreateConversation(userA: string, userB: string) {
  try {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user_a: userA,
      p_user_b: userB,
    });
    if (!error && data) return { data: data as DbConversation, error: null };
  } catch (_) {}

  // Fallback: check existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(user_1_id.eq.${userA},user_2_id.eq.${userB}),and(user_1_id.eq.${userB},user_2_id.eq.${userA})`
    )
    .maybeSingle();

  if (existing) return { data: existing as DbConversation, error: null };

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_1_id: userA, user_2_id: userB })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbConversation, error: null };
}

export async function markConversationRead(conversationId: string, userId: string) {
  try {
    await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
  } catch (_) {
    await supabase
      .from('messages')
      .update({ read_status: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  }
}

export function subscribeToMessages(conversationId: string, onNew: (msg: DbMessage) => void) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, payload => onNew(payload.new as DbMessage))
    .subscribe();
}

export function subscribeToConversations(userId: string, onUpdate: () => void) {
  return supabase
    .channel(`conversations:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversations',
      filter: `user_1_id=eq.${userId}`,
    }, onUpdate)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversations',
      filter: `user_2_id=eq.${userId}`,
    }, onUpdate)
    .subscribe();
}

export async function getOtherUserProfile(conversation: DbConversation, currentUserId: string) {
  const otherId = conversation.user_1_id === currentUserId
    ? conversation.user_2_id
    : conversation.user_1_id;

  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', otherId)
    .single();

  return data as { id: string; username: string | null; avatar_url: string | null } | null;
}
