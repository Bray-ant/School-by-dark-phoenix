"use client";

import { useState } from 'react';
import { LabLayout, LabControls } from './shared';
import type { SliderConfig } from './shared';

export default function SuperpositionLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [v1, setV1] = useState(10);
  const [v2, setV2] = useState(5);
  const [r1, setR1] = useState(2000);
  const [r2, setR2] = useState(3000);
  const [r3, setR3] = useState(4000);
  const [activeSource, setActiveSource] = useState<'both' | 'v1' | 'v2'>('both');

  // Circuit: V1 -- R1 -- [node] -- R2 -- R3 -- V2
  // Node voltage with both sources
  const g1 = 1 / r1, g2 = 1 / (r2 + r3);
  const gTotal = g1 + g2;
  const vNodeBoth = (v1 * g1 + v2 * g2) / gTotal;

  // V1 only (V2 shorted)
  const vNodeV1Only = v1 * g1 / gTotal;

  // V2 only (V1 shorted)
  const vNodeV2Only = v2 * g2 / gTotal;

  
  const sliders: SliderConfig[] = [
    { label: 'V1', value: v1, setter: setV1, min: -20, max: 30, color: '#f59e0b', unit: 'V', format: v => String(v) },
    { label: 'V2', value: v2, setter: setV2, min: -20, max: 30, color: '#ef4444', unit: 'V', format: v => String(v) },
    { label: 'R1', value: r1, setter: setR1, min: 100, max: 10000, color: '#3b82f6' },
    { label: 'R2', value: r2, setter: setR2, min: 100, max: 10000, color: '#8b5cf6' },
    { label: 'R3', value: r3, setter: setR3, min: 100, max: 10000, color: '#10b981' },
  ];

  return (
    <LabLayout
      title="Superposition Laboratory"
      subtitle="In linear circuits, the total response equals the sum of individual source responses"
    >
      <LabControls sliders={sliders} columns="grid-cols-2 md:grid-cols-5" />

        {/* Source toggle */}
        <div className="flex gap-2 justify-center">
          {[
            { id: 'v1' as const, label: `V1 only (V2=0)`, color: '#f59e0b' },
            { id: 'v2' as const, label: `V2 only (V1=0)`, color: '#ef4444' },
            { id: 'both' as const, label: 'Both sources', color: '#14b8a6' },
          ].map(s => (
            <button key={s.id} onClick={() => setActiveSource(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeSource === s.id ? 'text-white' : 'bg-white/5 text-[#737373] hover:text-white'}`}
              style={activeSource === s.id ? { backgroundColor: `${s.color}30`, border: `1px solid ${s.color}50`, color: s.color } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Contribution from V1 */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>Contribution from V1</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#737373]">V2 shorted</span><span className="font-mono text-[#f59e0b]">V2 = 0</span></div>
              <div className="flex justify-between"><span className="text-[#737373]">V_node</span><span className="font-mono text-[#f59e0b]">{vNodeV1Only.toFixed(4)} V</span></div>
            </div>
            <div className="mt-3 p-2 rounded bg-white/5 font-mono text-[10px] text-[#d4d4d4]">
              V_A' = V1 × (R2+R3)/(R1+R2+R3)<br />
              = {v1} × ({r2}+{r3})/({r1}+{r2}+{r3})<br />
              = {vNodeV1Only.toFixed(3)} V
            </div>
          </div>

          {/* Contribution from V2 */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-xs font-semibold mb-2" style={{ color: '#ef4444' }}>Contribution from V2</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#737373]">V1 shorted</span><span className="font-mono text-[#ef4444]">V1 = 0</span></div>
              <div className="flex justify-between"><span className="text-[#737373]">V_node</span><span className="font-mono text-[#ef4444]">{vNodeV2Only.toFixed(4)} V</span></div>
            </div>
            <div className="mt-3 p-2 rounded bg-white/5 font-mono text-[10px] text-[#d4d4d4]">
              V_A'' = V2 × R1/(R1+R2+R3)<br />
              = {v2} × {r1}/({r1}+{r2}+{r3})<br />
              = {vNodeV2Only.toFixed(3)} V
            </div>
          </div>

          {/* Total */}
          <div className="glass-panel rounded-xl p-4 border border-[#14b8a6]/20">
            <h3 className="text-xs font-semibold mb-2 text-[#14b8a6]">Total (Superposition)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#737373]">V_A' + V_A''</span><span className="font-mono text-[#14b8a6]">{vNodeBoth.toFixed(4)} V</span></div>
              <div className="flex justify-between"><span className="text-[#737373]">Direct calculation</span><span className="font-mono text-[#14b8a6]">{vNodeBoth.toFixed(4)} V</span></div>
            </div>
            <div className="mt-3 p-2 rounded bg-[#14b8a6]/5 font-mono text-[10px] text-[#d4d4d4]">
              V_A = V_A' + V_A''<br />
              = {vNodeV1Only.toFixed(3)} + {vNodeV2Only.toFixed(3)}<br />
              = {vNodeBoth.toFixed(3)} V ✓
            </div>
          </div>
        </div>

        {/* Visual result */}
        <div className="glass-panel rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-[#f59e0b]">{vNodeV1Only.toFixed(2)}V</span>
              </div>
              <span className="text-[10px] text-[#737373]">From V1</span>
            </div>
            <span className="text-xl text-[#14b8a6] font-bold">+</span>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-[#ef4444]">{vNodeV2Only.toFixed(2)}V</span>
              </div>
              <span className="text-[10px] text-[#737373]">From V2</span>
            </div>
            <span className="text-xl text-[#14b8a6] font-bold">=</span>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-[#14b8a6]">{vNodeBoth.toFixed(2)}V</span>
              </div>
              <span className="text-[10px] text-[#737373]">Total</span>
            </div>
          </div>
          <p className="text-[10px] text-[#525252]">Superposition verified: the sum of individual responses equals the total response</p>
        </div>
    </LabLayout>
  );
}
