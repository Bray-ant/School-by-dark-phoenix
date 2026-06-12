import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  LogIn, UserPlus, Eye, EyeOff, KeyRound, Shield, Lock,
  User, Mail, ArrowLeft, CheckCircle, XCircle, RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { hashPassword } from '../utils/security';

type View = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

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
    { label: 'Medium', color: '#f97316' },
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
  const { isAuthenticated, login, register, rateLimitInfo } = useAuth();
  const [view, setView] = useState<View>('login');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
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

  const handleLogin = async () => {
    if (!loginEmail || !loginPw) { showToast('Please fill in all fields.', 'error'); return; }
    setLoading(true);
    const result = await login(loginEmail, loginPw);
    if (result.success) { showToast('Welcome back!', 'success'); }
    else { showToast(result.error || 'Login failed.', 'error'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPw) { showToast('Please fill in all fields.', 'error'); return; }
    if (strengthScore(regPw) < 2) { showToast('Password must be at least Strong.', 'error'); return; }
    setLoading(true);
    const result = await register(regName, regEmail, regPw);
    if (result.success) {
      showToast('Account created! Please sign in.', 'success');
      setView('login');
      setLoginEmail(regEmail);
      setRegName(''); setRegEmail(''); setRegPw('');
    } else {
      showToast(result.error || 'Registration failed.', 'error');
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
      if (data.token) {
        setResetToken(data.token);
        setView('resetPassword');
        showToast('Reset token generated! Check below.', 'success');
      } else {
        showToast('If an account exists, a reset token will be generated.', 'success');
      }
    } catch {
      showToast('Request failed.', 'error');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetPw) { showToast('Enter a new password.', 'error'); return; }
    if (strengthScore(resetPw) < 2) { showToast('Password must be at least Strong.', 'error'); return; }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(resetPw);
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, passwordHash }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Password reset! Please sign in.', 'success');
        setResetPw(''); setResetToken(''); setForgotEmail(''); setView('login');
      } else {
        showToast(data.error || 'Reset failed.', 'error');
      }
    } catch {
      showToast('Reset failed.', 'error');
    }
    setLoading(false);
  };

  const genPw = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pw = '';
    for (let i = 0; i < 14; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setRegPw(pw);
    setShowRegPw(true);
  };

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
          <h1 className="text-xl font-semibold tracking-tight">ForceForm</h1>
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
                    Don't have an account?{' '}
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
                  <div>
                    <label className="text-[10px] text-[#737373] mb-1 block">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                      <input value={regName} onChange={e => setRegName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                        placeholder="Your name" />
                    </div>
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
                        placeholder="Min 8 chars, mixed case + number" />
                      <button onClick={() => setShowRegPw(!showRegPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors">
                        {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regPw && <StrengthMeter password={regPw} />}
                  </div>
                </div>

                <button onClick={handleRegister} disabled={loading}
                  className="w-full mt-4 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><UserPlus className="w-3.5 h-3.5" /> Create Account</>}
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
                <p className="text-[10px] text-[#737373] mb-4">Enter your email to receive a reset token.</p>
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

          {/* ═══ RESET PASSWORD ═══ */}
          {view === 'resetPassword' && (
            <motion.div key="reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
                <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><KeyRound className="w-4 h-4 text-[#10b981]" /> New Password</h2>
                <p className="text-[10px] text-[#737373] mb-4">Token: <span className="font-mono text-[#a3a3a3]">{resetToken.slice(0, 12)}...</span></p>
                <div className="relative mb-3">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252]" />
                  <input value={resetPw} onChange={e => setResetPw(e.target.value)} type={showResetPw ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 placeholder-[#525252]"
                    placeholder="New strong password" />
                  <button onClick={() => setShowResetPw(!showResetPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white transition-colors">
                    {showResetPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {resetPw && <StrengthMeter password={resetPw} />}
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
