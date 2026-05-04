/**
 * Login screen — standalone (not the modal)
 * Shown when user explicitly navigates to /login or is redirected from a protected route.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Animated, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

// ── Full-screen loading overlay while Google OAuth is in progress ─────────────
function GoogleLoadingOverlay() {
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 850, useNativeDriver: true }),
      ])
    ).start();
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: 1,   duration: 380, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 380, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, overlay.wrap, { opacity: fadeIn }]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient colors={['#FF4DA6', '#7B5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={overlay.pill}>
          <Text style={overlay.pillText}>Shopitt</Text>
        </LinearGradient>
      </Animated.View>
      <View style={overlay.row}>
        <Text style={overlay.g}>G</Text>
        <Text style={overlay.status}>Connecting to Google</Text>
      </View>
      <View style={overlay.dots}>
        {dots.map((dot, i) => <Animated.View key={i} style={[overlay.dot, { opacity: dot }]} />)}
      </View>
      <Text style={overlay.hint}>You will be redirected to Google to sign in</Text>
    </Animated.View>
  );
}

const overlay = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.background, alignItems: 'center',
    justifyContent: 'center', gap: 24, zIndex: 999,
  },
  pill: {
    paddingHorizontal: 44, paddingVertical: 18, borderRadius: 999,
    shadowColor: '#FF4DA6', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 12,
  },
  pillText: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: -0.5 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  g:      { fontSize: 22, fontWeight: '900', color: '#EA4335' },
  status: { color: Colors.textSecondary, fontSize: 17, fontWeight: '600' },
  dots:   { flexDirection: 'row', gap: 8 },
  dot:    { width: 9, height: 9, borderRadius: 5, backgroundColor: '#FF4DA6' },
  hint:   { color: Colors.textSubtle, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signInWithGoogle, sendMagicLink } = useAuth();

  const [email,     setEmail]     = useState('');
  const [username,  setUsername]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [error,     setError]     = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 12 }).start();
  }, []);

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const handleMagicLink = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true);
    const { error: err } = await sendMagicLink(email.trim(), username.trim() || undefined);
    setLoading(false);
    if (err) { setError(err); return; }
    setMagicSent(true);
  };

  const handleGoogle = async () => {
    setError('');
    setGLoading(true);
    const { error: err } = await signInWithGoogle();
    setGLoading(false);
    if (err && err !== 'Sign in cancelled') {
      setError(err);
    }
    // Navigation handled by AuthGuard via onAuthStateChange
  };

  // ── Magic link sent ───────────────────────────────────────────────────────

  if (magicSent) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.magicIconWrap}>
          <Ionicons name="mail-unread-outline" size={44} color="#fff" />
        </LinearGradient>
        <Text style={styles.magicTitle}>Check your inbox!</Text>
        <Text style={styles.magicSub}>
          We sent a magic link to{'\n'}
          <Text style={styles.magicEmail}>{email}</Text>
        </Text>
        <Text style={styles.magicHint}>
          Tap the link in your email to sign in instantly — no password needed.
        </Text>
        <Pressable style={styles.resendBtn} onPress={() => setMagicSent(false)}>
          <Text style={styles.resendBtnText}>Use a different email</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')} style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.textSubtle, fontSize: 13 }}>Browse without signing in</Text>
        </Pressable>
      </View>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      {gLoading ? <GoogleLoadingOverlay /> : null}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View style={[
          styles.logoSection,
          {
            opacity: logoAnim,
            transform: [{ scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
          },
        ]}>
          <LinearGradient
            colors={['#FF4DA6', '#7B5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoPill}
          >
            <Text style={styles.logoText}>Shopitt</Text>
          </LinearGradient>
          <Text style={styles.tagline}>Drop. Discover. Buy.</Text>
          <Text style={styles.taglineSub}>by AETHØNN Inc.</Text>
        </Animated.View>

        {/* Google */}
        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.82 }]}
          onPress={handleGoogle}
          disabled={gLoading}
        >
          {gLoading
            ? <ActivityIndicator size="small" color={Colors.textPrimary} />
            : <>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
          }
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or use magic link</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Username <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={styles.inputRow}>
              <Feather name="at-sign" size={17} color={Colors.textSubtle} />
              <TextInput
                style={styles.input}
                placeholder="your_username"
                placeholderTextColor={Colors.textSubtle}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                selectionColor="#FF4DA6"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Feather name="mail" size={17} color={Colors.textSubtle} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textSubtle}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                selectionColor="#FF4DA6"
              />
            </View>
          </View>

          {/* Magic note */}
          <View style={styles.magicNote}>
            <Ionicons name="flash-outline" size={13} color="#FF4DA6" />
            <Text style={styles.magicNoteText}>
              No password needed — we send a magic link straight to your email
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={handleMagicLink}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF4DA6', '#7B5CFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitBtn, loading && { opacity: 0.65 }]}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Ionicons name="send-outline" size={18} color="#fff" />
                      <Text style={styles.submitBtnText}>Send Magic Link</Text>
                    </>
                }
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* Browse as guest */}
        <Pressable style={styles.guestBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.guestBtnText}>Browse without signing in</Text>
        </Pressable>

        <Text style={styles.footer}>
          By continuing you agree to Shopitt Terms of Service and Privacy Policy.{'\n'}
          AETHØNN Inc. · shopitt54@gmail.com
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { paddingHorizontal: 24, alignItems: 'center' },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoPill: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, marginBottom: 16,
    shadowColor: '#FF4DA6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  logoText:   { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  tagline:    { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  taglineSub: { color: Colors.textSubtle, fontSize: 13 },

  googleBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 16, borderRadius: 16,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    minHeight: 56,
  },
  googleG:       { fontSize: 20, fontWeight: '900', color: '#EA4335' },
  googleBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16 },

  divider:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textSubtle, fontSize: 12 },

  card: {
    width: '100%', backgroundColor: Colors.surfaceCard,
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },

  field:      { marginBottom: 16 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  optional:   { color: Colors.textSubtle, fontWeight: '400' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },

  magicNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,77,166,0.07)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.2)', marginBottom: 16,
  },
  magicNoteText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)', marginBottom: 16,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, paddingVertical: 17, marginTop: 4, minHeight: 56,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  guestBtn: {
    width: '100%', borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20,
  },
  guestBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },

  footer: { color: Colors.textSubtle, fontSize: 11, textAlign: 'center', lineHeight: 18 },

  // Magic sent
  magicIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  magicTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: 12 },
  magicSub:   { color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  magicEmail: { color: '#FF4DA6', fontWeight: '700' },
  magicHint:  { color: Colors.textSubtle, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  resendBtn:  { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, borderWidth: 1.5, borderColor: Colors.border },
  resendBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
});
