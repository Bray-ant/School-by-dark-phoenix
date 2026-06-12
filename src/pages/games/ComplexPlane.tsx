import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDot, Home, Sparkles, Plus, Minus, RotateCw } from 'lucide-react';

interface ComplexPoint { re: number; im: number; id: number; }

let nextId = 1;

export default function ComplexPlane() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<ComplexPoint[]>([
    { re: 1, im: 0, id: nextId++ },
    { re: 0, im: 1, id: nextId++ },
    { re: -1, im: 1, id: nextId++ },
  ]);
  const [operation, setOperation] = useState<'multiply' | 'add' | 'power' | 'conjugate'>('multiply');
  const [operand, setOperand] = useState<string>('i');
  const [zoom, setZoom] = useState(60);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const step = zoom;
    for (let x = cx % step; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = cy % step; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    // Unit circle
    ctx.strokeStyle = 'rgba(6,182,212,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, zoom, 0, Math.PI * 2); ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px monospace';
    ctx.fillText('Re', w - 20, cy - 6);
    ctx.fillText('Im', cx + 6, 12);
    ctx.fillText('1', cx + zoom - 3, cy + 14);
    ctx.fillText('i', cx + 6, cy - zoom + 4);

    // Points
    timeRef.current += 0.01;
    const t = timeRef.current;

    points.forEach((pt, idx) => {
      const px = cx + pt.re * zoom;
      const py = cy - pt.im * zoom;
      const hue = (idx * 60 + t * 10) % 360;
      const color = `hsl(${hue}, 70%, 60%)`;

      // Glow
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 20);
      grad.addColorStop(0, color + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(px - 20, py - 20, 40, 40);

      // Ring
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 8 + Math.sin(t + idx) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px monospace';
      const label = pt.im >= 0 ? `${pt.re.toFixed(1)}+${pt.im.toFixed(1)}i` : `${pt.re.toFixed(1)}${pt.im.toFixed(1)}i`;
      ctx.fillText(label, px + 8, py - 8);

      // Line to origin
      ctx.strokeStyle = color + '20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
    });

    // Connection lines between points
    if (points.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i], p2 = points[j];
          ctx.beginPath();
          ctx.moveTo(cx + p1.re * zoom, cy - p1.im * zoom);
          ctx.lineTo(cx + p2.re * zoom, cy - p2.im * zoom);
          ctx.stroke();
        }
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [points, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const applyOp = () => {
    const parseComplex = (s: string): [number, number] => {
      s = s.trim().toLowerCase().replace(/\s/g, '');
      if (s === 'i') return [0, 1];
      if (s === '-i') return [0, -1];
      if (s.includes('i')) {
        const parts = s.replace(/\+/g, ' +').replace(/-/g, ' -').trim().split(/\s+/);
        let re = 0, im = 0;
        for (const p of parts) {
          if (p.includes('i')) im += parseFloat(p.replace('i', '')) || (p === 'i' || p === '+i' ? 1 : p === '-i' ? -1 : 0);
          else re += parseFloat(p) || 0;
        }
        return [re, im];
      }
      return [parseFloat(s) || 0, 0];
    };

    const [opRe, opIm] = parseComplex(operand);

    setPoints(prev => prev.map(p => {
      if (operation === 'multiply') {
        return { ...p, re: p.re * opRe - p.im * opIm, im: p.re * opIm + p.im * opRe };
      } else if (operation === 'add') {
        return { ...p, re: p.re + opRe, im: p.im + opIm };
      } else if (operation === 'power') {
        const n = Math.round(opRe) || 2;
        const r = Math.sqrt(p.re * p.re + p.im * p.im);
        const theta = Math.atan2(p.im, p.re);
        const newR = Math.pow(r, n);
        const newTheta = theta * n;
        return { ...p, re: newR * Math.cos(newTheta), im: newR * Math.sin(newTheta) };
      } else {
        return { ...p, im: -p.im };
      }
    }));
  };

  const addRandom = () => {
    setPoints(prev => [...prev, {
      re: (Math.random() - 0.5) * 6,
      im: (Math.random() - 0.5) * 6,
      id: nextId++,
    }]);
  };

  const reset = () => {
    nextId = 1;
    setPoints([
      { re: 1, im: 0, id: nextId++ },
      { re: 0, im: 1, id: nextId++ },
      { re: -1, im: 1, id: nextId++ },
    ]);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#050510' }}>
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <CircleDot className="w-4 h-4 text-[#06b6d4]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Complex Plane Explorer</h1>
          <p className="text-[10px] text-[#737373]">Drop numbers, watch operations transform them</p>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/5 px-4 py-2 flex flex-wrap items-center gap-2" style={{ background: '#0a0a1a' }}>
        <select value={operation} onChange={e => setOperation(e.target.value as any)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-[#f6f6f6] outline-none">
          <option value="multiply">Multiply by</option>
          <option value="add">Add</option>
          <option value="power">Raise to power</option>
          <option value="conjugate">Conjugate</option>
        </select>
        {operation !== 'conjugate' && (
          <input value={operand} onChange={e => setOperand(e.target.value)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-[#f6f6f6] font-mono outline-none w-20" placeholder="i" />
        )}
        <button onClick={applyOp} className="px-3 py-1 rounded bg-[#06b6d4]/15 text-[#06b6d4] text-[11px] font-medium hover:bg-[#06b6d4]/25 transition-all">
          <RotateCw className="w-3 h-3 inline mr-1" />Apply
        </button>
        <button onClick={addRandom} className="px-3 py-1 rounded bg-white/5 text-[#a3a3a3] text-[11px] hover:bg-white/10 transition-all">
          <Plus className="w-3 h-3 inline mr-1" />Add Point
        </button>
        <button onClick={() => setPoints(p => p.slice(0, -1))} className="px-3 py-1 rounded bg-white/5 text-[#a3a3a3] text-[11px] hover:bg-white/10 transition-all">
          <Minus className="w-3 h-3 inline mr-1" />Remove
        </button>
        <button onClick={reset} className="px-3 py-1 rounded bg-white/5 text-[#a3a3a3] text-[11px] hover:bg-white/10 transition-all">Reset</button>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} className="p-1 rounded bg-white/5 text-[#737373] hover:text-white text-[11px]">-</button>
          <span className="text-[10px] text-[#737373] w-8 text-center">{zoom}</span>
          <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 rounded bg-white/5 text-[#737373] hover:text-white text-[11px]">+</button>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      </div>
    </div>
  );
}
