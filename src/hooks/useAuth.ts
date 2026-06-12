import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } = options ?? {};
  const navigate = useNavigate();

  const ctx = useAuthContext();

  const logout = useCallback(async () => {
    await ctx.logout();
    if (redirectOnUnauthenticated) {
      navigate(redirectPath);
    }
  }, [ctx, redirectOnUnauthenticated, redirectPath, navigate]);

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
