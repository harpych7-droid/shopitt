import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MOCK_POSTS } from '@/services/mockData';
import FloatingBag from '@/components/ui/FloatingBag';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 3) / 3;

interface UserMeta {
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  followers: string;
  following: string;
  posts: string;
  verified: boolean;
  ships24h: boolean;
  category: string;
}

const USER_META: Record<string, UserMeta> = {
  sharonmulenga_plug: {
    displayName: 'Sharon Mulenga',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    bio: 'Curated drops for the culture 💎 Ships nationwide in 24h ✈️',
    location: 'Kabwe, Zambia',
    followers: '48.2K', following: '312', posts: '127',
    verified: true, ships24h: true, category: 'Fashion & Culture',
  },
  lusaka_sneakerhead: {
    displayName: 'Lusaka Sneakerhead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bio: 'Legit sneaker plug 🔥 Lusaka based — worldwide shipping',
    location: 'Lusaka, Zambia',
    followers: '12.4K', following: '218', posts: '89',
    verified: false, ships24h: true, category: 'Sneakers',
  },
  zm_fashion_house: {
    displayName: 'ZM Fashion House',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    bio: 'Streetwear for the culture 🧢 Ndola & Lusaka',
    location: 'Ndola, Zambia',
    followers: '31.7K', following: '445', posts: '204',
    verified: true, ships24h: true, category: 'Streetwear',
  },
  beauty_by_chanda: {
    displayName: 'Chanda Beauty',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
    bio: 'Full bridal glam ✨ Book your date before slots fill up',
    location: 'Livingstone, Zambia',
    followers: '8.9K', following: '190', posts: '63',
    verified: false, ships24h: false, category: 'Beauty & Services',
  },
};

const DEFAULT_META: UserMeta = {
  displayName: 'Shopitt User',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  bio: 'Dropping heat daily 🔥 Ships nationwide 🚚',
  location: 'Zambia',
  followers: '5.3K', following: '178', posts: '42',
  verified: false, ships24h: true, category: 'Fashion',
};

const GRID_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
];

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'shorts'>('posts');

  const meta = USER_META[username ?? ''] ?? DEFAULT_META;
  const userPosts = MOCK_POSTS.filter(p => p.username === username);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topUsername}>@{username}</Text>
            {meta.verified ? <MaterialIcons name="verified" size={16} color="#3B82F6" /> : null}
          </View>
          <Pressable hitSlop={8}>
            <Feather name="more-horizontal" size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Avatar + stats */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.avatarRing}>
            <Image source={{ uri: meta.avatar }} style={styles.avatar} contentFit="cover" />
          </LinearGradient>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{meta.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{meta.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{meta.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bio}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{meta.displayName}</Text>
            {meta.verified ? <MaterialIcons name="verified" size={16} color="#3B82F6" /> : null}
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {meta.location}</Text>
            {meta.ships24h ? (
              <View style={styles.shipsPill}>
                <Text style={styles.shipsText}>⚡ Ships 24h</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.categoryTag}>🏷️ {meta.category}</Text>
          <Text style={styles.bioDesc}>{meta.bio}</Text>
        </View>

        {/* Seller highlights */}
        <View style={styles.highlights}>
          <View style={styles.highlightItem}>
            <LinearGradient colors={['rgba(255,77,166,0.15)', 'rgba(123,92,255,0.15)']} style={styles.highlightGrad}>
              <Text style={styles.highlightIcon}>⭐</Text>
              <Text style={styles.highlightValue}>4.9</Text>
              <Text style={styles.highlightLabel}>Rating</Text>
            </LinearGradient>
          </View>
          <View style={styles.highlightItem}>
            <LinearGradient colors={['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)']} style={styles.highlightGrad}>
              <Text style={styles.highlightIcon}>✅</Text>
              <Text style={styles.highlightValue}>{userPosts.reduce((a, p) => a + p.sold, 0) || 412}</Text>
              <Text style={styles.highlightLabel}>Sold</Text>
            </LinearGradient>
          </View>
          <View style={styles.highlightItem}>
            <LinearGradient colors={['rgba(123,92,255,0.15)', 'rgba(123,92,255,0.05)']} style={styles.highlightGrad}>
              <Text style={styles.highlightIcon}>🚀</Text>
              <Text style={styles.highlightValue}>98%</Text>
              <Text style={styles.highlightLabel}>Positive</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.followBtnWrap} onPress={() => setFollowing(f => !f)}>
            {following ? (
              <View style={styles.followingBtn}>
                <Text style={styles.followingBtnText}>✓ Following</Text>
              </View>
            ) : (
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followGrad}>
                <Text style={styles.followText}>Follow</Text>
              </LinearGradient>
            )}
          </Pressable>
          <Pressable
            style={styles.msgBtn}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: username ?? '', username: username ?? '', avatar: meta.avatar } })}
          >
            <Feather name="message-circle" size={16} color={Colors.textPrimary} />
            <Text style={styles.msgBtnText}>Message</Text>
          </Pressable>
          <Pressable style={styles.moreBtn} hitSlop={8}>
            <Feather name="more-horizontal" size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Grid tabs */}
        <View style={styles.gridTabBar}>
          <Pressable
            style={[styles.gridTab, activeTab === 'posts' && styles.gridTabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <MaterialIcons name="grid-on" size={22} color={activeTab === 'posts' ? '#FF4DA6' : Colors.textSubtle} />
          </Pressable>
          <Pressable
            style={[styles.gridTab, activeTab === 'shorts' && styles.gridTabActive]}
            onPress={() => setActiveTab('shorts')}
          >
            <Ionicons name="play-circle-outline" size={22} color={activeTab === 'shorts' ? '#FF4DA6' : Colors.textSubtle} />
          </Pressable>
        </View>

        {/* Posts Grid */}
        <View style={styles.grid}>
          {GRID_IMAGES.map((img, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [styles.gridItem, pressed && { opacity: 0.82 }]}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: MOCK_POSTS[idx % MOCK_POSTS.length].id } })}
            >
              <Image source={{ uri: img }} style={styles.gridImage} contentFit="cover" />
              {/* Price overlay */}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFillObject} />
              <Text style={styles.gridPrice}>{MOCK_POSTS[idx % MOCK_POSTS.length].price}</Text>
              {idx % 4 === 0 ? (
                <View style={styles.gridHot}>
                  <Text style={styles.gridHotText}>🔥</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <FloatingBag />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  topBarCenter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  topUsername: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },

  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16, gap: 20,
  },
  avatarRing: { width: 92, height: 92, borderRadius: 46, padding: 3, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 86, height: 86, borderRadius: 43, borderWidth: 2, borderColor: Colors.background },
  statsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  bio: { paddingHorizontal: 20, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  displayName: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
  shipsPill: {
    backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  shipsText: { color: '#22C55E', fontSize: 11, fontWeight: '700' },
  categoryTag: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  bioDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },

  highlights: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  highlightItem: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  highlightGrad: { padding: 12, alignItems: 'center', gap: 2 },
  highlightIcon: { fontSize: 18 },
  highlightValue: { color: Colors.textPrimary, fontWeight: '800', fontSize: 15 },
  highlightLabel: { color: Colors.textSubtle, fontSize: 10, fontWeight: '600' },

  actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  followBtnWrap: { flex: 1 },
  followGrad: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  followText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  followingBtn: {
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  followingBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  msgBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingVertical: 12,
  },
  msgBtnText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  moreBtn: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  gridTabBar: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  gridTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  gridTabActive: { borderBottomWidth: 2, borderBottomColor: '#FF4DA6' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, position: 'relative', overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  gridPrice: {
    position: 'absolute', bottom: 6, left: 6,
    color: '#fff', fontSize: 12, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  gridHot: {
    position: 'absolute', top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  gridHotText: { fontSize: 11 },
});
