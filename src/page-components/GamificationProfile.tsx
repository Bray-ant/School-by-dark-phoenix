"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, Flame, Star, Target, Zap,
  Award, Crown, Download,
  BookOpen, PenTool, Gamepad2, Brain, Calendar,
  BarChart3, CheckCircle, Lock, Home,
} from 'lucide-react';
import { loadStats, BADGES, getLeaderboard, getWeeklyProgress, getWeakAreas, exportProgressToCsv } from '../utils/gamification';

export default function GamificationProfile() {
  const router = useRouter();
  const [stats] = useState(loadStats());
  const [tab, setTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview');
  const weekly = getWeeklyProgress();
  const leaderboard = getLeaderboard();
  const weakAreas = getWeakAreas();

  const earnedBadges = BADGES.filter(b => stats.badgesEarned.includes(b.id));
  const lockedBadges = BADGES.filter(b => !stats.badgesEarned.includes(b.id));

  const handleExport = () => {
    const csv = exportProgressToCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forceform-progress.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const xpPercent = Math.round((stats.currentLevelXp / stats.xpToNextLevel) * 100);

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
            <Home className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-xs font-mono text-[#f59e0b] inline-flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />PROGRESS
          </div>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Level Circle */}
            <div className="relative">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - xpPercent / 100)}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#f59e0b]">{stats.level}</span>
                <span className="text-[9px] text-[#737373]">LEVEL</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl font-semibold tracking-tight mb-1">Your Learning Profile</h1>
              <p className="text-sm text-[#737373] mb-3">{stats.totalXp.toLocaleString()} XP total • {earnedBadges.length}/{BADGES.length} badges</p>

              {/* XP Bar */}
              <div className="w-full bg-white/5 rounded-full h-2.5 mb-1">
                <div className="h-full rounded-full bg-[#f59e0b] transition-all" style={{ width: `${xpPercent}%` }} />
              </div>
              <p className="text-[10px] text-[#525252]">{stats.currentLevelXp} / {stats.xpToNextLevel} XP to Level {stats.level + 1}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center px-4 py-2.5 rounded-xl bg-[#f97316]/5 border border-[#f97316]/10">
                <Flame className="w-4 h-4 text-[#f97316] mx-auto mb-0.5" />
                <p className="text-lg font-bold text-[#f97316]">{stats.streak}</p>
                <p className="text-[9px] text-[#737373]">Day Streak</p>
              </div>
              <div className="text-center px-4 py-2.5 rounded-xl bg-[#10b981]/5 border border-[#10b981]/10">
                <Target className="w-4 h-4 text-[#10b981] mx-auto mb-0.5" />
                <p className="text-lg font-bold text-[#10b981]">{weekly.percent}%</p>
                <p className="text-[9px] text-[#737373]">Weekly Goal</p>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="mt-5 pt-5 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#737373] flex items-center gap-1"><Calendar className="w-3 h-3" /> Weekly Goal: {weekly.current}/{weekly.goal} days</span>
              <button onClick={handleExport} className="text-[9px] text-[#8b5cf6] hover:text-[#a78bfa] flex items-center gap-1 transition-colors">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: weekly.goal }, (_, i) => (
                <div key={i} className={`flex-1 h-6 rounded-md ${i < weekly.current ? 'bg-[#10b981]/40' : 'bg-white/5'}`} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Activity Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#3b82f6]" /> Activity Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <BookOpen className="w-4 h-4" />, label: 'Lessons', value: stats.lessonsCompleted, color: '#3b82f6' },
              { icon: <PenTool className="w-4 h-4" />, label: 'Quizzes', value: stats.quizzesCompleted, color: '#10b981' },
              { icon: <Brain className="w-4 h-4" />, label: 'Exercises', value: stats.exercisesCompleted, color: '#8b5cf6' },
              { icon: <Gamepad2 className="w-4 h-4" />, label: 'Games', value: stats.gamesPlayed, color: '#ec4899' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: item.color }}>
                  {item.icon}
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
                <p className="text-[10px] text-[#737373]">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <h3 className="text-[10px] text-[#737373] mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-[#f59e0b]" /> Focus Areas (weakest topics)</h3>
              <div className="flex flex-wrap gap-1.5">
                {weakAreas.map((area, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-[#f59e0b]/10 text-[#f59e0b] text-[10px] font-medium">
                    {area.topic}: {area.score} XP
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'overview' as const, label: 'Overview', icon: <Star className="w-3.5 h-3.5" /> },
            { id: 'badges' as const, label: `Badges (${earnedBadges.length})`, icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'leaderboard' as const, label: 'Leaderboard', icon: <Crown className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              tab === t.id ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-white/5 text-[#737373] hover:bg-white/10'
            }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
            <h3 className="text-sm font-semibold mb-3">Recent Achievements</h3>
            {earnedBadges.length === 0 ? (
              <p className="text-xs text-[#737373] text-center py-6">Complete lessons, quizzes, and exercises to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {earnedBadges.slice(-8).map(badge => (
                  <div key={badge.id} className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-[10px] font-medium" style={{ color: badge.color }}>{badge.name}</p>
                    <p className="text-[9px] text-[#525252]">{badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'badges' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Earned ({earnedBadges.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/10">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-[11px] font-medium" style={{ color: badge.color }}>{badge.name}</p>
                      <p className="text-[9px] text-[#737373]">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-[#525252]" /> Locked ({lockedBadges.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lockedBadges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 opacity-50">
                    <span className="text-xl grayscale">{badge.icon}</span>
                    <div>
                      <p className="text-[11px] font-medium text-[#525252]">{badge.name}</p>
                      <p className="text-[9px] text-[#525252]">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Crown className="w-4 h-4 text-[#f59e0b]" /> Global Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => {
                const isYou = entry.name === 'You' || entry.name === 'Guest';
                return (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isYou ? 'bg-[#f59e0b]/5 border border-[#f59e0b]/20' : 'bg-white/5 border border-transparent'
                  }`}>
                    <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-[#f59e0b]' : 'text-[#525252]'}`}>#{i + 1}</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#a3a3a3]">
                      {entry.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-medium truncate ${isYou ? 'text-[#f59e0b]' : ''}`}>{entry.name}</p>
                      <p className="text-[9px] text-[#737373]">Level {entry.level} • {entry.badges} badges</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-[#f59e0b]">{entry.xp.toLocaleString()} XP</p>
                      <p className="text-[9px] text-[#737373]">{entry.streak > 0 ? `${entry.streak}🔥` : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
