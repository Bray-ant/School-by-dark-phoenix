import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Eye } from 'lucide-react';
import { gaussJordanElimination } from '../../lib/circuitSolver';
import { LabLayout, LabControls } from './shared';
import type { SliderConfig } from './shared';

export default function NodalLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [v1, setV1] = useState(12);
  const [i1, setI1] = useState(0.005);
  const [r1, setR1] = useState(4000);
  const [r2, setR2] = useState(6000);
  const [r3, setR3] = useState(3000);
  const [showSteps, setShowSteps] = useState(false);

  // Nodal analysis: V1 is the only unknown node (ground = reference)
  // (1/R1 + 1/R2 + 1/R3) * V1 = V_source/R1 + I_source
  const g1 = 1 / r1, g2 = 1 / r2, g3 = 1 / r3;
  const gTotal = g1 + g2 + g3;
  const vNode = (v1 * g1 + i1) / gTotal;
  const iR1 = (v1 - vNode) / r1;
  const iR2 = vNode / r2;
  const iR3 = vNode / r3;
  const kclCheck = iR1 - iR2 - iR3 + i1;

  // 2-node version for matrix display
  const { steps } = gaussJordanElimination([[gTotal]], [v1 * g1 + i1]);

  const sliders: SliderConfig[] = [
    { label: 'V_source', value: v1, setter: setV1, min: 1, max: 30, color: '#f59e0b', unit: 'V', format: v => String(v) },
    { label: 'I_source', value: Math.round(i1 * 1000), setter: (v: number) => setI1(v / 1000), min: 1, max: 20, color: '#10b981', unit: 'mA', format: v => String(v) },
    { label: 'R1', value: r1, setter: setR1, min: 100, max: 10000, color: '#3b82f6' },
    { label: 'R2', value: r2, setter: setR2, min: 100, max: 10000, color: '#8b5cf6' },
    { label: 'R3', value: r3, setter: setR3, min: 100, max: 10000, color: '#ec4899' },
  ];

  return (
    <LabLayout
      title="Nodal Analysis Laboratory"
      subtitle="Apply KCL at each node to form conductance matrix equations"
    >
      <LabControls sliders={sliders} columns="grid-cols-2 md:grid-cols-5" accentColor="#ec4899" />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-4">
            <svg viewBox="0 0 400 240" className="w-full">
              {/* Ground reference */}
              <line x1="60" y1="200" x2="340" y2="200" stroke="#525252" strokeWidth="2" />
              <line x1="160" y1="205" x2="240" y2="205" stroke="#10b981" strokeWidth="2" />
              <line x1="170" y1="210" x2="230" y2="210" stroke="#10b981" strokeWidth="2" />
              <line x1="180" y1="215" x2="220" y2="215" stroke="#10b981" strokeWidth="2" />
              <text x="200" y="230" textAnchor="middle" fill="#10b981" fontSize="9">Reference (GND)</text>

              {/* Voltage source branch */}
              <line x1="100" y1="200" x2="100" y2="140" stroke="#525252" strokeWidth="2" />
              <circle cx="100" cy="120" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="100" y="125" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
              <text x="65" y="125" fill="#f59e0b" fontSize="9">{v1}V</text>
              <line x1="100" y1="100" x2="200" y2="100" stroke="#525252" strokeWidth="2" />
              <rect x="130" y="92" width="40" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
              <text x="150" y="88" textAnchor="middle" fill="#3b82f6" fontSize="8">R1</text>

              {/* Node A */}
              <line x1="200" y1="100" x2="200" y2="100" stroke="#525252" strokeWidth="2" />
              <circle cx="200" cy="100" r="6" fill="#ec4899" />
              <text x="200" y="85" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">NODE A</text>
              <text x="200" y="78" textAnchor="middle" fill="#a3a3a3" fontSize="8">V_A = {vNode.toFixed(2)}V</text>

              {/* R2 to ground */}
              <line x1="200" y1="100" x2="200" y2="200" stroke="#525252" strokeWidth="2" />
              <rect x="192" y="130" width="16" height="40" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <text x="225" y="155" fill="#8b5cf6" fontSize="8">R2</text>

              {/* R3 branch */}
              <line x1="200" y1="100" x2="300" y2="100" stroke="#525252" strokeWidth="2" />
              <rect x="260" y="92" width="40" height="16" rx="2" fill="none" stroke="#ec4899" strokeWidth="2" />
              <text x="280" y="88" textAnchor="middle" fill="#ec4899" fontSize="8">R3</text>
              <line x1="300" y1="100" x2="300" y2="200" stroke="#525252" strokeWidth="2" />

              {/* Current source */}
              <circle cx="300" cy="120" r="15" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="300" y="124" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">I</text>
              <text x="330" y="125" fill="#10b981" fontSize="9">{(i1 * 1000).toFixed(0)}mA</text>
            </svg>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-[#ec4899]" />
                Nodal Equation
              </h3>
              <div className="font-mono text-xs space-y-2">
                <div className="p-3 rounded-lg bg-white/5 text-[#d4d4d4]">
                  (G1 + G2 + G3) · V_A = V1·G1 + I1<br />
                  ({(g1 * 1000).toFixed(3)} + {(g2 * 1000).toFixed(3)} + {(g3 * 1000).toFixed(3)}) mS · V_A = {v1}·{(g1 * 1000).toFixed(3)}m + {(i1 * 1000).toFixed(0)}m<br />
                  <span className="text-[#ec4899]">{(gTotal * 1000).toFixed(3)} mS · V_A = {(v1 * g1 + i1).toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#10b981]" />
                Solution
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">V_A (node voltage)</span>
                  <span className="font-mono text-[#ec4899]">{vNode.toFixed(4)} V</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">I_R1 (through R1)</span>
                  <span className="font-mono text-[#3b82f6]">{(iR1 * 1000).toFixed(3)} mA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">I_R2 (through R2)</span>
                  <span className="font-mono text-[#8b5cf6]">{(iR2 * 1000).toFixed(3)} mA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#737373]">I_R3 (through R3)</span>
                  <span className="font-mono text-[#ec4899]">{(iR3 * 1000).toFixed(3)} mA</span>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#737373]">KCL check</span>
                    <span className="font-mono text-[#10b981]">{(kclCheck * 1e6).toFixed(1)} μA ≈ 0</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSteps(!showSteps)} className="w-full py-2 rounded-lg bg-white/5 text-xs text-[#737373] hover:text-white transition-all">
              {showSteps ? 'Hide' : 'Show'} Solving Steps
            </button>
            {showSteps && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-4 overflow-auto max-h-48">
                <pre className="font-mono text-[10px] text-[#a3a3a3] whitespace-pre-wrap">{steps.join('\n\n')}</pre>
              </motion.div>
            )}
          </div>
        </div>
    </LabLayout>
  );
}
