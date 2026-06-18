"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Lightbulb, BookOpen, Sparkles } from 'lucide-react';
import Math from '../Math';

// ─── Section Wrapper ──────────────────────────────────────
export function Section({ id, icon, title, color, children }: {
  id: string; icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <h2 className="text-xl font-bold" style={{ color }}>{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────
export function EMCard({ title, children, accent }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl p-5 transition-all hover:shadow-lg" style={{
      background: '#0f0f2e',
      border: `1px solid ${accent ? accent + '25' : 'rgba(0,212,255,0.12)'}`,
    }}>
      {title && <h3 className="text-sm font-semibold mb-3 text-white">{title}</h3>}
      {children}
    </div>
  );
}

// ─── Formula Box ──────────────────────────────────────────
export function Formula({ name, formula, vars }: { name: string; formula: string; vars: string }) {
  return (
    <div className="rounded-lg p-4 my-3 text-sm" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="text-[10px] text-[#00d4ff] uppercase tracking-wider mb-1">{name}</div>
      <div className="text-lg text-white font-semibold mb-1.5">
        <Math tex={formula} />
      </div>
      <div className="text-[11px] text-[#737373]">
        <Math tex={vars} />
      </div>
    </div>
  );
}

// ─── Worked Example ───────────────────────────────────────
export function WorkedExample({ title, steps, answer }: { title: string; steps: string[]; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-xs font-semibold text-[#f59e0b]">Worked Example (Sadiku)</span>
        </div>
        <button onClick={() => setShow(!show)} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-all">
          {show ? 'Hide' : 'Show Solution'}
        </button>
      </div>
      <p className="text-xs text-[#d4d4d4] mb-2">{title}</p>
      {show && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
          {steps.map((s, i) => (
            <p key={i} className="text-[11px] text-[#a3a3a3] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: `Step ${i + 1}: ${s}` }} />
          ))}
          <div className="mt-2 p-2 rounded bg-[#10b981]/10 border border-[#10b981]/20">
            <span className="text-[11px] text-[#10b981] font-semibold">Answer: </span>
            <span className="text-[11px] text-[#10b981]" dangerouslySetInnerHTML={{ __html: answer }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Practice Exercise ────────────────────────────────────
export function PracticeExercise({ title, answer }: { title: string; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#7c3aed]">Practice Exercise</span>
        </div>
        <button onClick={() => setShow(!show)} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-all">
          {show ? 'Hide' : 'Show Answer'}
        </button>
      </div>
      <p className="text-xs text-[#d4d4d4] mb-2">{title}</p>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 rounded bg-[#7c3aed]/10 border border-[#7c3aed]/20">
          <span className="text-[11px] text-[#a3a3a3]" dangerouslySetInnerHTML={{ __html: answer }} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Did You Know ─────────────────────────────────────────
export function DidYouKnow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
      <div>
        <span className="text-[10px] font-semibold text-[#f59e0b] uppercase tracking-wider">Did You Know?</span>
        <p className="text-[11px] text-[#d4d4d4] mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ─── Applications ─────────────────────────────────────────
export function Applications({ items }: { items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-3.5 h-3.5 text-[#00d4ff]" />
        <span className="text-[10px] font-semibold text-[#00d4ff] uppercase tracking-wider">Real-World Applications</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-[#a3a3a3] flex items-start gap-2">
            <span className="text-[#00d4ff] mt-0.5">&#8226;</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Mini Quiz ────────────────────────────────────────────
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function MiniQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const handle = (qi: number, oi: number) => {
    if (answers[qi] !== undefined) return;
    setAnswers(p => ({ ...p, [qi]: oi }));
  };
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
      <h4 className="text-xs font-semibold text-[#7c3aed] mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-[#7c3aed]/15 flex items-center justify-center text-[10px]">Q</span>
        Mini Quiz
      </h4>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-[11px] text-[#d4d4d4] mb-2">{qi + 1}. {q.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const correct = answers[qi] !== undefined;
                const isCorrect = oi === q.correct;
                let bg = 'rgba(255,255,255,0.04)';
                let border = 'rgba(255,255,255,0.08)';
                if (correct && selected && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; }
                else if (correct && selected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; }
                else if (correct && isCorrect) { bg = 'rgba(16,185,129,0.08)'; border = 'rgba(16,185,129,0.3)'; }
                else if (selected) { bg = 'rgba(0,212,255,0.08)'; border = '#00d4ff'; }
                return (
                  <button key={oi} onClick={() => handle(qi, oi)} disabled={answers[qi] !== undefined}
                    className="text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center gap-2" style={{ background: bg, border: `1px solid ${border}` }}>
                    {correct && isCorrect && <Check className="w-3 h-3 text-[#10b981] shrink-0" />}
                    {correct && selected && !isCorrect && <X className="w-3 h-3 text-[#ef4444] shrink-0" />}
                    <span className="text-[#a3a3a3]">{opt}</span>
                  </button>
                );
              })}
            </div>
            {answers[qi] !== undefined && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[#737373] mt-1.5 italic">{q.explanation}</motion.p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Interactive Slider ───────────────────────────────────
export function EMControl({ label, value, unit, min, max, step, color, onChange }: {
  label: string; value: number; unit: string; min: number; max: number; step: number; color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] text-[#737373]">{label}</label>
        <span className="text-[11px] font-mono" style={{ color }}>{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color, background: 'rgba(255,255,255,0.08)' }}
      />
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────
export function EMTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h, i) => <th key={i} className="text-left py-1.5 px-2 text-[#737373] font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5">
              {row.map((cell, ci) => <td key={ci} className="py-1.5 px-2 text-[#a3a3a3]">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
