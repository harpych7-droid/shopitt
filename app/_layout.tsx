import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { BagProvider } from '@/contexts/BagContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import AuthModal from '@/components/ui/AuthModal';

/**
 * Route guard — runs inside AuthProvider.
 *
 * Public routes (no login required):
 *   /(tabs)          — home feed
 *   /product/[id]    — product detail
 *   shorts           — shorts tab (browsing only)
 *
 * Conditional redirects:
 *   • Not logged in + trying to reach a login/auth route → let through
 *   • Logged in + needsOnboarding + not on /onboarding  → send to onboarding
 *   • Logged in + fully setup + on login/auth/onboarding → send to home
 *
 * Unauthenticated users can browse the main tabs freely.
 * Protected actions use requireAuth() from the auth context instead.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] as string | undefined;
    const inAuthFlow  = currentSegment === 'login' || currentSegment === 'auth';
    const inOnboarding = currentSegment === 'onboarding';

    if (user && needsOnboarding && !inOnboarding) {
      // Logged in but country not set → onboarding
      router.replace('/onboarding');
    } else if (user && !needsOnboarding && (inAuthFlow || inOnboarding)) {
      // Fully authenticated, redirect away from auth screens
      router.replace('/(tabs)');
    }
    // No redirect for unauthenticated users on public routes
  }, [user, loading, needsOnboarding, segments]);

  // Show spinner only during initial session restore
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF4DA6" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BagProvider>
          <AuthGuard>
            {/* Global auth modal — available on every screen */}
            <AuthModal />

            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="(tabs)"           options={{ headerShown: false }} />
              <Stack.Screen name="login"            options={{ headerShown: false }} />
              <Stack.Screen name="onboarding"       options={{ headerShown: false }} />
              <Stack.Screen name="auth"             options={{ headerShown: false }} />
              <Stack.Screen name="seller-dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="menu"             options={{ headerShown: false }} />
              <Stack.Screen name="bag"              options={{ headerShown: false }} />
              <Stack.Screen name="checkout"         options={{ headerShown: false }} />
              <Stack.Screen name="comments"         options={{ headerShown: false }} />
              <Stack.Screen name="search"           options={{ headerShown: false }} />
              <Stack.Screen name="wallet"           options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]"     options={{ headerShown: false }} />
              <Stack.Screen name="user/[username]"  options={{ headerShown: false }} />
              <Stack.Screen name="order/[id]"       options={{ headerShown: false }} />
              <Stack.Screen name="chat/index"       options={{ headerShown: false }} />
              <Stack.Screen name="chat/[id]"        options={{ headerShown: false }} />
              <Stack.Screen name="info/help"        options={{ headerShown: false }} />
              <Stack.Screen name="info/contact"     options={{ headerShown: false }} />
              <Stack.Screen name="info/safety"      options={{ headerShown: false }} />
              <Stack.Screen name="info/terms"       options={{ headerShown: false }} />
              <Stack.Screen name="info/privacy"     options={{ headerShown: false }} />
              <Stack.Screen name="info/cookies"     options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
        </BagProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
