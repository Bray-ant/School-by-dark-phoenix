"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy, Zap, BookOpen, Target, Flame, Clock, Star,
  ChevronLeft, Lock, CheckCircle2, TrendingUp, Award,
  Cpu, Lightbulb, Calculator, CircuitBoard, Brain
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'practice' | 'mastery' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const tierColors = {
  bronze: { bg: 'bg-[#cd7f32]/15', border: 'border-[#cd7f32]/30', text: 'text-[#cd7f32]', label: 'Bronze' },
  silver: { bg: 'bg-[#c0c0c0]/15', border: 'border-[#c0c0c0]/30', text: 'text-[#c0c0c0]', label: 'Silver' },
  gold:   { bg: 'bg-[#ffd700]/15', border: 'border-[#ffd700]/30', text: 'text-[#ffd700]', label: 'Gold' },
  platinum:{ bg: 'bg-[#3b82f6]/15', border: 'border-[#3b82f6]/30', text: 'text-[#3b82f6]', label: 'Platinum' },
};

const categoryFilters = [
  { id: 'all', label: 'All', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'practice', label: 'Practice', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 'mastery', label: 'Mastery', icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'special', label: 'Special', icon: <Award className="w-3.5 h-3.5" /> },
];

function getLocalProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem('project_school_progress') || '{}');
  } catch {
    return {};
  }
}

function getLocalStats() {
  try {
    return JSON.parse(localStorage.getItem('project_school_stats') || '{}');
  } catch {
    return { totalSolved: 0, streakDays: 0, timeSpent: 0, perfectScores: 0 };
  }
}

export default function Achievements() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const progress = getLocalProgress();
    const stats = getLocalStats();
    const completedLessons = Object.values(progress).filter((v: unknown) => v === true).length;
    const totalTime = stats.timeSpent || 0;
    const totalSolved = stats.totalSolved || 0;

    const defs: Achievement[] = [
      {
        id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson',
        icon: <BookOpen className="w-5 h-5" />, category: 'learning', tier: 'bronze',
        requirement: 1, current: Math.min(completedLessons, 1), unlocked: completedLessons >= 1,
      },
      {
        id: 'five-lessons', title: 'Getting Serious', description: 'Complete 5 lessons',
        icon: <BookOpen className="w-5 h-5" />, category: 'learning', tier: 'bronze',
        requirement: 5, current: Math.min(completedLessons, 5), unlocked: completedLessons >= 5,
      },
      {
        id: 'ten-lessons', title: 'Dedicated Student', description: 'Complete 10 lessons',
        icon: <BookOpen className="w-5 h-5" />, category: 'learning', tier: 'silver',
        requirement: 10, current: Math.min(completedLessons, 10), unlocked: completedLessons >= 10,
      },
      {
        id: 'twenty-lessons', title: 'Scholar', description: 'Complete 20 lessons',
        icon: <BookOpen className="w-5 h-5" />, category: 'learning', tier: 'gold',
        requirement: 20, current: Math.min(completedLessons, 20), unlocked: completedLessons >= 20,
      },
      {
        id: 'dc-master', title: 'DC Circuit Master', description: 'Complete all DC Circuit chapters',
        icon: <CircuitBoard className="w-5 h-5" />, category: 'mastery', tier: 'platinum',
        requirement: 25, current: Math.min(completedLessons, 25), unlocked: completedLessons >= 25,
      },
      {
        id: 'first-problem', title: 'Problem Solver', description: 'Solve your first practice problem',
        icon: <Target className="w-5 h-5" />, category: 'practice', tier: 'bronze',
        requirement: 1, current: Math.min(totalSolved, 1), unlocked: totalSolved >= 1,
      },
      {
        id: 'ten-problems', title: 'Practice Makes Perfect', description: 'Solve 10 practice problems',
        icon: <Target className="w-5 h-5" />, category: 'practice', tier: 'silver',
        requirement: 10, current: Math.min(totalSolved, 10), unlocked: totalSolved >= 10,
      },
      {
        id: 'fifty-problems', title: 'Grandmaster', description: 'Solve 50 practice problems',
        icon: <Target className="w-5 h-5" />, category: 'practice', tier: 'gold',
        requirement: 50, current: Math.min(totalSolved, 50), unlocked: totalSolved >= 50,
      },
      {
        id: 'study-hour', title: 'Hour of Power', description: 'Study for 1 hour total',
        icon: <Clock className="w-5 h-5" />, category: 'learning', tier: 'bronze',
        requirement: 60, current: Math.min(Math.floor(totalTime / 60), 60), unlocked: totalTime >= 3600,
      },
      {
        id: 'study-day', title: 'Day of Learning', description: 'Study for 24 hours total',
        icon: <Clock className="w-5 h-5" />, category: 'learning', tier: 'silver',
        requirement: 1440, current: Math.min(Math.floor(totalTime / 60), 1440), unlocked: totalTime >= 86400,
      },
      {
        id: 'ohms-law', title: 'Ohm Sage', description: 'Master Ohm\'s Law exercises',
        icon: <Zap className="w-5 h-5" />, category: 'mastery', tier: 'silver',
        requirement: 1, current: totalSolved > 0 ? 1 : 0, unlocked: totalSolved > 0,
      },
      {
        id: 'ai-tutor', title: 'AI Explorer', description: 'Use the AI Tutor for the first time',
        icon: <Brain className="w-5 h-5" />, category: 'special', tier: 'bronze',
        requirement: 1, current: 0, unlocked: false,
      },
      {
        id: 'circuit-sim', title: 'Virtual Engineer', description: 'Use the circuit simulator',
        icon: <Cpu className="w-5 h-5" />, category: 'special', tier: 'bronze',
        requirement: 1, current: 0, unlocked: false,
      },
      {
        id: 'flashcard-master', title: 'Flashcard Wizard', description: 'Generate 5 flashcard sets',
        icon: <Lightbulb className="w-5 h-5" />, category: 'special', tier: 'silver',
        requirement: 5, current: 0, unlocked: false,
      },
      {
        id: 'math-whiz', title: 'Math Whiz', description: 'Solve 10 math exercises',
        icon: <Calculator className="w-5 h-5" />, category: 'practice', tier: 'silver',
        requirement: 10, current: Math.min(totalSolved, 10), unlocked: totalSolved >= 10,
      },
    ];

    setAchievements(defs);
  }, []);

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => {
    const mult = { bronze: 10, silver: 25, gold: 50, platinum: 100 };
    return sum + mult[a.tier];
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-[#737373] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Trophy className="w-6 h-6 text-[#f59e0b]" />
        <div>
          <h1 className="text-lg font-bold">Achievements</h1>
          <p className="text-xs text-[#737373]">{unlockedCount} of {achievements.length} unlocked &middot; {totalPoints} points</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Unlocked', value: `${unlockedCount}/${achievements.length}`, icon: <CheckCircle2 className="w-4 h-4 text-[#10b981]" />, color: 'text-[#10b981]' },
          { label: 'Points', value: totalPoints, icon: <Star className="w-4 h-4 text-[#f59e0b]" />, color: 'text-[#f59e0b]' },
          { label: 'Streak', value: `${getLocalStats().streakDays || 0}d`, icon: <Flame className="w-4 h-4 text-[#ef4444]" />, color: 'text-[#ef4444]' },
          { label: 'Level', value: Math.floor(totalPoints / 50) + 1, icon: <TrendingUp className="w-4 h-4 text-[#3b82f6]" />, color: 'text-[#3b82f6]' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              {card.icon}
              <span className="text-[10px] text-[#737373] uppercase tracking-wider">{card.label}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {categoryFilters.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
              filter === cat.id ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ach, i) => {
          const tc = tierColors[ach.tier];
          const progressPct = Math.min((ach.current / ach.requirement) * 100, 100);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`relative glass-panel rounded-xl p-4 border transition-all ${
                ach.unlocked ? tc.border : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${ach.unlocked ? tc.bg : 'bg-white/5'} flex items-center justify-center shrink-0 ${ach.unlocked ? tc.text : 'text-[#525252]'}`}>
                  {ach.unlocked ? ach.icon : <Lock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold">{ach.title}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${tc.bg} ${tc.text} font-medium`}>{tc.label}</span>
                  </div>
                  <p className="text-[11px] text-[#737373] mb-2">{ach.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ach.unlocked ? 'bg-[#10b981]' : 'bg-[#3b82f6]/50'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#737373] font-mono shrink-0">{ach.current}/{ach.requirement}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isAuthenticated && (
        <div className="mt-6 glass-panel rounded-xl p-4 text-center">
          <p className="text-xs text-[#737373]">Sign in to sync your achievements across devices and compete on the leaderboard.</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-xs text-[#3b82f6] hover:bg-[#3b82f6]/25 transition-all">
            Sign In to Sync
          </Link>
        </div>
      )}
    </div>
  );
}
