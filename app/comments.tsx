import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  liked: boolean;
  replyTo?: string;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1', username: 'lusaka_drip',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    text: 'These are 🔥🔥 need them in my life', timeAgo: '2m', likes: 24, liked: false,
    replies: [
      { id: '1a', username: 'zm_drops', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', text: 'Agreed!! Fire drop 🔥', timeAgo: '1m', likes: 3, liked: false, replyTo: 'lusaka_drip' },
    ],
  },
  {
    id: '2', username: 'zm_fashion_house',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    text: 'Bro this is straight heat 💜 where do you ship?', timeAgo: '5m', likes: 18, liked: false,
    replies: [],
  },
  {
    id: '3', username: 'copperbelt_fits',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    text: 'Slay in this daily 💜', timeAgo: '12m', likes: 7, liked: false,
    replies: [],
  },
  {
    id: '4', username: 'ndola_street',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    text: 'Price is firm or can negotiate?', timeAgo: '20m', likes: 3, liked: false,
    replies: [
      { id: '4a', username: 'seller_zm', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop', text: 'DM me we can talk 😊', timeAgo: '18m', likes: 1, liked: false, replyTo: 'ndola_street' },
    ],
  },
  {
    id: '5', username: 'lusaka_sneakerhead',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop',
    text: 'Just bought mine! Fast delivery 🚀', timeAgo: '34m', likes: 31, liked: false,
    replies: [],
  },
  {
    id: '6', username: 'beauty_by_chanda',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop',
    text: 'Love the quality!! 💕', timeAgo: '1h', likes: 8, liked: false,
    replies: [],
  },
];

interface CommentRowProps {
  item: Comment;
  onLike: (id: string) => void;
  onReply: (username: string) => void;
  nested?: boolean;
}

function CommentRow({ item, onLike, onReply, nested }: CommentRowProps) {
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.5, useNativeDriver: true, speed: 40, bounciness: 18 }),
      Animated.spring(likeScale, { toValue: 1,   useNativeDriver: true, speed: 28, bounciness: 10 }),
    ]).start();
    onLike(item.id);
  };

  return (
    <View style={[styles.commentRow, nested && styles.commentRowNested]}>
      {nested ? <View style={styles.nestedLine} /> : null}
      <Pressable onPress={() => {}}>
        <Image source={{ uri: item.avatar }} style={[styles.commentAvatar, nested && styles.commentAvatarSmall]} contentFit="cover" />
      </Pressable>
      <View style={styles.commentBody}>
        {item.replyTo ? (
          <Text style={styles.replyingTo}>Replying to @{item.replyTo}</Text>
        ) : null}
        <Text style={styles.commentText}>
          <Text style={styles.commentUsername}>{item.username} </Text>
          <Text>{item.text}</Text>
        </Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{item.timeAgo}</Text>
          <Pressable onPress={() => onReply(item.username)} hitSlop={8}>
            <Text style={styles.replyBtn}>Reply</Text>
          </Pressable>
          {item.likes > 0 ? (
            <Text style={styles.likeCountText}>{item.likes} {item.likes === 1 ? 'like' : 'likes'}</Text>
          ) : null}
        </View>
      </View>
      <Pressable style={styles.likeBtn} onPress={handleLike} hitSlop={8}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Ionicons
            name={item.liked ? 'heart' : 'heart-outline'}
            size={16}
            color={item.liked ? '#FF4DA6' : Colors.textSubtle}
          />
        </Animated.View>
        <Text style={[styles.likeCount, item.liked && { color: '#FF4DA6' }]}>{item.likes}</Text>
      </Pressable>
    </View>
  );
}

export default function CommentsScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const { user, profile } = useAuth();

  const [comments,    setComments]    = useState<Comment[]>(MOCK_COMMENTS);
  const [input,       setInput]       = useState('');
  const [replyingTo,  setReplyingTo]  = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setInput(`@${username} `);
    inputRef.current?.focus();
  };

  const clearReply = () => {
    setReplyingTo(null);
    setInput('');
  };

  const toggleLike = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
      }
      // Check nested replies
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
          ),
        };
      }
      return c;
    }));
  };

  const sendComment = () => {
    if (!input.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      username: profile?.username ?? user?.email?.split('@')[0] ?? 'you',
      avatar: profile?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
      text: input.trim(),
      timeAgo: 'now',
      likes: 0,
      liked: false,
      replyTo: replyingTo ?? undefined,
      replies: [],
    };

    if (replyingTo) {
      // Add as reply to first comment that matches username
      setComments(prev => prev.map(c => {
        if (c.username === replyingTo || (c.replies && c.replies.some(r => r.username === replyingTo))) {
          return { ...c, replies: [...(c.replies ?? []), newComment] };
        }
        return c;
      }));
    } else {
      setComments(prev => [newComment, ...prev]);
    }
    clearReply();
  };

  // Flatten for display: root comments + their replies inline
  const flatItems: { item: Comment; nested: boolean }[] = [];
  comments.forEach(c => {
    flatItems.push({ item: c, nested: false });
    (c.replies ?? []).forEach(r => flatItems.push({ item: r, nested: true }));
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={flatItems}
        keyExtractor={(it, i) => `${it.item.id}_${i}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item: { item, nested } }) => (
          <CommentRow
            item={item}
            onLike={toggleLike}
            onReply={handleReply}
            nested={nested}
          />
        )}
      />

      {/* Reply indicator */}
      {replyingTo ? (
        <View style={styles.replyingBanner}>
          <Ionicons name="return-down-forward-outline" size={14} color="#FF4DA6" />
          <Text style={styles.replyingText}>Replying to <Text style={{ color: '#FF4DA6' }}>@{replyingTo}</Text></Text>
          <Pressable onPress={clearReply} hitSlop={8}>
            <Feather name="x" size={16} color={Colors.textSubtle} />
          </Pressable>
        </View>
      ) : null}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
        <Image
          source={{ uri: profile?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop' }}
          style={styles.myAvatar}
          contentFit="cover"
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={replyingTo ? `Reply to @${replyingTo}...` : 'Add a comment...'}
          placeholderTextColor={Colors.textSubtle}
          value={input}
          onChangeText={setInput}
          selectionColor="#FF4DA6"
          multiline
        />
        <Pressable onPress={sendComment} disabled={!input.trim()}>
          <LinearGradient
            colors={!input.trim() ? ['#444', '#333'] : ['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendBtn}
          >
            <Feather name="send" size={17} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },

  commentRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  commentRowNested: {
    paddingLeft: 44, backgroundColor: 'rgba(255,255,255,0.015)',
  },
  nestedLine: {
    position: 'absolute', left: 36, top: 0, bottom: 0,
    width: 2, backgroundColor: Colors.border,
  },
  commentAvatar:      { width: 38, height: 38, borderRadius: 19 },
  commentAvatarSmall: { width: 30, height: 30, borderRadius: 15 },

  commentBody: { flex: 1 },
  replyingTo: {
    color: '#7B5CFF', fontSize: 11, fontWeight: '600', marginBottom: 3,
  },
  commentText:     { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  commentUsername: { fontWeight: '800' },
  commentMeta:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 7 },
  commentTime:     { color: Colors.textSubtle, fontSize: 12 },
  replyBtn:        { color: '#FF4DA6', fontSize: 12, fontWeight: '700' },
  likeCountText:   { color: Colors.textSubtle, fontSize: 12 },

  likeBtn:   { alignItems: 'center', gap: 3, paddingLeft: 8, paddingTop: 2 },
  likeCount: { color: Colors.textSubtle, fontSize: 11 },

  replyingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,77,166,0.08)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,77,166,0.2)',
  },
  replyingText: { flex: 1, color: Colors.textSecondary, fontSize: 13 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingTop: 12,
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  myAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#FF4DA6' },
  input: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: Colors.border, maxHeight: 80,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
