/**
 * AuthContext — clean rebuild
 *
 * Key design decisions:
 *  • Single onAuthStateChange listener, cleaned up on unmount
 *  • AppState auto-refresh (pause in background, resume in foreground)
 *  • Google OAuth: web = full-page redirect, native = WebBrowser + code exchange
 *  • Magic link (passwordless): same redirect strategy as Google
 *  • requireAuth(callback) — shows inline modal for unauthenticated actions;
 *    guest users can browse but must auth before any interaction
 *  • NO guest-mode bypass for protected actions
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Detect if we're running inside Expo Go / OnSpace preview (not a standalone build).
// In those environments, custom URI schemes (shopitt://) are NOT supported.
// We use the Expo Auth proxy (https://auth.expo.io) as a universal redirect instead.
const IS_EXPO_GO =
  Constants.appOwnership === 'expo' ||
  (typeof Constants.executionEnvironment === 'string' &&
    Constants.executionEnvironment === 'storeClient');

/**
 * Returns the correct redirect URI for the current runtime:
 *  • Expo Go / OnSpace preview  → Expo proxy  (https://auth.expo.io/...)
 *  • Standalone APK / IPA       → shopitt://auth
 *  • Web                        → {origin}/auth
 */
function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? `${window.location.origin}/auth` : '/auth';
  }
  // useProxy handles both Expo Go and standalone seamlessly
  // Standalone APK  → shopitt://auth/callback
  // Expo Go/preview → https://auth.expo.io/@<user>/shopitt
  return AuthSession.makeRedirectUri({
    scheme: 'shopitt',
    path: 'auth/callback',
    ...(IS_EXPO_GO ? { useProxy: true } : {}),
  });
}

// iOS: ensures the auth session browser closes itself after redirect
WebBrowser.maybeCompleteAuthSession();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  country: string | null;
  created_at: string;
}

interface AuthContextType {
  // State
  session:         Session | null;
  user:            User | null;
  profile:         Profile | null;
  loading:         boolean;
  needsOnboarding: boolean;

  // Auth methods
  signInWithGoogle:  () => Promise<{ error: string | null }>;
  sendMagicLink:     (email: string, username?: string) => Promise<{ error: string | null }>;
  signIn:            (email: string, password: string) => Promise<{ error: string | null }>;
  signUp:            (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut:           () => Promise<void>;

  // Profile
  refreshProfile:    () => Promise<void>;
  updateCountry:     (country: string) => Promise<void>;

  // Action gating
  requireAuth:       (callback: () => void) => void;
  authModalVisible:  boolean;
  pendingCallback:   (() => void) | null;
  dismissAuthModal:  () => void;
  completedAuth:     () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,  setSession]  = useState<Session | null>(null);
  const [user,     setUser]     = useState<User | null>(null);
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);

  // Action gating
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingCallback,  setPendingCallback]  = useState<(() => void) | null>(null);

  // Track whether we already have a listener to avoid duplicates
  const listenerActive = useRef(false);

  // ── Profile helpers ────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data as Profile);
      return (data as Profile) ?? null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Creates the profile row if it does not yet exist.
   * Uses upsert so it is safe to call on every login.
   */
  const ensureProfile = useCallback(async (u: User) => {
    try {
      const meta = u.user_metadata ?? {};
      const fallbackUsername =
        meta.username ??
        meta.name?.replace(/\s+/g, '_').toLowerCase() ??
        u.email?.split('@')[0] ??
        `user_${u.id.slice(0, 6)}`;

      await supabase.from('profiles').upsert(
        {
          id:         u.id,
          username:   fallbackUsername,
          avatar_url: meta.avatar_url ?? meta.picture ?? null,
          country:    null,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      await fetchProfile(u.id);
    } catch (e) {
      console.warn('[Auth] ensureProfile error:', e);
    }
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const updateCountry = useCallback(async (country: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ country }).eq('id', user.id);
    setProfile(prev => (prev ? { ...prev, country } : prev));
  }, [user]);

  // ── Session bootstrap + auth listener ─────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    // 1. Restore existing session (fast — from AsyncStorage / localStorage)
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await ensureProfile(s.user);
      }
      setLoading(false);
    });

    // 2. Single auth state listener
    if (!listenerActive.current) {
      listenerActive.current = true;
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, s) => {
          if (!mounted) return;
          setSession(s);
          setUser(s?.user ?? null);
          if (s?.user) {
            await ensureProfile(s.user);
          } else {
            setProfile(null);
          }
          // Always mark loading done after first auth event
          setLoading(false);
        }
      );

      // 3. AppState — pause/resume token refresh to save battery
      const appSub = AppState.addEventListener('change', state => {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else                    supabase.auth.stopAutoRefresh();
      });

      return () => {
        mounted = false;
        listenerActive.current = false;
        subscription.unsubscribe();
        appSub.remove();
      };
    }

    return () => { mounted = false; };
  }, [ensureProfile]);

  // ── Deep-link handler for native OAuth / magic-link callbacks ─────────────

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleUrl = async ({ url }: { url: string }) => {
      if (!url.startsWith('shopitt://')) return;
      try {
        // Parse both shopitt://auth/callback?code=... and shopitt://auth?code=...
        const parsed     = new URL(url);
        const code       = parsed.searchParams.get('code');
        const accessToken = parsed.searchParams.get('access_token');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.warn('[Auth] Deep-link code exchange error:', error.message);
        } else if (accessToken) {
          // Implicit flow — session already embedded in URL fragment
          // onAuthStateChange will pick this up automatically
          console.log('[Auth] Implicit token received via deep link');
        }
      } catch (e) {
        console.warn('[Auth] Deep-link parse error:', e);
      }
    };

    // Cold-start deep link
    Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  // ── Auth Methods ──────────────────────────────────────────────────────────

  /**
   * Google OAuth
   * - Web:    full-page redirect to {origin}/auth (PKCE code in query string)
   * - Native: in-app WebBrowser, polls for session, falls back to deep-link code exchange
   */
  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      if (Platform.OS === 'web') {
        const origin     = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectTo = `${origin}/auth`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: { access_type: 'offline', prompt: 'consent' },
          },
        });
        return { error: error?.message ?? null };
      }

      // Native ──────────────────────────────────────────────────────────────
      //
      // getRedirectUri() returns the correct URL for the current runtime:
      //   Expo Go / OnSpace preview → https://auth.expo.io/@<user>/shopitt
      //   Standalone APK/IPA        → shopitt://auth/callback
      //
      // BOTH must be listed in:
      //   • Google Cloud Console → OAuth 2.0 → Authorized Redirect URIs
      //   • Supabase Dashboard   → Auth → URL Configuration → Redirect URLs
      //
      const redirectUrl = getRedirectUri();

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' },
          skipBrowserRedirect: true,
        },
      });

      if (oauthError)  return { error: oauthError.message };
      if (!data?.url)  return { error: 'Could not generate Google sign-in URL' };

      // Open the system browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
        showInRecents: true,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { error: 'Sign in cancelled' };
      }

      // Try to exchange the code from the result URL
      if (result.type === 'success' && result.url) {
        try {
          const parsed = new URL(result.url);
          const code   = parsed.searchParams.get('code');
          if (code) {
            const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchErr) return { error: null };
          }
        } catch (_) { /* continue to polling */ }
      }

      // Poll for session (deep-link handler may have set it; max 15 s)
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) return { error: null };
      }

      return { error: 'Sign in timed out. Please try again.' };
    } catch (e: any) {
      return { error: e?.message ?? 'Google sign in failed' };
    }
  }, []);

  /**
   * Magic link (passwordless email sign-in)
   * Supabase sends a one-time link; user taps it → redirected back to app.
   */
  const sendMagicLink = useCallback(async (
    email: string,
    username?: string
  ): Promise<{ error: string | null }> => {
    const redirectTo = getRedirectUri();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: username ? { username } : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  /** Email + password (legacy support) */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  // ── Action gating ─────────────────────────────────────────────────────────

  /**
   * Call this before any protected action (like, buy, comment, save, chat, add to bag).
   * If user is logged in → executes callback immediately.
   * If not              → shows the auth modal, stores callback to run after login.
   */
  const requireAuth = useCallback((callback: () => void) => {
    if (user) {
      callback();
    } else {
      setPendingCallback(() => callback);
      setAuthModalVisible(true);
    }
  }, [user]);

  const dismissAuthModal = useCallback(() => {
    setAuthModalVisible(false);
    setPendingCallback(null);
  }, []);

  /**
   * Called by the auth modal / login screen after successful authentication.
   * Executes the pending callback and dismisses the modal.
   */
  const completedAuth = useCallback(() => {
    setAuthModalVisible(false);
    if (pendingCallback) {
      // Small delay so UI settles before running the action
      setTimeout(pendingCallback, 300);
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const needsOnboarding = !loading && !!user && profile !== null && !profile.country;

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    session, user, profile, loading, needsOnboarding,
    signInWithGoogle, sendMagicLink, signIn, signUp, signOut,
    refreshProfile, updateCountry,
    requireAuth, authModalVisible, pendingCallback, dismissAuthModal, completedAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
