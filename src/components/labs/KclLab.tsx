import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

export default function KclLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [vSource, setVSource] = useState(12);
  const [r1, setR1] = useState(2000);
  const [r2, setR2] = useState(3000);
  const [r3, setR3] = useState(6000);
  const [animTime, setAnimTime] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const loop = () => { if (running) { setAnimTime(t => t + 0.02); animRef.current = requestAnimationFrame(loop); } };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  // Node A (junction): current from source splits into r2 and r3
  const iTotal = vSource / (r1 + 1 / (1 / r2 + 1 / r3));
  const vNode = vSource - iTotal * r1;
  const i2 = vNode / r2;
  const i3 = vNode / r3;
  const kclSum = iTotal - i2 - i3;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Kirchhoff's Current Law Laboratory</h2>
          <p className="text-xs text-[#737373]">Sum of currents entering a node equals sum leaving: ΣI_in = ΣI_out</p>
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'V_source', value: vSource, setter: setVSource, min: 1, max: 50, color: '#f59e0b' },
              { label: 'R1', value: r1, setter: setR1, min: 100, max: 10000, color: '#3b82f6' },
              { label: 'R2', value: r2, setter: setR2, min: 100, max: 10000, color: '#8b5cf6' },
              { label: 'R3', value: r3, setter: setR3, min: 100, max: 10000, color: '#10b981' },
            ].map(c => (
              <div key={c.label}>
                <label className="text-[10px] text-[#737373] mb-1 block">{c.label} (Ω)</label>
                <input type="range" min={c.min} max={c.max} value={c.value} onChange={e => c.setter(Number(e.target.value))} className="w-full accent-[#3b82f6]" />
                <span className="text-xs font-mono" style={{ color: c.color }}>{(c.value / 1000).toFixed(1)} kΩ</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Circuit */}
          <div className="glass-panel rounded-xl p-4">
            <svg viewBox="0 0 400 280" className="w-full">
              {/* Source vertical */}
              <line x1="200" y1="30" x2="200" y2="90" stroke="#525252" strokeWidth="2" />
              <circle cx="200" cy="110" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="200" y="115" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
              <text x="165" y="115" fill="#a3a3a3" fontSize="9">{vSource}V</text>
              <line x1="200" y1="130" x2="200" y2="140" stroke="#525252" strokeWidth="2" />

              {/* R1 horizontal */}
              <rect x="170" y="160" width="60" height="14" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <text x="200" y="155" textAnchor="middle" fill="#3b82f6" fontSize="8">R1={(r1 / 1000).toFixed(1)}k</text>

              {/* Junction node */}
              <circle cx="200" cy="200" r="5" fill="#ec4899" />
              <text x="200" y="220" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold">NODE A</text>

              {/* R2 branch */}
              <line x1="200" y1="200" x2="200" y2="240" stroke="#525252" strokeWidth="2" />
              <rect x="192" y="240" width="16" height="40" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <text x="220" y="260" fill="#8b5cf6" fontSize="8">R2</text>
              <line x1="200" y1="280" x2="200" y2="280" stroke="#525252" strokeWidth="2" />

              {/* R3 branch (horizontal) */}
              <line x1="200" y1="200" x2="260" y2="200" stroke="#525252" strokeWidth="2" />
              <rect x="260" y="192" width="50" height="16" rx="2" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="285" y="185" textAnchor="middle" fill="#10b981" fontSize="8">R3={(r3 / 1000).toFixed(1)}k</text>
              <line x1="310" y1="200" x2="350" y2="200" stroke="#525252" strokeWidth="2" />
              <line x1="350" y1="200" x2="350" y2="280" stroke="#525252" strokeWidth="2" />
              <line x1="200" y1="280" x2="350" y2="280" stroke="#525252" strokeWidth="2" />

              {/* Ground */}
              <line x1="185" y1="280" x2="215" y2="280" stroke="#10b981" strokeWidth="2" />
              <line x1="190" y1="285" x2="210" y2="285" stroke="#10b981" strokeWidth="2" />
              <line x1="195" y1="290" x2="205" y2="290" stroke="#10b981" strokeWidth="2" />

              {/* Animated current arrows */}
              {/* I_total flowing down */}
              <g transform={`translate(210, ${140 + (animTime * 10) % 60})`}>
                <polygon points="0,0 -4,-6 4,-6" fill="#f59e0b" opacity={0.8} />
              </g>
              <text x="230" y="170" fill="#f59e0b" fontSize="8">I_total</text>

              {/* I_2 flowing down */}
              <g transform={`translate(210, ${200 + (animTime * 10) % 80})`}>
                <polygon points="0,0 -4,-6 4,-6" fill="#8b5cf6" opacity={0.8} />
              </g>
              <text x="215" y="250" fill="#8b5cf6" fontSize="8">I_2</text>

              {/* I_3 flowing right */}
              <g transform={`translate(${200 + (animTime * 10) % 150}, 210)`}>
                <polygon points="0,0 -6,-4 -6,4" fill="#10b981" opacity={0.8} />
              </g>
              <text x="270" y="215" fill="#10b981" fontSize="8">I_3</text>
            </svg>
          </div>

          {/* KCL Analysis */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-[#10b981]" />
              KCL at Node A
            </h3>

            {/* Currents */}
            <div className="space-y-2">
              <motion.div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                <ArrowIn color="#f59e0b" />
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-[#f59e0b]">I_total (entering)</div>
                  <div className="text-[9px] text-[#525252]">From source through R1</div>
                </div>
                <span className="text-xs font-mono text-[#f59e0b]">{(iTotal * 1000).toFixed(3)} mA</span>
              </motion.div>

              <motion.div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/15">
                <ArrowOut color="#8b5cf6" />
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-[#8b5cf6]">I_2 (leaving)</div>
                  <div className="text-[9px] text-[#525252]">V_A / R2 = {(vNode).toFixed(2)}V / {(r2 / 1000).toFixed(1)}kΩ</div>
                </div>
                <span className="text-xs font-mono text-[#8b5cf6]">{(i2 * 1000).toFixed(3)} mA</span>
              </motion.div>

              <motion.div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#10b981]/5 border border-[#10b981]/15">
                <ArrowOut color="#10b981" />
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-[#10b981]">I_3 (leaving)</div>
                  <div className="text-[9xs] text-[#525252]">V_A / R3 = {(vNode).toFixed(2)}V / {(r3 / 1000).toFixed(1)}kΩ</div>
                </div>
                <span className="text-xs font-mono text-[#10b981]">{(i3 * 1000).toFixed(3)} mA</span>
              </motion.div>
            </div>

            {/* Equation */}
            <div className="p-3 rounded-lg bg-white/5 font-mono text-[10px] text-[#d4d4d4] leading-relaxed">
              I_total = I_2 + I_3<br />
              {(iTotal * 1000).toFixed(3)} = {(i2 * 1000).toFixed(3)} + {(i3 * 1000).toFixed(3)}<br />
              ΣI = {(kclSum * 1e6).toFixed(1)} μA ≈ 0
            </div>

            {/* Verification */}
            <div className="p-2 rounded-lg bg-[#10b981]/5 border border-[#10b981]/15">
              <p className="text-[10px] text-[#10b981] text-center">
                ✓ KCL satisfied! Sum of entering currents = Sum of leaving currents
              </p>
            </div>

            <div className="text-[9px] text-[#525252] text-center">
              Node voltage V_A = {vNode.toFixed(3)} V
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowIn({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="8" y1="16" x2="8" y2="4" stroke={color} strokeWidth="2" />
      <polygon points="8,0 4,6 12,6" fill={color} />
    </svg>
  );
}

function ArrowOut({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="8" y1="0" x2="8" y2="12" stroke={color} strokeWidth="2" />
      <polygon points="8,16 4,10 12,10" fill={color} />
    </svg>
  );
}
