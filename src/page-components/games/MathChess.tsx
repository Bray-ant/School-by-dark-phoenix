"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Home, Sparkles, Zap, Trophy } from 'lucide-react';

const PROBLEMS = [
  { q: '2 + 3 × 4', a: '14' },
  { q: 'd/dx(x³)', a: '3x²' },
  { q: '∫ 2x dx', a: 'x²' },
  { q: 'sin(π/2)', a: '1' },
  { q: '5! (factorial)', a: '120' },
  { q: '√144', a: '12' },
  { q: 'log₁₀(1000)', a: '3' },
  { q: '3² + 4²', a: '25' },
  { q: 'cos(0)', a: '1' },
  { q: 'd/dx(sin x)', a: 'cos x' },
  { q: 'e⁰', a: '1' },
  { q: 'lim x→0 sin(x)/x', a: '1' },
  { q: '1 + 2 + 3 + ... + 10', a: '55' },
  { q: 'i²', a: '-1' },
  { q: '∫ eˣ dx', a: 'eˣ' },
  { q: 'tan(π/4)', a: '1' },
  { q: 'ln(1)', a: '0' },
  { q: 'd/dx(ln x)', a: '1/x' },
  { q: '2⁸', a: '256' },
  { q: '∫ cos x dx', a: 'sin x' },
  { q: 'Pythagorean: 3-4-?', a: '5' },
  { q: '√(-1)', a: 'i' },
  { q: 'Area of circle radius 2', a: '4π' },
  { q: 'd/dx(eˣ)', a: 'eˣ' },
  { q: 'sin² + cos²', a: '1' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function MathChess() {
  const router = useRouter();
  const [board, setBoard] = useState<(number | null)[]>(Array(16).fill(null));
  const [current, setCurrent] = useState(0);
  const [problems, setProblems] = useState(() => shuffle(PROBLEMS));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [correctCells, setCorrectCells] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { setGameState('ended'); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const start = () => {
    setBoard(Array(16).fill(null));
    setProblems(shuffle(PROBLEMS));
    setCurrent(0);
    setScore(0);
    setTimeLeft(180);
    setCorrectCells(new Set());
    setStreak(0);
    setGameState('playing');
    setInput('');
  };

  const submit = useCallback(() => {
    if (!input.trim() || gameState !== 'playing') return;
    const ans = input.trim().toLowerCase().replace(/\s/g, '');
    const correct = ans === problems[current].a.toLowerCase().replace(/\s/g, '');
    const emptyCells = board.map((v, i) => v === null ? i : -1).filter(i => i >= 0);

    if (correct) {
      if (emptyCells.length > 0) {
        const idx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = [...board];
        newBoard[idx] = current;
        setBoard(newBoard);
        setCorrectCells(prev => new Set(prev).add(idx));
      }
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
    }

    if (current + 1 >= problems.length) {
      setProblems(shuffle(PROBLEMS));
      setCurrent(0);
    } else {
      setCurrent(c => c + 1);
    }
    setInput('');
  }, [input, gameState, problems, current, board, streak]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => router.push('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center ml-2">
          <Timer className="w-4 h-4 text-[#ef4444]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Math Speed Chess</h1>
          <p className="text-[10px] text-[#737373]">Solve fast, claim squares</p>
        </div>
        {gameState === 'playing' && (
          <>
            <span className="text-[10px] font-mono text-[#f59e0b]">{formatTime(timeLeft)}</span>
            <span className="text-[10px] font-mono text-[#10b981]">Score: {score}</span>
            {streak > 2 && <span className="text-[10px] text-[#ec4899]">🔥 {streak}x</span>}
          </>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Game Board */}
          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {board.map((cell, i) => (
              <motion.div
                key={i}
                initial={cell !== null ? { scale: 0.5 } : false}
                animate={{ scale: 1 }}
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-mono transition-all ${
                  cell !== null
                    ? correctCells.has(i) ? 'bg-[#10b981]/15 border-2 border-[#10b981]/40 text-[#10b981]' : 'bg-white/10 border border-white/20 text-[#d4d4d4]'
                    : 'bg-white/3 border border-white/5'
                }`}
              >
                {cell !== null ? (
                  <div className="text-center">
                    <div className="text-[9px] text-[#525252]">Q{cell + 1}</div>
                    <Zap className="w-3 h-3 mx-auto mt-0.5 text-[#f59e0b]" />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {gameState === 'ready' && (
              <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <h2 className="text-lg font-semibold mb-2">Ready to Play?</h2>
                <p className="text-xs text-[#737373] mb-4">3 minutes. Solve math problems to capture squares on the board.</p>
                <button onClick={start} className="px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl text-sm font-medium transition-all">
                  Start Game
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-4">
                  <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-[#737373] mb-1">Solve this:</p>
                    <p className="text-xl font-semibold text-[#f6f6f6] font-mono">{problems[current].q}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="Your answer..."
                    autoFocus
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#f6f6f6] placeholder-[#525252] outline-none focus:border-[#ef4444]/30 font-mono"
                  />
                  <button onClick={submit} className="px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl text-sm font-medium transition-all">
                    Submit
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'ended' && (
              <motion.div key="ended" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <Trophy className="w-10 h-10 text-[#f59e0b] mx-auto mb-2" />
                <h2 className="text-lg font-semibold mb-1">Time's Up!</h2>
                <p className="text-2xl font-bold text-[#10b981] mb-1">{score} pts</p>
                <p className="text-xs text-[#737373] mb-4">{correctCells.size} squares captured</p>
                <button onClick={start} className="px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl text-sm font-medium transition-all">
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
