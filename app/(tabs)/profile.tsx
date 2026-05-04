import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
  Alert, Platform, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import FloatingBag from '@/components/ui/FloatingBag';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserPosts, DbPost } from '@/services/postsService';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/services/cloudinaryService';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 3) / 3;

const FALLBACK_POSTS = [
  { id: '1', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
  { id: '2', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop' },
  { id: '3', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop' },
  { id: '4', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop' },
  { id: '5', img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop' },
  { id: '6', img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'shorts'>('posts');
  const [userPosts, setUserPosts] = useState<{ id: string; img: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Animated ring for upload progress
  const uploadProgress = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'You';
  const avatarUrl = profile?.avatar_url ?? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop';

  useEffect(() => {
    if (user) loadUserPosts();
  }, [user?.id]);

  const loadUserPosts = async () => {
    if (!user) return;
    const { data } = await fetchUserPosts(user.id);
    if (data && data.length > 0) {
      setUserPosts(data.map((p: DbPost) => ({
        id: p.id,
        img: p.media_urls?.[0] ?? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      })));
    } else {
      setUserPosts(FALLBACK_POSTS);
    }
  };

  const handleAvatarUpload = async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to update your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploading(true);

    // Animate ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    try {
      const { url, error } = await uploadImage(asset.uri, `avatar_${user.id}`);
      if (error || !url) throw new Error(error ?? 'Upload failed');

      // Update profile in Supabase
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      await refreshProfile();

      Alert.alert('Done!', 'Profile photo updated.');
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Please try again.');
    } finally {
      setUploading(false);
      ringScale.stopAnimation();
      ringScale.setValue(1);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar style="light" />
        <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Sign in to view profile</Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 14, marginBottom: 24 }}>Create an account to start selling and buying</Text>
        <Pressable onPress={() => router.push('/login')}>
          <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Sign In / Create Account</Text>
          </LinearGradient>
        </Pressable>
        <FloatingBag />
      </View>
    );
  }

  const displayPosts = activeTab === 'posts'
    ? userPosts.filter((_, i) => i % 2 === 0)
    : userPosts.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {/* Top nav */}
        <View style={[styles.topNav, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.navUsername}>@{displayName}</Text>
          <Pressable onPress={() => router.push('/menu')}>
            <Feather name="menu" size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Avatar + stats */}
        <View style={styles.profileHeader}>
          <Pressable onPress={handleAvatarUpload} style={styles.avatarContainer}>
            <Animated.View style={{ transform: [{ scale: ringScale }] }}>
              <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.avatarRing}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
              </LinearGradient>
            </Animated.View>
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>...</Text>
              </View>
            ) : (
              <View style={styles.cameraBtn}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            )}
          </Pressable>

          <View style={styles.statsRow}>
            {[
              { num: userPosts.length.toString(), label: 'Posts' },
              { num: '48.2K', label: 'Followers' },
              { num: '312', label: 'Following' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 ? <View style={styles.statDivider} /> : null}
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bio}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            <MaterialIcons name="verified" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.bioText}>📍 {profile?.country ?? 'Zambia'}  •  Fashion and Street Culture</Text>
          <Text style={styles.bioDesc}>Curated drops for the culture 💎 Ships 24h nationwide ✈️</Text>
        </View>

        {/* Buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.editBtn} onPress={() => {}}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
          <Pressable style={styles.msgBtn} onPress={() => router.push('/chat/index')}>
            <Feather name="message-circle" size={18} color={Colors.textPrimary} />
            <Text style={styles.msgBtnText}>Messages</Text>
          </Pressable>
          <Pressable style={styles.iconSquare} onPress={() => router.push('/seller-dashboard')}>
            <MaterialIcons name="storefront" size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Grid tabs */}
        <View style={styles.gridTabs}>
          <Pressable style={[styles.gridTab, activeTab === 'posts' && styles.gridTabActive]} onPress={() => setActiveTab('posts')}>
            <MaterialIcons name="grid-on" size={22} color={activeTab === 'posts' ? '#FF4DA6' : Colors.textSubtle} />
          </Pressable>
          <Pressable style={[styles.gridTab, activeTab === 'shorts' && styles.gridTabActive]} onPress={() => setActiveTab('shorts')}>
            <MaterialIcons name="play-circle-outline" size={22} color={activeTab === 'shorts' ? '#FF4DA6' : Colors.textSubtle} />
          </Pressable>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {displayPosts.map((post, idx) => (
            <Pressable
              key={post.id}
              style={({ pressed }) => [styles.gridItem, pressed && { opacity: 0.8 }]}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: post.id } })}
            >
              <Image source={{ uri: post.img }} style={styles.gridImage} contentFit="cover" />
              {idx % 3 === 0 ? (
                <View style={styles.gridBadge}>
                  <Text style={styles.gridBadgeText}>🔥</Text>
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
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  navUsername: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },

  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 20 },
  avatarContainer: { position: 'relative' },
  avatarRing: { width: 90, height: 90, borderRadius: 45, padding: 3, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: Colors.background },
  cameraBtn: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FF4DA6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  uploadingOverlay: {
    position: 'absolute', inset: 0, borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  uploadingText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  statsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  bio: { paddingHorizontal: 20, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  displayName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  bioText: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  bioDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },

  actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  editBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  editBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  msgBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingVertical: 10 },
  msgBtnText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  iconSquare: { width: 42, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  gridTabs: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  gridTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  gridTabActive: { borderBottomWidth: 2, borderBottomColor: '#FF4DA6' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, position: 'relative' },
  gridImage: { width: '100%', height: '100%' },
  gridBadge: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  gridBadgeText: { fontSize: 11 },
});
