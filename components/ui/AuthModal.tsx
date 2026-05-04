/**
 * AuthModal — inline auth gate
 *
 * Shown when a guest user triggers a protected action (like, buy, comment, save, etc.).
 * Keeps the user on the current screen; after login the pending action executes automatically.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, TextInput,
  Animated, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

type Tab = 'magic' | 'google';

export default function AuthModal() {
  const {
    authModalVisible, dismissAuthModal, completedAuth,
    signInWithGoogle, sendMagicLink,
  } = useAuth();

  const [tab,        setTab]        = useState<Tab>('magic');
  const [email,      setEmail]      = useState('');
  const [username,   setUsername]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [gLoading,   setGLoading]   = useState(false);
  const [error,      setError]      = useState('');
  const [magicSent,  setMagicSent]  = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (authModalVisible) {
      // Reset state on open
      setEmail('');
      setUsername('');
      setError('');
      setMagicSent(false);
      setTab('magic');

      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 600, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    }
  }, [authModalVisible]);

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
    } else if (!err) {
      completedAuth();
    }
  };

  if (!authModalVisible) return null;

  return (
    <Modal
      visible={authModalVisible}
      transparent
      animationType="none"
      onRequestClose={dismissAuthModal}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismissAuthModal} />
      </Animated.View>

      {/* Sheet */}
      <KeyboardAvoidingView
        style={styles.sheetContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#FF4DA6', '#7B5CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoPill}
            >
              <Text style={styles.logoText}>Shopitt</Text>
            </LinearGradient>
            <Pressable onPress={dismissAuthModal} style={styles.closeBtn} hitSlop={12}>
              <Feather name="x" size={20} color={Colors.textSubtle} />
            </Pressable>
          </View>

          <Text style={styles.title}>Sign in to continue</Text>
          <Text style={styles.subtitle}>Create an account or sign in to interact with this content</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {magicSent ? (
              /* ── Magic link sent ───────────────────────────────────────── */
              <View style={styles.magicSentWrap}>
                <LinearGradient colors={['#FF4DA6', '#7B5CFF']} style={styles.magicIcon}>
                  <Ionicons name="mail-unread-outline" size={36} color="#fff" />
                </LinearGradient>
                <Text style={styles.magicTitle}>Check your inbox!</Text>
                <Text style={styles.magicSub}>
                  Magic link sent to{'\n'}
                  <Text style={styles.magicEmail}>{email}</Text>
                </Text>
                <Text style={styles.magicHint}>
                  Tap the link in the email to sign in — no password needed.
                </Text>
                <Pressable style={styles.backBtn} onPress={() => setMagicSent(false)}>
                  <Text style={styles.backBtnText}>Use a different email</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* ── Google ────────────────────────────────────────────── */}
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

                {/* ── Divider ───────────────────────────────────────────── */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or magic link</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* ── Tab toggle ────────────────────────────────────────── */}
                <View style={styles.tabToggle}>
                  <Pressable
                    style={[styles.tabBtn, tab === 'magic' && styles.tabBtnActive]}
                    onPress={() => { setTab('magic'); setError(''); }}
                  >
                    <Ionicons name="flash-outline" size={13} color={tab === 'magic' ? '#FF4DA6' : Colors.textSubtle} />
                    <Text style={[styles.tabBtnText, tab === 'magic' && styles.tabBtnTextActive]}>
                      Magic Link
                    </Text>
                  </Pressable>
                </View>

                {/* ── Username (optional) ───────────────────────────────── */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    Username <Text style={styles.optional}>(optional for new accounts)</Text>
                  </Text>
                  <View style={styles.inputRow}>
                    <Feather name="at-sign" size={16} color={Colors.textSubtle} />
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

                {/* ── Email ─────────────────────────────────────────────── */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.inputRow}>
                    <Feather name="mail" size={16} color={Colors.textSubtle} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.textSubtle}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      selectionColor="#FF4DA6"
                      autoFocus
                    />
                  </View>
                </View>

                {/* ── Note ──────────────────────────────────────────────── */}
                <View style={styles.magicNote}>
                  <Ionicons name="flash-outline" size={13} color="#FF4DA6" />
                  <Text style={styles.magicNoteText}>No password needed — just tap the link in your email</Text>
                </View>

                {/* ── Error ─────────────────────────────────────────────── */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* ── Submit ────────────────────────────────────────────── */}
                <Pressable onPress={handleMagicLink} disabled={loading}>
                  <LinearGradient
                    colors={['#FF4DA6', '#7B5CFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.submitBtn, loading && { opacity: 0.65 }]}
                  >
                    {loading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <>
                          <Ionicons name="send-outline" size={17} color="#fff" />
                          <Text style={styles.submitBtnText}>Send Magic Link</Text>
                        </>
                    }
                  </LinearGradient>
                </Pressable>

                <Text style={styles.terms}>
                  By continuing you agree to Shopitt Terms & Privacy Policy
                </Text>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '92%',
  },
  handle: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: Colors.textSubtle,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  logoPill: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
  },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary, fontSize: 22, fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 24,
  },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 15, borderRadius: 14,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20,
    minHeight: 54,
  },
  googleG:      { fontSize: 18, fontWeight: '900', color: '#EA4335' },
  googleBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },

  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textSubtle, fontSize: 12 },

  tabToggle: {
    flexDirection: 'row', marginBottom: 20,
  },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: 'rgba(255,77,166,0.1)' },
  tabBtnText: { color: Colors.textSubtle, fontSize: 13, fontWeight: '600' },
  tabBtnTextActive: { color: '#FF4DA6' },

  field:      { marginBottom: 14 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 7 },
  optional:   { color: Colors.textSubtle, fontWeight: '400' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },

  magicNote: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,77,166,0.07)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.18)', marginBottom: 14,
  },
  magicNoteText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.18)', marginBottom: 14,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, paddingVertical: 16, minHeight: 54, marginBottom: 12,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  terms: {
    color: Colors.textSubtle, fontSize: 11, textAlign: 'center', lineHeight: 16,
    marginBottom: 8,
  },

  // Magic sent
  magicSentWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  magicIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  magicTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 10 },
  magicSub: {
    color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 12,
  },
  magicEmail: { color: '#FF4DA6', fontWeight: '700' },
  magicHint:  {
    color: Colors.textSubtle, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 28,
  },
  backBtn: {
    paddingVertical: 13, paddingHorizontal: 28,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
  },
  backBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
