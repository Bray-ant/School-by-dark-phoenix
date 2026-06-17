"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  LogIn, UserPlus, Eye, EyeOff, KeyRound, Shield, Lock,
  User, Mail, ArrowLeft, CheckCircle, XCircle, RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { hashPassword } from '../utils/security';

type View = 'login' | 'register' | 'verifyOtp' | 'verifyExistingEmail' | 'forgotPassword' | 'resetPassword';

// ── Password policy helpers ──

const PASSWORD_RULES = [
  { test: (pw: string) => pw.length >= 12, label: '12+ characters' },
  { test: (pw: string) => pw.length <= 128, label: '128 max characters' },
  { test: (pw: string) => /[A-Z]/.test(pw), label: 'Uppercase letter' },
  { test: (pw: string) => /[a-z]/.test(pw), label: 'Lowercase letter' },
  { test: (pw: string) => /\d/.test(pw), label: 'Number' },
  { test: (pw: string) => /[^a-zA-Z0-9]/.test(pw), label: 'Special character' },
];

function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every(r => r.test(pw));
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

function strengthScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(4, Math.floor(s / 1.25));
}

function strengthLabel(s: number): { label: string; color: string } {
  const labels = [
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Strong', color: '#f59e0b' },
    { label: 'Very Strong', color: '#10b981' },
  ];
  return labels[s] || labels[0];
}

function StrengthMeter({ password }: { password: string }) {
  const s = strengthScore(password);
  const { label, color } = strengthLabel(s);
  return (
    <div className="mt-1.5">
      <div className="flex gap-0.5 h-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 rounded-full transition-colors" style={{ background: i <= s ? color : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <p className="text-[9px] mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}

function PasswordRequirements({ password, extraRules }: { password: string; extraRules?: { test: (pw: string) => boolean; label: string }[] }) {
  if (!password) return null;
  const rules = [...PASSWORD_RULES, ...(extraRules || [])];
  return (
    <div className="mt-2 space-y-0.5">
      {rules.map(rule => {
        const pass = rule.test(password);
        return (
          <div key={rule.label} className="flex items-center gap-1.5">
            {pass
              ? <CheckCircle className="w-3 h-3 text-[#10b981]" />
              : <XCircle className="w-3 h-3 text-[#525252]" />}
            <span className={`text-[9px] ${pass ? 'text-[#10b981]' : 'text-[#525252]'}`}>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-[200] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
        type === 'success' ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]' : 'bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444]'
      }`}>
      {type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {message}
    </motion.div>
  );
}

export default function AuthPage() {
  const { isAuthenticated, login, register, verifyOtp, rateLimitInfo } = useAuth();
  const [view, setView] = useState<View>('login');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regConfirmPw, setRegConfirmPw] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // OTP verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpDevCode, setOtpDevCode] = useState<string | null>(null);

  // Existing-account email verification state
  const [verifyEmailCode, setVerifyEmailCode] = useState('');
  const [verifyEmailDevCode, setVerifyEmailDevCode] = useState<string | null>(null);

  // Forgot/reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetTokenDev, setResetTokenDev] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  // ── Handlers ──

  const handleLogin = async () => {
    if (!loginEmail || !loginPw) { showToast('Please fill in all fields.', 'error'); return; }
    setLoading(true);
    const result = await login(loginEmail, loginPw);
    if (result.success) {
      showToast('Welcome back!', 'success');
    } else if (result.error?.toLowerCase().includes('verify your email')) {
      showToast('Your email is not verified yet. Sending a verification code...', 'error');
      await handleSendVerifyEmailCode();
    } else {
      showToast(result.error || 'Login failed.', 'error');
    }
    setLoading(false);
  };

  const handleSendVerifyEmailCode = async () => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, purpose: 'VERIFY_EMAIL' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.otp) setVerifyEmailDevCode(data.otp);
        setVerifyEmailCode('');
        setView('verifyExistingEmail');
        showToast(data.otp ? 'Verification code generated (dev mode).' : 'A verification code has been sent to your email.', 'success');
      } else {
        showToast(data.error || 'Failed to send verification code.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleVerifyExistingEmail = async () => {
    if (!verifyEmailCode) { showToast('Enter the verification code.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-existing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, otp: verifyEmailCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Email verified! Please sign in.', 'success');
        setVerifyEmailCode(''); setVerifyEmailDevCode(null);
        setView('login');
      } else {
        showToast(data.error || 'Verification failed.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!regFirstName || !regLastName || !regUsername || !regEmail || !regPw) {
      showToast('Please fill in all fields.', 'error'); return;
    }
    if (!USERNAME_REGEX.test(regUsername)) {
      showToast('Username must be 3-30 chars, letters, numbers, and underscores only.', 'error'); return;
    }
    if (!isPasswordValid(regPw)) { showToast('Password does not meet all requirements.', 'error'); return; }
    if (regPw !== regConfirmPw) { showToast('Passwords do not match.', 'error'); return; }
    if (regPw.toLowerCase().includes(regUsername.toLowerCase())) {
      showToast('Password must not contain your username.', 'error'); return;
    }
    if (regPw.toLowerCase().includes(regEmail.split('@')[0].toLowerCase())) {
      showToast('Password must not contain your email address.', 'error'); return;
    }
    if (!acceptTerms) { showToast('You must accept the Terms & Conditions.', 'error'); return; }

    setLoading(true);
    const result = await register({
      firstName: regFirstName,
      lastName: regLastName,
      username: regUsername,
      email: regEmail,
      password: regPw,
      acceptTerms,
    });
    if (result.success) {
      if (result.requiresOtp) {
        if (result.otp) setOtpDevCode(result.otp);
        setView('verifyOtp');
        showToast(result.otp ? 'Verification code generated (dev mode).' : 'Verification code sent to your email.', 'success');
      } else {
        showToast('Account created! Please sign in.', 'success');
        setView('login');
        setLoginEmail(regEmail);
      }
    } else {
      showToast(result.error || 'Registration failed.', 'error');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) { showToast('Enter the verification code.', 'error'); return; }
    setLoading(true);
    const result = await verifyOtp({
      email: regEmail,
      otp: otpCode,
      firstName: regFirstName,
      lastName: regLastName,
      username: regUsername,
      password: regPw,
      acceptTerms,
    });
    if (result.success) {
      showToast('Account verified! Logging you in...', 'success');
      setRegFirstName(''); setRegLastName(''); setRegUsername('');
      setRegEmail(''); setRegPw(''); setRegConfirmPw('');
      setOtpCode(''); setOtpDevCode(null); setAcceptTerms(false);
    } else {
      showToast(result.error || 'Verification failed.', 'error');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, purpose: 'REGISTER', firstName: regFirstName }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.otp) setOtpDevCode(data.otp);
        setOtpCode('');
        showToast(data.otp ? 'New code generated (dev mode).' : 'New code sent to your email.', 'success');
      } else {
        showToast(data.error || 'Failed to resend code.', 'error');
      }
    } catch {
      showToast('Request failed.', 'error');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { showToast('Enter your email address.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.token) {
          setResetTokenDev(data.token);
          setResetToken(data.token);
        }
        setView('resetPassword');
        showToast(
          data.token
            ? 'Reset token generated (dev mode).'
            : 'If an account exists, a password reset email has been sent.',
          'success',
        );
      } else {
        showToast(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch {
      showToast('Request failed.', 'error');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetToken) { showToast('Enter or paste the reset token.', 'error'); return; }
    if (!resetPw) { showToast('Enter a new password.', 'error'); return; }
    if (!isPasswordValid(resetPw)) { showToast('Password does not meet all requirements.', 'error'); return; }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(resetPw);
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, passwordHash, rawPassword: resetPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Password reset! Please sign in.', 'success');
        setResetPw(''); setResetToken(''); setResetTokenDev(null); setForgotEmail(''); setView('login');
      } else {
        showToast(data.error || 'Reset failed.', 'error');
      }
    } catch {
      showToast('Reset failed.', 'error');
    }
    setLoading(false);
  };

  const genPw = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*';
    const all = lower + upper + digits + special;
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    let pw = lower[arr[0] % lower.length]
      + upper[arr[1] % upper.length]
      + digits[arr[2] % digits.length]
      + special[arr[3] % special.length];
    for (let i = 4; i < 16; i++) pw += all[arr[i] % all.length];
    const chars = pw.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = arr[i % arr.length] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const generated = chars.join('');
    setRegPw(generated);
    setRegConfirmPw(generated);
    setShowRegPw(true);
  };

  const regExtraRules = [
    {
      test: (pw: string) => !regUsername || !pw.toLowerCase().includes(regUsername.toLowerCase()),
      label: 'Must not contain username',
    },
    {
      test: (pw: string) => !regEmail || !pw.toLowerCase().includes(regEmail.split('@')[0].toLowerCase()),
      label: 'Must not contain email',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#050510' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)' }} />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#8b5cf6]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Project school</h1>
          <p className="text-[11px] text-[#737373] mt-1">Secure Authentication</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ LOGIN ═══ */}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><LogIn className="w-4 h-4 text-[#8b5cf6]" /> Sign In</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#8b5cf6]/30 placeholder-[#525252]"
                        placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={loginPw} onChange={e => setLoginPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} type="password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#8b5cf6]/30 placeholder-[#525252]"
                        placeholder="Your password" />
                    </div>
                  </div>
                </div>

                {rateLimitInfo.locked && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                    <p className="text-[10px] text-[#ef4444]">Account locked. Try again in {rateLimitInfo.minutes}m.</p>
                  </div>
                )}

                <button onClick={handleLogin} disabled={loading || rateLimitInfo.locked}
                  className="w-full mt-4 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><LogIn className="w-3.5 h-3.5" /> Sign In</>}
                </button>

                <div className="text-center mt-4 space-y-1.5">
                  <p className="text-[10px] text-[#737373]">
                    <button onClick={() => setView('forgotPassword')} className="text-[#8b5cf6] hover:underline font-medium">Forgot password?</button>
                  </p>
                  <p className="text-[10px] text-[#737373]">
                    Don&apos;t have an account?{' '}
                    <button onClick={() => setView('register')} className="text-[#8b5cf6] hover:underline font-medium">Create one</button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ REGISTER ═══ */}
          {view === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <button onClick={() => setView('login')} className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white mb-3 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#10b981]" /> Create Account</h2>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#737373] mb-1 block">First Name</label>
                      <input value={regFirstName} onChange={e => setRegFirstName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="John" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#737373] mb-1 block">Last Name</label>
                      <input value={regLastName} onChange={e => setRegLastName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={regUsername} onChange={e => setRegUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="your_username" />
                    </div>
                    {regUsername && !USERNAME_REGEX.test(regUsername) && (
                      <p className="text-[9px] text-[#ef4444] mt-1">3-30 chars, letters, numbers, and underscores only</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-[#737373]">Password</label>
                      <button onClick={genPw} className="text-[9px] text-[#8b5cf6] hover:text-[#a78bfa] flex items-center gap-0.5 transition-colors">
                        <KeyRound className="w-2.5 h-2.5" /> Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={regPw} onChange={e => setRegPw(e.target.value)} type={showRegPw ? 'text' : 'password'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="Min 12 chars, mixed case + number + special" />
                      <button onClick={() => setShowRegPw(!showRegPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors">
                        {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regPw && <StrengthMeter password={regPw} />}
                    <PasswordRequirements password={regPw} extraRules={regExtraRules} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={regConfirmPw} onChange={e => setRegConfirmPw(e.target.value)} type={showRegPw ? 'text' : 'password'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="Re-enter your password" />
                    </div>
                    {regConfirmPw && regPw !== regConfirmPw && (
                      <p className="text-[9px] text-[#ef4444] mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> Passwords do not match</p>
                    )}
                    {regConfirmPw && regPw === regConfirmPw && regConfirmPw.length > 0 && (
                      <p className="text-[9px] text-[#10b981] mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-white/5" id="accept-terms" />
                    <label htmlFor="accept-terms" className="text-[10px] text-[#737373] cursor-pointer">
                      I accept the <span className="text-[#8b5cf6]">Terms & Conditions</span> and <span className="text-[#8b5cf6]">Privacy Policy</span>
                    </label>
                  </div>
                </div>

                <button onClick={handleRegister} disabled={loading}
                  className="w-full mt-4 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><UserPlus className="w-3.5 h-3.5" /> Create Account</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ VERIFY OTP ═══ */}
          {view === 'verifyOtp' && (
            <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <button onClick={() => setView('register')} className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white mb-3 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-[#3b82f6]" /> Verify Email</h2>
                <p className="text-[10px] text-[#737373] mb-4">
                  Enter the 6-digit code sent to <span className="text-[#a3a3a3] font-medium">{regEmail}</span>
                </p>

                {otpDevCode && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                    <p className="text-[10px] text-[#f59e0b]">Dev mode — your code is: <span className="font-mono font-bold tracking-widest">{otpDevCode}</span></p>
                  </div>
                )}

                <div className="relative mb-3">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#3b82f6]/30 placeholder-[#525252] font-mono tracking-[0.5em] text-center"
                    placeholder="000000" maxLength={6} inputMode="numeric" />
                </div>

                <p className="text-[9px] text-[#525252] mb-3">Code expires in 10 minutes. Do not share it with anyone.</p>

                <button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6}
                  className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Verify & Create Account</>}
                </button>

                <button onClick={handleResendOtp} disabled={loading}
                  className="w-full mt-2 py-2 text-[10px] text-[#737373] hover:text-white transition-colors">
                  Didn&apos;t receive it? <span className="text-[#3b82f6] font-medium">Resend Code</span>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'verifyExistingEmail' && (
            <motion.div key="verify-existing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <button onClick={() => setView('login')} className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white mb-3 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-[#3b82f6]" /> Verify Your Email</h2>
                <p className="text-[10px] text-[#737373] mb-4">
                  Enter the 6-digit code sent to <span className="text-[#a3a3a3] font-medium">{loginEmail}</span>
                </p>

                {verifyEmailDevCode && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                    <p className="text-[10px] text-[#f59e0b]">Dev mode — your code is: <span className="font-mono font-bold tracking-widest">{verifyEmailDevCode}</span></p>
                  </div>
                )}

                <div className="relative mb-3">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input value={verifyEmailCode} onChange={e => setVerifyEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyExistingEmail()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#3b82f6]/30 placeholder-[#525252] font-mono tracking-[0.5em] text-center"
                    placeholder="000000" maxLength={6} inputMode="numeric" />
                </div>

                <p className="text-[9px] text-[#525252] mb-3">Code expires in 10 minutes. Do not share it with anyone.</p>

                <button onClick={handleVerifyExistingEmail} disabled={loading || verifyEmailCode.length !== 6}
                  className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Verify Email</>}
                </button>

                <button onClick={handleSendVerifyEmailCode} disabled={loading}
                  className="w-full mt-2 py-2 text-[10px] text-[#737373] hover:text-white transition-colors">
                  Didn&apos;t receive it? <span className="text-[#3b82f6] font-medium">Resend Code</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ FORGOT PASSWORD ═══ */}
          {view === 'forgotPassword' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <button onClick={() => setView('login')} className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white mb-3 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><KeyRound className="w-4 h-4 text-[#f59e0b]" /> Reset Password</h2>
                <p className="text-[10px] text-[#737373] mb-4">Enter your email to receive a password reset token.</p>
                <div className="relative mb-3">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#f59e0b]/30 placeholder-[#525252]"
                    placeholder="you@example.com" />
                </div>
                <button onClick={handleForgotPassword} disabled={loading}
                  className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><KeyRound className="w-3.5 h-3.5" /> Request Reset</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ RESET PASSWORD (token + new password) ═══ */}
          {view === 'resetPassword' && (
            <motion.div key="reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <button onClick={() => { setView('forgotPassword'); setResetToken(''); setResetTokenDev(null); }} className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-white mb-3 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-[#10b981]" /> New Password</h2>
                <p className="text-[10px] text-[#737373] mb-4">
                  {resetTokenDev
                    ? 'Token auto-filled (dev mode). Enter your new password below.'
                    : 'Paste the token from your email and enter a new password.'}
                </p>

                {resetTokenDev && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                    <p className="text-[10px] text-[#f59e0b]">Dev mode — token auto-filled</p>
                  </div>
                )}

                {!resetTokenDev && (
                  <div className="relative mb-3">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                    <input value={resetToken} onChange={e => setResetToken(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#f59e0b]/30 placeholder-[#525252] font-mono"
                      placeholder="Paste reset token from email" />
                  </div>
                )}

                <div className="relative mb-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input value={resetPw} onChange={e => setResetPw(e.target.value)} type={showResetPw ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                    placeholder="New strong password" />
                  <button onClick={() => setShowResetPw(!showResetPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors">
                    {showResetPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {resetPw && <StrengthMeter password={resetPw} />}
                <PasswordRequirements password={resetPw} />

                <p className="text-[9px] text-[#525252] mt-2">Token expires in 30 minutes. Do not share it.</p>

                <button onClick={handleResetPassword} disabled={loading}
                  className="w-full mt-4 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Reset Password</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
