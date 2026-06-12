import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Home, Plus, RotateCcw, CheckCircle, Trophy } from 'lucide-react';

interface Weight { id: number; mass: number; position: number; side: 'left' | 'right'; }

let nextId = 1;

const PRESET_WEIGHTS = [1, 2, 3, 5, 8];

export default function BalanceBeam() {
  const navigate = useNavigate();
  const [weights, setWeights] = useState<Weight[]>([
    { id: nextId++, mass: 5, position: -3, side: 'left' },
    { id: nextId++, mass: 3, position: 2, side: 'right' },
  ]);
  const [supportPos, setSupportPos] = useState(0);
  const [selectedMass, setSelectedMass] = useState(2);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');
  const [showHelp, setShowHelp] = useState(false);

  // Moment calculations
  const leftMoment = weights.filter(w => w.side === 'left').reduce((sum, w) => sum + w.mass * Math.abs(w.position - supportPos), 0);
  const rightMoment = weights.filter(w => w.side === 'right').reduce((sum, w) => sum + w.mass * Math.abs(w.position - supportPos), 0);
  const isBalanced = Math.abs(leftMoment - rightMoment) < 0.5;
  const tilt = Math.max(-20, Math.min(20, (rightMoment - leftMoment) * 2));

  const addWeight = () => {
    const pos = selectedSide === 'left' ? -2 - Math.random() * 4 : 2 + Math.random() * 4;
    setWeights(prev => [...prev, { id: nextId++, mass: selectedMass, position: Math.round(pos), side: selectedSide }]);
  };

  const removeWeight = (id: number) => setWeights(prev => prev.filter(w => w.id !== id));
  const reset = () => { setWeights([]); setSupportPos(0); };

  const beamWidth = 400;
  const centerX = beamWidth / 2;
  const toPx = (pos: number) => centerX + pos * 30;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
          <Trophy className="w-4 h-4 text-[#14b8a6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Balance Beam</h1>
          <p className="text-[10px] text-[#737373]">ΣM = 0 — Keep it balanced</p>
        </div>
        {isBalanced && weights.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] text-[10px] font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Balanced
          </span>
        )}
        <button onClick={() => setShowHelp(!showHelp)} className="px-3 py-1.5 rounded-lg bg-white/5 text-[#737373] text-[10px] hover:bg-white/10 transition-all">Help</button>
        <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Balance visualization */}
        <div className="relative mb-8" style={{ width: beamWidth, height: 200 }}>
          {/* Support triangle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-[#525252]" />

          {/* Beam */}
          <motion.div
            className="absolute top-16 left-0 right-0 h-3 rounded-full origin-center"
            style={{
              background: isBalanced ? '#10b981' : '#525252',
              transformOrigin: `${centerX}px center`,
            }}
            animate={{ rotate: tilt, backgroundColor: isBalanced ? '#10b981' : '#525252' }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            {/* Weight markers */}
            {weights.map(w => (
              <motion.button
                key={w.id}
                onClick={() => removeWeight(w.id)}
                className="absolute -top-8 transform -translate-x-1/2 group"
                style={{ left: toPx(w.position - supportPos) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                title={`${w.mass}kg at position ${w.position}`}
              >
                <div
                  className="w-8 rounded-t-lg rounded-b-sm flex items-center justify-center text-[9px] font-bold text-white transition-all group-hover:brightness-125"
                  style={{
                    height: 20 + w.mass * 6,
                    background: w.side === 'left' ? '#3b82f6' : '#ef4444',
                  }}
                >
                  {w.mass}
                </div>
              </motion.button>
            ))}

            {/* Support position indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50" />
          </motion.div>

          {/* Scale markings */}
          {[-6, -4, -2, 0, 2, 4, 6].map(tick => (
            <div key={tick} className="absolute top-20 text-[8px] text-[#525252] font-mono" style={{ left: toPx(tick), transform: 'translateX(-50%)' }}>
              {tick > 0 ? `+${tick}` : tick}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-[10px] text-[#3b82f6]">Left Moment</p>
            <p className="text-lg font-bold text-[#3b82f6] font-mono">{leftMoment.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#737373]">Support</p>
            <input
              type="range" min={-3} max={3} step={1}
              value={supportPos}
              onChange={e => setSupportPos(Number(e.target.value))}
              className="w-24 accent-[#f59e0b]"
            />
            <p className="text-[10px] text-[#f59e0b] font-mono">{supportPos}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#ef4444]">Right Moment</p>
            <p className="text-lg font-bold text-[#ef4444] font-mono">{rightMoment.toFixed(1)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-[#737373]">Mass:</span>
          {PRESET_WEIGHTS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMass(m)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                selectedMass === m ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-white/5 text-[#737373] hover:bg-white/10'
              }`}
            >
              {m}kg
            </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => setSelectedSide('left')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
              selectedSide === 'left' ? 'bg-[#3b82f6]/15 text-[#3b82f6]' : 'bg-white/5 text-[#737373]'
            }`}
          >
            Left
          </button>
          <button
            onClick={() => setSelectedSide('right')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
              selectedSide === 'right' ? 'bg-[#ef4444]/15 text-[#ef4444]' : 'bg-white/5 text-[#737373]'
            }`}
          >
            Right
          </button>
          <button onClick={addWeight} className="ml-2 px-3 py-1.5 rounded-lg bg-[#14b8a6]/15 text-[#14b8a6] text-[10px] font-medium hover:bg-[#14b8a6]/25 transition-all inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </div>

      {/* Help modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowHelp(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold mb-3">How to Play</h3>
              <ul className="text-[11px] text-[#a3a3a3] space-y-2">
                <li>• Add weights to either side of the beam</li>
                <li>• Move the support position to help balance</li>
                <li>• Goal: Left Moment = Right Moment</li>
                <li>• Moment = mass × distance from support</li>
                <li>• Click a weight to remove it</li>
              </ul>
              <button onClick={() => setShowHelp(false)} className="mt-4 w-full py-2 rounded-xl bg-white/5 text-[#a3a3a3] text-xs hover:bg-white/10 transition-all">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
