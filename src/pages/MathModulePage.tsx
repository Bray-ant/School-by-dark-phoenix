import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FunctionSquare, Grid3X3, CircleDot, Sigma, Infinity as InfiniteIcon, Divide, BookOpen, X } from 'lucide-react';
import LazySection from '../components/math/LazySection';
import Module1Multivariable from '../components/math/Module1Multivariable';
import Module2LinearAlgebra from '../components/math/Module2LinearAlgebra';
import Module3ComplexFunctions from '../components/math/Module3ComplexFunctions';
import Module4Taylor from '../components/math/Module4Taylor';
import Module5PowerSeries from '../components/math/Module5PowerSeries';
import Module6Integration from '../components/math/Module6Integration';

const NAV_ITEMS = [
  { id: 'multivariable', label: 'Multivariable', color: '#f97316', icon: <FunctionSquare className="w-3.5 h-3.5" /> },
  { id: 'linear-algebra', label: 'Linear Algebra', color: '#8b5cf6', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
  { id: 'complex', label: 'Complex', color: '#06b6d4', icon: <CircleDot className="w-3.5 h-3.5" /> },
  { id: 'taylor', label: 'Taylor', color: '#f59e0b', icon: <Sigma className="w-3.5 h-3.5" /> },
  { id: 'power-series', label: 'Power Series', color: '#ec4899', icon: <InfiniteIcon className="w-3.5 h-3.5" /> },
  { id: 'integration', label: 'Integration', color: '#10b981', icon: <Divide className="w-3.5 h-3.5" /> },
];

export default function MathModulePage() {
  const [activeSection, setActiveSection] = useState('multivariable');
  const [showFormulaBar, setShowFormulaBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const main = mainRef.current;
      if (!main) return;
      const sh = main.scrollHeight - main.clientHeight;
      setProgress(sh > 0 ? Math.min(100, (main.scrollTop / sh) * 100) : 0);
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_ITEMS[i].id);
        if (el && el.getBoundingClientRect().top <= 200) { setActiveSection(NAV_ITEMS[i].id); break; }
      }
    };
    const main = mainRef.current;
    if (main) main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" style={{ background: '#050510' }}>
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-4 py-3 flex items-center gap-3" style={{ background: '#0a0a1a' }}>
        <Link to="/" className="text-[#737373] hover:text-white transition-colors"><span className="text-sm">&#8592;</span></Link>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sigma className="w-5 h-5 text-[#f59e0b]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Advanced Mathematics</h1>
          <p className="text-[10px] text-[#737373]">6 Modules • Interactive • Worked Examples</p>
        </div>
        <button onClick={() => setShowFormulaBar(!showFormulaBar)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all ${showFormulaBar ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-white/5 text-[#737373] hover:text-white'}`}>
          <BookOpen className="w-3 h-3" /><span className="hidden sm:inline">Formulas</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg, #f97316, #8b5cf6, #06b6d4, #f59e0b, #ec4899, #10b981)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      {/* Sticky Nav */}
      <div className="shrink-0 border-b border-white/5 px-2 py-1.5 overflow-x-auto" style={{ background: '#0a0a1a' }}>
        <div className="flex gap-1 min-w-max">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${activeSection === item.id ? 'text-white' : 'text-[#525252] hover:text-[#a3a3a3]'}`}
              style={activeSection === item.id ? { backgroundColor: `${item.color}15`, color: item.color } : {}}>
              {item.icon}{item.label}
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
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(236,72,153,0.05))', border: '1px solid rgba(245,158,11,0.1)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Sigma className="w-8 h-8 text-[#f59e0b]" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Advanced Mathematics
              </h1>
              <p className="text-xs text-[#737373] max-w-lg mx-auto">Complete interactive module covering multivariable calculus, linear algebra, complex functions, Taylor series, power series, and engineering integration.</p>
            </motion.div>

            <LazySection><Module1Multivariable /></LazySection>
            <LazySection><Module2LinearAlgebra /></LazySection>
            <LazySection><Module3ComplexFunctions /></LazySection>
            <LazySection><Module4Taylor /></LazySection>
            <LazySection><Module5PowerSeries /></LazySection>
            <LazySection><Module6Integration /></LazySection>

            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Sigma className="w-6 h-6 text-[#10b981]" />
              </div>
              <h3 className="text-sm font-semibold text-[#10b981] mb-1">Module Complete!</h3>
              <p className="text-[10px] text-[#737373]">All 6 modules covered.</p>
            </div>
          </div>
        </div>

        {/* Formula sidebar placeholder */}
        {showFormulaBar && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="w-60 shrink-0 border-l border-white/5 overflow-y-auto hidden lg:block" style={{ background: '#0a0a1a' }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-[#f59e0b]" />Formula Quick Ref</h3>
                <button onClick={() => setShowFormulaBar(false)} className="text-[#525252] hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-2 text-[10px]">
                {[
                  { mod: 'M1', name: 'Partial Derivative', eq: '&#8706;f/&#8706;x&#8331;' },
                  { mod: 'M1', name: 'Gradient', eq: '&#8711;f = (f&#8331;,...,f&#8345;)' },
                  { mod: 'M1', name: 'Directional Deriv', eq: 'D&#8341;f = &#8711;f&#183;v' },
                  { mod: 'M2', name: 'Eigenvalue', eq: 'Av = &#955;v' },
                  { mod: 'M2', name: 'Hessian Test', eq: '&#955;&#8331; &gt; 0 &#8594; min' },
                  { mod: 'M3', name: 'Euler', eq: 'e&#7496;&#7497; = cos&#952;+isin&#952;' },
                  { mod: 'M3', name: 'Cauchy-Riemann', eq: 'u&#8331;=v&#129;, u&#129;=&#8722;v&#8331;' },
                  { mod: 'M4', name: 'Taylor', eq: 'T&#8345;(x)=&#8721;f&#7517;&#7518;(a)/k!(x&#8722;a)&#7517;' },
                  { mod: 'M5', name: 'Geometric', eq: '&#8721;x&#8345;=1/(1&#8722;x)' },
                  { mod: 'M6', name: 'Parts', eq: '&#8741;udv=uv&#8722;&#8741;vdu' },
                  { mod: 'M6', name: 'Simpson', eq: '(b&#8722;a)/6&#183;[f(a)+4f(m)+f(b)]' },
                ].map((f, i) => (
                  <div key={i} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-[9px] text-[#525252]">{f.mod}</div>
                    <div className="text-[10px] text-[#a3a3a3]">{f.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: '#f59e0b' }} dangerouslySetInnerHTML={{ __html: f.eq }} />
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
