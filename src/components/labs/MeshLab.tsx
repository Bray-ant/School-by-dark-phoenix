import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Eye } from 'lucide-react';
import { gaussJordanElimination } from '../../lib/circuitSolver';

export default function MeshLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [v1, setV1] = useState(10);
  const [v2, setV2] = useState(5);
  const [r1, setR1] = useState(2000);
  const [r2, setR2] = useState(3000);
  const [r3, setR3] = useState(4000);
  const [showSteps, setShowSteps] = useState(false);

  // Mesh equations for 2-mesh circuit
  // Mesh 1: (R1+R2)*I1 - R2*I2 = V1
  // Mesh 2: -R2*I1 + (R2+R3)*I2 = -V2
  const a11 = r1 + r2, a12 = -r2, b1 = v1;
  const a21 = -r2, a22 = r2 + r3, b2 = -v2;
  const det = a11 * a22 - a12 * a21;
  const i1Mesh = det !== 0 ? (b1 * a22 - a12 * b2) / det : 0;
  const i2Mesh = det !== 0 ? (a11 * b2 - b1 * a21) / det : 0;

  const { steps } = gaussJordanElimination(
    [[a11, a12], [a21, a22]],
    [b1, b2]
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Mesh Analysis Laboratory</h2>
          <p className="text-xs text-[#737373]">Apply KVL around each independent loop to form mesh equations</p>
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'V1', value: v1, setter: setV1, min: -20, max: 30, color: '#f59e0b' },
              { label: 'V2', value: v2, setter: setV2, min: -20, max: 30, color: '#ef4444' },
              { label: 'R1', value: r1, setter: setR1, min: 100, max: 10000, color: '#3b82f6' },
              { label: 'R2', value: r2, setter: setR2, min: 100, max: 10000, color: '#8b5cf6' },
              { label: 'R3', value: r3, setter: setR3, min: 100, max: 10000, color: '#10b981' },
            ].map(c => (
              <div key={c.label}>
                <label className="text-[10px] text-[#737373] mb-1 block">{c.label}</label>
                <input type="range" min={c.min} max={c.max} value={c.value} onChange={e => c.setter(Number(e.target.value))} className="w-full accent-[#8b5cf6]" />
                <span className="text-xs font-mono" style={{ color: c.color }}>{Math.abs(c.value) >= 1000 ? `${(c.value / 1000).toFixed(1)}k` : c.value} {c.label.startsWith('V') ? 'V' : 'Ω'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Circuit diagram */}
          <div className="glass-panel rounded-xl p-4">
            <svg viewBox="0 0 400 260" className="w-full">
              {/* Mesh 1: Left loop (V1, R1, R2) */}
              <line x1="80" y1="40" x2="80" y2="120" stroke="#525252" strokeWidth="2" />
              <circle cx="80" cy="140" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="80" y="145" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
              <text x="50" y="145" fill="#f59e0b" fontSize="9">{v1}V</text>
              <line x1="80" y1="160" x2="80" y2="220" stroke="#525252" strokeWidth="2" />
              <rect x="70" y="220" width="60" height="14" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <text x="100" y="250" textAnchor="middle" fill="#3b82f6" fontSize="9">R1={(r1 / 1000).toFixed(1)}k</text>
              <line x1="130" y1="227" x2="200" y2="227" stroke="#525252" strokeWidth="2" />

              {/* Shared R2 */}
              <rect x="200" y="140" width="14" height="60" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <text x="220" y="175" fill="#8b5cf6" fontSize="9">R2</text>
              <line x1="207" y1="200" x2="207" y2="227" stroke="#525252" strokeWidth="2" />
              <line x1="207" y1="140" x2="207" y2="50" stroke="#525252" strokeWidth="2" />
              <line x1="207" y1="50" x2="80" y2="50" stroke="#525252" strokeWidth="2" />

              {/* Mesh 2: Right loop (V2, R2, R3) */}
              <line x1="207" y1="50" x2="320" y2="50" stroke="#525252" strokeWidth="2" />
              <line x1="320" y1="50" x2="320" y2="120" stroke="#525252" strokeWidth="2" />
              <circle cx="320" cy="140" r="20" fill="none" stroke="#ef4444" strokeWidth="2" />
              <text x="320" y="145" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>
              <text x="350" y="145" fill="#ef4444" fontSize="9">{v2}V</text>
              <line x1="320" y1="160" x2="320" y2="220" stroke="#525252" strokeWidth="2" />
              <rect x="280" y="220" width="60" height="14" rx="2" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="310" y="250" textAnchor="middle" fill="#10b981" fontSize="9">R3={(r3 / 1000).toFixed(1)}k</text>
              <line x1="280" y1="227" x2="207" y2="227" stroke="#525252" strokeWidth="2" />

              {/* Mesh labels */}
              <text x="130" y="100" fill="#8b5cf6" fontSize="11" fontWeight="bold" opacity={0.7}>Mesh 1</text>
              <text x="250" y="100" fill="#10b981" fontSize="11" fontWeight="bold" opacity={0.7}>Mesh 2</text>
            </svg>
          </div>

          {/* Equations */}
          <div className="space-y-4">
            {/* Matrix form */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-[#8b5cf6]" />
                Mesh Equations (Matrix Form)
              </h3>
              <div className="font-mono text-xs space-y-2">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-[#737373] mb-1">Resistance Matrix [R] · Current Vector [I] = Voltage Vector [V]</div>
                  <div className="text-[#d4d4d4] leading-relaxed">
                    [{a11}  {a12}] [I1] = [{b1}]<br />
                    [{a21}  {a22}] [I2] = [{b2}]
                  </div>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#10b981]" />
                Solution
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">I1 (Mesh 1 current)</span>
                  <span className="font-mono text-[#8b5cf6]">{(i1Mesh * 1000).toFixed(3)} mA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">I2 (Mesh 2 current)</span>
                  <span className="font-mono text-[#10b981]">{(i2Mesh * 1000).toFixed(3)} mA</span>
                </div>
                <div className="border-t border-white/5 pt-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#737373]">Current through R1</span>
                    <span className="font-mono text-[#3b82f6]">{(i1Mesh * 1000).toFixed(3)} mA</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#737373]">Current through R2</span>
                    <span className="font-mono text-[#ec4899]">{((i1Mesh - i2Mesh) * 1000).toFixed(3)} mA</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#737373]">Current through R3</span>
                    <span className="font-mono text-[#10b981]">{(i2Mesh * 1000).toFixed(3)} mA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaussian elimination steps */}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full py-2 rounded-lg bg-white/5 text-xs text-[#737373] hover:text-white hover:bg-white/10 transition-all"
            >
              {showSteps ? 'Hide' : 'Show'} Gaussian Elimination Steps
            </button>
            {showSteps && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel rounded-xl p-4 overflow-auto max-h-64">
                <div className="font-mono text-[10px] text-[#a3a3a3] whitespace-pre leading-relaxed">
                  {steps.join('\n\n')}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
