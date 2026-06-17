"use client";
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Home, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Cell = { type: 'empty' | 'straight' | 'corner' | 't' | 'cross' | 'start' | 'end'; rotation: number; locked: boolean };
type Level = { name: string; size: number; grid: Cell[][] };

function rotateCell(c: Cell): Cell { return { ...c, rotation: (c.rotation + 90) % 360 }; }
function isConnected(cell: Cell, dir: number): boolean {
  const r = cell.rotation;
  if (cell.type === 'straight') return dir === r % 180 || dir === (r + 180) % 360;
  if (cell.type === 'corner') return dir === r || dir === (r + 90) % 360;
  if (cell.type === 't') return dir !== r;
  if (cell.type === 'cross') return true;
  if (cell.type === 'start') return dir === r;
  if (cell.type === 'end') return dir === r;
  return false;
}

const DIR_DX = [1, 0, -1, 0];
const DIR_DY = [0, 1, 0, -1];

function generateLevel(name: string, size: number): Level {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      type: (['straight', 'corner', 't', 'cross', 'empty'] as const)[Math.floor(Math.random() * 4)],
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
      locked: false,
    }))
  );
  grid[0][0] = { type: 'start', rotation: 0, locked: true };
  grid[size - 1][size - 1] = { type: 'end', rotation: 180, locked: true };
  return { name, size, grid };
}

export default function CircuitFlow() {
  const router = useRouter();
  const [levelNum, setLevelNum] = useState(0);
  const [level, setLevel] = useState<Level>(() => generateLevel('Level 1', 4));
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  const checkSolved = useCallback((grid: Cell[][]) => {
    const size = grid.length;
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      if (cx === size - 1 && cy === size - 1) return true;
      const cell = grid[cy][cx];
      for (let d = 0; d < 4; d++) {
        if (!isConnected(cell, d * 90)) continue;
        const nx = cx + DIR_DX[d];
        const ny = cy + DIR_DY[d];
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        if (visited[ny][nx]) continue;
        const neighbor = grid[ny][nx];
        if (isConnected(neighbor, (d * 90 + 180) % 360)) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }
    return false;
  }, []);

  const handleClick = (row: number, col: number) => {
    if (solved) return;
    const newGrid = level.grid.map(r => r.map(c => ({ ...c })));
    if (newGrid[row][col].locked) return;
    newGrid[row][col] = rotateCell(newGrid[row][col]);
    setLevel({ ...level, grid: newGrid });
    setMoves(m => m + 1);
    if (checkSolved(newGrid)) setSolved(true);
  };

  const nextLevel = () => {
    const newNum = levelNum + 1;
    const size = Math.min(4 + Math.floor(newNum / 2), 7);
    setLevelNum(newNum);
    setLevel(generateLevel(`Level ${newNum + 1}`, size));
    setSolved(false);
  };

  const resetLevel = () => {
    setLevel(generateLevel(level.name, level.grid.length));
    setSolved(false);
    setMoves(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'r' || e.key === 'R') resetLevel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [level]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => router.push('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center ml-2">
          <Zap className="w-4 h-4 text-[#f59e0b]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Circuit Flow</h1>
          <p className="text-[10px] text-[#737373]">Rotate tiles to complete the circuit</p>
        </div>
        <span className="text-[10px] text-[#737373] font-mono mr-2">{level.name} | Moves: {moves}</span>
        <button onClick={resetLevel} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div>
          <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns: `repeat(${level.grid.length}, 1fr)`, width: 'fit-content' }}>
            {level.grid.map((row, ri) => row.map((cell, ci) => (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleClick(ri, ci)}
                className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all relative ${
                  cell.locked ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'
                }`}
                style={{
                  background: cell.type === 'empty' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${cell.type === 'empty' ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.2)'}`,
                  transform: `rotate(${cell.rotation}deg)`,
                }}
              >
                {cell.type === 'start' && <div className="w-3 h-3 rounded-full bg-[#10b981]" />}
                {cell.type === 'end' && <div className="w-3 h-3 rounded-full bg-[#ef4444]" />}
                {cell.type === 'straight' && <div className="w-8 h-1.5 rounded-full bg-[#f59e0b]/60" />}
                {cell.type === 'corner' && (
                  <div className="relative w-8 h-8">
                    <div className="absolute bottom-0 left-0 w-8 h-1.5 rounded-full bg-[#f59e0b]/60" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-8 rounded-full bg-[#f59e0b]/60" />
                  </div>
                )}
                {cell.type === 't' && (
                  <div className="relative w-8 h-8">
                    <div className="absolute bottom-0 left-0 w-8 h-1.5 rounded-full bg-[#f59e0b]/60" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-8 rounded-full bg-[#f59e0b]/60" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-8 rounded-full bg-[#f59e0b]/60" />
                  </div>
                )}
                {cell.type === 'cross' && (
                  <div className="relative w-8 h-8">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-1.5 rounded-full bg-[#f59e0b]/60" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1.5 h-8 rounded-full bg-[#f59e0b]/60" />
                  </div>
                )}
                {cell.locked && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
              </button>
            )))}
          </div>

          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
                <p className="text-lg font-semibold text-[#10b981] mb-2">Circuit Complete!</p>
                <p className="text-xs text-[#737373] mb-3">Completed in {moves} moves</p>
                <button onClick={nextLevel} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-medium rounded-xl transition-all">
                  Next Level <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!solved && (
            <p className="text-center mt-6 text-[10px] text-[#525252]">
              Click tiles to rotate. Connect Start (green) to End (red). Press R to reset.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
