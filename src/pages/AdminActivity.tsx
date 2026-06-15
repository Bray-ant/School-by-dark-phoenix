import { useAuth } from '../contexts/AuthContext';
import { trpc } from '@/providers/trpc';
import { Activity, Shield, Loader2, AlertCircle, LogIn, LogOut, UserPlus, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ACTION_CONFIG: Record<string, { icon: typeof LogIn; color: string; label: string }> = {
  LOGIN: { icon: LogIn, color: '#10b981', label: 'Login' },
  LOGOUT: { icon: LogOut, color: '#f59e0b', label: 'Logout' },
  REGISTER: { icon: UserPlus, color: '#8b5cf6', label: 'Register' },
};

function formatRelativeTime(date: Date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function AdminActivity() {
  const { user } = useAuth();
  const { data: activity, isLoading, error } = trpc.admin.activity.useQuery();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel rounded-2xl p-6 text-center max-w-sm">
          <Shield className="w-8 h-8 text-[#ef4444] mx-auto mb-3" />
          <h1 className="text-sm font-semibold">Admin Access Required</h1>
          <p className="text-[10px] text-[#737373] mt-1">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const totalLogins = activity?.filter(a => a.action === 'LOGIN' && a.success).length ?? 0;
  const totalLogouts = activity?.filter(a => a.action === 'LOGOUT').length ?? 0;
  const failedAttempts = activity?.filter(a => !a.success).length ?? 0;
  const totalRegistrations = activity?.filter(a => a.action === 'REGISTER').length ?? 0;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#8b5cf6]" /> Login Activity
          </h1>
          <p className="text-sm text-[#737373]">
            Track all user login and logout events across the platform
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <LogIn className="w-4 h-4 text-[#10b981]" />
              <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider">Logins</span>
            </div>
            <p className="text-2xl font-semibold">{totalLogins}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <LogOut className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider">Logouts</span>
            </div>
            <p className="text-2xl font-semibold">{totalLogouts}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-[#ef4444]" />
              <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider">Failed</span>
            </div>
            <p className="text-2xl font-semibold">{failedAttempts}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider">Registrations</span>
            </div>
            <p className="text-2xl font-semibold">{totalRegistrations}</p>
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" />
          </div>
        )}

        {error && (
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-3 text-[#ef4444]">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">Failed to load activity log.</div>
          </div>
        )}

        {activity && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#a3a3a3]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">IP Address</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activity.map((entry) => {
                    const config = ACTION_CONFIG[entry.action] ?? { icon: Activity, color: '#737373', label: entry.action };
                    const Icon = config.icon;
                    return (
                      <tr key={entry.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5" style={{ color: config.color }}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="font-medium text-[11px]">{config.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{entry.username || '-'}</td>
                        <td className="px-4 py-3 text-[#a3a3a3]">{entry.email || '-'}</td>
                        <td className="px-4 py-3">
                          {entry.success ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#10b981]/15 text-[#10b981]">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#ef4444]/15 text-[#ef4444]">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#737373] text-[10px]">{entry.ipAddress || '-'}</td>
                        <td className="px-4 py-3 text-[#737373]" title={entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}>
                          {entry.createdAt ? formatRelativeTime(entry.createdAt) : '-'}
                        </td>
                        <td className="px-4 py-3 text-[#737373] max-w-[150px] truncate">{entry.details || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {activity.length === 0 && (
              <div className="p-8 text-center text-sm text-[#737373]">No login activity recorded yet.</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
