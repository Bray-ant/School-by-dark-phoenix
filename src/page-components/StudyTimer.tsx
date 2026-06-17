"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, Play, Pause, RotateCcw, Coffee, BookOpen,
  Zap, CheckCircle2, Flame, TrendingUp, Timer,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: Record<TimerMode, { label: string; minutes: number; color: string; icon: React.ReactNode }> = {
  focus:       { label: 'Focus',       minutes: 25, color: '#3b82f6', icon: <BookOpen className="w-4 h-4" /> },
  shortBreak:  { label: 'Short Break', minutes: 5,  color: '#10b981', icon: <Coffee className="w-4 h-4" /> },
  longBreak:   { label: 'Long Break',  minutes: 15, color: '#8b5cf6', icon: <Zap className="w-4 h-4" /> },
};

interface Session {
  id: string;
  mode: TimerMode;
  duration: number;
  completedAt: string;
  topic?: string;
}

function getStoredSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem('project_school_sessions') || '[]'); }
  catch { return []; }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem('project_school_sessions', JSON.stringify(sessions));
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StudyTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(getStoredSessions);
  const [topic, setTopic] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { addToast } = useToast();

  const config = MODE_CONFIG[mode];

  useEffect(() => {
    const today = new Date().toDateString();
    const total = sessions
      .filter(s => new Date(s.completedAt).toDateString() === today)
      .reduce((sum, s) => sum + s.duration, 0);
    setTodayTotal(total);
  }, [sessions]);

  const clearInterval = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearInterval;
  }, [isRunning, timeLeft, mode]);

  const handleComplete = () => {
    clearInterval();
    setIsRunning(false);
    const completed: Session = {
      id: `session-${Date.now()}`,
      mode,
      duration: config.minutes * 60,
      completedAt: new Date().toISOString(),
      topic: topic || undefined,
    };
    const updated = [completed, ...sessions].slice(0, 100);
    setSessions(updated);
    saveSessions(updated);
    addToast(`${config.label} session complete! Great work!`, 'success');
    setTimeLeft(config.minutes * 60);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(config.minutes * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    clearInterval();
    setIsRunning(false);
    setTimeLeft(config.minutes * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    clearInterval();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].minutes * 60);
  };

  const progress = ((config.minutes * 60 - timeLeft) / (config.minutes * 60)) * 100;
  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());
  const focusSessions = todaySessions.filter(s => s.mode === 'focus');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-[#737373] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Timer className="w-6 h-6 text-[#3b82f6]" />
        <div>
          <h1 className="text-lg font-bold">Study Timer</h1>
          <p className="text-xs text-[#737373]">Pomodoro-style focused learning</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {(Object.entries(MODE_CONFIG) as [TimerMode, typeof MODE_CONFIG.focus][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-all ${
              mode === key ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white'
            }`}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <motion.div
        className="glass-panel rounded-2xl p-8 mb-6 text-center"
        layout
      >
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={config.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold" style={{ color: config.color }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-[#737373] mt-1">
              {isRunning ? 'Running...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Topic Input */}
        <AnimatePresence>
          {showTopicInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What are you studying? (optional)"
                className="w-full max-w-xs mx-auto bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#f6f6f6] placeholder-[#737373] outline-none focus:border-[#3b82f6]/30 text-center"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTimer}
            className="px-8 py-3 rounded-xl text-white font-medium text-sm transition-all flex items-center gap-2"
            style={{ backgroundColor: config.color }}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => setShowTopicInput(!showTopicInput)}
            className={`p-3 rounded-xl border transition-all ${
              showTopicInput ? 'bg-[#3b82f6]/15 border-[#3b82f6]/30 text-[#3b82f6]' : 'bg-white/5 border-white/10 text-[#737373] hover:text-white'
            }`}
            title="Set topic"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-panel rounded-xl p-4 text-center">
          <Flame className="w-4 h-4 text-[#ef4444] mx-auto mb-1" />
          <p className="text-lg font-bold">{focusSessions.length}</p>
          <p className="text-[10px] text-[#737373]">Sessions Today</p>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <Clock className="w-4 h-4 text-[#3b82f6] mx-auto mb-1" />
          <p className="text-lg font-bold">{Math.floor(todayTotal / 60)}m</p>
          <p className="text-[10px] text-[#737373]">Focus Time</p>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <TrendingUp className="w-4 h-4 text-[#10b981] mx-auto mb-1" />
          <p className="text-lg font-bold">{sessions.length}</p>
          <p className="text-[10px] text-[#737373]">Total Sessions</p>
        </div>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            Today's Sessions
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todaySessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
                <div style={{ color: MODE_CONFIG[s.mode].color }}>{MODE_CONFIG[s.mode].icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{MODE_CONFIG[s.mode].label}</p>
                  {s.topic && <p className="text-[10px] text-[#737373] truncate">{s.topic}</p>}
                </div>
                <span className="text-[10px] text-[#737373] font-mono">{Math.floor(s.duration / 60)}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
