import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { exercises, topicColors } from '../data/mathExercisesData';
import { dcChapterList } from '../data/dcCircuitData';
import { Search, FileText, BookOpen, Calculator, Compass, LayoutDashboard, Sparkles, Dices, Trophy, CircuitBoard, Microscope, Brain, MessageCircle, Headphones, Radio, Sigma, FunctionSquare, Grid3X3, CircleDot, Infinity as InfinityIcon, Divide, ZapOff, Gamepad2 } from 'lucide-react';

interface CommandPaletteProps { onClose: () => void; }

interface SearchItem { id: string; title: string; subtitle: string; type: 'chapter' | 'lesson' | 'exercise' | 'nav'; path: string; color: string; section?: string; }

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const { chapterList } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Math module sub-items (appear under Advanced Mathematics section)
  const mathModuleItems: SearchItem[] = [
    { id: 'nav-math', title: 'Advanced Mathematics', subtitle: 'All 6 modules — university-level math', type: 'nav', path: '/math', color: '#f59e0b', section: 'math' },
    { id: 'nav-m1', title: 'M1: Multivariable Calculus', subtitle: 'Level sets, partial derivatives, gradient, Hessian', type: 'nav', path: '/math', color: '#f97316', section: 'math' },
    { id: 'nav-m2', title: 'M2: Linear Algebra', subtitle: 'Eigenvalues, definiteness, classifying extrema', type: 'nav', path: '/math', color: '#8b5cf6', section: 'math' },
    { id: 'nav-m3', title: 'M3: Complex Functions', subtitle: "Euler's formula, polar form, roots, complex log", type: 'nav', path: '/math', color: '#06b6d4', section: 'math' },
    { id: 'nav-m4', title: 'M4: Taylor Polynomials', subtitle: 'Approximations, error bounds, remainder', type: 'nav', path: '/math', color: '#f59e0b', section: 'math' },
    { id: 'nav-m5', title: 'M5: Power Series', subtitle: 'Radius of convergence, term-by-term ops', type: 'nav', path: '/math', color: '#ec4899', section: 'math' },
    { id: 'nav-m6', title: 'M6: Engineering Integration', subtitle: "By parts, substitution, partial fractions, L'Hôpital", type: 'nav', path: '/math', color: '#10b981', section: 'math' },
  ];

  const emItem: SearchItem = { id: 'nav-em', title: 'EM & Magnetism', subtitle: 'Electromagnetism based on Sadiku textbook', type: 'nav', path: '/em', color: '#00d4ff', section: 'em' };

  const gameNavItems: SearchItem[] = [
    { id: 'nav-games', title: 'Chill Games Hub', subtitle: 'All 10 games in one place', type: 'nav', path: '/games', color: '#ec4899', section: 'games' },
    { id: 'nav-game-fg', title: 'Function Garden', subtitle: 'Draw math functions, watch them bloom', type: 'nav', path: '/games/function-garden', color: '#10b981', section: 'games' },
    { id: 'nav-game-cf', title: 'Circuit Flow', subtitle: 'Rotate tiles to complete circuits', type: 'nav', path: '/games/circuit-flow', color: '#f59e0b', section: 'games' },
    { id: 'nav-game-cp', title: 'Complex Plane Explorer', subtitle: 'Transform complex numbers visually', type: 'nav', path: '/games/complex-plane', color: '#06b6d4', section: 'games' },
    { id: 'nav-game-cw', title: 'Engineering Crossword', subtitle: 'Engineering & math word puzzles', type: 'nav', path: '/games/crossword', color: '#8b5cf6', section: 'games' },
    { id: 'nav-game-mc', title: 'Math Speed Chess', subtitle: 'Solve fast to capture squares', type: 'nav', path: '/games/math-chess', color: '#ef4444', section: 'games' },
    { id: 'nav-game-vf', title: 'Vector Field Fishing', subtitle: 'Catch critical points in vector fields', type: 'nav', path: '/games/vector-fishing', color: '#3b82f6', section: 'games' },
    { id: 'nav-game-rr', title: 'Resistance Racer', subtitle: 'Calculate resistance to win the race', type: 'nav', path: '/games/resistance-racer', color: '#ec4899', section: 'games' },
    { id: 'nav-game-km', title: "Kirchhoff's Maze", subtitle: 'Navigate circuit mazes with KVL gates', type: 'nav', path: '/games/kirchhoff-maze', color: '#f97316', section: 'games' },
    { id: 'nav-game-lf', title: 'Lorenz Attractor Flight', subtitle: 'Fly through chaos theory art', type: 'nav', path: '/games/lorenz-flight', color: '#a855f7', section: 'games' },
    { id: 'nav-game-bb', title: 'Balance Beam', subtitle: 'Keep the beam balanced with physics', type: 'nav', path: '/games/balance-beam', color: '#14b8a6', section: 'games' },
  ];

  const otherNavItems: SearchItem[] = [
    { id: 'nav-practice', title: 'Practice Generator', subtitle: 'Infinite math exercise generation', type: 'nav', path: '/practice', color: '#ec4899' },
    { id: 'nav-mastery', title: 'Mastery Dashboard', subtitle: 'Track progress and analyze performance', type: 'nav', path: '/mastery', color: '#f59e0b' },
    { id: 'nav-exercises', title: 'Math Exercises', subtitle: '20 curated hand-crafted problems', type: 'nav', path: '/exercises', color: '#8b5cf6' },
    { id: 'nav-inspiration', title: 'Daily Inspiration', subtitle: 'Quotes, challenges, and reflections', type: 'nav', path: '/inspiration', color: '#f59e0b' },
    { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Course progress overview', type: 'nav', path: '/dashboard', color: '#737373' },
    { id: 'nav-visuallab', title: 'Visual Lab', subtitle: 'Interactive circuit simulation laboratory', type: 'nav', path: '/visual-lab', color: '#f59e0b' },
    { id: 'nav-aitutor', title: 'AI Tutor', subtitle: 'AI-powered learning assistant', type: 'nav', path: '/ai-tutor', color: '#8b5cf6' },
    { id: 'nav-chatroom', title: 'Chat Room', subtitle: 'Collaborative learning chat with AI bot', type: 'nav', path: '/chat-room', color: '#10b981' },
    { id: 'nav-voiceai', title: 'Voice AI', subtitle: 'Spoken tutoring', type: 'nav', path: '/voice-ai', color: '#ec4899' },
    { id: 'nav-dclab', title: 'DC Lab', subtitle: 'Hands-on circuit laboratory', type: 'nav', path: '/dc-lab', color: '#06b6d4' },
  ];

  const items: SearchItem[] = [
    ...mathModuleItems,
    emItem,
    ...gameNavItems,
    ...otherNavItems,
    ...dcChapterList.flatMap(ch => [
      { id: `dc-ch-${ch.id}`, title: ch.title, subtitle: ch.subtitle, type: 'chapter' as const, path: `/dc-circuit/${ch.id}`, color: ch.color },
      ...ch.sections.flatMap(sec => sec.lessons.map(lesson => ({
        id: `dc-lesson-${lesson.id}`, title: lesson.title, subtitle: `${ch.title} \u2192 ${sec.title}`,
        type: 'lesson' as const, path: `/dc-circuit/${ch.id}/section/${sec.id}/lesson/${lesson.id}`, color: ch.color,
      }))),
    ]),
    ...chapterList.flatMap(ch => [
      { id: `ch-${ch.id}`, title: ch.title, subtitle: ch.subtitle, type: 'chapter' as const, path: `/chapter/${ch.id}`, color: ch.color },
      ...ch.sections.flatMap(sec => sec.lessons.map(lesson => ({
        id: `lesson-${lesson.id}`, title: lesson.title, subtitle: `${ch.title} \u2192 ${sec.title}`,
        type: 'lesson' as const, path: `/chapter/${ch.id}/section/${sec.id}/lesson/${lesson.id}`, color: ch.color,
      }))),
    ]),
    ...exercises.map(ex => ({
      id: `ex-${ex.id}`, title: ex.title, subtitle: `${ex.topic} \u2022 ${ex.subtopic}`,
      type: 'exercise' as const, path: `/exercise/${ex.id}`, color: topicColors[ex.topic] || '#8b5cf6',
    })),
  ];

  const filtered = query.trim() ? items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.subtitle.toLowerCase().includes(query.toLowerCase())) : items;

  // Group filtered items by section
  const mathItems = filtered.filter(i => i.section === 'math');
  const emItems = filtered.filter(i => i.section === 'em');
  const gameItems = filtered.filter(i => i.section === 'games');
  const navItems = filtered.filter(i => i.type === 'nav' && !i.section);
  const dcItems = filtered.filter(i => i.id.startsWith('dc-'));
  const chapterItems = filtered.filter(i => i.type === 'chapter' && !i.id.startsWith('dc-'));
  const lessonItems = filtered.filter(i => i.type === 'lesson' && !i.id.startsWith('dc-'));
  const exerciseItems = filtered.filter(i => i.type === 'exercise');

  const allGrouped = [
    ...(mathItems.length > 0 ? [{ isHeader: true as const, label: 'ADVANCED MATHEMATICS', color: '#f59e0b' }, ...mathItems] : []),
    ...(emItems.length > 0 ? [{ isHeader: true as const, label: 'ELECTROMAGNETISM', color: '#00d4ff' }, ...emItems] : []),
    ...(gameItems.length > 0 ? [{ isHeader: true as const, label: 'CHILL GAMES', color: '#ec4899' }, ...gameItems] : []),
    ...(navItems.length > 0 ? [{ isHeader: true as const, label: 'NAVIGATION', color: '#737373' }, ...navItems] : []),
    ...(dcItems.length > 0 ? [{ isHeader: true as const, label: 'DC CIRCUITS', color: '#10b981' }, ...dcItems] : []),
    ...(chapterItems.length > 0 ? [{ isHeader: true as const, label: 'TECHNICAL MECHANICS', color: '#3b82f6' }, ...chapterItems] : []),
    ...(lessonItems.length > 0 ? [{ isHeader: true as const, label: 'LESSONS', color: '#a3a3a3' }, ...lessonItems] : []),
    ...(exerciseItems.length > 0 ? [{ isHeader: true as const, label: 'EXERCISES', color: '#8b5cf6' }, ...exerciseItems] : []),
  ];

  // Flatten for keyboard navigation
  const flatItems = allGrouped.filter((item): item is SearchItem => !('isHeader' in item));

  useEffect(() => { inputRef.current?.focus(); setSelectedIndex(0); }, []);
  useEffect(() => { setSelectedIndex(0); }, [query]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => (p + 1) % flatItems.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => (p - 1 + flatItems.length) % flatItems.length); }
      else if (e.key === 'Enter' && flatItems[selectedIndex]) { navigate(flatItems[selectedIndex].path); onClose(); }
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatItems, selectedIndex, navigate, onClose]);

  const getIcon = (item: SearchItem) => {
    if (item.type === 'chapter') return <BookOpen className="w-4 h-4" style={{ color: item.color }} />;
    if (item.type === 'lesson') return <FileText className="w-4 h-4" style={{ color: item.color }} />;
    if (item.type === 'exercise') return <Calculator className="w-4 h-4" style={{ color: item.color }} />;
    if (item.type === 'nav') {
      if (item.path === '/math') return <Sigma className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/em') return <ZapOff className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m1') return <FunctionSquare className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m2') return <Grid3X3 className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m3') return <CircleDot className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m4') return <Sigma className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m5') return <InfinityIcon className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-m6') return <Divide className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id === 'nav-games') return <Gamepad2 className="w-4 h-4" style={{ color: item.color }} />;
      if (item.id.startsWith('nav-game-')) return <Gamepad2 className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/practice') return <Dices className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/mastery') return <Trophy className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/inspiration') return <Sparkles className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/dashboard') return <LayoutDashboard className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/visual-lab') return <Microscope className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/ai-tutor') return <Brain className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/chat-room') return <MessageCircle className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/voice-ai') return <Headphones className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path === '/dc-lab') return <Radio className="w-4 h-4" style={{ color: item.color }} />;
      if (item.path.startsWith('/dc-circuit')) return <CircuitBoard className="w-4 h-4" style={{ color: item.color }} />;
      return <Calculator className="w-4 h-4" style={{ color: item.color }} />;
    }
    if (item.id.startsWith('dc-')) return <CircuitBoard className="w-4 h-4" style={{ color: item.color }} />;
    return <Compass className="w-4 h-4" style={{ color: item.color }} />;
  };

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[600px] mx-4 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chapters, lessons, exercises..."
            className="flex-1 bg-transparent text-sm text-[#f6f6f6] placeholder-[#737373] outline-none" />
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#737373]">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {allGrouped.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#737373]">No results found for &quot;{query}&quot;</div>
          ) : (
            <div className="py-2">
              {allGrouped.map((item, index) => {
                if ('isHeader' in item) {
                  return (
                    <div key={`header-${index}`} className="px-4 pt-3 pb-1">
                      <span className="text-[9px] font-mono font-semibold tracking-widest" style={{ color: item.color }}>{item.label}</span>
                      <div className="h-px mt-1" style={{ background: `linear-gradient(90deg, ${item.color}30, transparent)` }} />
                    </div>
                  );
                }
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                return (
                  <button key={item.id} onClick={() => { navigate(item.path); onClose(); }} onMouseEnter={() => setSelectedIndex(flatIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-[rgba(59,130,246,0.15)]' : 'hover:bg-white/5'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>{getIcon(item)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#f6f6f6] truncate">{item.title}</div>
                      <div className="text-xs text-[#737373] truncate">{item.subtitle}</div>
                    </div>
                    {isSelected && <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#737373] shrink-0">↵</kbd>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-white/10 flex items-center gap-4 text-[10px] text-[#737373]">
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd>Navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-white/5 border border-white/10 font-mono">↵</kbd>Select</span>
          <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-white/5 border border-white/10 font-mono">ESC</kbd>Close</span>
        </div>
      </div>
    </div>
  );
}
