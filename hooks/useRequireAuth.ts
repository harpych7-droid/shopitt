/**
 * useRequireAuth — convenience hook for protected actions
 *
 * Usage inside any component:
 *
 *   const requireAuth = useRequireAuth();
 *
 *   <Pressable onPress={() => requireAuth(() => handleLike())}>
 *     <Ionicons name="heart" />
 *   </Pressable>
 *
 * If the user is logged in: executes callback immediately.
 * If not: shows the AuthModal bottom sheet; callback runs after sign-in.
 */

import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth() {
  const { requireAuth } = useAuth();
  return requireAuth;
}
