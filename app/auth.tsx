import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

/**
 * OAuth callback handler — Google redirects here after sign-in.
 * Reads the code/hash from the URL, exchanges it for a session,
 * then navigates to the home feed (or onboarding if needed).
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const pulse  = useRef(new Animated.Value(1)).current;

  // Breathing logo animation while we process
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      if (typeof window === 'undefined') {
        router.replace('/(tabs)');
        return;
      }

      // Supabase PKCE flow: code in query string
      const urlParams = new URLSearchParams(window.location.search);
      const code      = urlParams.get('code');

      // Implicit flow: tokens in hash fragment
      const hash      = window.location.hash;

      if (code) {
        // Exchange the authorization code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('OAuth code exchange error:', error.message);
        }
      } else if (hash && hash.includes('access_token')) {
        // Implicit flow — Supabase detects this automatically via detectSessionInUrl
        // Just wait for onAuthStateChange to fire
        await new Promise(r => setTimeout(r, 1000));
      } else {
        // No code or hash — might be a stale redirect, just go home
        router.replace('/login');
        return;
      }

      // Wait briefly for the session to propagate to the auth listener
      await new Promise(r => setTimeout(r, 600));

      // Check if we got a session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Check if profile has country (onboarding needed?)
        const { data: profile } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', session.user.id)
          .single();

        if (!profile?.country) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.error('Auth callback error:', e);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient
          colors={['#FF4DA6', '#7B5CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoPill}
        >
          <Text style={styles.logoText}>Shopitt</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.statusText}>Completing sign in...</Text>

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map(i => (
          <Dot key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.dot, { opacity }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoPill: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 999,
    shadowColor: '#FF4DA6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4DA6',
  },
});
