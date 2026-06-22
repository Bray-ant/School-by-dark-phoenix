"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Box, Orbit, Zap, LayoutDashboard, Calculator, Sparkles, Search, Menu, X, Dices, CircuitBoard, FlaskConical, LogIn, LogOut, User, Brain, Sun, Moon, Monitor, Trophy, Timer, MessageCircle, Headphones, Radio, Microscope, ZapOff, Sigma, Gamepad2, Home } from 'lucide-react';

const chapterIcons: Record<string, React.ReactNode> = {
  stereostatics: <Box className="w-4 h-4" />,
  kinematics: <Orbit className="w-4 h-4" />,
  kinetics: <Zap className="w-4 h-4" />,
};

const chapterColors: Record<string, string> = {
  stereostatics: '#3b82f6',
  kinematics: '#10b981',
  kinetics: '#f59e0b',
};

export default function Navigation() {
  const pathname = usePathname() ?? "/";
  const { chapterList, setCommandOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl" aria-label="Main navigation">
        <div className="glass-panel-strong rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center group-hover:bg-[#3b82f6]/30 transition-colors">
              <Box className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">Project school</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {chapterList.map(ch => (
              <Link key={ch.id} href={`/chapter/${ch.id}`}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive(`/chapter/${ch.id}`) || pathname.includes(`/chapter/${ch.id}/`) ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}>
                <span style={{ color: chapterColors[ch.id] }}>{chapterIcons[ch.id]}</span>
                <span className="hidden xl:inline">{ch.title}</span>
              </Link>
            ))}
            <Link href="/dc-circuit/dc-fundamentals" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname.startsWith('/dc-circuit/') || pathname === '/dc-lab' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><CircuitBoard className="w-3.5 h-3.5" /><span className="hidden xl:inline">DC Circuits</span></Link>
            <Link href="/dc-lab" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname === '/dc-lab' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><FlaskConical className="w-3.5 h-3.5" /><span className="hidden xl:inline">Lab</span></Link>
            <Link href="/visual-lab" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname === '/visual-lab' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Microscope className="w-3.5 h-3.5" /><span className="hidden xl:inline">Visual Lab</span></Link>
            <Link href="/em" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname === '/em' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><ZapOff className="w-3.5 h-3.5" /><span className="hidden xl:inline">EM & Magnetism</span></Link>
            <Link href="/math" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname === '/math' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Sigma className="w-3.5 h-3.5" /><span className="hidden xl:inline">Math</span></Link>
            <Link href="/games" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${pathname.startsWith('/games') ? 'bg-[#ec4899]/15 text-[#ec4899]' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Gamepad2 className="w-3.5 h-3.5" /><span className="hidden xl:inline">Games</span></Link>
            <div className="w-px h-4 bg-[var(--glass-border)] mx-2" />
            <Link href="/exercises" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/exercises') || pathname.startsWith('/exercise/') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Calculator className="w-3.5 h-3.5" /><span className="hidden xl:inline">Math Exercises</span></Link>
            <Link href="/practice" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/practice') || isActive('/mastery') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Dices className="w-3.5 h-3.5" /><span className="hidden xl:inline">Practice</span></Link>
            <Link href="/ai-tutor" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/ai-tutor') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Brain className="w-3.5 h-3.5" /><span className="hidden xl:inline">AI Tutor</span></Link>
            <Link href="/chat-room" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/chat-room') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><MessageCircle className="w-3.5 h-3.5" /><span className="hidden xl:inline">Chat</span></Link>
            <Link href="/chronos" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/chronos') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Headphones className="w-3.5 h-3.5" /><span className="hidden xl:inline">Chronos</span></Link>
            <Link href="/voice-ai" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/voice-ai') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Radio className="w-3.5 h-3.5" /><span className="hidden xl:inline">Voice AI</span></Link>
            <Link href="/study-timer" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/study-timer') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Timer className="w-3.5 h-3.5" /><span className="hidden xl:inline">Timer</span></Link>
            <Link href="/achievements" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/achievements') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Trophy className="w-3.5 h-3.5" /><span className="hidden xl:inline">Achievements</span></Link>
            <Link href="/inspiration" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/inspiration') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><Sparkles className="w-3.5 h-3.5" /><span className="hidden xl:inline">Inspiration</span></Link>
            <Link href="/dashboard" className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}><LayoutDashboard className="w-3.5 h-3.5" /><span className="hidden xl:inline">Dashboard</span></Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[#10b981]">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{user?.name || user?.username || 'User'}</span>
                </div>
                <button onClick={logout} aria-label="Sign out" className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[#737373] hover:text-white hover:bg-white/5 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-xs text-[#3b82f6] hover:bg-[#3b82f6]/25 transition-all">
                <LogIn className="w-3.5 h-3.5" /><span>Sign In</span>
              </Link>
            )}
            <button onClick={() => setCommandOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#737373] hover:text-white hover:bg-white/10 transition-all">
              <Search className="w-3.5 h-3.5" /><span>Search...</span><kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">⌘K</kbd>
            </button>
            <button onClick={toggleTheme} aria-label={`Switch theme, current: ${theme}`} className="hidden md:flex p-2 rounded-lg bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10 transition-all" title={`Theme: ${theme}`}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--body-bg)]/95 backdrop-blur-lg pt-20 px-6 md:hidden" role="dialog" aria-label="Mobile navigation menu">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-[#3b82f6]/10 text-[#3b82f6] transition-all hover:bg-[#3b82f6]/20">
              <Home className="w-4 h-4" /><span>Home</span>
            </Link>
            <div className="h-px bg-[var(--subtle-border)] my-1" />
            {chapterList.map(ch => (
              <Link key={ch.id} href={`/chapter/${ch.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5">
                <span style={{ color: chapterColors[ch.id] }}>{chapterIcons[ch.id]}</span><span>{ch.title}</span><span className="ml-auto text-xs text-[#737373]">{ch.subtitle}</span>
              </Link>
            ))}
            <Link href="/dc-circuit/dc-fundamentals" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><CircuitBoard className="w-4 h-4 text-[#10b981]" /><span>DC Circuits</span></Link>
            <Link href="/dc-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><FlaskConical className="w-4 h-4 text-[#f59e0b]" /><span>DC Lab</span></Link>
            <Link href="/visual-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Microscope className="w-4 h-4 text-[#f59e0b]" /><span>Visual Lab</span></Link>
            <Link href="/em" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><ZapOff className="w-4 h-4 text-[#00d4ff]" /><span>EM & Magnetism</span></Link>
            <Link href="/math" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Sigma className="w-4 h-4 text-[#f59e0b]" /><span>Advanced Math</span></Link>
            <Link href="/games" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-[#ec4899]/10 text-[#ec4899] transition-all hover:bg-[#ec4899]/20"><Gamepad2 className="w-4 h-4" /><span>Chill Games</span></Link>
            <Link href="/ai-tutor" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Brain className="w-4 h-4 text-[#8b5cf6]" /><span>AI Tutor</span></Link>
            <Link href="/chat-room" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><MessageCircle className="w-4 h-4 text-[#10b981]" /><span>Chat Room</span></Link>
            <Link href="/chronos" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Headphones className="w-4 h-4 text-[#f59e0b]" /><span>Chronos</span></Link>
            <Link href="/voice-ai" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Radio className="w-4 h-4 text-[#ec4899]" /><span>Voice AI</span></Link>
            <Link href="/study-timer" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Timer className="w-4 h-4 text-[#3b82f6]" /><span>Study Timer</span></Link>
            <Link href="/achievements" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Trophy className="w-4 h-4 text-[#f59e0b]" /><span>Achievements</span></Link>
            <div className="w-full h-px bg-[var(--glass-border)] my-2" />
            <Link href="/exercises" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Calculator className="w-4 h-4 text-[#8b5cf6]" /><span>Math Exercises</span></Link>
            <Link href="/practice" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Dices className="w-4 h-4 text-[#ec4899]" /><span>Practice</span></Link>
            <Link href="/inspiration" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><Sparkles className="w-4 h-4 text-[#f59e0b]" /><span>Inspiration</span></Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"><LayoutDashboard className="w-4 h-4 text-[#737373]" /><span>Dashboard</span></Link>
            <div className="w-full h-px bg-[var(--glass-border)] my-2" />
            <button onClick={() => { toggleTheme(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 w-full text-left">
              {isDark ? <Sun className="w-4 h-4 text-[#f59e0b]" /> : <Moon className="w-4 h-4 text-[#8b5cf6]" />}
              <span>Theme: {theme === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}</span>
            </button>
            <div className="w-full h-px bg-[var(--glass-border)] my-2" />
            {isAuthenticated ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5 w-full text-left">
                <LogOut className="w-4 h-4 text-[#ef4444]" /><span className="text-[#ef4444]">Sign Out ({user?.name || user?.username || 'User'})</span>
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5">
                <LogIn className="w-4 h-4 text-[#3b82f6]" /><span className="text-[#3b82f6]">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
