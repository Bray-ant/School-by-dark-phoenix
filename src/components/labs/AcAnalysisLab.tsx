import { useState, useEffect, useRef } from 'react';

import { Waves } from 'lucide-react';

export default function AcAnalysisLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [freq, setFreq] = useState(1000);
  const [r, setR] = useState(1000);
  const [l, setL] = useState(0.01);
  const [c, setC] = useState(0.0000001);
  const [vSource, setVSource] = useState(10);
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const omega = 2 * Math.PI * freq;
  const xl = omega * l;
  const xc = 1 / (omega * c);

  let zMag = 0, zAngle = 0, iMag = 0, iAngle = 0, vr = 0, vl = 0, vc = 0;

  if (mode === 'series') {
    const zReal = r;
    const zImag = xl - xc;
    zMag = Math.sqrt(zReal * zReal + zImag * zImag);
    zAngle = Math.atan2(zImag, zReal) * 180 / Math.PI;
    iMag = vSource / zMag;
    iAngle = -zAngle;
    vr = iMag * r;
    vl = iMag * xl;
    vc = iMag * xc;
  } else {
    const yReal = 1 / r;
    const yImag = 1 / xc - 1 / xl;
    const yMag = Math.sqrt(yReal * yReal + yImag * yImag);
    zMag = 1 / yMag;
    zAngle = -Math.atan2(yImag, yReal) * 180 / Math.PI;
    iMag = vSource / zMag;
    iAngle = -zAngle;
  }

  const f0 = 1 / (2 * Math.PI * Math.sqrt(l * c));
  const q = mode === 'series' ? (omega0: number) => (omega0 * l) / r : (omega0: number) => r / (omega0 * l);
  const bw = f0 / q(2 * Math.PI * f0);

  // Draw phasor diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.35 / vSource;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    // Real label
    ctx.fillStyle = '#737373'; ctx.font = '11px monospace';
    ctx.fillText('Real', w - 40, cy + 15);
    ctx.fillText('+Imag', cx + 5, 15);

    // Voltage phasor (reference)
    drawArrow(ctx, cx, cy, cx + vSource * scale, cy, '#f59e0b', 2, 'Vs');

    if (mode === 'series') {
      // Current phasor
      const iScale = scale * 100;
      const ix = cx + iMag * iScale * Math.cos(iAngle * Math.PI / 180);
      const iy = cy - iMag * iScale * Math.sin(iAngle * Math.PI / 180);
      drawArrow(ctx, cx, cy, ix, iy, '#f59e0b', 2, 'I');

      // VR (in phase with I)
      drawArrow(ctx, cx, cy, cx + vr * scale * Math.cos(iAngle * Math.PI / 180), cy - vr * scale * Math.sin(iAngle * Math.PI / 180), '#3b82f6', 2, 'VR');

      // VL (leads I by 90)
      drawArrow(ctx, cx, cy, cx + vl * scale * Math.cos((iAngle + 90) * Math.PI / 180), cy - vl * scale * Math.sin((iAngle + 90) * Math.PI / 180), '#8b5cf6', 2, 'VL');

      // VC (lags I by 90)
      drawArrow(ctx, cx, cy, cx + vc * scale * Math.cos((iAngle - 90) * Math.PI / 180), cy - vc * scale * Math.sin((iAngle - 90) * Math.PI / 180), '#10b981', 2, 'VC');
    } else {
      // Impedance phasor
      const zx = cx + zMag * scale * Math.cos(zAngle * Math.PI / 180);
      const zy = cy - zMag * scale * Math.sin(zAngle * Math.PI / 180);
      drawArrow(ctx, cx, cy, zx, zy, '#ec4899', 2, 'Z');
    }
  }, [vSource, iMag, iAngle, vr, vl, vc, zMag, zAngle, mode]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">AC Analysis Laboratory</h2>
          <p className="text-xs text-[#737373]">Phasors, impedance, and frequency response in RLC circuits</p>
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={() => setMode('series')} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${mode === 'series' ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30' : 'bg-white/5 text-[#737373]'}`}>Series RLC</button>
          <button onClick={() => setMode('parallel')} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${mode === 'parallel' ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30' : 'bg-white/5 text-[#737373]'}`}>Parallel RLC</button>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Frequency', value: freq, setter: setFreq, min: 10, max: 50000, unit: 'Hz', color: '#f97316' },
              { label: 'V_source', value: vSource, setter: setVSource, min: 1, max: 20, unit: 'V', color: '#f59e0b' },
              { label: 'R', value: r, setter: setR, min: 10, max: 10000, unit: 'Ω', color: '#3b82f6' },
              { label: 'L', value: l * 1000, setter: (v: number) => setL(v / 1000), min: 1, max: 100, unit: 'mH', color: '#8b5cf6' },
              { label: 'C', value: c * 1e6, setter: (v: number) => setC(v * 1e-6), min: 0.01, max: 10, unit: 'μF', color: '#10b981' },
            ].map(c => (
              <div key={c.label}>
                <label className="text-[10px] text-[#737373] mb-1 block">{c.label} ({c.unit})</label>
                <input type="range" min={c.min} max={c.max} step={c.unit === 'μF' ? 0.01 : c.unit === 'mH' ? 1 : undefined}
                  value={c.unit === 'μF' ? Math.round(c.value * 100) / 100 : c.unit === 'mH' ? c.value : c.value}
                  onChange={e => c.setter(Number(e.target.value))} className="w-full" style={{ accentColor: c.color }} />
                <span className="text-xs font-mono" style={{ color: c.color }}>
                  {c.unit === 'Hz' ? (freq >= 1000 ? `${(freq / 1000).toFixed(1)} kHz` : `${freq} Hz`) : c.unit === 'μF' ? `${c.value.toFixed(2)} μF` : `${c.value} ${c.unit}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Phasor Diagram */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
              <Waves className="w-3.5 h-3.5 text-[#f97316]" />
              Phasor Diagram
            </h3>
            <canvas ref={canvasRef} width={400} height={300} className="w-full rounded-lg bg-[#050505]" />
            <div className="flex flex-wrap gap-3 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#f59e0b]" /> Vs</span>
              {mode === 'series' && (
                <>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#3b82f6]" /> VR</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#8b5cf6]" /> VL</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#10b981]" /> VC</span>
                </>
              )}
              {mode === 'parallel' && (
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#ec4899]" /> Z</span>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3">Reactances & Impedance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#737373]">X_L = ωL</span><span className="font-mono text-[#8b5cf6]">{xl < 1000 ? `${xl.toFixed(1)} Ω` : `${(xl / 1000).toFixed(2)} kΩ`}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#737373]">X_C = 1/ωC</span><span className="font-mono text-[#10b981]">{xc < 1000 ? `${xc.toFixed(1)} Ω` : `${(xc / 1000).toFixed(2)} kΩ`}</span></div>
                <div className="flex justify-between text-xs border-t border-white/5 pt-2"><span className="text-[#737373]">|Z| (magnitude)</span><span className="font-mono text-[#ec4899]">{zMag < 1000 ? `${zMag.toFixed(1)} Ω` : `${(zMag / 1000).toFixed(2)} kΩ`}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#737373]">∠Z (phase)</span><span className="font-mono text-[#f59e0b]">{zAngle.toFixed(1)}°</span></div>
              </div>
            </div>

            {mode === 'series' && (
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-xs font-semibold mb-3">Voltage Drops</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">V_R = I×R</span><span className="font-mono text-[#3b82f6]">{vr.toFixed(3)} V</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">V_L = I×X_L</span><span className="font-mono text-[#8b5cf6]">{vl.toFixed(3)} V</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">V_C = I×X_C</span><span className="font-mono text-[#10b981]">{vc.toFixed(3)} V</span></div>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3">Resonance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#737373]">f₀ (resonant freq)</span><span className="font-mono text-[#f97316]">{f0 < 1000 ? `${f0.toFixed(1)} Hz` : `${(f0 / 1000).toFixed(2)} kHz`}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#737373]">Q (quality factor)</span><span className="font-mono text-[#ec4899]">{q(2 * Math.PI * f0).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#737373]">BW (bandwidth)</span><span className="font-mono text-[#8b5cf6]">{bw < 1000 ? `${bw.toFixed(1)} Hz` : `${(bw / 1000).toFixed(2)} kHz`}</span></div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3">Circuit Status</h3>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-[10px] text-[#737373]">
                  {xl > xc ? `Inductive (X_L > X_C by ${((xl - xc) / (xl + xc) * 100).toFixed(1)}%)` :
                    xc > xl ? `Capacitive (X_C > X_L by ${((xc - xl) / (xl + xc) * 100).toFixed(1)}%)` :
                      'At Resonance! X_L = X_C'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number, label: string) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (len < 5) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  const headLen = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.3), y2 - headLen * Math.sin(angle - 0.3));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.3), y2 - headLen * Math.sin(angle + 0.3));
  ctx.closePath();
  ctx.fill();

  // Label
  ctx.fillStyle = color;
  ctx.font = '10px monospace';
  ctx.fillText(label, x2 + 8, y2);
}
