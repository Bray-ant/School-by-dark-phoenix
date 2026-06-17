"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flower2, Zap, CircleDot, Grid3x3, Timer, Fish, Car, Waypoints,
  Waves, Gamepad2, ArrowRight, Sparkles
} from 'lucide-react';

const games = [
  {
    id: 'function-garden',
    title: 'Function Garden',
    desc: 'Draw math functions and watch them bloom into living art. A creative sandbox where sin(x) becomes a flower garden.',
    icon: <Flower2 className="w-6 h-6" />,
    color: '#10b981',
    tag: 'Creative',
    difficulty: 'Relaxing',
  },
  {
    id: 'circuit-flow',
    title: 'Circuit Flow',
    desc: 'Rotate components to complete circuit paths. A calming pipe-puzzle with resistors, capacitors, and voltage sources.',
    icon: <Zap className="w-6 h-6" />,
    color: '#f59e0b',
    tag: 'Puzzle',
    difficulty: 'Easy',
  },
  {
    id: 'complex-plane',
    title: 'Complex Plane Explorer',
    desc: 'Drop numbers on the complex plane and watch operations transform them. Multiply by i, see everything rotate.',
    icon: <CircleDot className="w-6 h-6" />,
    color: '#06b6d4',
    tag: 'Toy',
    difficulty: 'Relaxing',
  },
  {
    id: 'crossword',
    title: 'Engineering Crossword',
    desc: 'Crossword puzzles with engineering and math terms. Clues drawn from course material.',
    icon: <Grid3x3 className="w-6 h-6" />,
    color: '#8b5cf6',
    tag: 'Word',
    difficulty: 'Medium',
  },
  {
    id: 'math-chess',
    title: 'Math Speed Chess',
    desc: 'Capture squares by solving math problems faster than your opponent. 3-minute matches.',
    icon: <Timer className="w-6 h-6" />,
    color: '#ef4444',
    tag: 'Competitive',
    difficulty: 'Hard',
  },
  {
    id: 'vector-fishing',
    title: 'Vector Field Fishing',
    desc: 'Cast your line into a 2D vector field and see where it carries. Catch saddles, sources, and sinks.',
    icon: <Fish className="w-6 h-6" />,
    color: '#3b82f6',
    tag: 'Calculus',
    difficulty: 'Relaxing',
  },
  {
    id: 'resistance-racer',
    title: 'Resistance Racer',
    desc: 'Top-down racer where speed depends on calculating equivalent resistance. Quick 60-second rounds.',
    icon: <Car className="w-6 h-6" />,
    color: '#ec4899',
    tag: 'Arcade',
    difficulty: 'Fast',
  },
  {
    id: 'kirchhoff-maze',
    title: "Kirchhoff's Maze",
    desc: 'Navigate a glowing particle through circuit-node mazes. Apply KCL/KVL to open gates.',
    icon: <Waypoints className="w-6 h-6" />,
    color: '#f97316',
    tag: 'Logic',
    difficulty: 'Medium',
  },
  {
    id: 'lorenz-flight',
    title: 'Lorenz Attractor Flight',
    desc: 'Fly through 3D strange attractors. Beautiful trails, calming motion. Chaos theory as art.',
    icon: <Waves className="w-6 h-6" />,
    color: '#a855f7',
    tag: 'Visual',
    difficulty: 'Relaxing',
  },
  {
    id: 'balance-beam',
    title: 'Balance Beam',
    desc: 'Stack weights on a beam and adjust supports to keep it balanced. Real statics physics.',
    icon: <Sparkles className="w-6 h-6" />,
    color: '#14b8a6',
    tag: 'Physics',
    difficulty: 'Medium',
  },
];

export default function GamesHub() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="px-3 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 text-xs font-mono text-[#ec4899] inline-flex items-center gap-1.5 mb-4">
            <Gamepad2 className="w-3 h-3" />CHILL GAMES
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Learn Through <span className="text-gradient">Play</span>
          </h1>
          <p className="text-sm text-[#737373] max-w-lg mx-auto">
            Take a break from studying with these engineering and math-inspired games. 
            Relax, have fun, and reinforce what you learned.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/games/${game.id}`}
                className="group block rounded-2xl border border-white/10 bg-[#111118]/80 hover:border-white/20 transition-all p-5 h-full"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${game.color}15`, border: `1px solid ${game.color}30`, color: game.color }}
                  >
                    {game.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold group-hover:text-white transition-colors">
                        {game.title}
                      </h3>
                      <ArrowRight className="w-3.5 h-3.5 text-[#525252] group-hover:text-white group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-[#737373] leading-relaxed mb-3">
                      {game.desc}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-medium"
                        style={{ backgroundColor: `${game.color}15`, color: game.color }}
                      >
                        {game.tag}
                      </span>
                      <span className="text-[9px] text-[#525252]">{game.difficulty}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
