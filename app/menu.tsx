import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const MENU_SECTIONS = [
  {
    title: 'SELLER',
    items: [
      { icon: 'storefront', lib: 'material', label: 'Seller Dashboard', route: '/seller-dashboard' },
      { icon: 'wallet-outline', lib: 'ionicons', label: 'My Wallet', route: '/wallet' },
      { icon: 'add-circle-outline', lib: 'ionicons', label: 'Create Post', route: '/(tabs)/create' },
      { icon: 'send', lib: 'feather', label: 'Order Tracking', route: null },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: 'help-circle', lib: 'feather', label: 'Help Center', route: '/info/help' },
      { icon: 'mail', lib: 'feather', label: 'Contact AETHØN Inc.', route: '/info/contact' },
      { icon: 'shield', lib: 'feather', label: 'Safety Tips', route: '/info/safety' },
    ],
  },
  {
    title: 'LEGAL — AETHØN INC.',
    items: [
      { icon: 'file-text', lib: 'feather', label: 'Terms of Service', route: '/info/terms' },
      { icon: 'lock', lib: 'feather', label: 'Privacy Policy', route: '/info/privacy' },
      { icon: 'info', lib: 'feather', label: 'Cookies Policy', route: '/info/cookies' },
    ],
  },
];

function MenuIcon({ icon, lib }: { icon: string; lib: string }) {
  if (lib === 'material') return <MaterialIcons name={icon as any} size={20} color={Colors.textSecondary} />;
  if (lib === 'ionicons') return <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />;
  return <Feather name={icon as any} size={20} color={Colors.textSecondary} />;
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'Guest';

  const handleNav = (route: string | null) => {
    if (!route) return;
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoPill}>
          <Text style={styles.logoText}>Shopitt</Text>
        </LinearGradient>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* User card (if signed in) */}
        {user ? (
          <Pressable
            style={styles.userCard}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{displayName[0].toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>@{displayName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <LinearGradient colors={['rgba(255,77,166,0.15)', 'rgba(123,92,255,0.15)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
            <Feather name="chevron-right" size={18} color={Colors.textSubtle} />
          </Pressable>
        ) : (
          <Pressable style={styles.signInPrompt} onPress={() => router.push('/login')}>
            <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signInBtn}>
              <Text style={styles.signInBtnText}>Sign In / Create Account</Text>
            </LinearGradient>
          </Pressable>
        )}

        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleNav(item.route)}
                >
                  <View style={styles.menuIconWrap}>
                    <MenuIcon icon={item.icon} lib={item.lib} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={Colors.textSubtle} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        {user ? (
          <Pressable
            style={styles.signOutBtn}
            onPress={async () => { await signOut(); router.replace('/(tabs)'); }}
          >
            <Feather name="log-out" size={18} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        ) : null}

        <Text style={styles.version}>Shopitt v1.0.0 · AETHØN Inc.</Text>
      </ScrollView>
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
  logoPill: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 9 },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginTop: 20, marginBottom: 8,
    backgroundColor: Colors.surfaceCard, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', position: 'relative',
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  userEmail: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  signInPrompt: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  signInBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  signInBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { color: Colors.textSubtle, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  sectionCard: { backgroundColor: Colors.surfaceCard, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginHorizontal: 16, marginTop: 24,
    backgroundColor: 'rgba(255,59,48,0.08)', borderRadius: 16,
    paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)',
  },
  signOutText: { color: Colors.error, fontWeight: '700', fontSize: 16 },

  version: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20 },
});
