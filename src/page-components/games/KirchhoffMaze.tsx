"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Waypoints, Home, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple maze with KVL gates
const LEVELS = [
  {
    name: 'Ohm Starter',
    size: 5,
    walls: [[0,1],[1,1],[1,3],[2,0],[2,2],[3,2],[3,4],[4,1]],
    gates: [{ r: 1, c: 2, answer: '12', hint: 'V=IR, I=2A, R=6Ω' }, { r: 3, c: 1, answer: '3', hint: 'V=IR, I=1A, R=3Ω' }],
    start: { r: 0, c: 0 },
    end: { r: 4, c: 4 },
  },
  {
    name: 'KVL Loop',
    size: 6,
    walls: [[0,2],[1,1],[1,4],[2,0],[2,3],[2,5],[3,2],[4,1],[4,4],[5,3]],
    gates: [
      { r: 0, c: 3, answer: '5', hint: 'Series: 2Ω + 3Ω = ?Ω' },
      { r: 2, c: 2, answer: '2', hint: 'Parallel: two 4Ω resistors = ?Ω' },
      { r: 4, c: 3, answer: '10', hint: 'KVL: 5V + 5V = ?V' },
    ],
    start: { r: 0, c: 0 },
    end: { r: 5, c: 5 },
  },
  {
    name: 'Mesh Madness',
    size: 7,
    walls: [[0,3],[1,1],[1,5],[2,2],[2,4],[3,0],[3,3],[3,6],[4,1],[4,5],[5,2],[5,4],[6,3]],
    gates: [
      { r: 1, c: 3, answer: '6', hint: 'Three 2Ω in series' },
      { r: 3, c: 2, answer: '1.5', hint: 'Two 3Ω in parallel' },
      { r: 5, c: 3, answer: '24', hint: 'P=VI, V=12, I=2' },
    ],
    start: { r: 0, c: 0 },
    end: { r: 6, c: 6 },
  },
];

export default function KirchhoffMaze() {
  const router = useRouter();
  const [levelIdx, setLevelIdx] = useState(0);
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [openGates, setOpenGates] = useState<Set<string>>(new Set());
  const [activeGate, setActiveGate] = useState<{ r: number; c: number; answer: string; hint: string } | null>(null);
  const [gateInput, setGateInput] = useState('');
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const level = LEVELS[levelIdx];

  const isWall = (r: number, c: number) => level.walls.some(w => w[0] === r && w[1] === c);
  const isGate = (r: number, c: number) => level.gates.find(g => g.r === r && g.c === c);
  const isGateOpen = (r: number, c: number) => openGates.has(`${r},${c}`);

  const move = useCallback((dr: number, dc: number) => {
    if (solved || activeGate) return;
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (nr < 0 || nc < 0 || nr >= level.size || nc >= level.size) return;
    if (isWall(nr, nc)) return;
    const gate = isGate(nr, nc);
    if (gate && !isGateOpen(nr, nc)) { setActiveGate(gate); setGateInput(''); return; }
    setPlayer({ r: nr, c: nc });
    setMoves(m => m + 1);
    if (nr === level.end.r && nc === level.end.c) setSolved(true);
  }, [player, solved, activeGate, level]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move(-1, 0);
      else if (e.key === 'ArrowDown' || e.key === 's') move(1, 0);
      else if (e.key === 'ArrowLeft' || e.key === 'a') move(0, -1);
      else if (e.key === 'ArrowRight' || e.key === 'd') move(0, 1);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [move]);

  const submitGate = () => {
    if (!activeGate) return;
    const user = gateInput.trim().toLowerCase();
    const correct = activeGate.answer.toLowerCase();
    if (user === correct) {
      setOpenGates(prev => new Set(prev).add(`${activeGate.r},${activeGate.c}`));
      setActiveGate(null);
      setPlayer({ r: activeGate.r, c: activeGate.c });
      setMoves(m => m + 1);
    } else {
      setGateInput('');
    }
  };

  const reset = () => {
    setPlayer(level.start);
    setOpenGates(new Set());
    setActiveGate(null);
    setMoves(0);
    setSolved(false);
  };

  const nextLevel = () => {
    const ni = (levelIdx + 1) % LEVELS.length;
    setLevelIdx(ni);
    const nl = LEVELS[ni];
    setPlayer(nl.start);
    setOpenGates(new Set());
    setActiveGate(null);
    setMoves(0);
    setSolved(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => router.push('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <Waypoints className="w-4 h-4 text-[#f97316]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Kirchhoff's Maze</h1>
          <p className="text-[10px] text-[#737373]">{level.name} | Moves: {moves}</p>
        </div>
        <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div>
          <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${level.size}, 3.5rem)` }}>
            {Array.from({ length: level.size * level.size }, (_, i) => {
              const r = Math.floor(i / level.size);
              const c = i % level.size;
              const isP = player.r === r && player.c === c;
              const isS = level.start.r === r && level.start.c === c;
              const isE = level.end.r === r && level.end.c === c;
              const wall = isWall(r, c);
              const gate = isGate(r, c);
              const gateOpen = gate && isGateOpen(r, c);

              return (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                    wall ? 'bg-[#1a1a2e] border border-[#333]' :
                    gate && !gateOpen ? 'bg-[#f59e0b]/10 border-2 border-[#f59e0b]/50 cursor-pointer animate-pulse' :
                    gateOpen ? 'bg-[#10b981]/10 border border-[#10b981]/30' :
                    isE ? 'bg-[#ef4444]/15 border border-[#ef4444]/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  {wall ? '' :
                   isP ? <motion.div layoutId="player" className="w-5 h-5 rounded-full bg-[#f97316] shadow-lg shadow-[#f97316]/40" /> :
                   isS ? <div className="w-2 h-2 rounded-full bg-[#10b981]" /> :
                   isE ? <span className="text-[#ef4444] text-xs">END</span> :
                   gate && !gateOpen ? <span className="text-[#f59e0b]">?</span> :
                   gateOpen ? <span className="text-[#10b981]">✓</span> : ''}
                </div>
              );
            })}
          </div>

          {/* D-pad for mobile */}
          <div className="mt-4 flex justify-center">
            <div className="grid grid-cols-3 gap-1 w-32">
              <div />
              <button onClick={() => move(-1, 0)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#737373]">↑</button>
              <div />
              <button onClick={() => move(0, -1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#737373]">←</button>
              <div />
              <button onClick={() => move(0, 1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#737373]">→</button>
              <div />
              <button onClick={() => move(1, 0)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#737373]">↓</button>
              <div />
            </div>
          </div>

          {solved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
              <p className="text-lg font-semibold text-[#10b981] mb-2">Maze Solved!</p>
              <button onClick={nextLevel} className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2">
                Next Level <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Gate modal */}
      {activeGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#f59e0b]/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <p className="text-[10px] text-[#f59e0b] font-semibold mb-2">KVL GATE</p>
            <p className="text-sm text-[#d4d4d4] mb-4">{activeGate.hint}</p>
            <input
              value={gateInput}
              onChange={e => setGateInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitGate()}
              placeholder="Your answer..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#f6f6f6] outline-none focus:border-[#f59e0b]/30 font-mono mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setActiveGate(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-[#737373] text-sm hover:bg-white/10 transition-all">Skip</button>
              <button onClick={submitGate} className="flex-1 py-2 rounded-xl bg-[#f59e0b] text-white text-sm font-medium hover:bg-[#d97706] transition-all">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
