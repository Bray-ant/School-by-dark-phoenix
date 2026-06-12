// ═══════════════════════════════════════════════
// SECURITY UTILITIES — Imran Security Layer
// ═══════════════════════════════════════════════

const SALT = 'ForceForm_Imran_Secure_2026_v2';
const ITERATIONS = 10000;

// ── PBKDF2-like password hashing using Web Crypto ──
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltData = encoder.encode(SALT);
  const passwordData = encoder.encode(password);

  // Combine salt + password
  const combined = new Uint8Array(saltData.length + passwordData.length);
  combined.set(saltData);
  combined.set(passwordData, saltData.length);

  let hash = await crypto.subtle.digest('SHA-256', combined);

  // Multiple iterations
  for (let i = 0; i < ITERATIONS; i++) {
    hash = await crypto.subtle.digest('SHA-256', hash);
  }

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Rate Limiter ──
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

const RATE_LIMIT_KEY = 'ff_rate_limits';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION = 60 * 60 * 1000; // 1 hour window

function getRateLimits(): Record<string, RateLimitEntry> {
  try { return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}'); } catch { return {}; }
}

function saveRateLimits(limits: Record<string, RateLimitEntry>) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; lockoutMinutes?: number } {
  const now = Date.now();
  const limits = getRateLimits();
  const entry = limits[identifier];

  if (!entry) return { allowed: true, remaining: MAX_ATTEMPTS };

  // Check if locked out
  if (entry.lockedUntil > now) {
    return { allowed: false, remaining: 0, lockoutMinutes: Math.ceil((entry.lockedUntil - now) / 60000) };
  }

  // Reset if window expired
  if (now - entry.firstAttempt > WINDOW_DURATION) {
    delete limits[identifier];
    saveRateLimits(limits);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  return { allowed: remaining > 0, remaining };
}

export function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const limits = getRateLimits();

  if (!limits[identifier]) {
    limits[identifier] = { attempts: 1, firstAttempt: now, lockedUntil: 0 };
  } else {
    limits[identifier].attempts++;
    if (limits[identifier].attempts >= MAX_ATTEMPTS) {
      limits[identifier].lockedUntil = now + LOCKOUT_DURATION;
    }
  }

  saveRateLimits(limits);
}

export function resetRateLimit(identifier: string) {
  const limits = getRateLimits();
  delete limits[identifier];
  saveRateLimits(limits);
}

// ── Session Security ──
const SESSION_KEY = 'ff_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface SecureSession {
  userId: string;
  token: string;
  expiresAt: number;
}

export function generateSessionToken(userId: string): SecureSession {
  const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  return {
    userId,
    token,
    expiresAt: Date.now() + SESSION_EXPIRY,
  };
}

export function saveSession(session: SecureSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): SecureSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as SecureSession | null;
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isSessionValid(): boolean {
  const session = loadSession();
  return session !== null && Date.now() < session.expiresAt;
}

// ── Input Sanitization ──
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .slice(0, 500); // Max 500 chars
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 320;
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

// ── Audit Log ──
const AUDIT_KEY = 'ff_audit_log';

export interface AuditEntry {
  id: string;
  action: string;
  email?: string;
  timestamp: string;
  ip?: string;
  success: boolean;
  details?: string;
}

export function addAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const logs: AuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  logs.unshift({
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  if (logs.length > 100) logs.length = 100;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function getAuditLogs(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
}

export function exportAuditLogs(filename?: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const logs = getAuditLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const name = filename || `forceform-auth-log-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Password Reset Token ──
const RESET_TOKENS_KEY = 'ff_reset_tokens';

export interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

export function generateResetToken(email: string): string {
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const tokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
  tokens.push({
    email,
    token,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    used: false,
  });
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  return token;
}

export function validateResetToken(token: string): { valid: boolean; email?: string } {
  const tokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
  const entry = tokens.find(t => t.token === token && !t.used && Date.now() < t.expiresAt);
  if (!entry) return { valid: false };
  return { valid: true, email: entry.email };
}

export function markResetTokenUsed(token: string) {
  const tokens: ResetToken[] = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]');
  const entry = tokens.find(t => t.token === token);
  if (entry) entry.used = true;
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
}
