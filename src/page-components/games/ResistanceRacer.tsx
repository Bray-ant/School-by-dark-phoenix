"use client";
import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Home, Sparkles, Play, RotateCcw } from 'lucide-react';

const TRACK_RESISTANCES = [
  [10, 5, 8, 3, 12, 4, 6, 15],
  [7, 3, 11, 4, 8, 6, 9, 5],
  [4, 9, 6, 7, 3, 10, 5, 8],
  [12, 6, 4, 9, 5, 7, 11, 3],
  [8, 4, 10, 6, 3, 9, 7, 5],
];

export default function ResistanceRacer() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lane, setLane] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const progressRef = useRef(0);
  const laneRef = useRef(0);
  const scoreRef = useRef(0);
  const animRef = useRef<number>(0);

  laneRef.current = lane;
  scoreRef.current = score;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const laneH = h / 4;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    // Track
    const segWidth = w / 8;
    const offset = (progressRef.current * 3) % segWidth;

    for (let l = 0; l < 4; l++) {
      const y = l * laneH;
      // Lane bg
      ctx.fillStyle = l % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, y, w, laneH);

      // Segments
      for (let s = -1; s < 10; s++) {
        const sx = s * segWidth - offset;
        if (sx < -segWidth || sx > w) continue;
        const r = TRACK_RESISTANCES[l % TRACK_RESISTANCES.length][(s + Math.floor(progressRef.current * 3 / segWidth)) % 8];
        const hue = 120 - r * 8;

        ctx.fillStyle = `hsla(${hue}, 60%, 40%, 0.3)`;
        ctx.fillRect(sx + 2, y + 2, segWidth - 4, laneH - 4);

        ctx.fillStyle = `hsla(${hue}, 60%, 60%, 0.8)`;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${r}Ω`, sx + segWidth / 2, y + laneH / 2 + 4);
      }

      // Lane label
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Lane ${l + 1}`, 8, y + 12);
    }

    // Player car
    const carY = laneRef.current * laneH + laneH / 2;
    const carX = w * 0.15;

    // Car glow
    const glow = ctx.createRadialGradient(carX, carY, 0, carX, carY, 30);
    glow.addColorStop(0, 'rgba(236,72,153,0.4)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(carX - 30, carY - 30, 60, 60);

    // Car body
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(carX, carY, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(carX + 2, carY - 2, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Speed lines
    ctx.strokeStyle = 'rgba(236,72,153,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const ly = carY + (i - 1) * 12;
      ctx.beginPath();
      ctx.moveTo(carX - 30, ly);
      ctx.lineTo(carX - 50 - Math.random() * 20, ly);
      ctx.stroke();
    }

    // Progress bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, h - 4, w, 4);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, h - 4, (progressRef.current / 100) * w, 4);

    if (gameState === 'playing') {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [gameState]);

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
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { setGameState('ended'); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const update = setInterval(() => {
      setProgress(p => {
        const currentLane = laneRef.current;
        const segIdx = Math.floor(p / 12.5) % 8;
        const resistance = TRACK_RESISTANCES[currentLane][segIdx];
        const speed = Math.max(0.3, (15 - resistance) / 15) * 0.8;
        const newP = Math.min(100, p + speed);
        progressRef.current = newP;
        if (newP >= 100) { setGameState('ended'); setScore(Math.round(scoreRef.current + timeLeft * 5)); }
        return newP;
      });
    }, 50);
    return () => clearInterval(update);
  }, [gameState, timeLeft]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setLane(l => Math.max(0, l - 1));
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setLane(l => Math.min(3, l + 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [gameState]);

  const start = () => {
    setLane(0); setProgress(0); setScore(0); setTimeLeft(60); setGameState('playing');
    progressRef.current = 0; laneRef.current = 0; scoreRef.current = 0;
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <button onClick={() => router.push('/games')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#737373] hover:text-white text-[11px] transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Games
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-2" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <Car className="w-4 h-4 text-[#ec4899]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Resistance Racer</h1>
          <p className="text-[10px] text-[#737373]">Switch to low-resistance lanes for speed</p>
        </div>
        {gameState === 'playing' && (
          <>
            <span className="text-[10px] font-mono text-[#f59e0b]">{timeLeft}s</span>
            <span className="text-[10px] font-mono text-[#10b981]">{Math.round(progress)}%</span>
          </>
        )}
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />

          {gameState === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <Car className="w-12 h-12 text-[#ec4899] mx-auto mb-3" />
                <h2 className="text-xl font-semibold mb-2">Resistance Racer</h2>
                <p className="text-xs text-[#737373] mb-4 max-w-xs">Switch lanes with ↑/↓. Lower Ω = faster speed. Reach 100% in 60s!</p>
                <button onClick={start} className="px-6 py-2.5 bg-[#ec4899] hover:bg-[#db2777] text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start Race
                </button>
              </div>
            </div>
          )}

          {gameState === 'ended' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">{progress >= 100 ? 'Finish!' : 'Time Up'}</h2>
                <p className="text-2xl font-bold text-[#ec4899] mb-4">{Math.round(progress)}% complete</p>
                <button onClick={start} className="px-6 py-2.5 bg-[#ec4899] hover:bg-[#db2777] text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Race Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lane controls for mobile */}
        <div className="w-16 shrink-0 border-l border-white/5 flex flex-col" style={{ background: '#0a0a1a' }}>
          {[0, 1, 2, 3].map(l => (
            <button
              key={l}
              onClick={() => gameState === 'playing' && setLane(l)}
              className={`flex-1 flex items-center justify-center text-[10px] font-bold transition-all border-b border-white/5 ${
                lane === l ? 'bg-[#ec4899]/20 text-[#ec4899]' : 'text-[#525252] hover:bg-white/5'
              }`}
            >
              {l + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
