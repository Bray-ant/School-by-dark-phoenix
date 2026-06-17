"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

import { Activity, Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function TransientLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [circuit, setCircuit] = useState<'rc' | 'rl' | 'rlc'>('rc');
  const [vSource, setVSource] = useState(10);
  const [r, setR] = useState(1000);
  const [c, setC] = useState(0.000001);
  const [l, setL] = useState(0.01);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [voltageData, setVoltageData] = useState<number[]>([]);
  const [currentData, setCurrentData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const tau = circuit === 'rc' ? r * c : circuit === 'rl' ? l / r : 2 * Math.sqrt(l * c);
  const maxTime = 5 * tau;

  const reset = useCallback(() => {
    setTime(0);
    timeRef.current = 0;
    setVoltageData([]);
    setCurrentData([]);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    reset();
  }, [circuit, vSource, r, c, l, reset]);

  useEffect(() => {
    if (!isRunning) return;
    const dt = tau * 0.02;
    const step = () => {
      timeRef.current += dt;
      const t = timeRef.current;
      setTime(t);

      let v = 0, i = 0;
      if (circuit === 'rc') {
        v = vSource * (1 - Math.exp(-t / tau));
        i = (vSource / r) * Math.exp(-t / tau);
      } else if (circuit === 'rl') {
        v = vSource * Math.exp(-t / tau);
        i = (vSource / r) * (1 - Math.exp(-t / tau));
      } else {
        const alpha = r / (2 * l);
        const omega0 = 1 / Math.sqrt(l * c);
        if (alpha < omega0) {
          const omegad = Math.sqrt(omega0 * omega0 - alpha * alpha);
          v = vSource * (1 - Math.exp(-alpha * t) * (Math.cos(omegad * t) + (alpha / omegad) * Math.sin(omegad * t)));
          i = (vSource / l) * Math.exp(-alpha * t) * Math.sin(omegad * t) / omegad;
        } else {
          v = vSource * (1 - Math.exp(-alpha * t) * (1 + alpha * t));
          i = (vSource / l) * t * Math.exp(-alpha * t);
        }
      }

      setVoltageData(prev => [...prev.slice(-300), v]);
      setCurrentData(prev => [...prev.slice(-300), i]);

      if (t < maxTime * 1.5) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRunning(false);
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, circuit, vSource, r, c, l, tau, maxTime]);

  // Draw oscilloscope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || voltageData.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    // Voltage curve
    const maxV = vSource * 1.2;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    voltageData.forEach((v, i) => {
      const x = (i / Math.max(voltageData.length, 1)) * w;
      const y = h - (v / maxV) * h * 0.8 - h * 0.1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current curve
    const maxI = vSource / r;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    currentData.forEach((i, idx) => {
      const x = (idx / Math.max(currentData.length, 1)) * w;
      const y = h - (Math.abs(i) / maxI) * h * 0.8 - h * 0.1;
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#3b82f6'; ctx.font = '11px monospace';
    ctx.fillText('Voltage (V)', 10, 15);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Current (I)', 100, 15);
  }, [voltageData, currentData, vSource, r]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Transient Response Laboratory</h2>
          <p className="text-xs text-[#737373]">Observe how circuits respond to sudden changes over time</p>
        </div>

        {/* Circuit selector */}
        <div className="flex gap-2 justify-center">
          {[
            { id: 'rc' as const, label: 'RC Circuit', desc: 'Capacitor charging/discharging' },
            { id: 'rl' as const, label: 'RL Circuit', desc: 'Inductor current buildup' },
            { id: 'rlc' as const, label: 'RLC Circuit', desc: 'Damped oscillations' },
          ].map(c => (
            <button key={c.id} onClick={() => { setCircuit(c.id); reset(); }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${circuit === c.id ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' : 'bg-white/5 text-[#737373] hover:text-white'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] text-[#737373] mb-1 block">V_source (V)</label>
              <input type="range" min={1} max={20} value={vSource} onChange={e => setVSource(Number(e.target.value))} className="w-full accent-[#ef4444]" />
              <span className="text-xs font-mono text-[#f59e0b]">{vSource} V</span>
            </div>
            <div>
              <label className="text-[10px] text-[#737373] mb-1 block">R (Ω)</label>
              <input type="range" min={100} max={10000} value={r} onChange={e => setR(Number(e.target.value))} className="w-full accent-[#ef4444]" />
              <span className="text-xs font-mono text-[#3b82f6]">{(r / 1000).toFixed(1)} kΩ</span>
            </div>
            {circuit !== 'rl' && (
              <div>
                <label className="text-[10px] text-[#737373] mb-1 block">C (μF)</label>
                <input type="range" min={0.1} max={10} step={0.1} value={c * 1e6} onChange={e => setC(Number(e.target.value) * 1e-6)} className="w-full accent-[#ef4444]" />
                <span className="text-xs font-mono text-[#10b981]">{(c * 1e6).toFixed(1)} μF</span>
              </div>
            )}
            {circuit !== 'rc' && (
              <div>
                <label className="text-[10px] text-[#737373] mb-1 block">L (mH)</label>
                <input type="range" min={1} max={100} value={l * 1000} onChange={e => setL(Number(e.target.value) / 1000)} className="w-full accent-[#ef4444]" />
                <span className="text-xs font-mono text-[#8b5cf6]">{(l * 1000).toFixed(0)} mH</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setIsRunning(!isRunning)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/30 text-xs text-[#ef4444] hover:bg-[#ef4444]/25 transition-all">
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause' : 'Simulate'}
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-xs text-[#737373] hover:text-white transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Oscilloscope */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#ef4444]" />
              Oscilloscope
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Voltage</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Current</span>
              <span className="text-[#737373]">t = {time.toExponential(1)} s</span>
            </div>
          </div>
          <canvas ref={canvasRef} width={800} height={250} className="w-full rounded-lg bg-[#050505]" />
        </div>

        {/* Time constant info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel rounded-xl p-3 text-center">
            <Timer className="w-4 h-4 text-[#ef4444] mx-auto mb-1" />
            <p className="text-[10px] text-[#737373]">Time Constant (τ)</p>
            <p className="text-sm font-mono font-bold text-[#ef4444]">{tau < 1e-3 ? `${(tau * 1e6).toFixed(1)} μs` : tau < 1 ? `${(tau * 1e3).toFixed(2)} ms` : `${tau.toFixed(3)} s`}</p>
          </div>
          <div className="glass-panel rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#737373]">At t = τ</p>
            <p className="text-sm font-mono font-bold text-[#3b82f6]">63.2%</p>
            <p className="text-[9px] text-[#525252]">of final value</p>
          </div>
          <div className="glass-panel rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#737373]">At t = 5τ</p>
            <p className="text-sm font-mono font-bold text-[#10b981]">99.3%</p>
            <p className="text-[9px] text-[#525252]">fully charged</p>
          </div>
          <div className="glass-panel rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#737373]">Max Time</p>
            <p className="text-sm font-mono font-bold text-[#8b5cf6]">5τ</p>
            <p className="text-[9px] text-[#525252]">{maxTime < 1e-3 ? `${(maxTime * 1e6).toFixed(0)} μs` : maxTime < 1 ? `${(maxTime * 1e3).toFixed(1)} ms` : `${maxTime.toFixed(3)} s`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
