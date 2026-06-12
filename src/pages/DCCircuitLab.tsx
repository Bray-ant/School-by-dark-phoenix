import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical, ChevronLeft, Zap, Palette, Timer, GitFork,
  BookOpen, ArrowRight,
} from 'lucide-react';
import OhmsLawCalculator from '../components/circuit-simulators/OhmsLawCalculator';
import ResistorColorCode from '../components/circuit-simulators/ResistorColorCode';
import RCTransient from '../components/circuit-simulators/RCTransient';
import VoltageDividerCalc from '../components/circuit-simulators/VoltageDividerCalc';

const labs = [
  { id: 'ohms', title: "Ohm's Law", icon: <Zap className="w-4 h-4" />, description: 'Interactive V=IR calculator with live circuit visualization', component: <OhmsLawCalculator />, color: '#f59e0b' },
  { id: 'color', title: 'Resistor Color Code', icon: <Palette className="w-4 h-4" />, description: 'Decode resistor values from color bands', component: <ResistorColorCode />, color: '#10b981' },
  { id: 'rc', title: 'RC Transient Response', icon: <Timer className="w-4 h-4" />, description: 'Visualize capacitor charging and discharging curves', component: <RCTransient />, color: '#ec4899' },
  { id: 'divider', title: 'Voltage Divider', icon: <GitFork className="w-4 h-4" />, description: 'Calculate voltage divider outputs interactively', component: <VoltageDividerCalc />, color: '#3b82f6' },
];

export default function DCCircuitLab() {
  const [activeLab, setActiveLab] = useState('ohms');
  const currentLab = labs.find(l => l.id === activeLab);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#737373]">
            <Link to="/" className="hover:text-white flex items-center gap-1"><ChevronLeft className="w-3 h-3" />Home</Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">DC Circuit Lab</h1>
              <p className="text-sm text-[#737373]">Interactive simulators for every concept in the book</p>
            </div>
          </div>
        </motion.div>

        {/* Lab Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {labs.map((lab, i) => (
            <motion.button
              key={lab.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveLab(lab.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeLab === lab.id
                  ? 'border-white/20 bg-white/5'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${lab.color}15` }}>
                <span style={{ color: lab.color }}>{lab.icon}</span>
              </div>
              <div className="text-xs font-medium">{lab.title}</div>
              <div className="text-[10px] text-[#737373] mt-1">{lab.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Active Lab */}
        <motion.div key={activeLab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {currentLab?.component}
        </motion.div>

        {/* CTA to chapters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#10b981]" />
            <div>
              <div className="text-sm font-medium">Ready to dive deeper?</div>
              <div className="text-xs text-[#737373]">Explore the full 10-chapter DC Circuit Analysis course</div>
            </div>
          </div>
          <Link to="/dc-circuit/dc-fundamentals" className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium rounded-xl transition-colors">
            Start Learning <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
