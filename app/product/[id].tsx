import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
  Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MOCK_POSTS } from '@/services/mockData';
import { useBag } from '@/hooks/useBag';
import FloatingBag from '@/components/ui/FloatingBag';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = width * 1.15;

// Size variants per category
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];

// Related product images
const RELATED_IMGS = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop',
];

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useBag();

  const post = MOCK_POSTS.find(p => p.id === id) ?? MOCK_POSTS[0];

  // Carousel
  const carouselImages = [post.mediaUrl,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=1000&fit=crop',
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const onCarouselScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(idx);
  }, []);

  // State
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);

  // Animation
  const ctaScale = useRef(new Animated.Value(1)).current;

  const pressCTA = () => {
    if (!selectedSize) {
      // Shake to indicate size must be selected
      Animated.sequence([
        Animated.timing(ctaScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.timing(ctaScale, { toValue: 1.02, duration: 80, useNativeDriver: true }),
        Animated.timing(ctaScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(ctaScale, { toValue: 0.93, duration: 100, useNativeDriver: true }),
        Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 10 }),
      ]).start();
      addItem({ id: post.id, name: post.dropTitle, price: post.price, image: post.mediaUrl });
    }
  };

  const isSneaker = post.dropTitle.toLowerCase().includes('air') ||
    post.dropTitle.toLowerCase().includes('nike') ||
    post.dropTitle.toLowerCase().includes('jordan') ||
    post.dropTitle.toLowerCase().includes('dunk');

  const variants = isSneaker ? SHOE_SIZES : SIZES;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>

        {/* ─── CAROUSEL ─── */}
        <View style={{ height: HERO_HEIGHT }}>
          <FlatList
            ref={carouselRef}
            data={carouselImages}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onCarouselScroll}
            renderItem={({ item }) => (
              <View style={{ width, height: HERO_HEIGHT }}>
                <Image source={{ uri: item }} style={{ width, height: HERO_HEIGHT }} contentFit="cover" transition={200} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(0,0,0,0.8)']}
                  locations={[0, 0.4, 1]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
            )}
          />

          {/* Back button */}
          <Pressable
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {/* Top right actions */}
          <View style={[styles.topRight, { top: insets.top + 12 }]}>
            <Pressable style={styles.topIconBtn} onPress={() => setSaved(s => !s)} hitSlop={8}>
              <Feather name="bookmark" size={18} color={saved ? '#FF4DA6' : '#fff'} />
            </Pressable>
            <Pressable style={styles.topIconBtn} hitSlop={8}>
              <Feather name="send" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Drop title glassmorphism pill */}
          <View style={styles.dropTitlePill}>
            <Text style={styles.dropTitleText}>{post.dropTitle}</Text>
          </View>

          {/* Scarcity badge */}
          {post.scarcity ? (
            <View style={[styles.scarcityBadge, { top: insets.top + 58 }]}>
              <Text style={styles.scarcityText}>{post.scarcity}</Text>
            </View>
          ) : null}

          {/* Slide indicators */}
          <View style={styles.indicators}>
            {carouselImages.map((_, i) => (
              <Pressable key={i} onPress={() => carouselRef.current?.scrollToIndex({ index: i, animated: true })}>
                <View style={[styles.dot, i === activeSlide && styles.dotActive]} />
              </Pressable>
            ))}
          </View>

          {/* Price + CTA overlay */}
          <View style={styles.heroBottom}>
            <View>
              <Text style={styles.heroPrice}>{post.price}</Text>
              {post.freeDelivery ? <Text style={styles.freeDelivery}>🚚 Free Delivery</Text> : null}
            </View>
            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <Pressable onPress={pressCTA}>
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                  <Text style={styles.ctaText}>{post.ctaType} 🛍️</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* ─── ENGAGEMENT ─── */}
        <View style={styles.engagementRow}>
          <View style={styles.engLeft}>
            <Pressable style={styles.engBtn} onPress={() => setLiked(l => !l)}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#FF4DA6' : Colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.engBtn} onPress={() => router.push({ pathname: '/comments', params: { id: post.id } })}>
              <Ionicons name="chatbubble-outline" size={24} color={Colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.engBtn}>
              <Feather name="send" size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>
          <Pressable onPress={() => setSaved(s => !s)}>
            <Feather name="bookmark" size={22} color={saved ? '#FF4DA6' : Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Social proof */}
        <View style={styles.socialProof}>
          <Text style={styles.likesText}>{(post.likes / 1000).toFixed(1)}K likes</Text>
          <View style={styles.soldPill}>
            <Text style={styles.soldText}>✓ {post.sold} sold</Text>
          </View>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.captionText}>
            <Text style={styles.captionUsername}>{post.username} </Text>
            <Text style={{ color: Colors.textSecondary }}>{post.caption}</Text>
          </Text>
          <View style={styles.hashtagsRow}>
            {post.hashtags.map(tag => (
              <Pressable key={tag} style={styles.hashtagPill} onPress={() => router.push('/search')}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* View comments */}
        <Pressable style={styles.commentsLink} onPress={() => router.push({ pathname: '/comments', params: { id: post.id } })}>
          <Text style={styles.commentsLinkText}>View all {post.comments.toLocaleString()} comments</Text>
        </Pressable>

        {/* ─── SIZE / VARIANT SELECTOR ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{isSneaker ? 'Select Size (EU)' : 'Select Size'}</Text>
            {selectedSize ? (
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedSize} selected</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.selectHintText}>Required</Text>
            )}
          </View>
          <View style={styles.sizeGrid}>
            {variants.map(size => {
              const isSelected = selectedSize === size;
              return (
                <Pressable
                  key={size}
                  style={({ pressed }) => [styles.sizeBtn, isSelected && styles.sizeBtnSelected, pressed && { opacity: 0.8 }]}
                  onPress={() => setSelectedSize(size)}
                >
                  {isSelected ? (
                    <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sizeBtnGrad}>
                      <Text style={styles.sizeBtnTextSelected}>{size}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.sizeBtnText}>{size}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
          {!selectedSize ? (
            <Text style={styles.sizeHint}>Please select a size to proceed</Text>
          ) : null}
        </View>

        {/* ─── SELLER CARD ─── */}
        <View style={styles.card}>
          <Pressable
            style={styles.sellerRow}
            onPress={() => router.push({ pathname: '/user/[username]', params: { username: post.username } })}
          >
            <Image source={{ uri: post.avatar }} style={styles.sellerAvatar} contentFit="cover" />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerUsername}>{post.username}</Text>
                {post.verified ? <MaterialIcons name="verified" size={14} color="#3B82F6" /> : null}
              </View>
              <Text style={styles.sellerMeta}>📍 {post.location} · {post.ships24h ? '⚡ Ships 24h' : 'Standard delivery'}</Text>
            </View>
            <Pressable onPress={() => setFollowing(f => !f)}>
              {following ? (
                <View style={styles.followingBtn}>
                  <Text style={styles.followingBtnText}>Following</Text>
                </View>
              ) : (
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followBtn}>
                  <Text style={styles.followBtnText}>Follow</Text>
                </LinearGradient>
              )}
            </Pressable>
          </Pressable>

          {/* Seller stats */}
          <View style={styles.sellerStats}>
            <View style={styles.sellerStat}>
              <Text style={styles.sellerStatNum}>4.9 ★</Text>
              <Text style={styles.sellerStatLabel}>Rating</Text>
            </View>
            <View style={styles.sellerStatDivider} />
            <View style={styles.sellerStat}>
              <Text style={styles.sellerStatNum}>{post.sold}</Text>
              <Text style={styles.sellerStatLabel}>Sold</Text>
            </View>
            <View style={styles.sellerStatDivider} />
            <View style={styles.sellerStat}>
              <Text style={styles.sellerStatNum}>98%</Text>
              <Text style={styles.sellerStatLabel}>Positive</Text>
            </View>
          </View>
        </View>

        {/* ─── FULL DESCRIPTION ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Product Description</Text>
          <Text style={styles.descText}>
            {post.caption}
            {'\n\n'}
            🔥 This is a premium drop — authentic product, sourced directly. Ships securely packaged within 24 hours of payment confirmation.
            {'\n\n'}
            📦 Includes: Original box, cleaning kit, authentication tag.
            {'\n\n'}
            💳 Payment: Airtel Money, MTN Money, or bank transfer accepted.
          </Text>
        </View>

        {/* ─── DELIVERY INFO ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Info</Text>
          <View style={styles.deliveryItem}>
            <View style={styles.deliveryIconWrap}>
              <Ionicons name="location-outline" size={16} color="#FF4DA6" />
            </View>
            <Text style={styles.deliveryText}>Ships from {post.location}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <View style={styles.deliveryIconWrap}>
              <Ionicons name="time-outline" size={16} color="#7B5CFF" />
            </View>
            <Text style={styles.deliveryText}>{post.ships24h ? 'Ships within 24 hours' : 'Standard shipping 3–5 days'}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <View style={styles.deliveryIconWrap}>
              <Ionicons name="car-outline" size={16} color="#22C55E" />
            </View>
            <Text style={styles.deliveryText}>{post.freeDelivery ? 'Free delivery nationwide' : 'Delivery fees apply'}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <View style={styles.deliveryIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.deliveryText}>Buyer protection included</Text>
          </View>
        </View>

        {/* ─── RELATED PRODUCTS ─── */}
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.relatedTitle}>Related Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
            {RELATED_IMGS.map((img, idx) => {
              const relPost = MOCK_POSTS[idx % MOCK_POSTS.length];
              return (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [styles.relatedCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: relPost.id } })}
                >
                  <Image source={{ uri: img }} style={styles.relatedImg} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={1}>{relPost.dropTitle}</Text>
                    <Text style={styles.relatedPrice}>{relPost.price}</Text>
                  </View>
                  {relPost.scarcity ? (
                    <View style={styles.relatedScarcity}>
                      <Text style={styles.relatedScarcityText}>{relPost.scarcity}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* ─── STICKY BOTTOM CTA ─── */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.stickyPriceRow}>
          <View>
            <Text style={styles.stickyPriceLabel}>Price</Text>
            <Text style={styles.stickyPrice}>{post.price}</Text>
          </View>
          {post.freeDelivery ? (
            <View style={styles.freeDeliveryPill}>
              <Text style={styles.freeDeliveryPillText}>🚚 Free Delivery</Text>
            </View>
          ) : null}
        </View>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <Pressable onPress={pressCTA}>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.stickyCtaBtn}>
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
              <Text style={styles.stickyCtaText}>
                {selectedSize ? `${post.ctaType} · Size ${selectedSize}` : `Select Size to ${post.ctaType}`}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <FloatingBag />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Carousel
  backBtn: {
    position: 'absolute', left: 14,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  topRight: { position: 'absolute', right: 14, flexDirection: 'row', gap: 8 },
  topIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  dropTitlePill: {
    position: 'absolute', bottom: 82, left: 14,
    backgroundColor: 'rgba(14,14,14,0.88)',
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  dropTitleText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  scarcityBadge: {
    position: 'absolute', right: 14,
    backgroundColor: '#F59E0B', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  scarcityText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  indicators: {
    position: 'absolute', bottom: 72,
    width: '100%', flexDirection: 'row',
    justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  heroBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingBottom: 14,
  },
  heroPrice: { color: '#fff', fontSize: 36, fontWeight: '900' },
  freeDelivery: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  ctaBtn: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 14 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Engagement
  engagementRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  engLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  engBtn: {},
  socialProof: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, marginBottom: 10,
  },
  likesText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  soldPill: {
    backgroundColor: '#0D2B1A', borderWidth: 1, borderColor: '#22C55E',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  soldText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },

  // Caption / hashtags
  section: { paddingHorizontal: 16, marginBottom: 12 },
  captionText: { fontSize: 14, lineHeight: 20, color: Colors.textPrimary },
  captionUsername: { fontWeight: '800' },
  hashtagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hashtagPill: {
    backgroundColor: 'rgba(123,92,255,0.12)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(123,92,255,0.25)',
  },
  hashtagText: { color: '#7B5CFF', fontSize: 13, fontWeight: '600' },
  commentsLink: { paddingHorizontal: 16, marginBottom: 16 },
  commentsLinkText: { color: Colors.textSubtle, fontSize: 13 },

  // Cards
  card: {
    marginHorizontal: 16, backgroundColor: Colors.surfaceCard,
    borderRadius: 18, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { color: Colors.textPrimary, fontWeight: '800', fontSize: 15, marginBottom: 14 },
  selectedBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  selectedBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  selectHintText: { color: '#FF4DA6', fontSize: 13, fontWeight: '600' },

  // Size selector
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeBtn: {
    borderRadius: 10, borderWidth: 1.5,
    borderColor: Colors.border, overflow: 'hidden',
    minWidth: 50, height: 46,
    alignItems: 'center', justifyContent: 'center',
  },
  sizeBtnSelected: { borderColor: 'transparent' },
  sizeBtnGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  sizeBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14, paddingHorizontal: 12 },
  sizeBtnTextSelected: { color: '#fff', fontWeight: '800', fontSize: 14 },
  sizeHint: { color: '#FF4DA6', fontSize: 12, marginTop: 12, fontWeight: '500' },

  // Seller
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#FF4DA6' },
  sellerInfo: { flex: 1 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerUsername: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  sellerMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  followBtn: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  followBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  followingBtn: {
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  followingBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13 },
  sellerStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  sellerStat: { alignItems: 'center' },
  sellerStatNum: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  sellerStatLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  sellerStatDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  // Description
  descText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },

  // Delivery
  deliveryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  deliveryIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  deliveryText: { color: Colors.textSecondary, fontSize: 14, flex: 1 },

  // Related
  relatedTitle: {
    color: Colors.textPrimary, fontWeight: '800', fontSize: 16,
    paddingHorizontal: 16, marginBottom: 14,
  },
  relatedScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  relatedCard: { width: 160, height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  relatedImg: { width: '100%', height: '100%' },
  relatedInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  relatedName: { color: '#fff', fontWeight: '700', fontSize: 13 },
  relatedPrice: { color: '#FF4DA6', fontWeight: '800', fontSize: 16, marginTop: 2 },
  relatedScarcity: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#F59E0B', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  relatedScarcityText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Sticky footer
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
    gap: 10,
  },
  stickyPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stickyPriceLabel: { color: Colors.textSubtle, fontSize: 11, fontWeight: '600' },
  stickyPrice: { color: Colors.textPrimary, fontWeight: '900', fontSize: 22 },
  freeDeliveryPill: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)',
  },
  freeDeliveryPillText: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  stickyCtaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 16, paddingVertical: 16,
  },
  stickyCtaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
