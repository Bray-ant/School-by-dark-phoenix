"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { exercises, topicColors } from '../data/mathExercisesData';
import { ChevronLeft, Home, Eye, EyeOff, Lightbulb, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExerciseDetail() {
  const params = useParams<{ exerciseId: string }>();
  const exerciseId = params?.exerciseId;
  const exercise = exercises.find(e => e.id === exerciseId);
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!exercise) return <div className="py-20 text-center text-[#737373]">Exercise not found</div>;

  const revealStep = (i: number) => setRevealedSteps(prev => new Set([...prev, i]));
  const nextStep = exercise.solutionSteps.findIndex((_, i) => !revealedSteps.has(i));

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-xs text-[#737373]">
          <Link href="/" className="hover:text-white flex items-center gap-1"><Home className="w-3 h-3" /></Link>
          <span>/</span>
          <Link href="/exercises" className="hover:text-white">Exercises</Link>
          <span>/</span>
          <span className="text-[#f6f6f6]">{exercise.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: `${topicColors[exercise.topic]}15`, color: topicColors[exercise.topic] }}>{exercise.topic}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#737373]">L{exercise.difficulty}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-4">{exercise.title}</h1>

          <div className="glass-panel rounded-2xl p-6 mb-6 border-l-4" style={{ borderLeftColor: topicColors[exercise.topic] }}>
            <p className="text-sm text-[#f6f6f6] leading-relaxed">{exercise.problemStatement}</p>
          </div>

          <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-xs text-[#f59e0b] mb-2">
            <Lightbulb className="w-3.5 h-3.5" />{showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
          {showHints && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 space-y-2">
              {exercise.hints.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                  <div className="text-[10px] font-mono text-[#f59e0b] mb-1">HINT {i + 1}</div>
                  <p className="text-xs text-[#d4d4d4]">{h}</p>
                </div>
              ))}
            </motion.div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#10b981]" />Solution</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737373] font-mono">{revealedSteps.size}/{exercise.solutionSteps.length}</span>
                {nextStep >= 0 && <button onClick={() => revealStep(nextStep)} className="px-3 py-1.5 bg-[#ec4899] text-white text-xs rounded-lg">Reveal Next</button>}
                <button onClick={() => setShowAnswer(!showAnswer)} className="px-3 py-1.5 bg-white/5 text-xs rounded-lg border border-white/10">{showAnswer ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}</button>
              </div>
            </div>
            <div className="space-y-2">
              {exercise.solutionSteps.map((step, i) => {
                const revealed = revealedSteps.has(i) || showAnswer;
                return (
                  <div key={i}>
                    {!revealed ? (
                      <button onClick={() => revealStep(i)} disabled={i !== nextStep}
                        className={`w-full p-3 rounded-xl border text-left text-xs ${i === nextStep ? 'border-[#ec4899]/30 bg-[#ec4899]/5 cursor-pointer' : 'border-white/5 opacity-50 cursor-not-allowed'}`}>
                        {step.title} {i === nextStep && <span className="ml-2 text-[10px] font-mono text-[#ec4899]">CLICK TO REVEAL</span>}
                      </button>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl border border-white/10 bg-[#111111]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-md bg-[#10b981]/15 flex items-center justify-center text-[10px] font-bold text-[#10b981]">{i + 1}</div>
                          <span className="text-sm font-semibold">{step.title}</span>
                        </div>
                        <p className="text-xs text-[#d4d4d4] pl-8" dangerouslySetInnerHTML={{ __html: step.content }} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {(revealedSteps.size === exercise.solutionSteps.length || showAnswer) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl border border-[#10b981]/20 bg-[#10b981]/5">
                <div className="text-[10px] font-mono text-[#10b981] mb-1">ANSWER</div>
                <div className="text-sm font-medium font-mono">{exercise.finalAnswer}</div>
              </div>
              <div className="p-4 rounded-2xl border border-[#3b82f6]/20 bg-[#3b82f6]/5">
                <div className="text-[10px] font-mono text-[#3b82f6] mb-1">VERIFICATION</div>
                <div className="text-xs text-[#d4d4d4]">{exercise.verification}</div>
              </div>
            </motion.div>
          )}

          {exercise.commonMistakes.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-[#f59e0b]" /><span className="text-sm font-semibold">Common Mistakes</span></div>
              {exercise.commonMistakes.map((m, i) => <p key={i} className="text-xs text-[#737373]">• {m}</p>)}
            </div>
          )}

          <Link href="/exercises" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Exercises
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
