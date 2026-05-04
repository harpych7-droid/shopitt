import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MOCK_POSTS } from '@/services/mockData';
import FloatingBag from '@/components/ui/FloatingBag';

const { width } = Dimensions.get('window');

const TABS = ['All', 'Users', 'Products', 'Hashtags'];

const MOCK_USERS = [
  { username: 'sharonmulenga_plug', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop', followers: '48.2K', verified: true, bio: 'Fashion & Street Culture 💎' },
  { username: 'lusaka_sneakerhead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', followers: '12.4K', verified: false, bio: 'Sneaker plug 🔥 Lusaka' },
  { username: 'zm_fashion_house', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', followers: '31.7K', verified: true, bio: 'Streetwear for the culture' },
  { username: 'beauty_by_chanda', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop', followers: '8.9K', verified: false, bio: 'Bridal & beauty services ✨' },
  { username: 'kitwe_drops', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', followers: '5.3K', verified: false, bio: 'Copperbelt finest fits' },
];

const MOCK_HASHTAGS = [
  { tag: '#shopzambia', posts: '24.1K posts', emoji: '🇿🇲' },
  { tag: '#shopitt', posts: '18.3K posts', emoji: '🛍️' },
  { tag: '#sneakers', posts: '12.7K posts', emoji: '👟' },
  { tag: '#streetwear', posts: '9.4K posts', emoji: '🧢' },
  { tag: '#lusaka', posts: '7.2K posts', emoji: '📍' },
  { tag: '#fashion', posts: '5.8K posts', emoji: '💎' },
  { tag: '#zambia', posts: '4.1K posts', emoji: '🔥' },
  { tag: '#luxury', posts: '3.5K posts', emoji: '✨' },
];

const TRENDING = ['#sneakers', '#shopzambia', '#streetwear'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const filtered = query.length > 0
    ? MOCK_POSTS.filter(p =>
        p.dropTitle.toLowerCase().includes(query.toLowerCase()) ||
        p.username.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_POSTS;

  const filteredUsers = query.length > 0
    ? MOCK_USERS.filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    : MOCK_USERS;

  const filteredHashtags = MOCK_HASHTAGS.filter(h =>
    query.length === 0 || h.tag.toLowerCase().includes(query.toLowerCase())
  );

  const toggleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      next.has(username) ? next.delete(username) : next.add(username);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Search Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, products, hashtags..."
            placeholderTextColor={Colors.textSubtle}
            value={query}
            onChangeText={setQuery}
            selectionColor="#FF4DA6"
            autoFocus
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={16} color={Colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {TABS.map(tab => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            {activeTab === tab ? (
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabActive}>
                <Text style={styles.tabActiveText}>{tab}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tab}>
                <Text style={styles.tabText}>{tab}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Trending (when no query) */}
        {query.length === 0 && activeTab === 'All' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 TRENDING NOW</Text>
            <View style={styles.trendingRow}>
              {TRENDING.map(tag => (
                <Pressable key={tag} style={styles.trendingPill} onPress={() => setQuery(tag)}>
                  <LinearGradient colors={['rgba(255,77,166,0.15)', 'rgba(123,92,255,0.15)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trendingPillGrad}>
                    <Text style={styles.trendingPillText}>{tag}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Users section */}
        {(activeTab === 'All' || activeTab === 'Users') ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USERS</Text>
            {filteredUsers.map(user => (
              <Pressable
                key={user.username}
                style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.75 }]}
                onPress={() => router.push({ pathname: '/user/[username]', params: { username: user.username } })}
              >
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} contentFit="cover" />
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                    {user.verified ? <MaterialIcons name="verified" size={14} color="#3B82F6" /> : null}
                  </View>
                  <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>
                  <Text style={styles.userFollowers}>{user.followers} followers</Text>
                </View>
                <Pressable
                  onPress={() => toggleFollow(user.username)}
                  style={followedUsers.has(user.username) ? styles.followingBtn : styles.followBtn}
                >
                  {followedUsers.has(user.username) ? (
                    <Text style={styles.followingBtnText}>Following</Text>
                  ) : (
                    <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followBtnGrad}>
                      <Text style={styles.followBtnText}>Follow</Text>
                    </LinearGradient>
                  )}
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Products section */}
        {(activeTab === 'All' || activeTab === 'Products') ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCTS</Text>
            <View style={styles.productsGrid}>
              {filtered.map(post => (
                <Pressable
                  key={post.id}
                  style={({ pressed }) => [styles.productCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: post.id } })}
                >
                  <Image source={{ uri: post.mediaUrl }} style={styles.productImg} contentFit="cover" transition={200} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />
                  {post.scarcity ? (
                    <View style={styles.productScarcity}>
                      <Text style={styles.productScarcityText}>{post.scarcity}</Text>
                    </View>
                  ) : null}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={1}>{post.dropTitle}</Text>
                    <View style={styles.productBottom}>
                      <Text style={styles.productPrice}>{post.price}</Text>
                      <View style={styles.soldMini}>
                        <Text style={styles.soldMiniText}>✓ {post.sold}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Hashtags section */}
        {(activeTab === 'All' || activeTab === 'Hashtags') ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HASHTAGS</Text>
            {filteredHashtags.map((item, idx) => (
              <Pressable
                key={item.tag}
                style={({ pressed }) => [styles.hashtagRow, pressed && { opacity: 0.75 }]}
                onPress={() => setQuery(item.tag)}
              >
                <LinearGradient
                  colors={idx % 2 === 0 ? ['rgba(255,77,166,0.18)', 'rgba(123,92,255,0.18)'] : ['rgba(123,92,255,0.18)', 'rgba(255,77,166,0.18)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.hashtagIconWrap}
                >
                  <Text style={styles.hashtagEmoji}>{item.emoji}</Text>
                </LinearGradient>
                <View style={styles.hashtagInfo}>
                  <Text style={styles.hashtagName}>{item.tag}</Text>
                  <Text style={styles.hashtagCount}>{item.posts}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textSubtle} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <FloatingBag />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    gap: 10, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  tabsScroll: { maxHeight: 56, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabsContent: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', gap: 8, paddingVertical: 8 },
  tab: {
    borderRadius: 999, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard, paddingHorizontal: 18, paddingVertical: 8,
  },
  tabActive: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
  tabText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  tabActiveText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },

  // Trending
  trendingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  trendingPill: { borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,77,166,0.25)' },
  trendingPillGrad: { paddingHorizontal: 16, paddingVertical: 9 },
  trendingPillText: { color: '#FF4DA6', fontWeight: '700', fontSize: 14 },

  // Users
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#FF4DA6' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userUsername: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  userBio: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  userFollowers: { color: Colors.textSubtle, fontSize: 11, marginTop: 2 },
  followBtn: { borderRadius: 999, overflow: 'hidden' },
  followBtnGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  followBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  followingBtn: {
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  followingBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // Products
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  productCard: { width: (width - 42) / 2, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  productImg: { width: '100%', height: 200 },
  productInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  productTitle: { color: '#fff', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice: { color: '#FF4DA6', fontWeight: '900', fontSize: 17 },
  soldMini: {
    backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)',
  },
  soldMiniText: { color: '#22C55E', fontSize: 10, fontWeight: '700' },
  productScarcity: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#F59E0B', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  productScarcityText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Hashtags
  hashtagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  hashtagIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  hashtagEmoji: { fontSize: 22 },
  hashtagInfo: { flex: 1 },
  hashtagName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  hashtagCount: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
