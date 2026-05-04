import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { fetchMessages, sendMessage as sendSupabaseMessage, subscribeToMessages, DbMessage } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, username, avatar } = useLocalSearchParams<{ id: string; username: string; avatar: string }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationId = id ?? '';
  const otherAvatar = avatar ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop';

  useEffect(() => {
    if (!conversationId) return;
    loadMessages();

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(conversationId, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // Show typing indicator briefly on received messages
      if (newMsg.sender_id !== user?.id) {
        setIsTyping(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const loadMessages = async () => {
    setLoading(true);
    const { data } = await fetchMessages(conversationId);
    if (data) {
      setMessages(data);
    }
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    // Show typing indicator simulation for demo
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1500);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || !conversationId) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimistic: DbMessage = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const { data, error } = await sendSupabaseMessage(conversationId, user.id, content);
    if (data) {
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m));
    }
    setSending(false);
  }, [input, user, conversationId]);

  const isMyMessage = (msg: DbMessage) => msg.sender_id === user?.id;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Pressable
          style={styles.headerUser}
          onPress={() => router.push({ pathname: '/user/[username]', params: { username: username ?? '' } })}
        >
          <Image
            source={{ uri: otherAvatar }}
            style={styles.headerAvatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.headerUsername}>@{username}</Text>
            <Text style={styles.headerOnline}>● Online</Text>
          </View>
        </Pressable>
        <Pressable hitSlop={8}>
          <Feather name="more-horizontal" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF4DA6" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 8 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: Colors.textSubtle, fontSize: 14 }}>No messages yet. Say hi! 👋</Text>
            </View>
          }
          renderItem={({ item }) => {
            const mine = isMyMessage(item);
            return (
              <View style={[styles.msgRow, mine && styles.msgRowMine]}>
                {!mine ? (
                  <Image source={{ uri: otherAvatar }} style={styles.msgAvatar} contentFit="cover" />
                ) : null}
                <View style={[styles.msgBubble, mine && styles.msgBubbleMine]}>
                  {mine ? (
                    <LinearGradient
                      colors={['#FF4DA6', '#7B5CFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.msgBubbleGrad}
                    >
                      <Text style={styles.msgTextMine}>{item.content}</Text>
                      <View style={styles.msgMeta}>
                        <Text style={styles.msgTimeMine}>{formatTime(item.created_at)}</Text>
                        <Text style={styles.readReceipt}>{item.read ? '✓✓' : '✓'}</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.msgBubbleOther}>
                      <Text style={styles.msgText}>{item.content}</Text>
                      <Text style={styles.msgTime}>{formatTime(item.created_at)}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Typing indicator */}
      {isTyping ? (
        <View style={styles.typingRow}>
          <Image source={{ uri: otherAvatar }} style={styles.typingAvatar} contentFit="cover" />
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              {[0, 1, 2].map(i => <TypingDot key={i} delay={i * 200} />)}
            </View>
          </View>
        </View>
      ) : null}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable style={styles.attachBtn} hitSlop={8}>
          <Feather name="image" size={20} color={Colors.textSubtle} />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSubtle}
          value={input}
          onChangeText={handleInputChange}
          selectionColor="#FF4DA6"
          multiline
        />
        <Pressable onPress={handleSend} disabled={sending || !input.trim()}>
          <LinearGradient
            colors={sending || !input.trim() ? ['#555', '#333'] : ['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendBtn}
          >
            <Feather name="send" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -4, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.typingDot, { transform: [{ translateY: anim }] }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#FF4DA6' },
  headerUsername: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  headerOnline: { color: '#22C55E', fontSize: 11, fontWeight: '600', marginTop: 1 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMine: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15 },
  msgBubble: { maxWidth: '75%' },
  msgBubbleMine: {},
  msgBubbleGrad: { borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleOther: {
    backgroundColor: Colors.surfaceCard, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  msgText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  msgTextMine: { color: '#fff', fontSize: 14, lineHeight: 20 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  msgTime: { color: Colors.textSubtle, fontSize: 10, marginTop: 4, textAlign: 'right' },
  msgTimeMine: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  readReceipt: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingAvatar: { width: 28, height: 28, borderRadius: 14 },
  typingBubble: {
    backgroundColor: Colors.surfaceCard, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.textSubtle },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  attachBtn: { padding: 4 },
  input: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: Colors.border, maxHeight: 80,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
