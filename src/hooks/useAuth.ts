import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } = options ?? {};
  const router = useRouter();

  const ctx = useAuthContext();

  const logout = useCallback(async () => {
    await ctx.logout();
    if (redirectOnUnauthenticated) {
      router.push(redirectPath);
    }
  }, [ctx, redirectOnUnauthenticated, redirectPath, router]);

  // Backwards-compatible shape for existing components
  return useMemo(
    () => ({
      user: ctx.user ?? null,
      isAuthenticated: ctx.isAuthenticated,
      isLoading: ctx.isLoading,
      error: null,
      logout,
      refresh: ctx.refresh,
    }),
    [ctx, logout]
  );
}
