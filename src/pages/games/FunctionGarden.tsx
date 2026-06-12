import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, Home, RotateCcw, Download, Sparkles } from 'lucide-react';

const PRESETS = [
  { name: 'Sine Garden', expr: 'sin(x)', color: '#10b981' },
  { name: 'Cosine Waves', expr: 'cos(x)', color: '#3b82f6' },
  { name: 'Tangent Fire', expr: 'tan(x/3)', color: '#f59e0b' },
  { name: 'Exponential', expr: 'exp(-x*x/4)', color: '#ec4899' },
  { name: 'Logarithmic', expr: 'log(abs(x)+1)', color: '#8b5cf6' },
  { name: 'Parabola', expr: 'x*x/10', color: '#f97316' },
  { name: 'Cubic', expr: 'x*x*x/30', color: '#06b6d4' },
  { name: 'Damped Oscillation', expr: 'exp(-x*x/8)*sin(x*2)', color: '#a855f7' },
];

function safeEval(expr: string, x: number): number {
  try {
    const scope = { x, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, log: Math.log, abs: Math.abs, sqrt: Math.sqrt, PI: Math.PI, E: Math.E };
    const fn = new Function(...Object.keys(scope), `return ${expr}`);
    return fn(...Object.values(scope));
  } catch { return 0; }
}

export default function FunctionGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [expr, setExpr] = useState('sin(x)');
  const [color, setColor] = useState('#10b981');
  const [bloomSize, setBloomSize] = useState(3);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    timeRef.current += 0.008;
    const t = timeRef.current;

    ctx.fillStyle = 'rgba(5, 5, 16, 0.15)';
    ctx.fillRect(0, 0, w, h);

    const scaleX = w / 20;
    const scaleY = h / 12;
    const offsetY = h / 2;

    // Draw function as stem line
    ctx.beginPath();
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 1;
    for (let px = 0; px < w; px += 2) {
      const x = (px - w / 2) / scaleX;
      const y = safeEval(expr, x + t * 0.3);
      const py = offsetY - y * scaleY;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw flowers at sample points
    const numFlowers = 40 * bloomSize;
    for (let i = 0; i < numFlowers; i++) {
      const fx = -10 + (i / numFlowers) * 20;
      const fy = safeEval(expr, fx + t * 0.3);
      const fpx = w / 2 + fx * scaleX;
      const fpy = offsetY - fy * scaleY;

      const petalSize = 3 + Math.sin(t + i * 0.5) * 2;
      const numPetals = 5 + (i % 3);

      for (let p = 0; p < numPetals; p++) {
        const angle = (p / numPetals) * Math.PI * 2 + t * 0.2;
        const px2 = fpx + Math.cos(angle) * petalSize * 3;
        const py2 = fpy + Math.sin(angle) * petalSize * 3;

        const grad = ctx.createRadialGradient(fpx, fpy, 0, px2, py2, petalSize * 2);
        grad.addColorStop(0, color + 'cc');
        grad.addColorStop(1, color + '10');

        ctx.beginPath();
        ctx.arc(px2, py2, petalSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(fpx, fpy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff80';
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [expr, color, bloomSize]);

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

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'function-garden.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#050510' }}>
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Flower2 className="w-4 h-4 text-[#10b981]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Function Garden</h1>
          <p className="text-[10px] text-[#737373]">Draw functions. Watch them bloom.</p>
        </div>
        <button onClick={() => { setExpr('sin(x)'); setColor('#10b981'); timeRef.current = 0; }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={handleDownload} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white transition-all">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex flex-wrap items-center gap-3" style={{ background: '#0a0a1a' }}>
        <input
          value={expr}
          onChange={e => setExpr(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#f6f6f6] outline-none focus:border-[#10b981]/30 font-mono"
          placeholder="sin(x)"
        />
        <div className="flex items-center gap-1.5">
          {['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#a855f7'].map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-5 h-5 rounded-full border-2 transition-all" style={{ background: c, borderColor: color === c ? '#fff' : 'transparent' }} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#737373]">Bloom</span>
          <input type="range" min={1} max={5} step={1} value={bloomSize} onChange={e => setBloomSize(Number(e.target.value))} className="w-20 accent-[#10b981]" />
        </div>
      </div>

      {/* Presets */}
      <div className="shrink-0 border-b border-white/5 px-4 py-2 flex gap-1.5 overflow-x-auto" style={{ background: '#0a0a1a' }}>
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => { setExpr(p.expr); setColor(p.color); }}
            className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap"
            style={{
              background: expr === p.expr ? `${p.color}15` : 'rgba(255,255,255,0.05)',
              color: expr === p.expr ? p.color : '#737373',
              border: `1px solid ${expr === p.expr ? p.color + '30' : 'transparent'}`,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      </div>
    </div>
  );
}
