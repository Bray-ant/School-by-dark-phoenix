import { useAuth } from '../contexts/AuthContext';
import { trpc } from '@/providers/trpc';
import { Users, Shield, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ONLINE_THRESHOLD_MINUTES = 15;

function isOnline(lastActiveAt: Date | null | undefined) {
  if (!lastActiveAt) return false;
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  return diff >= 0 && diff < ONLINE_THRESHOLD_MINUTES * 60 * 1000;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { data: users, isLoading, error } = trpc.admin.users.useQuery();

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

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 flex items-center gap-3">
            <Users className="w-7 h-7 text-[#8b5cf6]" /> Users
          </h1>
          <p className="text-sm text-[#737373]">
            {users ? `${users.length} registered user${users.length === 1 ? '' : 's'}` : 'Loading users...'}
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" />
          </div>
        )}

        {error && (
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-3 text-[#ef4444]">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">Failed to load users.</div>
          </div>
        )}

        {users && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#a3a3a3]">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Active</th>
                    <th className="px-4 py-3 font-medium">Last Sign In</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-[#737373]">{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3 text-[#a3a3a3]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${u.role === 'admin' ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' : 'bg-white/5 text-[#a3a3a3]'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isOnline(u.lastActiveAt) ? (
                          <span className="inline-flex items-center gap-1 text-[#10b981]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#737373]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" /> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#737373]">{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : 'Never'}</td>
                      <td className="px-4 py-3 text-[#737373]">{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : 'Never'}</td>
                      <td className="px-4 py-3 text-[#737373]">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-8 text-center text-sm text-[#737373]">No users yet.</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
