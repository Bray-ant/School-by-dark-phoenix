import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fish, Home, Sparkles } from 'lucide-react';

const FIELD_SIZE = 40;

function vectorField(x: number, y: number): [number, number] {
  // A vector field with saddle, source, and sink
  const sx1 = -0.3, sy1 = -0.2; // saddle
  const sx2 = 0.4, sy2 = 0.3;  // source
  const sx3 = 0.2, sy3 = -0.4; // sink

  let dx = 0, dy = 0;

  // Saddle: dx = x, dy = -y
  const d1 = Math.sqrt((x - sx1) ** 2 + (y - sy1) ** 2) + 0.1;
  dx += (x - sx1) / d1 * 0.3;
  dy += -(y - sy1) / d1 * 0.3;

  // Source: outward
  const d2 = Math.sqrt((x - sx2) ** 2 + (y - sy2) ** 2) + 0.1;
  dx += (x - sx2) / d2 * 0.4;
  dy += (y - sy2) / d2 * 0.4;

  // Sink: inward
  const d3 = Math.sqrt((x - sx3) ** 2 + (y - sy3) ** 2) + 0.1;
  dx += -(x - sx3) / d3 * 0.35;
  dy += -(y - sy3) / d3 * 0.35;

  return [dx, dy];
}

export default function VectorFishing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [catches, setCatches] = useState<string[]>([]);
  const scoreRef = useRef(0);

  const toCanvas = (val: number, size: number) => (val + 0.6) / 1.2 * size;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= FIELD_SIZE; i++) {
      const x = toCanvas(-0.6 + (i / FIELD_SIZE) * 1.2, w);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      const y = toCanvas(-0.6 + (i / FIELD_SIZE) * 1.2, h);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Critical points
    const points = [
      { x: -0.3, y: -0.2, label: 'Saddle', color: '#f59e0b' },
      { x: 0.4, y: 0.3, label: 'Source', color: '#10b981' },
      { x: 0.2, y: -0.4, label: 'Sink', color: '#ef4444' },
    ];

    // Draw vectors
    const step = 0.06;
    for (let x = -0.5; x < 0.5; x += step) {
      for (let y = -0.5; y < 0.5; y += step) {
        const [vx, vy] = vectorField(x, y);
        const cx = toCanvas(x, w);
        const cy = toCanvas(y, h);
        const len = Math.sqrt(vx * vx + vy * vy);
        const maxLen = step * w / 1.2 * 0.8;
        const scale = Math.min(len * 30, maxLen);
        const angle = Math.atan2(-vy, vx);

        const endX = cx + Math.cos(angle) * scale;
        const endY = cy + Math.sin(angle) * scale;

        const hue = (len * 120 + 200) % 360;
        ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = `hsla(${hue}, 60%, 50%, 0.5)`;
        ctx.beginPath();
        ctx.arc(endX, endY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Critical point markers
    points.forEach(p => {
      const px = toCanvas(p.x, w);
      const py = toCanvas(p.y, h);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 20);
      grad.addColorStop(0, p.color + '30');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(px - 20, py - 20, 40, 40);

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.strokeStyle = p.color + '80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px sans-serif';
      ctx.fillText(p.label, px + 12, py + 3);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    draw();
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1.2 - 0.6;
    const clickY = ((e.clientY - rect.top) / rect.height) * 1.2 - 0.6;

    const criticalPoints = [
      { x: -0.3, y: -0.2, name: 'Saddle', pts: 15 },
      { x: 0.4, y: 0.3, name: 'Source', pts: 20 },
      { x: 0.2, y: -0.4, name: 'Sink', pts: 20 },
    ];

    for (const cp of criticalPoints) {
      const dist = Math.sqrt((clickX - cp.x) ** 2 + (clickY - cp.y) ** 2);
      if (dist < 0.08) {
        const newScore = scoreRef.current + cp.pts;
        scoreRef.current = newScore;
        setScore(newScore);
        setCatches(prev => [`Caught a ${cp.name}! +${cp.pts}pts`, ...prev].slice(0, 5));
        return;
      }
    }

    // Animate line cast
    const [vx, vy] = vectorField(clickX, clickY);
    const type = Math.sqrt(vx * vx + vy * vy) > 0.3 ? 'Fast current!' : 'Calm waters';
    setCatches(prev => [`Cast at (${clickX.toFixed(2)}, ${clickY.toFixed(2)}) — ${type}`, ...prev].slice(0, 5));
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <Fish className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Vector Field Fishing</h1>
          <p className="text-[10px] text-[#737373]">Click near critical points to catch them</p>
        </div>
        <span className="text-[10px] font-mono text-[#f59e0b]">Score: {score}</span>
      </div>

      <div className="shrink-0 border-b border-white/5 px-4 py-2 flex items-center gap-3 text-[10px] text-[#737373]" style={{ background: '#0a0a1a' }}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Saddle (15pts)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Source (20pts)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Sink (20pts)</span>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" style={{ display: 'block' }} onClick={handleCanvasClick} />
        </div>
        {catches.length > 0 && (
          <div className="w-48 shrink-0 border-l border-white/5 p-3 overflow-y-auto" style={{ background: '#0a0a1a' }}>
            <p className="text-[10px] font-semibold text-[#a3a3a3] mb-2">CATCH LOG</p>
            {catches.map((c, i) => (
              <p key={i} className="text-[10px] text-[#737373] mb-1.5 leading-relaxed">{c}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
