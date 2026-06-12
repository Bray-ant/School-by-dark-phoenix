import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function OhmsLawCalculator() {
  const [voltage, setVoltage] = useState(12);
  const [current, setCurrent] = useState(2);
  const [resistance, setResistance] = useState(6);
  const [solveFor, setSolveFor] = useState<'R' | 'I' | 'V'>('R');

  const computed = useMemo(() => {
    if (solveFor === 'R') {
      const r = voltage / current;
      return { V: voltage, I: current, R: r, P: voltage * current };
    } else if (solveFor === 'I') {
      const i = voltage / resistance;
      return { V: voltage, I: i, R: resistance, P: voltage * i };
    } else {
      const v = current * resistance;
      return { V: v, I: current, R: resistance, P: v * current };
    }
  }, [voltage, current, resistance, solveFor]);

  const electronSpeed = Math.min(computed.I * 5, 100);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#f59e0b]" />
        <h3 className="text-sm font-semibold">Ohm's Law Calculator</h3>
        <span className="text-[10px] text-[#737373] ml-auto">V = I × R</span>
      </div>

      {/* Solve For Selector */}
      <div className="flex gap-2 mb-5">
        {([['R', 'Resistance'], ['I', 'Current'], ['V', 'Voltage']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSolveFor(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              solveFor === key ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30' : 'bg-white/5 text-[#737373] border border-white/5'
            }`}
          >
            Solve for {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {solveFor !== 'V' && (
            <div>
              <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 block">Voltage (V)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={240} value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  className="flex-1 accent-[#f59e0b]"
                />
                <input
                  type="number" value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                />
                <span className="text-[10px] text-[#737373] w-4">V</span>
              </div>
            </div>
          )}
          {solveFor !== 'I' && (
            <div>
              <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 block">Current (I)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0.1} max={20} step={0.1} value={current}
                  onChange={e => setCurrent(Number(e.target.value))}
                  className="flex-1 accent-[#3b82f6]"
                />
                <input
                  type="number" value={current} step={0.1}
                  onChange={e => setCurrent(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                />
                <span className="text-[10px] text-[#737373] w-4">A</span>
              </div>
            </div>
          )}
          {solveFor !== 'R' && (
            <div>
              <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-1 block">Resistance (R)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={1000} value={resistance}
                  onChange={e => setResistance(Number(e.target.value))}
                  className="flex-1 accent-[#10b981]"
                />
                <input
                  type="number" value={resistance}
                  onChange={e => setResistance(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-center"
                />
                <span className="text-[10px] text-[#737373] w-4">Ω</span>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15 text-center">
              <div className="text-[10px] text-[#f59e0b] mb-1">VOLTAGE</div>
              <div className="text-lg font-bold font-mono">{computed.V.toFixed(2)} <span className="text-xs">V</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/15 text-center">
              <div className="text-[10px] text-[#3b82f6] mb-1">CURRENT</div>
              <div className="text-lg font-bold font-mono">{computed.I.toFixed(2)} <span className="text-xs">A</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15 text-center">
              <div className="text-[10px] text-[#10b981] mb-1">RESISTANCE</div>
              <div className="text-lg font-bold font-mono">{computed.R.toFixed(2)} <span className="text-xs">Ω</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#ec4899]/5 border border-[#ec4899]/15 text-center">
              <div className="text-[10px] text-[#ec4899] mb-1">POWER</div>
              <div className="text-lg font-bold font-mono">{computed.P.toFixed(2)} <span className="text-xs">W</span></div>
            </div>
          </div>
        </div>

        {/* Circuit Visualization */}
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full max-w-[300px]">
            {/* Battery */}
            <rect x={20} y={85} width={30} height={30} rx={4} fill="#1a1a1a" stroke="#f59e0b" strokeWidth={2} />
            <text x={35} y={105} textAnchor="middle" fill="#f59e0b" fontSize={12} fontWeight="bold">{computed.V.toFixed(0)}V</text>
            {/* Wire top */}
            <line x1={50} y1={95} x2={120} y2={95} stroke="#525252" strokeWidth={2} />
            {/* Wire bottom */}
            <line x1={50} y1={115} x2={120} y2={115} stroke="#525252" strokeWidth={2} />
            {/* Resistor (zigzag) */}
            <polyline
              points="120,95 130,85 140,105 150,85 160,105 170,85 180,95"
              fill="none" stroke="#10b981" strokeWidth={2}
            />
            <text x={150} y={80} textAnchor="middle" fill="#10b981" fontSize={10}>{computed.R.toFixed(1)}Ω</text>
            {/* Wire continuation */}
            <line x1={180} y1={95} x2={250} y2={95} stroke="#525252" strokeWidth={2} />
            <line x1={250} y1={95} x2={250} y2={115} stroke="#525252" strokeWidth={2} />
            <line x1={180} y1={115} x2={250} y2={115} stroke="#525252" strokeWidth={2} />
            {/* Current arrow */}
            <motion.polygon
              points="100,90 115,95 100,100"
              fill="#3b82f6"
              animate={{ x: [0, 60, 0] }}
              transition={{ duration: 3 / Math.max(computed.I, 0.5), repeat: Infinity, ease: "linear" }}
            />
            <text x={150} y={135} textAnchor="middle" fill="#3b82f6" fontSize={10}>I = {computed.I.toFixed(2)}A</text>
            {/* Current flow indicator */}
            <text x={150} y={155} textAnchor="middle" fill="#737373" fontSize={9}>
              {electronSpeed > 50 ? 'High current flow' : electronSpeed > 20 ? 'Moderate flow' : 'Low current flow'}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
