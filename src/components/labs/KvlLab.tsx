import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, RotateCcw } from 'lucide-react';

export default function KvlLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [vSource, setVSource] = useState(12);
  const [r1, setR1] = useState(1000);
  const [r2, setR2] = useState(2000);
  const [r3, setR3] = useState(1000);
  const [activeLoop, setActiveLoop] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [animTime, setAnimTime] = useState(0);
  const animRef = useRef<number>(0);

  const rTotal = r1 + r2 + r3;
  const iTotal = vSource / rTotal;
  const v1 = iTotal * r1;
  const v2 = iTotal * r2;
  const v3 = iTotal * r3;

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      setAnimTime(t => t + 0.02);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  const steps = [
    { label: 'Start at source (+)', value: vSource, color: '#f59e0b', desc: `V_source = ${vSource.toFixed(1)} V (voltage rise)` },
    { label: 'Drop across R1', value: -v1, color: '#3b82f6', desc: `V_R1 = I x R1 = ${(iTotal * 1000).toFixed(3)} mA x ${(r1 / 1000).toFixed(1)} kΩ = ${v1.toFixed(3)} V` },
    { label: 'Drop across R2', value: -v2, color: '#8b5cf6', desc: `V_R2 = I x R2 = ${(iTotal * 1000).toFixed(3)} mA x ${(r2 / 1000).toFixed(1)} kΩ = ${v2.toFixed(3)} V` },
    { label: 'Drop across R3', value: -v3, color: '#10b981', desc: `V_R3 = I x R3 = ${(iTotal * 1000).toFixed(3)} mA x ${(r3 / 1000).toFixed(1)} kΩ = ${v3.toFixed(3)} V` },
  ];

  const kvlSum = vSource - v1 - v2 - v3;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Kirchhoff's Voltage Law Laboratory</h2>
          <p className="text-xs text-[#737373]">Sum of voltages around any closed loop equals zero: ΣV = 0</p>
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'V_source', value: vSource, unit: 'V', setter: setVSource, min: 1, max: 50, color: '#f59e0b' },
              { label: 'R1', value: r1, unit: 'Ω', setter: setR1, min: 100, max: 10000, color: '#3b82f6' },
              { label: 'R2', value: r2, unit: 'Ω', setter: setR2, min: 100, max: 10000, color: '#8b5cf6' },
              { label: 'R3', value: r3, unit: 'Ω', setter: setR3, min: 100, max: 10000, color: '#10b981' },
            ].map(c => (
              <div key={c.label}>
                <label className="text-[10px] text-[#737373] mb-1 block">{c.label} ({c.unit})</label>
                <input
                  type="range" min={c.min} max={c.max} value={c.value}
                  onChange={e => c.setter(Number(e.target.value))}
                  className="w-full accent-[#3b82f6]"
                />
                <span className="text-xs font-mono" style={{ color: c.color }}>{c.value >= 1000 ? `${(c.value / 1000).toFixed(1)}k` : c.value} {c.unit}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setActiveLoop(!activeLoop); setLoopStep(0); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-xs text-[#f59e0b] hover:bg-[#f59e0b]/25 transition-all"
            >
              {activeLoop ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {activeLoop ? 'Reset' : 'Trace Loop'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Circuit Visualization */}
          <div className="glass-panel rounded-xl p-4">
            <svg viewBox="0 0 400 300" className="w-full">
              {/* Series circuit: Source - R1 - R2 - R3 */}
              {/* Left vertical: Source */}
              <line x1="80" y1="50" x2="80" y2="110" stroke="#525252" strokeWidth="2" />
              <circle cx="80" cy="130" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="80" y="135" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
              <text x="50" y="135" fill="#a3a3a3" fontSize="9">{vSource.toFixed(1)}V</text>
              <line x1="80" y1="150" x2="80" y2="250" stroke="#525252" strokeWidth="2" />

              {/* Bottom: R3 */}
              <line x1="80" y1="250" x2="150" y2="250" stroke="#525252" strokeWidth="2" />
              <rect x="150" y="242" width="40" height="16" rx="2" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="170" y="270" textAnchor="middle" fill="#10b981" fontSize="9">R3={(r3/1000).toFixed(1)}k</text>
              <line x1="190" y1="250" x2="260" y2="250" stroke="#525252" strokeWidth="2" />

              {/* Right vertical: R2 */}
              <line x1="260" y1="250" x2="260" y2="180" stroke="#525252" strokeWidth="2" />
              <rect x="252" y="130" width="16" height="50" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <text x="285" y="155" fill="#8b5cf6" fontSize="9">R2={(r2/1000).toFixed(1)}k</text>
              <line x1="260" y1="130" x2="260" y2="50" stroke="#525252" strokeWidth="2" />

              {/* Top: R1 */}
              <line x1="260" y1="50" x2="190" y2="50" stroke="#525252" strokeWidth="2" />
              <rect x="150" y="42" width="40" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <text x="170" y="35" textAnchor="middle" fill="#3b82f6" fontSize="9">R1={(r1/1000).toFixed(1)}k</text>
              <line x1="150" y1="50" x2="80" y2="50" stroke="#525252" strokeWidth="2" />

              {/* Current flow animation */}
              {activeLoop && (
                <>
                  {/* Along the loop path */}
                  {[
                    { x1: 80, y1: 250, x2: 80, y2: 150, offset: 0 },
                    { x1: 80, y1: 250, x2: 260, y2: 250, offset: 25 },
                    { x1: 260, y1: 250, x2: 260, y2: 50, offset: 50 },
                    { x1: 260, y1: 50, x2: 80, y2: 50, offset: 75 },
                  ].map((seg, i) => {
                    const t = ((animTime * 15 + seg.offset) % 100) / 100;
                    const px = seg.x1 + (seg.x2 - seg.x1) * t;
                    const py = seg.y1 + (seg.y2 - seg.y1) * t;
                    return (
                      <circle key={i} cx={px} cy={py} r={3} fill="#f59e0b" opacity={0.8}>
                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                      </circle>
                    );
                  })}
                </>
              )}

              {/* Voltage labels */}
              <text x="170" y="165" textAnchor="middle" fill="#737373" fontSize="8">I = {(iTotal*1000).toFixed(2)} mA</text>
            </svg>
          </div>

          {/* KVL Equation Builder */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
              KVL Equation (Clockwise Loop)
            </h3>

            <div className="space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    activeLoop && loopStep === i ? 'bg-white/10' : 'bg-white/[0.02]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                    {step.value >= 0 ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium">{step.label}</div>
                    <div className="text-[9px] text-[#525252]">{step.desc}</div>
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: step.color }}>
                    {step.value >= 0 ? '+' : ''}{step.value.toFixed(3)} V
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Sum */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#737373]">Sum (ΣV)</span>
                <motion.span
                  className="text-sm font-mono font-bold"
                  animate={{ color: Math.abs(kvlSum) < 0.001 ? '#10b981' : '#ef4444' }}
                >
                  {kvlSum.toFixed(4)} V
                </motion.span>
              </div>
              <div className="mt-2 p-2 rounded-lg bg-[#10b981]/5 border border-[#10b981]/15">
                <p className="text-[10px] text-[#10b981] text-center">
                  {Math.abs(kvlSum) < 0.001 ? '✓ KVL satisfied! Sum = 0' : `≈ 0 (numerical precision: ${kvlSum.toExponential(1)})`}
                </p>
              </div>
            </div>

            {/* Full equation */}
            <div className="p-3 rounded-lg bg-white/5 font-mono text-[10px] text-[#d4d4d4] leading-relaxed">
              {vSource.toFixed(1)} - {v1.toFixed(3)} - {v2.toFixed(3)} - {v3.toFixed(3)} = {kvlSum.toFixed(4)} ≈ 0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
