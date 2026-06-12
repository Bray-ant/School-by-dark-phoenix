import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Compass, Magnet, Waves,
  BookOpen, X,
} from 'lucide-react';
import LazySection from '../components/em/LazySection';
import Part1VectorAnalysis from '../components/em/Part1VectorAnalysis';
import Part2Electrostatics from '../components/em/Part2Electrostatics';
import Part3Magnetostatics from '../components/em/Part3Magnetostatics';
import Part4Waves from '../components/em/Part4Waves';

const NAV_ITEMS = [
  { id: 'vector-analysis', label: 'Vectors', color: '#737373', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'electrostatics', label: 'Electrostatics', color: '#ef4444', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'magnetostatics', label: 'Magnetostatics', color: '#10b981', icon: <Magnet className="w-3.5 h-3.5" /> },
  { id: 'waves', label: 'Waves', color: '#06b6d4', icon: <Waves className="w-3.5 h-3.5" /> },
];

const ALL_FORMULAS = [
  { name: "Coulomb's Law", eq: "F = Q&#8321;Q&#8322;/4&#960;&#949;&#8320;R&#178;", section: "Ch.4" },
  { name: "E = &#8722;&#8711;V", eq: "E = &#8722;&#8711;V", section: "Ch.4" },
  { name: "Gauss's Law", eq: "&#8750;D&#183;dS = Q&#8345;", section: "Ch.4" },
  { name: "Energy Density", eq: "w&#8341; = &#189;&#949;&#8320;E&#178;", section: "Ch.4" },
  { name: "J = &#963;E", eq: "J = &#963;E (Ohm's pt)", section: "Ch.5" },
  { name: "&#949;&#8341; = 1 + &#967;&#8341;", eq: "&#949;&#8341; = &#949;/&#949;&#8320;", section: "Ch.5" },
  { name: "Laplace's Eq.", eq: "&#8711;&#178;V = 0", section: "Ch.6" },
  { name: "C = &#949;A/d", eq: "C = &#949;A/d", section: "Ch.6" },
  { name: "Biot-Savart", eq: "dH = Idl&#215;R/4&#960;R&#179;", section: "Ch.7" },
  { name: "H = I/2&#960;&#961;", eq: "H = I/2&#960;&#961; (wire)", section: "Ch.7" },
  { name: "Ampere's Law", eq: "&#8750;H&#183;dl = I&#8345;", section: "Ch.7" },
  { name: "Lorentz Force", eq: "F = Q(E+u&#215;B)", section: "Ch.8" },
  { name: "B = &#956;&#8320;(H+M)", eq: "B = &#956;&#8320;&#956;&#8341;H", section: "Ch.8" },
  { name: "L = N&#934;/I", eq: "L = &#955;/I", section: "Ch.8" },
  { name: "Faraday's Law", eq: "EMF = &#8722;d&#934;/dt", section: "Ch.9" },
  { name: "Disp. Current", eq: "J&#8342; = &#8706;D/&#8706;t", section: "Ch.9" },
  { name: "c = 1/&#8730;(&#956;&#8320;&#949;&#8320;)", eq: "c = 2.998&#215;10&#8310; m/s", section: "Ch.9" },
  { name: "Wave Eqn", eq: "&#8711;&#178;E = (1/c&#178;)&#8706;&#178;E/&#8706;t&#178;", section: "Ch.10" },
  { name: "Skin Depth", eq: "&#948; = 1/&#8730;(&#960;f&#956;&#963;)", section: "Ch.10" },
  { name: "Poynting", eq: "P = E &#215; H", section: "Ch.10" },
  { name: "&#915; = (&#951;&#8322;&#8722;&#951;&#8321;)/(&#951;&#8322;+&#951;&#8321;)", eq: "&#915; refl. coeff.", section: "Ch.10" },
  { name: "&#951;&#8320; = 120&#960; &#937;", eq: "&#951;&#8320; = 376.6 &#937;", section: "Ch.10" },
];

export default function EMChapterPage() {
  const [activeSection, setActiveSection] = useState('vector-analysis');
  const [showFormulaBar, setShowFormulaBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const main = mainRef.current;
      if (!main) return;
      const scrollTop = main.scrollTop;
      const scrollHeight = main.scrollHeight - main.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_ITEMS[i].id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };
    const main = mainRef.current;
    if (main) main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" style={{ background: '#050510' }}>
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <Link to="/" className="text-[#737373] hover:text-white transition-colors">
          <span className="text-sm">&#8592;</span>
        </Link>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <Zap className="w-5 h-5 text-[#00d4ff]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Electromagnetism &amp; Magnetism</h1>
          <p className="text-[10px] text-[#737373]">Based on Sadiku, Elements of Electromagnetics (4th Ed.)</p>
        </div>
        <button onClick={() => setShowFormulaBar(!showFormulaBar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all ${showFormulaBar ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-white/5 text-[#737373] hover:text-white'}`}>
          <BookOpen className="w-3 h-3" />
          <span className="hidden sm:inline">Formulas</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg, #737373, #ef4444, #10b981, #06b6d4)' }}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      {/* Sticky Nav */}
      <div className="shrink-0 border-b border-white/5 px-2 py-1.5 overflow-x-auto" style={{ background: '#0a0a1a' }}>
        <div className="flex gap-1 min-w-max">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${activeSection === item.id ? 'text-white' : 'text-[#525252] hover:text-[#a3a3a3]'}`}
              style={activeSection === item.id ? { backgroundColor: `${item.color}15`, color: item.color } : {}}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div ref={mainRef} className="flex-1 overflow-y-auto px-4 py-6" style={{ background: '#050510' }}>
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 py-8 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))', border: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Zap className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Electromagnetism &amp; Magnetism
              </h1>
              <p className="text-xs text-[#737373] max-w-lg mx-auto mb-1">Complete interactive module following Sadiku&apos;s textbook structure</p>
              <div className="flex items-center justify-center gap-3 text-[9px] text-[#525252]">
                <span><span className="text-[#737373]">Part 1:</span> Vector Analysis</span>
                <span><span className="text-[#737373]">Part 2:</span> Electrostatics (Ch.4-6)</span>
                <span><span className="text-[#737373]">Part 3:</span> Magnetostatics (Ch.7-8)</span>
                <span><span className="text-[#737373]">Part 4:</span> Waves (Ch.9-10)</span>
              </div>
            </motion.div>

            <LazySection><Part1VectorAnalysis /></LazySection>
            <LazySection><Part2Electrostatics /></LazySection>
            <LazySection><Part3Magnetostatics /></LazySection>
            <LazySection><Part4Waves /></LazySection>

            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Zap className="w-6 h-6 text-[#10b981]" />
              </div>
              <h3 className="text-sm font-semibold text-[#10b981] mb-1">Module Complete!</h3>
              <p className="text-[10px] text-[#737373]">All 4 parts, 10 chapters covered.</p>
            </div>
          </div>
        </div>

        {/* Formula sidebar */}
        {showFormulaBar && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="w-64 shrink-0 border-l border-white/5 overflow-y-auto hidden lg:block" style={{ background: '#0a0a1a' }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#f59e0b]" />
                  Formula Reference
                </h3>
                <button onClick={() => setShowFormulaBar(false)} className="text-[#525252] hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-1.5">
                {ALL_FORMULAS.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onClick={() => {
                      const sectionMap: Record<string, string> = { 'Ch.4': 'electrostatics', 'Ch.5': 'electrostatics', 'Ch.6': 'electrostatics', 'Ch.7': 'magnetostatics', 'Ch.8': 'magnetostatics', 'Ch.9': 'waves', 'Ch.10': 'waves' };
                      scrollTo(sectionMap[f.section] || 'electrostatics');
                    }}>
                    <div className="text-[9px] text-[#525252]">{f.section}</div>
                    <div className="text-[10px] text-[#d4d4d4] font-mono" style={{ color: '#00d4ff' }} dangerouslySetInnerHTML={{ __html: f.eq }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
