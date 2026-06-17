"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Clock, TrendingUp, TrendingDown, Brain, Zap, ChevronRight, Home, BarChart3, Award, Calendar, ArrowUpRight, Dices } from 'lucide-react';
import { getMasteryProgress, topics, topicColors, type Topic, type MasteryProgress } from '../data/generatorEngine';

interface TopicStats { topic: Topic; completed: number; correct: number; accuracy: number; currentStreak: number; bestStreak: number; totalTime: number; lastPracticed: string | null; color: string; }

export default function MasteryDashboard() {
  const [progress, setProgress] = useState<MasteryProgress[]>([]);
  const [sortBy, setSortBy] = useState<'accuracy' | 'streak' | 'recent'>('accuracy');

  useEffect(() => { setProgress(getMasteryProgress()); }, []);

  const topicStats: TopicStats[] = topics.map(topic => {
    const p = progress.find(pr => pr.topic === topic);
    if (!p) return { topic, completed: 0, correct: 0, accuracy: 0, currentStreak: 0, bestStreak: 0, totalTime: 0, lastPracticed: null, color: topicColors[topic] };
    return { topic, completed: p.completed, correct: p.correct, accuracy: p.completed > 0 ? Math.round((p.correct / p.completed) * 100) : 0, currentStreak: p.currentStreak, bestStreak: p.bestStreak, totalTime: p.totalTime, lastPracticed: p.lastPracticed, color: topicColors[topic] };
  });

  const sortedStats = [...topicStats].sort((a, b) => {
    if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (sortBy === 'streak') return b.bestStreak - a.bestStreak;
    if (!a.lastPracticed) return 1; if (!b.lastPracticed) return -1;
    return new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime();
  });

  const totalSolved = topicStats.reduce((s, t) => s + t.completed, 0);
  const totalCorrect = topicStats.reduce((s, t) => s + t.correct, 0);
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
  const bestStreakOverall = Math.max(...topicStats.map(t => t.bestStreak), 0);
  const totalTimeMin = Math.round(topicStats.reduce((s, t) => s + t.totalTime, 0) / 60000);
  const practicedTopics = topicStats.filter(t => t.completed > 0).length;
  const weakAreas = topicStats.filter(t => t.completed >= 3 && t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const strongAreas = topicStats.filter(t => t.correct >= 5 && t.accuracy > 85).sort((a, b) => b.accuracy - a.accuracy);
  const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never';

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-xs">
          <Link href="/" className="text-[#737373] hover:text-white flex items-center gap-1"><Home className="w-3 h-3" /></Link>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <Link href="/practice" className="text-[#737373] hover:text-white flex items-center gap-1"><Dices className="w-3 h-3" /></Link>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <span className="text-[#f6f6f6]">Mastery</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Mastery Dashboard</h1>
              <p className="text-sm text-[#737373]">Track your progress, identify strengths, and target weak areas</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[{ label: 'Problems Solved', value: totalSolved, icon: Target, color: '#3b82f6' }, { label: 'Accuracy', value: `${overallAccuracy}%`, icon: BarChart3, color: '#10b981' }, { label: 'Best Streak', value: bestStreakOverall, icon: Flame, color: '#f59e0b' }, { label: 'Time Practiced', value: `${totalTimeMin}m`, icon: Clock, color: '#8b5cf6' }].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}><stat.icon className="w-4 h-4" style={{ color: stat.color }} /></div>
                <span className="text-[10px] text-[#737373] uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-semibold font-mono">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-[#8b5cf6]" /><span className="text-sm font-semibold">Topic Coverage</span></div>
            <span className="text-xs text-[#737373] font-mono">{practicedTopics} / {topics.length} topics</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(practicedTopics / topics.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-4 h-4 text-[#ef4444]" /><span className="text-sm font-semibold">Focus Areas</span></div>
            {weakAreas.length === 0 ? <p className="text-xs text-[#737373] py-4 text-center">No weak areas detected. Keep practicing!</p> : (
              <div className="space-y-2">{weakAreas.map(a => (
                <div key={a.topic} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/10">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="text-xs font-medium flex-1">{a.topic}</span>
                  <span className="text-[10px] font-mono text-[#ef4444]">{a.accuracy}% accuracy</span>
                  <Link href="/practice" onClick={() => sessionStorage.setItem('practiceTopic', a.topic)} className="px-2 py-1 rounded-lg bg-[#ef4444]/15 text-[#ef4444] text-[10px] font-medium hover:bg-[#ef4444]/25 transition-colors">Practice</Link>
                </div>
              ))}</div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-[#10b981]" /><span className="text-sm font-semibold">Strengths</span></div>
            {strongAreas.length === 0 ? <p className="text-xs text-[#737373] py-4 text-center">Keep practicing to build mastery streaks!</p> : (
              <div className="space-y-2">{strongAreas.map(a => (
                <div key={a.topic} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#10b981]/5 border border-[#10b981]/10">
                  <Award className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span className="text-xs font-medium flex-1">{a.topic}</span>
                  <span className="text-[10px] font-mono text-[#10b981]">{a.accuracy}% accuracy</span>
                </div>
              ))}</div>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-panel rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#3b82f6]" /><span className="text-sm font-semibold">Topic Breakdown</span></div>
            <div className="flex items-center gap-1">{(['accuracy', 'streak', 'recent'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${sortBy === s ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}>{s === 'accuracy' ? 'Accuracy' : s === 'streak' ? 'Streak' : 'Recent'}</button>
            ))}</div>
          </div>
          <div className="space-y-1">
            <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-[#737373] uppercase tracking-wider">
              <div className="col-span-3">Topic</div><div className="col-span-2 text-center">Solved</div><div className="col-span-2 text-center">Accuracy</div><div className="col-span-2 text-center">Best Streak</div><div className="col-span-2 text-center">Last</div><div className="col-span-1" />
            </div>
            {sortedStats.map(stat => (
              <div key={stat.topic} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="col-span-2 md:col-span-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stat.color }} /><span className="text-xs font-medium">{stat.topic}</span></div>
                <div className="col-span-1 md:col-span-2 text-center"><span className="text-xs font-mono">{stat.completed}</span></div>
                <div className="col-span-1 md:col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden hidden sm:block"><div className="h-full rounded-full" style={{ width: `${stat.accuracy}%`, backgroundColor: stat.accuracy >= 85 ? '#10b981' : stat.accuracy >= 60 ? '#f59e0b' : '#ef4444' }} /></div>
                    <span className="text-[10px] font-mono" style={{ color: stat.accuracy >= 85 ? '#10b981' : stat.accuracy >= 60 ? '#f59e0b' : '#ef4444' }}>{stat.accuracy}%</span>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 text-center"><span className="text-xs font-mono flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-[#f59e0b]" />{stat.bestStreak}</span></div>
                <div className="col-span-1 md:col-span-2 text-center"><span className="text-[10px] text-[#737373] font-mono flex items-center justify-center gap-1"><Calendar className="w-3 h-3" />{formatDate(stat.lastPracticed)}</span></div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <Link href="/practice" onClick={() => sessionStorage.setItem('practiceTopic', stat.topic)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title={`Practice ${stat.topic}`}><ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" /></Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-[#ec4899]" /><span className="text-sm font-semibold">Quick Actions</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/practice" className="flex items-center gap-3 p-4 rounded-xl bg-[#ec4899]/5 border border-[#ec4899]/15 hover:bg-[#ec4899]/10 transition-colors group">
              <Dices className="w-5 h-5 text-[#ec4899]" /><div><div className="text-xs font-medium group-hover:text-[#ec4899] transition-colors">Start Practice</div><div className="text-[10px] text-[#737373]">Generate infinite exercises</div></div>
            </Link>
            <Link href="/exercises" className="flex items-center gap-3 p-4 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/15 hover:bg-[#3b82f6]/10 transition-colors group">
              <Target className="w-5 h-5 text-[#3b82f6]" /><div><div className="text-xs font-medium group-hover:text-[#3b82f6] transition-colors">Curated Exercises</div><div className="text-[10px] text-[#737373]">20 hand-crafted problems</div></div>
            </Link>
            <Link href="/" className="flex items-center gap-3 p-4 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15 hover:bg-[#10b981]/10 transition-colors group">
              <Home className="w-5 h-5 text-[#10b981]" /><div><div className="text-xs font-medium group-hover:text-[#10b981] transition-colors">Back to Home</div><div className="text-[10px] text-[#737373]">Explore chapters & tools</div></div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
