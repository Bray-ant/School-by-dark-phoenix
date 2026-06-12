import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Home, Sparkles, Lightbulb, RotateCcw, CheckCircle } from 'lucide-react';

const WORDS = [
  { word: 'OHMSLAW', clue: 'V = IR', dir: 'across', row: 0, col: 0 },
  { word: 'KIRCHHOFF', clue: 'Circuit loop rule pioneer', dir: 'across', row: 2, col: 0 },
  { word: 'THEVENIN', clue: 'Equivalent circuit theorem', dir: 'down', row: 0, col: 0 },
  { word: 'CAPACITOR', clue: 'Stores energy in electric field', dir: 'down', row: 0, col: 4 },
  { word: 'NORTON', clue: 'Current source equivalent', dir: 'across', row: 4, col: 4 },
  { word: 'EULER', clue: 'e^(ix) = cos(x) + i sin(x)', dir: 'across', row: 6, col: 0 },
  { word: 'HESSIAN', clue: 'Matrix of second derivatives', dir: 'down', row: 2, col: 8 },
  { word: 'EIGEN', clue: '___value: scalar in Av = λv', dir: 'across', row: 8, col: 0 },
];

const SIZE = 10;

function buildGrid() {
  const grid: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const solution: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  WORDS.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row : w.row + i;
      const c = w.dir === 'across' ? w.col + i : w.col;
      if (r < SIZE && c < SIZE) solution[r][c] = w.word[i];
    }
  });
  return { grid, solution };
}

const { solution: SOLUTION } = buildGrid();

export default function CrosswordGame() {
  const navigate = useNavigate();
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleCellChange = (r: number, c: number, val: string) => {
    if (val.length > 1) return;
    const upper = val.toUpperCase();
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = upper;
    setUserGrid(newGrid);

    // Check if solved
    let allCorrect = true;
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (SOLUTION[i][j] !== null && newGrid[i][j] !== SOLUTION[i][j]) {
          allCorrect = false; break;
        }
      }
    }
    if (allCorrect) setSolved(true);
  };

  const reset = () => {
    setUserGrid(Array.from({ length: SIZE }, () => Array(SIZE).fill('')));
    setSolved(false);
    setSelectedCell(null);
  };

  const handleHint = () => {
    if (selectedCell) {
      const [r, c] = selectedCell;
      if (SOLUTION[r][c]) {
        handleCellChange(r, c, SOLUTION[r][c]!);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center ml-2">
          <Grid3x3 className="w-4 h-4 text-[#8b5cf6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Engineering Crossword</h1>
          <p className="text-[10px] text-[#737373]">Fill in engineering & math terms</p>
        </div>
        <button onClick={handleHint} className="p-2 rounded-lg bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] transition-all" title="Hint for selected cell">
          <Lightbulb className="w-4 h-4" />
        </button>
        <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 max-w-5xl mx-auto w-full">
        {/* Grid */}
        <div className="shrink-0">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SIZE}, 2rem)` }}>
            {userGrid.map((row, r) => row.map((cell, c) => {
              const isBlock = SOLUTION[r][c] === null;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isCorrect = cell !== '' && cell === SOLUTION[r][c];
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => !isBlock && setSelectedCell([r, c])}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-sm transition-all ${
                    isBlock ? 'bg-transparent' :
                    isSelected ? 'bg-[#8b5cf6]/30 border-2 border-[#8b5cf6]' :
                    isCorrect ? 'bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]' :
                    cell ? 'bg-white/10 border border-white/20 text-[#d4d4d4]' :
                    'bg-white/5 border border-white/10 text-[#737373] cursor-pointer hover:bg-white/10'
                  }`}
                >
                  {!isBlock && (
                    <input
                      value={cell}
                      onChange={e => handleCellChange(r, c, e.target.value)}
                      onClick={() => setSelectedCell([r, c])}
                      className="w-full h-full text-center bg-transparent outline-none text-inherit font-bold"
                      maxLength={1}
                    />
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold mb-3 text-[#a3a3a3]">Across</h3>
          <div className="space-y-1.5 mb-6">
            {WORDS.filter(w => w.dir === 'across').map((w, i) => (
              <button key={i} onClick={() => setShowHint(showHint === i ? null : i)} className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <span className="text-[10px] text-[#8b5cf6] font-mono">{i + 1}.</span>
                <span className="text-[11px] text-[#d4d4d4] ml-1">{w.clue}</span>
                <span className="text-[9px] text-[#525252] ml-1">({w.word.length})</span>
              </button>
            ))}
          </div>
          <h3 className="text-xs font-semibold mb-3 text-[#a3a3a3]">Down</h3>
          <div className="space-y-1.5">
            {WORDS.filter(w => w.dir === 'down').map((w, i) => (
              <button key={i} className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <span className="text-[10px] text-[#8b5cf6] font-mono">{i + 1}.</span>
                <span className="text-[11px] text-[#d4d4d4] ml-1">{w.clue}</span>
                <span className="text-[9px] text-[#525252] ml-1">({w.word.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {solved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSolved(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-[#111118] border border-[#10b981]/30 rounded-2xl p-8 text-center max-w-sm">
              <CheckCircle className="w-12 h-12 text-[#10b981] mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-[#10b981] mb-2">Puzzle Solved!</h2>
              <p className="text-xs text-[#737373] mb-4">All engineering terms filled in correctly.</p>
              <button onClick={() => { setSolved(false); reset(); }} className="px-5 py-2 bg-[#10b981]/15 text-[#10b981] rounded-xl text-sm font-medium hover:bg-[#10b981]/25 transition-all">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
