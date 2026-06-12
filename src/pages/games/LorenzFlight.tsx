import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Home, Sparkles } from 'lucide-react';

// Lorenz attractor: dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz
const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.005;
const NUM_POINTS = 2000;

interface Point3D { x: number; y: number; z: number; }

function lorenzStep(p: Point3D): Point3D {
  return {
    x: p.x + DT * SIGMA * (p.y - p.x),
    y: p.y + DT * (p.x * (RHO - p.z) - p.y),
    z: p.z + DT * (p.x * p.y - BETA * p.z),
  };
}

export default function LorenzFlight() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const [trail, setTrail] = useState(0.5);
  const [colorHue, setColorHue] = useState(280);
  const animRef = useRef<number>(0);
  const pointsRef = useRef<Point3D[]>([]);
  const cameraRef = useRef(0);

  const init = useCallback(() => {
    const pts: Point3D[] = [{ x: 0.1, y: 0, z: 0 }];
    for (let i = 0; i < NUM_POINTS; i++) pts.push(lorenzStep(pts[pts.length - 1]));
    pointsRef.current = pts;
  }, []);

  useEffect(() => { init(); }, [init]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Fade effect
    ctx.fillStyle = `rgba(5, 5, 16, ${0.08 + trail * 0.15})`;
    ctx.fillRect(0, 0, w, h);

    const pts = pointsRef.current;
    if (pts.length < 2) return;

    // Rotate
    cameraRef.current += 0.002 * speed;
    const angle = cameraRef.current;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Project 3D to 2D
    const projected = pts.map(p => {
      const rx = p.x * cos - p.z * sin;
      const rz = p.x * sin + p.z * cos;
      return {
        sx: w / 2 + rx * 12,
        sy: h / 2 + p.y * 6 - rz * 3,
        depth: rz,
      };
    });

    // Draw trail
    for (let i = 1; i < projected.length; i++) {
      const p1 = projected[i - 1];
      const p2 = projected[i];
      const progress = i / projected.length;
      const hue = (colorHue + progress * 60) % 360;
      const alpha = progress * 0.8;
      const width = 0.5 + progress * 2;

      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    // Head glow
    const head = projected[projected.length - 1];
    const glow = ctx.createRadialGradient(head.sx, head.sy, 0, head.sx, head.sy, 25);
    glow.addColorStop(0, `hsla(${colorHue}, 70%, 60%, 0.4)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(head.sx - 25, head.sy - 25, 50, 50);

    ctx.beginPath();
    ctx.arc(head.sx, head.sy, 4, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${colorHue}, 70%, 70%, 0.9)`;
    ctx.fill();

    // Advance
    for (let s = 0; s < speed; s++) {
      const last = pointsRef.current[pointsRef.current.length - 1];
      const next = lorenzStep(last);
      pointsRef.current.push(next);
      if (pointsRef.current.length > NUM_POINTS) pointsRef.current.shift();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [speed, trail, colorHue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.scale(dpr, dpr); ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, rect.width, rect.height); }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="h-screen flex flex-col" style={{ background: '#050510' }}>
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <Waves className="w-4 h-4 text-[#a855f7]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Lorenz Attractor Flight</h1>
          <p className="text-[10px] text-[#737373]">Chaos theory as living art</p>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/5 px-4 py-2 flex flex-wrap items-center gap-4" style={{ background: '#0a0a1a' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#737373]">Speed</span>
          <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-20 accent-[#a855f7]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#737373]">Trail</span>
          <input type="range" min={1} max={10} value={Math.round(trail * 10)} onChange={e => setTrail(Number(e.target.value) / 10)} className="w-20 accent-[#a855f7]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#737373]">Color</span>
          <input type="range" min={0} max={360} value={colorHue} onChange={e => setColorHue(Number(e.target.value))} className="w-20 accent-[#a855f7]" />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {['Purple', 'Blue', 'Green', 'Pink', 'Orange'].map((name, i) => {
            const hues = [280, 200, 120, 320, 30];
            return (
              <button key={name} onClick={() => setColorHue(hues[i])} className="px-2 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-[#a3a3a3] transition-all">
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
        <div className="absolute bottom-4 left-4 text-[10px] text-[#525252] font-mono">
          σ={SIGMA} ρ={RHO} β={BETA.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
