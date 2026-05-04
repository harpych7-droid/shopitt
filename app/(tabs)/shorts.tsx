import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  Pressable, Animated, TextInput, KeyboardAvoidingView, Platform,
  NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { MOCK_SHORTS } from '@/services/mockData';
import { fetchShortsPosts, DbPost } from '@/services/postsService';
import { useBag } from '@/hooks/useBag';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const MOCK_COMMENTS = [
  { id: '1', username: 'lusaka_drip', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', text: '🔥🔥 this is crazy heat bro', likes: 24 },
  { id: '2', username: 'zm_fashion_house', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', text: 'Need these in my life asap 💜', likes: 18 },
  { id: '3', username: 'copperbelt_fits', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', text: 'How long does shipping take?', likes: 7 },
  { id: '4', username: 'ndola_street', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', text: 'Just bought! Super fast delivery 🚀', likes: 31 },
  { id: '5', username: 'beauty_by_chanda', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop', text: 'Love the quality 💕', likes: 12 },
];

interface ShortShape {
  id: string;
  username: string;
  avatar: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  price: string;
  sold: number;
  scarcity: string | null;
  hasProduct: boolean;
}

function dbToShort(p: DbPost): ShortShape {
  return {
    id: p.id,
    username: p.profiles?.username ?? 'shopitt_user',
    avatar: p.profiles?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
    videoUrl: p.media_urls?.[0] ?? 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=900&fit=crop',
    caption: p.caption ?? p.drop_title,
    likes: p.likes_count,
    comments: 0,
    price: p.price != null ? `K${p.price.toLocaleString()}` : '',
    sold: p.sold_count,
    scarcity: p.quantity != null && p.quantity <= 5 ? `Only ${p.quantity} left` : null,
    hasProduct: p.type === 'product',
  };
}

interface ShortItemProps {
  item: ShortShape;
  isActive: boolean;
  onOpenComments: () => void;
}

function ShortItem({ item, isActive, onOpenComments }: ShortItemProps) {
  const insets = useSafeAreaInsets();
  const { addItem } = useBag();
  const router = useRouter();

  const [liked,     setLiked]     = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [following, setFollowing] = useState(false);

  // Animation refs
  const iconEntrance   = useRef(new Animated.Value(0)).current;
  const iconTranslate  = useRef(new Animated.Value(30)).current;
  const heartScale     = useRef(new Animated.Value(1)).current;
  const bookmarkScale  = useRef(new Animated.Value(1)).current;
  const imageZoom      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // Icons slide in from right
      Animated.parallel([
        Animated.timing(iconEntrance, { toValue: 1, duration: 400, delay: 120, useNativeDriver: true }),
        Animated.spring(iconTranslate, { toValue: 0, delay: 120, useNativeDriver: true, speed: 18, bounciness: 8 }),
      ]).start();
      // Subtle image zoom-in effect
      Animated.timing(imageZoom, { toValue: 1.04, duration: 5000, useNativeDriver: true }).start();
    } else {
      iconEntrance.setValue(0);
      iconTranslate.setValue(30);
      imageZoom.setValue(1);
    }
  }, [isActive]);

  const handleLike = () => {
    setLiked(l => !l);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true, speed: 40, bounciness: 20 }),
      Animated.spring(heartScale, { toValue: 1,   useNativeDriver: true, speed: 28, bounciness: 10 }),
    ]).start();
  };

  const handleSave = () => {
    setSaved(s => !s);
    Animated.sequence([
      Animated.spring(bookmarkScale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 18 }),
      Animated.spring(bookmarkScale, { toValue: 1,   useNativeDriver: true, speed: 28, bounciness: 10 }),
    ]).start();
  };

  const handleAddBag = () => {
    addItem({ id: item.id, name: item.caption.slice(0, 40), price: item.price, image: item.videoUrl });
  };

  // Right-side icon stack bottom: above tab bar (≈90) + safe area
  const stackBottom = insets.bottom + 96;

  return (
    <View style={[styles.shortPage, { height }]}>
      {/* Background image with subtle zoom */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ scale: imageZoom }] }]}>
        <Image
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'transparent', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.18, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Play button */}
      <View style={styles.playBtnContainer} pointerEvents="none">
        <Pressable style={styles.playBtn} pointerEvents="box-none">
          <MaterialIcons name="play-arrow" size={40} color="rgba(255,255,255,0.88)" />
        </Pressable>
      </View>

      {/* Scarcity badge — top right */}
      {item.scarcity ? (
        <View style={[styles.scarcityBadge, { top: insets.top + 12 }]}>
          <Text style={styles.scarcityText}>{item.scarcity}</Text>
        </View>
      ) : null}

      {/* ── RIGHT SIDE ICON STACK ──────────────────────────────────────────
          Order: Like → Comment → Share → Save → Bag
          Positioned so the bottom of the stack is above the tab bar.
          NO FloatingBag here — bag action is the last icon in the stack.
      ─────────────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.rightStack,
          { bottom: stackBottom, opacity: iconEntrance, transform: [{ translateX: iconTranslate }] },
        ]}
      >
        {/* Like */}
        <Pressable style={styles.iconBtn} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={30}
              color={liked ? '#FF4DA6' : '#fff'}
            />
          </Animated.View>
          <Text style={styles.iconLabel}>{liked ? item.likes + 1 : item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}</Text>
        </Pressable>

        {/* Comment */}
        <Pressable style={styles.iconBtn} onPress={onOpenComments}>
          <Ionicons name="chatbubble-outline" size={27} color="#fff" />
          <Text style={styles.iconLabel}>Reply</Text>
        </Pressable>

        {/* Share */}
        <Pressable style={styles.iconBtn}>
          <Feather name="send" size={25} color="#fff" />
          <Text style={styles.iconLabel}>Share</Text>
        </Pressable>

        {/* Save */}
        <Pressable style={styles.iconBtn} onPress={handleSave}>
          <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={27}
              color={saved ? '#FF4DA6' : '#fff'}
            />
          </Animated.View>
          <Text style={[styles.iconLabel, saved && { color: '#FF4DA6' }]}>Save</Text>
        </Pressable>

        {/* Bag — gradient circle, part of the stack, no overlap */}
        <Pressable style={styles.iconBtn} onPress={handleAddBag}>
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bagIconGrad}
          >
            <Ionicons name="bag-outline" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.iconLabel}>Bag</Text>
        </Pressable>
      </Animated.View>

      {/* Bottom-left: user info + caption */}
      <View style={[styles.bottomLeft, { bottom: stackBottom - 4 }]}>
        <View style={styles.userRow}>
          <Pressable onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })}>
            <Image source={{ uri: item.avatar }} style={styles.shortAvatar} contentFit="cover" />
          </Pressable>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })}
          >
            <Text style={styles.shortUsername} numberOfLines={1}>@{item.username}</Text>
          </Pressable>
          <Pressable style={styles.followBtnSmall} onPress={() => setFollowing(f => !f)}>
            <Text style={[styles.followBtnSmallText, following && { color: '#aaa', borderColor: '#aaa' }]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.shortCaption} numberOfLines={2}>{item.caption}</Text>

        {item.price ? (
          <Text style={styles.shortPrice}>{item.price}</Text>
        ) : null}

        {item.sold > 0 ? (
          <View style={styles.soldPill}>
            <Text style={styles.soldText}>✓ {item.sold} sold</Text>
          </View>
        ) : null}

        {/* Buy Now — shown below caption if product */}
        {item.hasProduct ? (
          <Pressable
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
          >
            <LinearGradient
              colors={['#FF4DA6', '#7B5CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyNowBtn}
            >
              <Text style={styles.buyNowText}>Buy Now 🛍️</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function ShortsScreen() {
  const insets    = useSafeAreaInsets();
  const [shorts,  setShorts]  = useState<ShortShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput,  setCommentInput]  = useState('');
  const [comments,      setComments]      = useState(MOCK_COMMENTS);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const commentsAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => { loadShorts(); }, []);

  const loadShorts = async () => {
    setLoading(true);
    const { data } = await fetchShortsPosts(20);
    if (data && data.length > 0) {
      setShorts(data.map(dbToShort));
    } else {
      setShorts(MOCK_SHORTS.map(s => ({
        id: s.id,
        username: s.username,
        avatar: s.avatar,
        videoUrl: s.videoUrl,
        caption: s.caption,
        likes: s.likes,
        comments: s.comments,
        price: s.price,
        sold: s.sold,
        scarcity: s.scarcity,
        hasProduct: s.hasProduct,
      })));
    }
    setLoading(false);
  };

  const openComments = () => {
    setCommentsOpen(true);
    Animated.spring(commentsAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
  };

  const closeComments = () => {
    Animated.timing(commentsAnim, { toValue: 600, duration: 280, useNativeDriver: true })
      .start(() => setCommentsOpen(false));
  };

  const sendComment = () => {
    if (!commentInput.trim()) return;
    setComments(prev => [{
      id: Date.now().toString(),
      username: 'you',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop',
      text: commentInput.trim(),
      likes: 0,
    }, ...prev]);
    setCommentInput('');
  };

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / height);
    setActiveIndex(Math.min(idx, shorts.length - 1));
  }, [shorts.length]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FF4DA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top progress bar */}
      <View style={[styles.progressBar, { top: insets.top + 4 }]}>
        {shorts.map((_, i) => (
          <View key={i} style={styles.progressSegmentWrap}>
            <View style={[styles.progressSegment, i <= activeIndex && styles.progressSegmentActive]} />
          </View>
        ))}
      </View>

      <FlatList
        data={shorts}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        renderItem={({ item, index }) => (
          <ShortItem
            item={item}
            isActive={index === activeIndex}
            onOpenComments={openComments}
          />
        )}
      />

      {/* Comments overlay */}
      {commentsOpen ? (
        <Pressable style={styles.commentsOverlay} onPress={closeComments} />
      ) : null}

      {commentsOpen ? (
        <Animated.View
          style={[
            styles.commentsSheet,
            { transform: [{ translateY: commentsAnim }], paddingBottom: insets.bottom + 60 },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{comments.length} Comments</Text>
            <Pressable onPress={closeComments} hitSlop={8}>
              <Feather name="x" size={22} color={Colors.textSubtle} />
            </Pressable>
          </View>

          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.commentsList}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} contentFit="cover" />
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentUsername}>{item.username} </Text>
                    <Text style={styles.commentBody}>{item.text}</Text>
                  </Text>
                </View>
                <Pressable
                  style={styles.commentLike}
                  onPress={() => {
                    setLikedComments(prev => {
                      const n = new Set(prev);
                      n.has(item.id) ? n.delete(item.id) : n.add(item.id);
                      return n;
                    });
                  }}
                >
                  <Ionicons
                    name={likedComments.has(item.id) ? 'heart' : 'heart-outline'}
                    size={14}
                    color={likedComments.has(item.id) ? '#FF4DA6' : Colors.textSubtle}
                  />
                  <Text style={[styles.commentLikeCount, likedComments.has(item.id) && { color: '#FF4DA6' }]}>
                    {item.likes}
                  </Text>
                </Pressable>
              </View>
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={Colors.textSubtle}
                value={commentInput}
                onChangeText={setCommentInput}
                selectionColor="#FF4DA6"
              />
              <Pressable onPress={sendComment}>
                <LinearGradient
                  colors={['#FF4DA6', '#7B5CFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendBtn}
                >
                  <Feather name="send" size={18} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  progressBar: {
    position: 'absolute', left: 12, right: 12,
    flexDirection: 'row', gap: 4, zIndex: 100,
  },
  progressSegmentWrap: {
    flex: 1, height: 3, borderRadius: 2, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressSegment:       { flex: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressSegmentActive: { backgroundColor: '#fff' },

  shortPage: { width, position: 'relative', overflow: 'hidden' },

  playBtnContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },

  scarcityBadge: {
    position: 'absolute', right: 14,
    backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  scarcityText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Right icon stack ────────────────────────────────────────────────────
  rightStack: {
    position: 'absolute',
    right: 12,
    alignItems: 'center',
    gap: 20,
  },
  iconBtn: { alignItems: 'center', gap: 4 },
  iconLabel: {
    color: '#fff', fontSize: 11, fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  bagIconGrad: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4DA6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 6,
  },

  // ── Bottom-left info ─────────────────────────────────────────────────────
  bottomLeft: { position: 'absolute', left: 14, right: 78, gap: 5 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  shortAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FF4DA6' },
  shortUsername: { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 },
  followBtnSmall: {
    borderWidth: 1.5, borderColor: '#FF4DA6', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  followBtnSmallText: { color: '#FF4DA6', fontSize: 12, fontWeight: '700' },
  shortCaption: {
    color: '#fff', fontSize: 13, lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  shortPrice: {
    color: '#fff', fontSize: 28, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  soldPill: {
    backgroundColor: 'rgba(13,43,26,0.85)', borderWidth: 1, borderColor: '#22C55E',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
  },
  soldText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },

  buyNowBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  buyNowText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // ── Comments sheet ───────────────────────────────────────────────────────
  commentsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  commentsSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surfaceCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    zIndex: 51, maxHeight: height * 0.68,
    borderWidth: 1, borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.textSubtle,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sheetTitle: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  commentsList: { maxHeight: 300 },
  commentRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  commentAvatar:  { width: 32, height: 32, borderRadius: 16 },
  commentContent: { flex: 1 },
  commentText:    { color: Colors.textPrimary, fontSize: 13, lineHeight: 19 },
  commentUsername: { fontWeight: '700' },
  commentBody:    { color: Colors.textSecondary },
  commentLike:    { alignItems: 'center', gap: 2, paddingLeft: 4 },
  commentLikeCount: { color: Colors.textSubtle, fontSize: 11 },

  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  commentInput: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
