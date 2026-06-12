import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function TheveninLab({ showInfo: _showInfo }: { showInfo?: boolean }) {
  const [vSource, setVSource] = useState(12);
  const [r1, setR1] = useState(2000);
  const [r2, setR2] = useState(3000);
  const [rLoad, setRLload] = useState(1000);
  const [step, setStep] = useState(0);

  // Original circuit calculations
  const rTotal = r1 + r2;
  const iTotal = vSource / rTotal;
  const vR2 = iTotal * r2;
  
  // Thevenin equivalent
  const vTh = vR2; // Open-circuit voltage across R2 (load terminals)
  const rTh = (r1 * r2) / (r1 + r2); // Parallel of R1 and R2 with source shorted
  const iN = vTh / rTh;

  // With load
  const iLoad = vTh / (rTh + rLoad);
  const vLoad = iLoad * rLoad;
  const pLoad = vLoad * iLoad;
  const pMax = (vTh * vTh) / (4 * rTh);

  const steps = [
    { title: 'Original Circuit', desc: 'Circuit with voltage divider and load terminals' },
    { title: 'Find V_th', desc: 'Remove load, find open-circuit voltage' },
    { title: 'Find R_th', desc: 'Turn off source, find equivalent resistance' },
    { title: 'Thevenin Equivalent', desc: 'V_th in series with R_th' },
    { title: 'Norton Equivalent', desc: 'I_n in parallel with R_n (=R_th)' },
    { title: 'Load Analysis', desc: 'Attach load, verify equivalence' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Thevenin & Norton Laboratory</h2>
          <p className="text-xs text-[#737373]">Replace any linear network with equivalent V_th + R_th or I_n // R_n</p>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'V_source', value: vSource, setter: setVSource, min: 1, max: 30 },
              { label: 'R1', value: r1, setter: setR1, min: 100, max: 10000 },
              { label: 'R2', value: r2, setter: setR2, min: 100, max: 10000 },
              { label: 'R_load', value: rLoad, setter: setRLload, min: 100, max: 10000 },
            ].map(c => (
              <div key={c.label}>
                <label className="text-[10px] text-[#737373] mb-1 block">{c.label}</label>
                <input type="range" min={c.min} max={c.max} value={c.value} onChange={e => c.setter(Number(e.target.value))} className="w-full accent-[#06b6d4]" />
                <span className="text-xs font-mono">{c.label === 'V_source' ? `${c.value} V` : `${(c.value / 1000).toFixed(1)} kΩ`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step navigation */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-white/5 rounded-xl">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-[10px] font-medium transition-all ${step === i ? 'bg-[#06b6d4]/20 text-[#06b6d4]' : 'text-[#737373] hover:text-white'}`}>
              {i + 1}. {s.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Circuit visualization */}
              <div className="glass-panel rounded-xl p-4 flex items-center justify-center">
                <svg viewBox="0 0 400 200" className="w-full">
                  {step === 0 && (
                    <>
                      <line x1="60" y1="100" x2="100" y2="100" stroke="#525252" strokeWidth="2" />
                      <circle cx="120" cy="100" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="120" y="105" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
                      <text x="80" y="95" fill="#f59e0b" fontSize="9">{vSource}V</text>
                      <line x1="140" y1="100" x2="200" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="190" y="92" width="40" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
                      <text x="210" y="88" textAnchor="middle" fill="#3b82f6" fontSize="8">R1</text>
                      <line x1="230" y1="100" x2="300" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="290" y="92" width="40" height="16" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="310" y="88" textAnchor="middle" fill="#8b5cf6" fontSize="8">R2</text>
                      <line x1="330" y1="100" x2="370" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="370" y="105" fill="#ec4899" fontSize="9">A B</text>
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="370" y1="100" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <rect x="330" y="115" width="40" height="14" rx="2" fill="none" stroke="#ec4899" strokeWidth="2" transform="rotate(90 350 122)" />
                      <text x="385" y="125" fill="#ec4899" fontSize="8">R_L</text>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <text x="200" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="11">Step 1: Remove load, find open-circuit voltage</text>
                      <line x1="60" y1="100" x2="100" y2="100" stroke="#525252" strokeWidth="2" />
                      <circle cx="120" cy="100" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="120" y="105" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
                      <line x1="140" y1="100" x2="200" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="190" y="92" width="40" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
                      <text x="210" y="88" textAnchor="middle" fill="#3b82f6" fontSize="8">R1</text>
                      <line x1="230" y1="100" x2="300" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="290" y="92" width="40" height="16" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="310" y="88" textAnchor="middle" fill="#8b5cf6" fontSize="8">R2</text>
                      <line x1="330" y1="100" x2="370" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="370" y="95" fill="#ec4899" fontSize="10" fontWeight="bold">OPEN</text>
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="370" y1="100" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <text x="200" y="180" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="bold">V_th = {vTh.toFixed(3)} V</text>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <text x="200" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="11">Step 2: Short source, find R_th</text>
                      <line x1="60" y1="100" x2="200" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="130" y="95" fill="#f59e0b" fontSize="9">SHORT</text>
                      <rect x="190" y="92" width="40" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="2" />
                      <text x="210" y="88" textAnchor="middle" fill="#3b82f6" fontSize="8">R1</text>
                      <line x1="230" y1="100" x2="300" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="290" y="92" width="40" height="16" rx="2" fill="none" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="310" y="88" textAnchor="middle" fill="#8b5cf6" fontSize="8">R2</text>
                      <line x1="330" y1="100" x2="370" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="370" y="95" fill="#ec4899" fontSize="10" fontWeight="bold">A B</text>
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="370" y1="100" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <text x="200" y="180" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="bold">R_th = R1 || R2 = {(rTh).toFixed(1)} Ω</text>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <text x="200" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="11">Thevenin Equivalent Circuit</text>
                      <line x1="60" y1="100" x2="120" y2="100" stroke="#525252" strokeWidth="2" />
                      <circle cx="140" cy="100" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="140" y="105" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
                      <text x="100" y="95" fill="#f59e0b" fontSize="9">{vTh.toFixed(2)}V</text>
                      <line x1="160" y1="100" x2="250" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="240" y="92" width="40" height="16" rx="2" fill="none" stroke="#06b6d4" strokeWidth="2" />
                      <text x="260" y="88" textAnchor="middle" fill="#06b6d4" fontSize="8">R_th</text>
                      <line x1="280" y1="100" x2="340" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="350" y="105" fill="#ec4899" fontSize="10" fontWeight="bold">A B</text>
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="340" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="340" y1="100" x2="340" y2="160" stroke="#525252" strokeWidth="2" />
                      <text x="200" y="180" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">V_th = {vTh.toFixed(3)} V, R_th = {(rTh).toFixed(1)} Ω</text>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <text x="200" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="11">Norton Equivalent Circuit</text>
                      <circle cx="100" cy="100" r="18" fill="none" stroke="#10b981" strokeWidth="2" />
                      <text x="100" y="104" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">I</text>
                      <text x="75" y="95" fill="#10b981" fontSize="9">{(iN * 1000).toFixed(2)}mA</text>
                      <line x1="118" y1="100" x2="250" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="240" y="92" width="40" height="16" rx="2" fill="none" stroke="#06b6d4" strokeWidth="2" />
                      <text x="260" y="88" textAnchor="middle" fill="#06b6d4" fontSize="8">R_n</text>
                      <line x1="280" y1="100" x2="340" y2="100" stroke="#525252" strokeWidth="2" />
                      <text x="350" y="105" fill="#ec4899" fontSize="10" fontWeight="bold">A B</text>
                      <line x1="60" y1="100" x2="82" y2="100" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="340" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="340" y1="100" x2="340" y2="160" stroke="#525252" strokeWidth="2" />
                      <text x="200" y="180" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">I_n = {(iN * 1000).toFixed(3)} mA, R_n = {(rTh).toFixed(1)} Ω</text>
                    </>
                  )}
                  {step === 5 && (
                    <>
                      <text x="200" y="30" textAnchor="middle" fill="#a3a3a3" fontSize="11">Load Analysis & Verification</text>
                      <line x1="60" y1="100" x2="120" y2="100" stroke="#525252" strokeWidth="2" />
                      <circle cx="140" cy="100" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="140" y="105" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">+</text>
                      <line x1="160" y1="100" x2="230" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="220" y="92" width="40" height="16" rx="2" fill="none" stroke="#06b6d4" strokeWidth="2" />
                      <text x="240" y="88" textAnchor="middle" fill="#06b6d4" fontSize="8">R_th</text>
                      <line x1="260" y1="100" x2="320" y2="100" stroke="#525252" strokeWidth="2" />
                      <rect x="310" y="92" width="40" height="16" rx="2" fill="none" stroke="#ec4899" strokeWidth="2" />
                      <text x="330" y="88" textAnchor="middle" fill="#ec4899" fontSize="8">R_L</text>
                      <line x1="350" y1="100" x2="370" y2="100" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="100" x2="60" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="60" y1="160" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <line x1="370" y1="100" x2="370" y2="160" stroke="#525252" strokeWidth="2" />
                      <text x="200" y="180" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">V_L = {vLoad.toFixed(3)}V, I_L = {(iLoad * 1000).toFixed(3)}mA, P_L = {(pLoad * 1000).toFixed(3)}mW</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Analysis panel */}
              <div className="glass-panel rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#06b6d4]" />
                  {steps[step].title}
                </h3>
                <p className="text-xs text-[#737373]">{steps[step].desc}</p>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#737373]">V_th (Thevenin voltage)</span>
                    <span className="font-mono text-[#f59e0b]">{vTh.toFixed(4)} V</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#737373]">R_th (Thevenin resistance)</span>
                    <span className="font-mono text-[#06b6d4]">{(rTh).toFixed(1)} Ω</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#737373]">I_n (Norton current)</span>
                    <span className="font-mono text-[#10b981]">{(iN * 1000).toFixed(4)} mA</span>
                  </div>
                  <div className="border-t border-white/5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#737373]">Max power transfer</span>
                      <span className="font-mono text-[#ec4899]">R_L = {rTh.toFixed(1)} Ω</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-[#737373]">P_max</span>
                      <span className="font-mono text-[#ec4899]">{(pMax * 1000).toFixed(4)} mW</span>
                    </div>
                  </div>
                </div>

                {/* Conversion */}
                <div className="p-3 rounded-lg bg-white/5 font-mono text-[10px] text-[#d4d4d4] leading-relaxed">
                  V_th = {vTh.toFixed(3)} V<br />
                  R_th = R1 || R2 = {r1}×{r2}/({r1}+{r2}) = {rTh.toFixed(1)} Ω<br />
                  I_n = V_th / R_th = {(iN * 1000).toFixed(3)} mA
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
