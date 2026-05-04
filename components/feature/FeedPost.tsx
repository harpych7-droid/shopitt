import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { DbPost } from '@/services/postsService';
import { useBag } from '@/hooks/useBag';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const MEDIA_HEIGHT = Math.round(height * 0.78);

interface FeedPostProps {
  post: DbPost;
  likesCount: number;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function FeedPost({ post, likesCount, liked, saved, onLike, onSave }: FeedPostProps) {
  const { addItem } = useBag();
  const router = useRouter();

  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(-10)).current;
  const glowScale      = useRef(new Animated.Value(1)).current;
  const ctaScale       = useRef(new Animated.Value(1)).current;
  const heartScale     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity,   { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(titleTranslate, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(glowScale, { toValue: 1.04, duration: 700, delay: 700, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1,    duration: 700,              useNativeDriver: true }),
    ]).start();
  }, []);

  // Derived values from DbPost
  const username  = post.profiles?.username  ?? 'shopitt_user';
  const avatarUrl = post.profiles?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop';
  const mediaUrl  = post.media_url ?? post.media_urls?.[0] ?? post.media?.[0]
    ?? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop';
  const priceStr  = post.price != null ? `${post.currency ?? ''} ${post.price}`.trim() : null;
  const scarcity  = post.stock_quantity != null && post.stock_quantity <= 5
    ? `Only ${post.stock_quantity} left` : null;
  const ctaLabel  = post.post_type === 'service' ? 'Book Now 🛍️' : 'Buy Now 🛍️';
  const hashtags  = post.hashtags ?? [];

  const pressCTA = () => {
    Animated.sequence([
      Animated.timing(ctaScale,  { toValue: 0.88, duration: 90,  useNativeDriver: true }),
      Animated.spring(ctaScale,  { toValue: 1,    useNativeDriver: true, speed: 28, bounciness: 14 }),
    ]).start();
    addItem({
      id:    post.id,
      name:  post.title,
      price: post.price ?? 0,
      image: mediaUrl,
      currency: post.currency ?? 'USD',
    });
  };

  const pressLike = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 18 }),
      Animated.spring(heartScale, { toValue: 1,   useNativeDriver: true, speed: 28, bounciness: 10 }),
    ]).start();
    onLike();
  };

  return (
    <View style={styles.post}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.avatarWrap}
          onPress={() => router.push({ pathname: '/user/[username]', params: { username } })}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        </Pressable>

        <View style={styles.headerInfo}>
          <Pressable onPress={() => router.push({ pathname: '/user/[username]', params: { username } })}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{username}</Text>
            </View>
          </Pressable>
          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.location}>Zambia</Text>
            <View style={styles.shipsPill}>
              <Text style={styles.shipsText}>Ships 24h</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.menuBtn} hitSlop={8}>
          <MaterialIcons name="more-horiz" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Media */}
      <Pressable
        style={[styles.media, { height: MEDIA_HEIGHT }]}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: post.id } })}
      >
        <Image
          source={{ uri: mediaUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.82)']}
          locations={[0.35, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Drop title pill */}
        <Animated.View
          style={[
            styles.dropTitlePill,
            { opacity: titleOpacity, transform: [{ translateY: titleTranslate }, { scale: glowScale }] },
          ]}
        >
          <Text style={styles.dropTitleText} numberOfLines={1}>{post.title}</Text>
        </Animated.View>

        {/* Scarcity */}
        {scarcity ? (
          <View style={styles.scarcityBadge}>
            <Text style={styles.scarcityText}>{scarcity}</Text>
          </View>
        ) : null}

        {/* Bottom overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.priceSection}>
            {priceStr ? (
              <Text style={styles.price}>{priceStr}</Text>
            ) : null}
            {post.delivery_type && (
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryText}>🚚 {post.delivery_type}</Text>
              </View>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable onPress={(e) => { e.stopPropagation?.(); pressCTA(); }}>
              <LinearGradient
                colors={['#FF4DA6', '#7B5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaText}>{ctaLabel}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>

      {/* Engagement Row */}
      <View style={styles.engagement}>
        <View style={styles.engLeft}>
          <Pressable style={styles.engBtn} onPress={pressLike}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={26}
                color={liked ? '#FF4DA6' : Colors.textPrimary}
              />
            </Animated.View>
          </Pressable>

          <Pressable
            style={styles.engBtn}
            onPress={() => router.push({ pathname: '/comments', params: { id: post.id } })}
          >
            <Ionicons name="chatbubble-outline" size={24} color={Colors.textPrimary} />
          </Pressable>

          <Pressable style={styles.engBtn}>
            <Feather name="send" size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            Animated.sequence([
              Animated.timing(ctaScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
              Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 14 }),
            ]).start();
            onSave();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={saved ? '#FF4DA6' : Colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <Text style={styles.likesCount}>{formatNum(likesCount)} likes</Text>
      </View>

      {/* Caption */}
      <View style={styles.caption}>
        <Text style={styles.captionText}>
          <Text style={styles.captionUsername}>{username} </Text>
          <Text>{post.description ?? ''}</Text>
        </Text>
        {hashtags.length > 0 ? (
          <View style={styles.hashtagRow}>
            {hashtags.slice(0, 4).map(tag => (
              <Pressable key={tag} onPress={() => router.push('/search')}>
                <Text style={styles.hashtag}>#{tag.replace(/^#/, '')}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {/* View comments */}
      <Pressable
        style={styles.commentsLink}
        onPress={() => router.push({ pathname: '/comments', params: { id: post.id } })}
      >
        <Text style={styles.commentsText}>View all comments</Text>
      </Pressable>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  post:   { width: '100%' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: '#FF4DA6',
  },
  headerInfo:  { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  username:    { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationPin: { fontSize: 11 },
  location:    { color: Colors.textSecondary, fontSize: 12 },
  shipsPill: {
    backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  shipsText: { color: '#22C55E', fontSize: 10, fontWeight: '700' },
  menuBtn: { padding: 4 },

  media: { width, position: 'relative', overflow: 'hidden' } as any,

  dropTitlePill: {
    position: 'absolute', top: 16, left: 14,
    backgroundColor: Colors.glassBg, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.glassBorder,
    maxWidth: width * 0.6,
  },
  dropTitleText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  scarcityBadge: {
    position: 'absolute', top: 16, right: 14,
    backgroundColor: '#F59E0B', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  scarcityText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  bottomOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 18, paddingTop: 50,
  },
  priceSection: {},
  price: {
    color: '#fff', fontSize: 36, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deliveryText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  ctaBtn: { borderRadius: 999, paddingHorizontal: 24, paddingVertical: 15 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  engagement: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  engLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  engBtn:  {},

  socialProof: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, marginBottom: 6,
  },
  likesCount: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },

  caption:         { paddingHorizontal: 14, marginBottom: 6 },
  captionText:     { fontSize: 14, lineHeight: 20, color: Colors.textPrimary },
  captionUsername: { fontWeight: '800' },
  hashtagRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  hashtag: {
    color: '#FF4DA6', fontSize: 12, fontWeight: '700',
    borderWidth: 1.5, borderColor: 'rgba(255,77,166,0.45)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
    backgroundColor: 'rgba(255,77,166,0.07)', overflow: 'hidden',
  },

  commentsLink: { paddingHorizontal: 14, marginBottom: 4 },
  commentsText: { color: Colors.textSubtle, fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.borderSubtle, marginTop: 6, marginBottom: 2 },
});
