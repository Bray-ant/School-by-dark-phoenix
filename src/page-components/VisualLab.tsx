"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, ChevronLeft, ChevronRight, Zap, GitBranch,
  CircleDot, Grid3x3, Sigma, Layers, Activity,
  Waves, Info,
} from 'lucide-react';
import KvlLab from '../components/labs/KvlLab';
import KclLab from '../components/labs/KclLab';
import MeshLab from '../components/labs/MeshLab';
import NodalLab from '../components/labs/NodalLab';
import TheveninLab from '../components/labs/TheveninLab';
import SuperpositionLab from '../components/labs/SuperpositionLab';
import TransientLab from '../components/labs/TransientLab';
import AcAnalysisLab from '../components/labs/AcAnalysisLab';
import CircuitSandbox from '../components/labs/CircuitSandbox';

interface LabModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  component: React.ComponentType<any>;
}

const labs: LabModule[] = [
  {
    id: 'sandbox',
    title: 'Circuit Sandbox',
    description: 'Build, simulate, and analyze any DC circuit with real-time visual feedback.',
    icon: <FlaskConical className="w-5 h-5" />,
    color: '#3b82f6',
    component: CircuitSandbox,
  },
  {
    id: 'kvl',
    title: 'KVL Laboratory',
    description: 'Traverse circuit loops and watch voltage drops accumulate in real time.',
    icon: <Zap className="w-5 h-5" />,
    color: '#f59e0b',
    component: KvlLab,
  },
  {
    id: 'kcl',
    title: 'KCL Laboratory',
    description: 'Click any node to see currents entering and leaving with animated vectors.',
    icon: <GitBranch className="w-5 h-5" />,
    color: '#10b981',
    component: KclLab,
  },
  {
    id: 'mesh',
    title: 'Mesh Analysis Lab',
    description: 'Automatic mesh detection with live matrix equations and solved currents.',
    icon: <Grid3x3 className="w-5 h-5" />,
    color: '#8b5cf6',
    component: MeshLab,
  },
  {
    id: 'nodal',
    title: 'Nodal Analysis Lab',
    description: 'Node detection, conductance matrix, and step-by-step equation solving.',
    icon: <CircleDot className="w-5 h-5" />,
    color: '#ec4899',
    component: NodalLab,
  },
  {
    id: 'thevenin',
    title: 'Thevenin & Norton Lab',
    description: 'Find equivalent circuits by calculating V-th, R-th, I-n step by step.',
    icon: <Layers className="w-5 h-5" />,
    color: '#06b6d4',
    component: TheveninLab,
  },
  {
    id: 'superposition',
    title: 'Superposition Lab',
    description: 'Enable sources one at a time and watch contributions combine visually.',
    icon: <Sigma className="w-5 h-5" />,
    color: '#14b8a6',
    component: SuperpositionLab,
  },
  {
    id: 'transient',
    title: 'Transient Response Lab',
    description: 'RC, RL, and RLC circuits with animated charging curves and time constants.',
    icon: <Activity className="w-5 h-5" />,
    color: '#ef4444',
    component: TransientLab,
  },
  {
    id: 'ac',
    title: 'AC Analysis Lab',
    description: 'Phasors, impedance, resonance, and frequency response visualization.',
    icon: <Waves className="w-5 h-5" />,
    color: '#f97316',
    component: AcAnalysisLab,
  },
];

export default function VisualLab() {
  const [activeLab, setActiveLab] = useState<string>('sandbox');
  const [showInfo, setShowInfo] = useState(true);

  const currentLab = labs.find(l => l.id === activeLab)!;
  const ActiveComponent = currentLab.component;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-[#737373] hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <FlaskConical className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-sm font-semibold">Visual Lab</h2>
          </div>
          <p className="text-[10px] text-[#737373]">{labs.length} interactive laboratories</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {labs.map(lab => (
            <button
              key={lab.id}
              onClick={() => { setActiveLab(lab.id); setShowInfo(true); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all ${
                activeLab === lab.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#737373] hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${lab.color}15`, color: lab.color }}
              >
                {lab.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[11px]">{lab.title}</div>
                <div className="text-[9px] text-[#525252] truncate leading-tight">{lab.description}</div>
              </div>
              {activeLab === lab.id && <ChevronRight className="w-3 h-3 shrink-0" style={{ color: lab.color }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lab Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Lab Header */}
        <div className="border-b border-white/5 px-4 py-3 flex items-center gap-3 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${currentLab.color}15`, color: currentLab.color }}
          >
            {currentLab.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold">{currentLab.title}</h1>
            <p className="text-[10px] text-[#737373] truncate">{currentLab.description}</p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg bg-white/5 text-[#737373] hover:text-white transition-colors"
            title="Toggle info panel"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Lab Content */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ActiveComponent showInfo={showInfo} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
