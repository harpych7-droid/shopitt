import React from 'react';
import {
  View, Text, StyleSheet, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function TopNavBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {/* Logo */}
      <LinearGradient
        colors={['#FF4DA6', '#7B5CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.logoPill}
      >
        <Text style={styles.logoText}>Shopitt</Text>
      </LinearGradient>

      {/* Right Icons */}
      <View style={styles.rightIcons}>
        <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.push('/search')}>
          <Feather name="search" size={22} color={Colors.textPrimary} />
        </Pressable>

        {/* Chat with badge */}
        <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.push('/chat/index')}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="chatbubble-outline" size={22} color={Colors.textPrimary} />
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>2</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={() => router.push('/menu')} hitSlop={8}>
          <MaterialIcons name="menu" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.background,
  },
  logoPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6 },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
