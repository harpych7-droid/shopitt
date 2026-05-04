import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
  PanResponder, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import FloatingBag from '@/components/ui/FloatingBag';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
  DbNotification,
} from '@/services/notificationsService';
import { MOCK_NOTIFICATIONS } from '@/services/mockData';

const ICON_MAP: Record<string, { icon: string; color: string; bg: string }> = {
  like:    { icon: 'heart',            color: '#FF4DA6', bg: 'rgba(255,77,166,0.12)' },
  comment: { icon: 'chatbubble',       color: '#7B5CFF', bg: 'rgba(123,92,255,0.12)' },
  follow:  { icon: 'person-add',       color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  order:   { icon: 'bag',              color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  sold:    { icon: 'checkmark-circle', color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  message: { icon: 'chatbubbles',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface NotifRowProps {
  notif: DbNotification;
  onDismiss: () => void;
  onPress: () => void;
}

function NotifRow({ notif, onDismiss, onPress }: NotifRowProps) {
  const iconData = ICON_MAP[notif.type] ?? ICON_MAP.like;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => { if (gs.dx < 0) translateX.setValue(gs.dx); },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -80) {
          Animated.parallel([
            Animated.timing(translateX, { toValue: -400, duration: 220, useNativeDriver: true }),
            Animated.timing(opacity,    { toValue: 0,    duration: 220, useNativeDriver: true }),
          ]).start(onDismiss);
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  const avatarUrl = notif.actor_profile?.avatar_url
    ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop';
  const username = notif.actor_profile?.username ?? 'someone';

  return (
    <Animated.View style={{ transform: [{ translateX }], opacity }}>
      <Pressable
        style={({ pressed }) => [
          styles.notifCard,
          notif.read && styles.notifRead,
          pressed && { opacity: 0.78 },
        ]}
        onPress={onPress}
        {...panResponder.panHandlers}
      >
        {/* Unread dot accent */}
        {!notif.read && <View style={styles.unreadAccent} />}

        {/* Avatar + icon badge */}
        <View style={styles.notifLeft}>
          <Image source={{ uri: avatarUrl }} style={styles.notifAvatar} contentFit="cover" />
          <View style={[styles.notifIconBadge, { backgroundColor: iconData.bg }]}>
            <Ionicons name={iconData.icon as any} size={12} color={iconData.color} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <Text style={[styles.notifText, notif.read && { opacity: 0.6 }]}>
            <Text style={styles.notifUsername}>{username} </Text>
            <Text style={styles.notifAction}>{notif.message}</Text>
          </Text>
          <Text style={styles.notifTime}>{timeAgo(notif.created_at)}</Text>
        </View>

        {/* Read dot */}
        <View style={[styles.notifDot, { backgroundColor: notif.read ? 'transparent' : iconData.color }]} />
      </Pressable>

      {/* Swipe dismiss hint */}
      <View style={styles.dismissHint}>
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </View>
    </Animated.View>
  );
}

// ─── Fallback shapes (mock → DbNotification-like) ────────────────────────────
function mockToDb(m: typeof MOCK_NOTIFICATIONS[0]): DbNotification {
  return {
    id: m.id,
    user_id: 'mock',
    actor_id: null,
    type: m.type as DbNotification['type'],
    entity_id: null,
    entity_type: null,
    message: m.action,
    read: m.timeAgo !== '2m' && m.timeAgo !== '5m',
    created_at: new Date(Date.now() - parseMockTime(m.timeAgo)).toISOString(),
    actor_profile: { username: m.username, avatar_url: m.avatar },
  };
}

function parseMockTime(t: string): number {
  if (t.endsWith('m')) return parseInt(t) * 60000;
  if (t.endsWith('h')) return parseInt(t) * 3600000;
  return parseInt(t) * 86400000;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    if (user) {
      const { data } = await fetchNotifications(user.id);
      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // Fallback: show mock data so screen is never empty
        setNotifications(MOCK_NOTIFICATIONS.map(mockToDb));
      }
    } else {
      setNotifications(MOCK_NOTIFICATIONS.map(mockToDb));
    }

    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // ── Real-time subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const sub = subscribeToNotifications(user.id, (n) => {
      setNotifications(prev => [n, ...prev]);
    });
    return () => { sub.unsubscribe(); };
  }, [user?.id]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (user) await markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handlePress = async (notif: DbNotification) => {
    // Mark as read
    if (!notif.read) {
      if (user) markRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    // Route based on type
    switch (notif.type) {
      case 'order':
      case 'sold':
        router.push('/seller-dashboard');
        break;
      case 'like':
      case 'comment':
        if (notif.entity_id) {
          router.push({ pathname: '/product/[id]', params: { id: notif.entity_id } });
        } else {
          router.push({ pathname: '/product/[id]', params: { id: '1' } });
        }
        break;
      case 'follow':
        const uname = notif.actor_profile?.username ?? 'user';
        router.push({ pathname: '/user/[username]', params: { username: uname } });
        break;
      case 'message':
        router.push('/chat/index');
        break;
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayNotifs = notifications.slice(0, Math.ceil(notifications.length / 2));
  const earlierNotifs = notifications.slice(Math.ceil(notifications.length / 2));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['rgba(14,14,14,1)', 'rgba(14,14,14,0.95)']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Alerts</Text>
          {unreadCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={handleMarkAllRead} hitSlop={8}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>

      {/* Swipe hint */}
      <View style={styles.swipeHintBar}>
        <Ionicons name="arrow-back-outline" size={12} color={Colors.textSubtle} />
        <Text style={styles.swipeHint}>Swipe left to dismiss</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF4DA6" size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#FF4DA6"
              colors={['#FF4DA6']}
            />
          }
        >
          {/* TODAY section */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>TODAY</Text>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionLine} />
          </View>

          {todayNotifs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No new alerts today</Text>
            </View>
          ) : (
            todayNotifs.map(notif => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onDismiss={() => handleDismiss(notif.id)}
                onPress={() => handlePress(notif)}
              />
            ))
          )}

          {/* EARLIER section */}
          {earlierNotifs.length > 0 ? (
            <>
              <View style={[styles.sectionRow, { marginTop: 8 }]}>
                <Text style={styles.sectionLabel}>EARLIER</Text>
                <LinearGradient colors={['#7B5CFF', '#FF4DA6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionLine} />
              </View>
              {earlierNotifs.map(notif => (
                <NotifRow
                  key={`e-${notif.id}`}
                  notif={{ ...notif, read: true }}
                  onDismiss={() => handleDismiss(notif.id)}
                  onPress={() => handlePress(notif)}
                />
              ))}
            </>
          ) : null}
        </ScrollView>
      )}

      <FloatingBag />
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  countBadge: {
    backgroundColor: '#FF3B30', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 24, alignItems: 'center',
  },
  countBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  markAllBtn: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  markAllText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  swipeHintBar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 20, paddingVertical: 7,
    backgroundColor: Colors.surface,
  },
  swipeHint: { color: Colors.textSubtle, fontSize: 11, fontWeight: '500' },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  sectionLabel: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  sectionLine: { flex: 1, height: 1.5, borderRadius: 1 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.background,
  },
  notifRead: { opacity: 0.65 },
  unreadAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: 2, backgroundColor: '#FF4DA6',
  },
  notifLeft: { position: 'relative' },
  notifAvatar: { width: 50, height: 50, borderRadius: 25 },
  notifIconBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.background,
  },
  notifContent: { flex: 1 },
  notifText: { fontSize: 14, lineHeight: 20, color: Colors.textPrimary },
  notifUsername: { fontWeight: '700' },
  notifAction: { fontWeight: '400', color: Colors.textSecondary },
  notifTime: { color: Colors.textSubtle, fontSize: 12, marginTop: 4 },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  dismissHint: {
    position: 'absolute', right: 14, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: -1,
  },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: Colors.textSubtle, fontSize: 15, fontWeight: '600' },
});
