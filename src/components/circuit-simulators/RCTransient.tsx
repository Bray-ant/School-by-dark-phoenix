import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function RCTransient() {
  const [R, setR] = useState(10); // kΩ
  const [C, setC] = useState(100); // μF
  const [Vsource, setVsource] = useState(12); // V
  const [mode, setMode] = useState<'charge' | 'discharge'>('charge');

  const tau = (R * 1000) * (C * 1e-6); // seconds

  const dataPoints = useMemo(() => {
    const points = [];
    const maxTime = 5 * tau;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxTime;
      let v: number;
      if (mode === 'charge') {
        v = Vsource * (1 - Math.exp(-t / tau));
      } else {
        v = Vsource * Math.exp(-t / tau);
      }
      points.push({ t, v });
    }
    return points;
  }, [R, C, Vsource, mode, tau]);

  const formatTime = (t: number) => {
    if (t < 0.001) return `${(t * 1000).toFixed(1)}μs`;
    if (t < 1) return `${(t * 1000).toFixed(1)}ms`;
    return `${t.toFixed(2)}s`;
  };

  const svgWidth = 400;
  const svgHeight = 200;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const xScale = (t: number) => padding.left + (t / (5 * tau)) * (svgWidth - padding.left - padding.right);
  const yScale = (v: number) => padding.top + (1 - v / Vsource) * (svgHeight - padding.top - padding.bottom);

  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.t)},${yScale(p.v)}`).join(' ');

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">RC Transient Response</h3>
        <div className="flex gap-1">
          <button onClick={() => setMode('charge')} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${mode === 'charge' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-white/5 text-[#737373]'}`}>Charging</button>
          <button onClick={() => setMode('discharge')} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${mode === 'discharge' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-white/5 text-[#737373]'}`}>Discharging</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">Resistance</label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={100} value={R} onChange={e => setR(Number(e.target.value))} className="flex-1 accent-[#f59e0b]" />
            <span className="text-xs font-mono w-16 text-right">{R}kΩ</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">Capacitance</label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={1000} value={C} onChange={e => setC(Number(e.target.value))} className="flex-1 accent-[#3b82f6]" />
            <span className="text-xs font-mono w-16 text-right">{C}μF</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#737373] uppercase mb-1 block">Source Voltage</label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={50} value={Vsource} onChange={e => setVsource(Number(e.target.value))} className="flex-1 accent-[#10b981]" />
            <span className="text-xs font-mono w-16 text-right">{Vsource}V</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-3">
        <span className="text-[10px] text-[#737373]">Time Constant </span>
        <span className="text-xs font-mono font-bold text-[#ec4899]">τ = {formatTime(tau)}</span>
        <span className="text-[10px] text-[#737373] ml-3">5τ = {formatTime(5 * tau)} (steady state)</span>
      </div>

      {/* Graph */}
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
        {/* Grid */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(pct => {
          const y = padding.top + pct * (svgHeight - padding.top - padding.bottom);
          return <line key={`h-${pct}`} x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#333" strokeWidth={0.5} strokeDasharray="2,2" />;
        })}
        {[0, 1, 2, 3, 4, 5].map(tauMult => {
          const x = xScale(tauMult * tau);
          return <line key={`v-${tauMult}`} x1={x} y1={padding.top} x2={x} y2={svgHeight - padding.bottom} stroke="#333" strokeWidth={0.5} strokeDasharray="2,2" />;
        })}

        {/* Axes */}
        <line x1={padding.left} y1={svgHeight - padding.bottom} x2={svgWidth - padding.right} y2={svgHeight - padding.bottom} stroke="#525252" strokeWidth={1} />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={svgHeight - padding.bottom} stroke="#525252" strokeWidth={1} />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const v = Vsource * (1 - pct);
          const y = padding.top + pct * (svgHeight - padding.top - padding.bottom);
          return <text key={`yl-${pct}`} x={padding.left - 8} y={y + 3} textAnchor="end" fill="#737373" fontSize={8}>{v.toFixed(1)}V</text>;
        })}

        {/* X-axis labels */}
        {[0, 1, 2, 3, 4, 5].map(tauMult => {
          const x = xScale(tauMult * tau);
          return <text key={`xl-${tauMult}`} x={x} y={svgHeight - padding.bottom + 15} textAnchor="middle" fill="#737373" fontSize={8}>{tauMult}τ</text>;
        })}

        {/* Curve */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={mode === 'charge' ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Steady state line */}
        {mode === 'charge' && (
          <line x1={padding.left} y1={yScale(Vsource)} x2={svgWidth - padding.right} y2={yScale(Vsource)} stroke="#10b981" strokeWidth={0.5} strokeDasharray="4,2" opacity={0.5} />
        )}

        {/* Key point at 1τ */}
        <circle cx={xScale(tau)} cy={yScale(mode === 'charge' ? Vsource * 0.632 : Vsource * 0.368)} r={4} fill={mode === 'charge' ? '#10b981' : '#ef4444'} />
        <text x={xScale(tau) + 8} y={yScale(mode === 'charge' ? Vsource * 0.632 : Vsource * 0.368) + 3} fill="#d4d4d4" fontSize={8}>
          {mode === 'charge' ? '63.2%' : '36.8%'}
        </text>
      </svg>

      {/* Key values table */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {[1, 2, 3, 4, 5].map(t => {
          const pct = mode === 'charge'
            ? (1 - Math.exp(-t)) * 100
            : Math.exp(-t) * 100;
          return (
            <div key={t} className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-[10px] text-[#737373]">{t}τ</div>
              <div className="text-xs font-mono font-bold">{pct.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
