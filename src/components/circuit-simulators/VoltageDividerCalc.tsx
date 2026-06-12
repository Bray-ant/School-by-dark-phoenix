import { useState, useMemo } from 'react';


export default function VoltageDividerCalc() {
  const [Vtotal, setVtotal] = useState(12);
  const [R1, setR1] = useState(1000);
  const [R2, setR2] = useState(2000);

  const result = useMemo(() => {
    const Rtotal = R1 + R2;
    const I = Vtotal / Rtotal;
    const V1 = I * R1;
    const V2 = I * R2;
    const ratio = R2 / Rtotal;
    return { Rtotal, I, V1, V2, ratio };
  }, [Vtotal, R1, R2]);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-sm font-semibold mb-4">Voltage Divider Calculator</h3>

      <div className="space-y-4 mb-5">
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">Source Voltage (V_total)</label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={100} value={Vtotal} onChange={e => setVtotal(Number(e.target.value))} className="flex-1 accent-[#f59e0b]" />
            <span className="text-xs font-mono w-14">{Vtotal}V</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">R1 (top resistor)</label>
          <div className="flex items-center gap-2">
            <input type="range" min={100} max={10000} step={100} value={R1} onChange={e => setR1(Number(e.target.value))} className="flex-1 accent-[#3b82f6]" />
            <span className="text-xs font-mono w-14">{(R1/1000).toFixed(1)}k</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">R2 (bottom resistor)</label>
          <div className="flex items-center gap-2">
            <input type="range" min={100} max={10000} step={100} value={R2} onChange={e => setR2(Number(e.target.value))} className="flex-1 accent-[#10b981]" />
            <span className="text-xs font-mono w-14">{(R2/1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>

      {/* Circuit SVG */}
      <div className="flex justify-center mb-5">
        <svg viewBox="0 0 200 160" className="w-48">
          {/* Source */}
          <circle cx={100} cy={20} r={12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={100} y={24} textAnchor="middle" fill="#f59e0b" fontSize={8}>{Vtotal}V</text>
          {/* Wire to R1 */}
          <line x1={100} y1={32} x2={100} y2={55} stroke="#525252" strokeWidth={1.5} />
          {/* R1 */}
          <rect x={85} y={55} width={30} height={20} rx={2} fill="#1a1a1a" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={100} y={68} textAnchor="middle" fill="#3b82f6" fontSize={7}>{R1 >= 1000 ? (R1/1000)+'k' : R1}Ω</text>
          {/* V1 label */}
          <text x={128} y={65} fill="#3b82f6" fontSize={8}>V₁={result.V1.toFixed(2)}V</text>
          {/* Wire to junction */}
          <line x1={100} y1={75} x2={100} y2={85} stroke="#525252" strokeWidth={1.5} />
          {/* Junction dot */}
          <circle cx={100} cy={85} r={3} fill="#ec4899" />
          {/* Vout label */}
          <text x={100} y={98} textAnchor="middle" fill="#ec4899" fontSize={9} fontWeight="bold">Vout={result.V2.toFixed(2)}V</text>
          {/* R2 */}
          <rect x={85} y={105} width={30} height={20} rx={2} fill="#1a1a1a" stroke="#10b981" strokeWidth={1.5} />
          <text x={100} y={118} textAnchor="middle" fill="#10b981" fontSize={7}>{R2 >= 1000 ? (R2/1000)+'k' : R2}Ω</text>
          {/* Wire to ground */}
          <line x1={100} y1={125} x2={100} y2={135} stroke="#525252" strokeWidth={1.5} />
          {/* Ground */}
          <line x1={90} y1={135} x2={110} y2={135} stroke="#737373" strokeWidth={1.5} />
          <line x1={94} y1={140} x2={106} y2={140} stroke="#737373" strokeWidth={1.5} />
          <line x1={98} y1={145} x2={102} y2={145} stroke="#737373" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/15 text-center">
          <div className="text-[10px] text-[#3b82f6]">V across R1</div>
          <div className="text-lg font-bold font-mono">{result.V1.toFixed(2)}V</div>
        </div>
        <div className="p-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15 text-center">
          <div className="text-[10px] text-[#10b981]">V across R2 (Vout)</div>
          <div className="text-lg font-bold font-mono">{result.V2.toFixed(2)}V</div>
        </div>
        <div className="p-3 rounded-xl bg-[#ec4899]/5 border border-[#ec4899]/15 text-center">
          <div className="text-[10px] text-[#ec4899]">Current</div>
          <div className="text-lg font-bold font-mono">{(result.I * 1000).toFixed(2)}mA</div>
        </div>
        <div className="p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15 text-center">
          <div className="text-[10px] text-[#f59e0b]">Ratio (R2/Total)</div>
          <div className="text-lg font-bold font-mono">{(result.ratio * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white/5 text-[10px] text-[#737373] text-center">
        Vout = V_total × (R₂ / (R₁ + R₂)) = {Vtotal} × ({R2} / {R1 + R2}) = <strong className="text-[#f6f6f6]">{result.V2.toFixed(2)}V</strong>
      </div>
    </div>
  );
}
