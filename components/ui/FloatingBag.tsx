import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBag } from '@/hooks/useBag';

const MESSAGES = ['+1 added 👀', 'This one is trending 🔥', 'Great pick! 💜', 'Added to bag ✓'];

export default function FloatingBag() {
  const { totalCount, lastAdded } = useBag();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Breathing animation
  const breathe = useRef(new Animated.Value(1)).current;
  // Pulse on add
  const pulse = useRef(new Animated.Value(1)).current;
  // Toast opacity
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    breathLoop.start();
    return () => breathLoop.stop();
  }, []);

  useEffect(() => {
    if (lastAdded) {
      // Pulse
      Animated.sequence([
        Animated.spring(pulse, { toValue: 1.35, useNativeDriver: true, speed: 30, bounciness: 12 }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }),
      ]).start();

      // Toast in
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(toastTranslate, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(toastTranslate, { toValue: 10, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [lastAdded]);

  const bagBottom = insets.bottom + 80;

  const toastMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  return (
    <>
      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            bottom: bagBottom + 72,
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslate }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{lastAdded ? `+1 added 👀` : ''}</Text>
      </Animated.View>

      {/* Bag Button */}
      <Animated.View
        style={[
          styles.bagContainer,
          { bottom: bagBottom, transform: [{ scale: breathe }] },
        ]}
      >
        <Pressable onPress={() => router.push('/bag')}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient
              colors={['#FF4DA6', '#7B5CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bagBtn}
            >
              <Ionicons name="bag-outline" size={26} color="#fff" />
            </LinearGradient>
          </Animated.View>
          {totalCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  bagContainer: {
    position: 'absolute',
    left: 20,
    zIndex: 999,
  },
  bagBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4DA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0E0E0E',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  toast: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(30,20,40,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,77,166,0.3)',
    zIndex: 998,
  },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
