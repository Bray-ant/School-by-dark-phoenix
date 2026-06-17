"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

export function MSection({ id, icon, title, color, children }: { id: string; icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
        <h2 className="text-xl font-bold" style={{ color }}>{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function MCard({ title, children, accent }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl p-5 transition-all hover:shadow-lg" style={{ background: '#0f0f2e', border: `1px solid ${accent ? accent + '25' : 'rgba(0,212,255,0.12)'}` }}>
      {title && <h3 className="text-sm font-semibold mb-3 text-white">{title}</h3>}
      {children}
    </div>
  );
}

export function MFormula({ name, formula, note }: { name: string; formula: string; note?: string }) {
  return (
    <div className="rounded-lg p-4 my-3" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="text-[10px] text-[#00d4ff] uppercase tracking-wider mb-1">{name}</div>
      <div className="text-lg text-white font-semibold font-mono mb-1" dangerouslySetInnerHTML={{ __html: formula }} />
      {note && <div className="text-[11px] text-[#737373]" dangerouslySetInnerHTML={{ __html: note }} />}
    </div>
  );
}

export function WorkedEx({ title, steps, answer }: { title: string; steps: string[]; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#f59e0b]" /><span className="text-xs font-semibold text-[#f59e0b]">Worked Example</span></div>
        <button onClick={() => setShow(!show)} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-all">{show ? 'Hide' : 'Show'}</button>
      </div>
      <p className="text-xs text-[#d4d4d4] mb-2">{title}</p>
      {show && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
        {steps.map((s, i) => <p key={i} className="text-[11px] text-[#a3a3a3] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: `Step ${i + 1}: ${s}` }} />)}
        <div className="mt-2 p-2 rounded bg-[#10b981]/10 border border-[#10b981]/20"><span className="text-[11px] text-[#10b981] font-semibold">Answer: </span><span className="text-[11px] text-[#10b981]" dangerouslySetInnerHTML={{ __html: answer }} /></div>
      </motion.div>}
    </div>
  );
}

export function Caution({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
      <div><span className="text-[10px] font-semibold text-[#ef4444] uppercase tracking-wider">Common Mistake</span><p className="text-[11px] text-[#d4d4d4] mt-1 leading-relaxed">{children}</p></div>
    </div>
  );
}

export function DidYouKnow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
      <div><span className="text-[10px] font-semibold text-[#f59e0b] uppercase tracking-wider">Did You Know?</span><p className="text-[11px] text-[#d4d4d4] mt-1 leading-relaxed">{children}</p></div>
    </div>
  );
}

export function Exercises({ items }: { items: { q: string; level: string }[] }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
      <h4 className="text-xs font-semibold text-[#7c3aed] mb-3">Exercises</h4>
      <ol className="space-y-2">
        {items.map((ex, i) => (
          <li key={i} className="text-[11px] text-[#d4d4d4]">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold mr-2 ${ex.level === 'Easy' ? 'bg-[#10b981]/15 text-[#10b981]' : ex.level === 'Medium' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>{ex.level}</span>
            <span dangerouslySetInnerHTML={{ __html: ex.q }} />
          </li>
        ))}
      </ol>
    </div>
  );
}

interface Q { question: string; options: string[]; correct: number; explanation: string; }
export function MQuiz({ questions }: { questions: Q[] }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const handle = (qi: number, oi: number) => { if (ans[qi] !== undefined) return; setAns(p => ({ ...p, [qi]: oi })); };
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
      <h4 className="text-xs font-semibold text-[#10b981] mb-3">Quick Check</h4>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-[11px] text-[#d4d4d4] mb-2">{qi + 1}. {q.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {q.options.map((opt, oi) => {
                const sel = ans[qi] === oi, done = ans[qi] !== undefined, ok = oi === q.correct;
                let bg = 'rgba(255,255,255,0.04)', b = 'rgba(255,255,255,0.08)';
                if (done && sel && ok) { bg = 'rgba(16,185,129,0.1)'; b = '#10b981'; }
                else if (done && sel && !ok) { bg = 'rgba(239,68,68,0.1)'; b = '#ef4444'; }
                else if (done && ok) { bg = 'rgba(16,185,129,0.08)'; b = 'rgba(16,185,129,0.3)'; }
                else if (sel) { bg = 'rgba(0,212,255,0.08)'; b = '#00d4ff'; }
                return (
                  <button key={oi} onClick={() => handle(qi, oi)} disabled={done} className="text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center gap-2" style={{ background: bg, border: `1px solid ${b}` }}>
                    {done && ok && <Check className="w-3 h-3 text-[#10b981] shrink-0" />}{done && sel && !ok && <X className="w-3 h-3 text-[#ef4444] shrink-0" />}
                    <span className="text-[#a3a3a3]">{opt}</span>
                  </button>
                );
              })}
            </div>
            {ans[qi] !== undefined && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[#737373] mt-1.5 italic">{q.explanation}</motion.p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead><tr className="border-b border-white/10">{headers.map((h, i) => <th key={i} className="text-left py-1.5 px-2 text-[#737373] font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, ri) => <tr key={ri} className="border-b border-white/5">{r.map((c, ci) => <td key={ci} className="py-1.5 px-2 text-[#a3a3a3]" dangerouslySetInnerHTML={{ __html: c }} />)}</tr>)}</tbody>
      </table>
    </div>
  );
}
