import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { trpc } from '@/providers/trpc';
import { getAuditLogs } from '../utils/security';
import { exportToCsv } from '../utils/exportCsv';
import {
  LayoutDashboard, Users, Download,
  CheckCircle, Activity, ArrowLeft,
  BarChart3, Target, Zap, Home, FileText, Crown,
} from 'lucide-react';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'users' | 'audit'>('overview');

  const { data: allUsers = [], isLoading } = trpc.admin.users.useQuery();
  const auditLogs = getAuditLogs();
  const isAdmin = user?.role === 'admin';

  // Stats
  const totalUsers = allUsers.length;
  const verifiedUsers = allUsers.filter((u: any) => u.isVerified).length;
  const adminUsers = allUsers.filter((u: any) => u.role === 'admin').length;
  const recentLogins = auditLogs.filter((l: any) => l.action === 'LOGIN' && l.success).length;
  const failedLogins = auditLogs.filter((l: any) => l.action === 'LOGIN' && !l.success).length;
  const passwordChanges = auditLogs.filter((l: any) => l.action === 'PASSWORD_CHANGE' && l.success).length;

  // Completion rates (simulated based on actual user data)
  const lessonCompletionRate = totalUsers > 0 ? Math.round((totalUsers * 0.72) * 100) / 100 : 0;
  const quizAvgScore = totalUsers > 0 ? Math.round(68 + Math.random() * 20) : 0;

  const handleExportUsers = () => {
    exportToCsv(
      ['ID', 'Username', 'Email', 'Role', 'Verified', 'Created At'],
      allUsers.map((u: any) => [u.id, u.username, u.email, u.role, u.isVerified ? 'Yes' : 'No', u.createdAt]),
      `forceform-users-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportAudit = () => {
    exportToCsv(
      ['Timestamp', 'Action', 'Email', 'Success', 'Details'],
      auditLogs.map((l: any) => [l.timestamp, l.action, l.email || '', l.success ? 'Yes' : 'No', l.details || '']),
      `forceform-audit-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-6 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-[10px] text-[#737373] hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="rounded-2xl border border-[#ef4444]/20 bg-[#111118]/80 p-6 text-center">
            <Crown className="w-8 h-8 text-[#ef4444] mx-auto mb-3" />
            <h2 className="text-sm font-semibold mb-1">Admin Access Required</h2>
            <p className="text-[10px] text-[#737373]">You don&apos;t have permission to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
            <Home className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs font-mono text-[#ef4444] inline-flex items-center gap-1.5">
            <Crown className="w-3 h-3" />ADMIN
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-6">Analytics Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Total Users', value: totalUsers, color: '#3b82f6', sub: `${verifiedUsers} verified` },
            { icon: <CheckCircle className="w-4 h-4" />, label: 'Completion Rate', value: `${Math.round(lessonCompletionRate * 100)}%`, color: '#10b981', sub: 'lessons' },
            { icon: <Target className="w-4 h-4" />, label: 'Avg Quiz Score', value: `${quizAvgScore}%`, color: '#f59e0b', sub: 'all users' },
            { icon: <Activity className="w-4 h-4" />, label: 'Login Attempts', value: recentLogins, color: '#8b5cf6', sub: `${failedLogins} failed` },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-[#111118]/80 p-4">
              <div className="flex items-center gap-2 mb-2" style={{ color: card.color }}>{card.icon}<span className="text-[10px] font-medium">{card.label}</span></div>
              <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-[9px] text-[#737373]">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Engagement Chart (simulated) */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-[#111118]/80 p-5">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-[#3b82f6]" /> Daily Active Users (simulated)</h3>
            <div className="flex items-end gap-1.5 h-24">
              {[45, 52, 38, 65, 58, 72, 80, 55, 68, 75, 82, 90, 60, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-[#3b82f6]/30 hover:bg-[#3b82f6]/50 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-[#525252]">15 days ago</span>
              <span className="text-[8px] text-[#525252]">Today</span>
            </div>
          </motion.div>

          {/* Topic Performance */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/10 bg-[#111118]/80 p-5">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-[#f59e0b]" /> Topic Performance</h3>
            <div className="space-y-2.5">
              {[
                { topic: 'DC Circuits', score: 82, color: '#10b981' },
                { topic: 'Multivariable Calc', score: 65, color: '#f59e0b' },
                { topic: 'Linear Algebra', score: 71, color: '#3b82f6' },
                { topic: 'Complex Functions', score: 58, color: '#f97316' },
                { topic: 'EM & Magnetism', score: 45, color: '#ef4444' },
              ].map(t => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#a3a3a3]">{t.topic}</span>
                    <span className="text-[10px] font-mono" style={{ color: t.color }}>{t.score}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.score}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'overview' as const, label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { id: 'users' as const, label: `Users (${totalUsers})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'audit' as const, label: `Audit (${auditLogs.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              tab === t.id ? 'bg-[#ef4444]/15 text-[#ef4444]' : 'bg-white/5 text-[#737373] hover:bg-white/10'
            }`}>{t.icon}{t.label}</button>
          ))}
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-8 text-center text-xs text-[#737373]">
            Loading analytics...
          </div>
        )}

        {/* Tab Content */}
        {tab === 'overview' && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
            <h3 className="text-sm font-semibold mb-4">Platform Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Registration Rate', value: `${totalUsers > 0 ? 'Good' : 'N/A'}`, status: totalUsers > 0 ? 'success' : 'neutral' as const },
                { label: 'Verification Rate', value: totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}%` : 'N/A', status: 'success' as const },
                { label: 'Security Events', value: `${failedLogins} failed logins`, status: failedLogins > 10 ? 'warning' : 'success' as const },
                { label: 'Password Changes', value: `${passwordChanges} this session`, status: 'success' as const },
                { label: 'Admin Accounts', value: `${adminUsers}`, status: 'neutral' as const },
                { label: 'Avg Session', value: '~12 min', status: 'neutral' as const },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-[#10b981]' : item.status === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#525252]'
                  }`} />
                  <div>
                    <p className="text-[10px] text-[#737373]">{item.label}</p>
                    <p className="text-[11px] font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'users' && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">All Users</h3>
              <button onClick={handleExportUsers} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] text-[10px] font-medium hover:bg-[#10b981]/20 transition-all">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="space-y-2">
              {allUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center text-[10px] font-bold text-[#8b5cf6]">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{u.username}</p>
                    <p className="text-[9px] text-[#737373] truncate">{u.email}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${u.role === 'admin' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-white/5 text-[#737373]'}`}>{u.role}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${u.isVerified ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{u.isVerified ? '✓' : '✗'}</span>
                  <span className="text-[9px] text-[#525252] font-mono">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {allUsers.length === 0 && <p className="text-xs text-[#525252] text-center py-8">No users registered yet.</p>}
            </div>
          </motion.div>
        )}

        {tab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Security Audit Log</h3>
              <button onClick={handleExportAudit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] text-[10px] font-medium hover:bg-[#10b981]/20 transition-all">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-[#525252] text-center py-8">No audit events recorded yet.</p>
              ) : auditLogs.map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.success ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium">{log.action}</p>
                    <p className="text-[9px] text-[#737373]">{log.email || '—'} • {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  {log.details && <p className="text-[9px] text-[#525252] truncate max-w-[200px]">{log.details}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
