import type { ReactNode } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { IdentitySplash } from "@/components/auth/IdentitySplash";

/**
 * Blocks UI render until the auth session is resolved.
 * - Authed: waits for profile to be hydrated
 * - Anonymous: renders immediately (no profile required)
 */
export const IdentityGate = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthed, profile } = useIdentity();
  if (loading) return <IdentitySplash />;
  if (isAuthed && !profile) return <IdentitySplash />;
  return <>{children}</>;
};
