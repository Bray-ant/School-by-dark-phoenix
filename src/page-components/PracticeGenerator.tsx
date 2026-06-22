"use client";
import { useState, useEffect, useRef } from 'react';
import {
  generateExercise, updateMasteryProgress, topics, topicColors,
  difficultyLabels, difficultyColors, type Topic, type DifficultyLevel, type GeneratedExercise,
} from '../data/generatorEngine';
import { Dices, ChevronRight, Lightbulb, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown, CheckCircle, Clock, Target, Zap, BookOpen, Flame, Home, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { withClientOnly } from '../components/withClientOnly';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '@/providers/trpc';

function PracticeGenerator() {
  const { isAuthenticated } = useAuth();
  const getInitialTopic = (): Topic => {
    const saved = sessionStorage.getItem('practiceTopic') as Topic | null;
    if (saved) { sessionStorage.removeItem('practiceTopic'); return saved; }
    return 'Linear Equations';
  };
  const [topic, setTopic] = useState<Topic>(getInitialTopic);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null);
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());
  const [showHints, setShowHints] = useState(false);
  const [activeHint, setActiveHint] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [exerciseSource, setExerciseSource] = useState<'local' | 'ai'>('local');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const aiGenerateMutation = trpc.smart.generatePractice.useMutation();

  const resetExerciseState = () => {
    setRevealedSteps(new Set()); setShowHints(false);
    setActiveHint(0); setShowAnswer(false); setElapsed(0);
  };

  const gen = (t: Topic, d: DifficultyLevel) => {
    const ex = generateExercise(t, d);
    setExercise(ex); setExerciseSource('local'); resetExerciseState();
  };

  const genAi = async (t: Topic, d: DifficultyLevel) => {
    setIsAiGenerating(true);
    resetExerciseState();
    try {
      const result = await aiGenerateMutation.mutateAsync({ topic: t, difficulty: d });
      if (result.exercise && result.source === 'ai') {
        setExercise({
          id: `ai-${Date.now()}`,
          topic: t,
          difficulty: d,
          problemText: result.exercise.problemText,
          answer: result.exercise.answer,
          solutionSteps: result.exercise.solutionSteps,
          hints: result.exercise.hints,
          estimatedTime: result.exercise.estimatedTime,
          verification: result.exercise.verification,
          seed: 0,
        });
        setExerciseSource('ai');
        return;
      }
    } catch {
      // AI failed — fall through to local
    } finally {
      setIsAiGenerating(false);
    }
    // Fallback to local
    gen(t, d);
  };

  useEffect(() => {
    gen(topic, difficulty);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const revealStep = (i: number) => setRevealedSteps(prev => new Set([...prev, i]));
  const nextStep = exercise?.solutionSteps.findIndex((_, i) => !revealedSteps.has(i));

  const handleComplete = () => {
    if (!exercise) return;
    setCompleted(c => c + 1); setSessionStreak(s => s + 1);
    updateMasteryProgress(exercise.topic, true, elapsed * 1000);
  };

  const handleSimilar = () => { if (exercise) gen(exercise.topic, exercise.difficulty); };
  const handleHarder = () => { if (!exercise) return; const d = Math.min(7, exercise.difficulty + 1) as DifficultyLevel; setDifficulty(d); gen(exercise.topic, d); };
  const handleEasier = () => { if (!exercise) return; const d = Math.max(1, exercise.difficulty - 1) as DifficultyLevel; setDifficulty(d); gen(exercise.topic, d); };
  const handleRandom = () => { const t = topics[Math.floor(Math.random() * topics.length)]; const d = (Math.floor(Math.random() * 5) + 1) as DifficultyLevel; setTopic(t); setDifficulty(d); gen(t, d); setSessionStreak(0); };
  const handleNewTopic = (t: Topic) => { setTopic(t); gen(t, difficulty); setSessionStreak(0); };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-xs">
          <a href="/" className="text-[#737373] hover:text-white flex items-center gap-1"><Home className="w-3 h-3" /></a>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <span className="text-[#f6f6f6]">Practice Generator</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center">
              <Dices className="w-6 h-6 text-[#ec4899]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dark Phoenix Generator</h1>
              <p className="text-sm text-[#737373]">Infinite mathematics practice — no two exercises are ever the same</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#737373]">
            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-[#3b82f6]" />{completed} Solved</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#f59e0b]" />{sessionStreak} Streak</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#10b981]" />{formatTime(elapsed)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex flex-wrap gap-1.5">
            {topics.map(t => (
              <button key={t} onClick={() => handleNewTopic(t)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${topic === t ? 'text-white border-white/20' : 'bg-white/5 border-white/5 text-[#737373] hover:text-white hover:bg-white/10'}`}
                style={topic === t ? { backgroundColor: `${topicColors[t]}20`, borderColor: `${topicColors[t]}50` } : {}}>
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: topicColors[t] }} />{t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 glass-panel rounded-xl p-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button key={d} onClick={() => { setDifficulty(d as DifficultyLevel); gen(topic, d as DifficultyLevel); }}
                  className={`w-8 h-8 rounded-lg text-[10px] font-mono font-bold transition-all ${difficulty === d ? 'text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'}`}
                  style={difficulty === d ? { backgroundColor: `${difficultyColors[d as DifficultyLevel]}25`, color: difficultyColors[d as DifficultyLevel] } : {}}
                  title={`L${d}: ${difficultyLabels[d as DifficultyLevel]}`}>{d}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSimilar} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Similar</button>
              <button onClick={handleEasier} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5"><ArrowDown className="w-3.5 h-3.5" /> Easier</button>
              <button onClick={handleHarder} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5"><ArrowUp className="w-3.5 h-3.5" /> Harder</button>
              <button onClick={handleRandom} className="px-3 py-2 rounded-xl bg-[#ec4899]/15 hover:bg-[#ec4899]/25 border border-[#ec4899]/30 text-[#ec4899] text-xs font-medium transition-all flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Random</button>
              {isAuthenticated && (
                <button
                  onClick={() => genAi(topic, difficulty)}
                  disabled={isAiGenerating}
                  className="px-3 py-2 rounded-xl bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI Generate
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {exercise && (
            <motion.div key={exercise.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <div className="glass-panel rounded-2xl p-6 mb-4 border-l-4" style={{ borderLeftColor: topicColors[exercise.topic] }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium" style={{ backgroundColor: `${topicColors[exercise.topic]}15`, color: topicColors[exercise.topic] }}>{exercise.topic}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: `${difficultyColors[exercise.difficulty]}15`, color: difficultyColors[exercise.difficulty] }}>L{exercise.difficulty}: {difficultyLabels[exercise.difficulty]}</span>
                    <span className="text-[10px] text-[#737373] font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{exercise.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exerciseSource === 'ai' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#8b5cf6]/15 text-[#8b5cf6] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#525252]">#{exercise.seed || exercise.id}</span>
                  </div>
                </div>
                <div className="text-base md:text-lg font-medium leading-relaxed text-[#f6f6f6]" dangerouslySetInnerHTML={{ __html: exercise.problemText }} />
              </div>

              <div className="mb-4">
                <button onClick={() => { setShowHints(!showHints); setActiveHint(0); }} className="flex items-center gap-2 text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors mb-2">
                  <Lightbulb className="w-3.5 h-3.5" />{showHints ? 'Hide Hints' : 'Need a Hint?'} ({exercise.hints.length} available)
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                      {exercise.hints.slice(0, activeHint + 1).map((hint, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                          <div className="text-[10px] font-mono text-[#f59e0b] mb-1">HINT {i + 1}</div>
                          <p className="text-xs text-[#d4d4d4]">{hint}</p>
                        </div>
                      ))}
                      {activeHint < exercise.hints.length - 1 && (
                        <button onClick={() => setActiveHint(h => h + 1)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-[#737373] hover:text-white transition-colors">Show Next Hint</button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#10b981]" />Solution</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737373] font-mono">{revealedSteps.size}/{exercise.solutionSteps.length} steps</span>
                    {nextStep !== undefined && nextStep >= 0 && (
                      <button onClick={() => revealStep(nextStep)} className="px-3 py-1.5 bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-medium rounded-lg transition-colors">Reveal Next Step</button>
                    )}
                    <button onClick={() => setShowAnswer(!showAnswer)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#f6f6f6] text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center gap-1.5">
                      {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{showAnswer ? 'Hide' : 'Show All'}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {exercise.solutionSteps.map((step, i) => {
                    const revealed = revealedSteps.has(i) || showAnswer;
                    return (
                      <motion.div key={i}>
                        {!revealed ? (
                          <button onClick={() => revealStep(i)} disabled={i !== nextStep && !showAnswer}
                            className={`w-full p-3 rounded-xl border text-left transition-all ${i === nextStep ? 'border-[#ec4899]/30 bg-[#ec4899]/5 cursor-pointer hover:bg-[#ec4899]/10' : 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'}`}>
                            <span className="text-sm font-medium">{step.title}</span>
                            {i === nextStep && <span className="ml-2 text-[10px] font-mono text-[#ec4899]">CLICK TO REVEAL</span>}
                          </button>
                        ) : (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl border border-white/10 bg-[#111111]/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-md bg-[#10b981]/15 flex items-center justify-center text-[10px] font-mono font-bold text-[#10b981]">{i + 1}</div>
                              <span className="text-sm font-semibold">{step.title}</span>
                            </div>
                            <div className="text-xs text-[#d4d4d4] leading-relaxed pl-8" dangerouslySetInnerHTML={{ __html: step.content }} />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {(revealedSteps.size === exercise.solutionSteps.length || showAnswer) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-2xl border border-[#10b981]/20 bg-[#10b981]/5">
                    <div className="text-[10px] font-mono text-[#10b981] mb-1">ANSWER</div>
                    <div className="text-sm font-medium text-[#f6f6f6] font-mono">{exercise.answer}</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-[#3b82f6]/20 bg-[#3b82f6]/5">
                    <div className="text-[10px] font-mono text-[#3b82f6] mb-1">VERIFICATION</div>
                    <div className="text-xs text-[#d4d4d4]" dangerouslySetInnerHTML={{ __html: exercise.verification }} />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <button onClick={handleComplete} className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Mark Complete</button>
                <button onClick={handleSimilar} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#f6f6f6] text-sm rounded-xl border border-white/10 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Similar Problem</button>
                <button onClick={handleHarder} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#f6f6f6] text-sm rounded-xl border border-white/10 transition-colors flex items-center gap-2"><ArrowUp className="w-4 h-4" /> Harder</button>
                <button onClick={handleRandom} className="px-4 py-2 bg-[#ec4899]/10 hover:bg-[#ec4899]/20 text-[#ec4899] text-sm rounded-xl border border-[#ec4899]/20 transition-colors flex items-center gap-2"><Zap className="w-4 h-4" /> Random</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default withClientOnly(PracticeGenerator);
