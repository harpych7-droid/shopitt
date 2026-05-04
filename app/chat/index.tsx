import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator,
  TextInput, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchConversations, DbConversation } from '@/services/chatService';
import { supabase } from '@/lib/supabase';

// Fallback mock data
const MOCK_CHATS = [
  { id: '1', username: 'sharonmulenga_plug', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop', lastMsg: 'Yes, I still have stock! When do you want it?', timeAgo: '2m', unread: 2, verified: true },
  { id: '2', username: 'lusaka_sneakerhead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', lastMsg: 'Order confirmed ✅ Will ship tomorrow', timeAgo: '15m', unread: 0, verified: false },
  { id: '3', username: 'zm_fashion_house', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', lastMsg: 'Thanks for your purchase 🙏', timeAgo: '1h', unread: 1, verified: true },
  { id: '4', username: 'beauty_by_chanda', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop', lastMsg: 'Booking confirmed for Saturday!', timeAgo: '3h', unread: 0, verified: false },
  { id: '5', username: 'copperbelt_fits', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', lastMsg: 'Is the hoodie still available?', timeAgo: '5h', unread: 0, verified: false },
];

interface ChatDisplay {
  id: string;
  username: string;
  avatar: string;
  lastMsg: string;
  timeAgo: string;
  unread: number;
  verified: boolean;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [chats, setChats] = useState<ChatDisplay[]>([]);
  const [filtered, setFiltered] = useState<ChatDisplay[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    if (!user) {
      setChats(MOCK_CHATS);
      setFiltered(MOCK_CHATS);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data } = await fetchConversations(user.id);
    if (data && data.length > 0) {
      // For each conversation, fetch other user's profile
      const enriched: ChatDisplay[] = await Promise.all(
        data.map(async (conv: DbConversation) => {
          const otherUserId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Count unread messages in this conversation
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            username: profile?.username ?? 'user',
            avatar: profile?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
            lastMsg: conv.last_message ?? 'Say hi! 👋',
            timeAgo: formatTime(conv.last_message_at),
            unread: unreadCount ?? 0,
            verified: false,
          };
        })
      );
      setChats(enriched);
      setFiltered(enriched);
    } else {
      // Fallback to mock
      setChats(MOCK_CHATS);
      setFiltered(MOCK_CHATS);
    }

    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Real-time: any new message bubbles the conversation up
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat_list_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => {
        load();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, load]);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(chats);
    } else {
      setFiltered(chats.filter(c => c.username.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, chats]);

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread}</Text>
            </View>
          ) : null}
        </View>
        <Pressable style={styles.newChatBtn} hitSlop={8}>
          <Feather name="edit" size={20} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.textSubtle}
            value={search}
            onChangeText={setSearch}
            selectionColor="#FF4DA6"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x" size={16} color={Colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF4DA6" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#FF4DA6"
              colors={['#FF4DA6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Message sellers directly from their product pages</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.chatRow,
                pressed && { opacity: 0.75, backgroundColor: Colors.surfaceCard },
                item.unread > 0 && styles.chatRowUnread,
              ]}
              onPress={() => router.push({
                pathname: '/chat/[id]',
                params: { id: item.id, username: item.username, avatar: item.avatar },
              })}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: item.avatar }} style={styles.chatAvatar} contentFit="cover" />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.chatUsername, item.unread > 0 && { color: '#fff' }]}>
                      {item.username}
                    </Text>
                    {item.verified ? (
                      <MaterialIcons name="verified" size={13} color="#3B82F6" />
                    ) : null}
                  </View>
                  <Text style={styles.chatTime}>{item.timeAgo}</Text>
                </View>

                <View style={styles.chatBottom}>
                  <Text
                    style={[styles.chatLastMsg, item.unread > 0 && { color: Colors.textPrimary, fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    {item.lastMsg}
                  </Text>
                  {item.unread > 0 ? (
                    <LinearGradient
                      colors={['#FF4DA6', '#7B5CFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.unreadBadge}
                    >
                      <Text style={styles.unreadText}>{item.unread > 99 ? '99+' : item.unread}</Text>
                    </LinearGradient>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  headerTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  headerBadge: {
    backgroundColor: '#FF4DA6', borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  newChatBtn: { padding: 4 },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    gap: 10, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },

  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  chatRowUnread: { backgroundColor: 'rgba(255,77,166,0.04)' },

  avatarWrap: { position: 'relative' },
  chatAvatar: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: Colors.background,
  },

  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chatUsername: { color: Colors.textPrimary, fontWeight: '600', fontSize: 15 },
  chatTime: { color: Colors.textSubtle, fontSize: 12 },

  chatBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatLastMsg: { color: Colors.textSecondary, fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: Colors.textSubtle, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
