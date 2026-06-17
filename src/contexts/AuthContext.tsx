"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  hashPassword,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  sanitizeInput,
  validateEmail,
  validateUsername,
  addAuditLog,
} from '../utils/security';
import { trpc } from '@/providers/trpc';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  name?: string | null;
  avatar?: string | null;
}

interface RegisterResult {
  success: boolean;
  error?: string;
  requiresOtp?: boolean;
  otp?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rateLimitInfo: { locked: boolean; minutes?: number };
}

interface RegisterOpts {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

interface VerifyOtpOpts {
  email: string;
  otp: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  acceptTerms: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (opts: RegisterOpts) => Promise<RegisterResult>;
  verifyOtp: (opts: VerifyOtpOpts) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const FALLBACK_VALUE: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  rateLimitInfo: { locked: false },
  login: async () => ({ success: false, error: 'Auth not ready' }),
  register: async () => ({ success: false, error: 'Auth not ready', requiresOtp: false }),
  verifyOtp: async () => ({ success: false, error: 'Auth not ready' }),
  logout: async () => {},
  refresh: async () => {},
};

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    rateLimitInfo: { locked: false },
  });

  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const syncUser = useCallback(() => {
    if (meQuery.isLoading) {
      setState(s => ({ ...s, isLoading: true }));
      return;
    }
    if (meQuery.data) {
      setState({
        user: meQuery.data as AuthUser,
        isAuthenticated: true,
        isLoading: false,
        rateLimitInfo: { locked: false },
      });
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        rateLimitInfo: { locked: false },
      });
    }
  }, [meQuery.data, meQuery.isLoading]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  const refresh = useCallback(async () => {
    await utils.auth.me.invalidate();
  }, [utils]);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = sanitizeInput(email).toLowerCase();

    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Invalid email address.' };
    }

    const rateCheck = checkRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      setState(s => ({ ...s, rateLimitInfo: { locked: true, minutes: rateCheck.lockoutMinutes } }));
      return { success: false, error: `Too many failed attempts. Account locked for ${rateCheck.lockoutMinutes} minutes.` };
    }

    try {
      const passwordHash = await hashPassword(password);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, passwordHash }),
      });

      if (!res.ok) {
        recordFailedAttempt(cleanEmail);
        const data = await res.json().catch(() => ({}));
        addAuditLog({ action: 'LOGIN', email: cleanEmail, success: false, details: data.error || 'Login failed' });
        return { success: false, error: data.error || 'Invalid email or password.' };
      }

      resetRateLimit(cleanEmail);
      await refresh();
      addAuditLog({ action: 'LOGIN', email: cleanEmail, success: true });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [refresh]);

  const register = useCallback(async (opts: RegisterOpts): Promise<RegisterResult> => {
    const cleanUsername = sanitizeInput(opts.username);
    const cleanEmail = sanitizeInput(opts.email).toLowerCase();

    if (!validateUsername(cleanUsername)) {
      return { success: false, error: 'Username must be 3-30 chars, letters, numbers, and underscores only.' };
    }
    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Invalid email address.' };
    }
    if (opts.password.length < 12) {
      return { success: false, error: 'Password must be at least 12 characters.' };
    }
    if (opts.password.length > 128) {
      return { success: false, error: 'Password must not exceed 128 characters.' };
    }

    try {
      const passwordHash = await hashPassword(opts.password);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: opts.firstName,
          lastName: opts.lastName,
          username: cleanUsername,
          email: cleanEmail,
          passwordHash,
          rawPassword: opts.password,
          acceptTerms: opts.acceptTerms,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addAuditLog({ action: 'REGISTER', email: cleanEmail, success: false, details: data.error || 'Registration failed' });
        return { success: false, error: data.error || 'Registration failed.' };
      }

      if (data.requiresOtp) {
        addAuditLog({ action: 'REGISTER', email: cleanEmail, success: true, details: 'OTP sent' });
        return { success: true, requiresOtp: true, otp: data.otp };
      }

      addAuditLog({ action: 'REGISTER', email: cleanEmail, success: true, details: `Username: ${cleanUsername}` });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const verifyOtp = useCallback(async (opts: VerifyOtpOpts) => {
    try {
      const passwordHash = await hashPassword(opts.password);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: opts.email,
          otp: opts.otp,
          firstName: opts.firstName,
          lastName: opts.lastName,
          username: opts.username,
          passwordHash,
          acceptTerms: opts.acceptTerms,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addAuditLog({ action: 'OTP_VERIFY', email: opts.email, success: false, details: data.error });
        return { success: false, error: data.error || 'Verification failed.' };
      }

      addAuditLog({ action: 'OTP_VERIFY', email: opts.email, success: true });
      await refresh();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        rateLimitInfo: { locked: false },
      });
      await utils.invalidate();
      addAuditLog({ action: 'LOGOUT', success: true });
    }
  }, [utils]);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      verifyOtp,
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AuthContext.Provider value={FALLBACK_VALUE}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return FALLBACK_VALUE;
  }
  return ctx;
}
