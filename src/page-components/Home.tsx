"use client";
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { getTotalLessons, getCompletedLessons } from '../data/courseData';
import { exercises } from '../data/mathExercisesData';
import DailyInspiration from '../components/DailyInspiration';
import {
  Box, Orbit, Zap, Calculator, ArrowRight, BookOpen, CheckCircle,
  TrendingUp, Eye, Target, Award, Users, Compass, Sparkles,
  Quote, Play, Dices, CircuitBoard, Sigma, FunctionSquare, Grid3X3,
  CircleDot, Infinity as InfinityIcon, Divide, ZapOff, Gamepad2,
} from 'lucide-react';
import { dcChapterList, getDCTotalLessons } from '../data/dcCircuitData';
import { motion } from 'framer-motion';

const mathModules = [
  { id: 'multivariable', num: '01', title: 'Multivariable Calculus', desc: 'Level sets, partial derivatives, gradient, Hessian, tangent planes', color: '#f97316', icon: <FunctionSquare className="w-5 h-5" /> },
  { id: 'linear-algebra', num: '02', title: 'Linear Algebra', desc: 'Eigenvalues, definiteness, classifying extrema, convexity', color: '#8b5cf6', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'complex', num: '03', title: 'Complex Functions', desc: "Euler's formula, polar form, roots in ℂ, complex logarithm", color: '#06b6d4', icon: <CircleDot className="w-5 h-5" /> },
  { id: 'taylor', num: '04', title: 'Taylor Polynomials', desc: 'Approximations, error bounds, remainder estimation', color: '#f59e0b', icon: <Sigma className="w-5 h-5" /> },
  { id: 'power-series', num: '05', title: 'Power Series', desc: 'Radius of convergence, term-by-term operations', color: '#ec4899', icon: <InfinityIcon className="w-5 h-5" /> },
  { id: 'integration', num: '06', title: 'Engineering Integration', desc: "By parts, substitution, partial fractions, L'Hôpital", color: '#10b981', icon: <Divide className="w-5 h-5" /> },
];

const chapterIcons: Record<string, React.ReactNode> = {
  stereostatics: <Box className="w-6 h-6" />,
  kinematics: <Orbit className="w-6 h-6" />,
  kinetics: <Zap className="w-6 h-6" />,
};

const learningPathSteps = [
  { step: '01', title: 'Learn', description: 'Study theory, definitions, and foundational concepts with rich visual explanations.', icon: <BookOpen className="w-5 h-5" />, color: '#3b82f6' },
  { step: '02', title: 'Visualize', description: 'Interact with dynamic diagrams, function plotters, and geometry tools.', icon: <Eye className="w-5 h-5" />, color: '#06b6d4' },
  { step: '03', title: 'Practice', description: 'Work through guided exercises with step-by-step solutions and instant feedback.', icon: <Target className="w-5 h-5" />, color: '#8b5cf6' },
  { step: '04', title: 'Master', description: 'Take on challenge problems, assessments, and prove your deep understanding.', icon: <Award className="w-5 h-5" />, color: '#10b981' },
];

const testimonials = [
  { text: "The step-by-step solution reveals changed how I study. I actually understand the reasoning now, not just the final answer.", author: "Engineering Student", role: "Technical Mechanics Course" },
  { text: "The interactive diagrams make abstract concepts tangible. Being able to adjust parameters and see the math update in real-time is invaluable.", author: "Mathematics Student", role: "Calculus & Linear Algebra" },
  { text: "The exercise center covers every topic I need. From basic set theory to eigenvalue problems — all with complete solutions.", author: "Physics Undergraduate", role: "Mathematical Methods" },
];

export default function Home() {
  const { chapterList } = useApp();
  const totalLessons = getTotalLessons();
  const completedLessons = getCompletedLessons();
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-15" style={{ background: 'radial-gradient(ellipse at center, #3b82f6 0%, #8b5cf6 40%, transparent 70%)' }} />
          <div className="absolute top-20 left-[10%] text-[#3b82f6]/10 text-6xl font-serif select-none">∫</div>
          <div className="absolute top-32 right-[15%] text-[#8b5cf6]/10 text-5xl font-serif select-none">Σ</div>
          <div className="absolute bottom-20 left-[20%] text-[#10b981]/10 text-4xl font-serif select-none">∂</div>
          <div className="absolute top-40 right-[8%] text-[#f59e0b]/10 text-5xl font-serif select-none">π</div>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-xs font-mono text-[#3b82f6] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />Technical Mechanics & Mathematics
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4 leading-[1.1]">
              Master the <span className="text-gradient">Fundamentals</span><br />of Engineering & Math
            </h1>
            <p className="text-lg text-[#737373] max-w-2xl mb-8 leading-relaxed">
              A comprehensive interactive learning platform covering stereostatics, kinematics, kinetics,
              and mathematics. From free-body diagrams to eigenvalue problems — build your intuition step by step.
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-10">
              {[{ icon: <TrendingUp className="w-4 h-4 text-[#10b981]" />, label: `${overallProgress}% Mastery` }, { icon: <BookOpen className="w-4 h-4 text-[#3b82f6]" />, label: `${totalLessons} Lessons` }, { icon: <Calculator className="w-4 h-4 text-[#8b5cf6]" />, label: `${exercises.length} Math Exercises` }, { icon: <CheckCircle className="w-4 h-4 text-[#10b981]" />, label: `${completedLessons} Completed` }].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#737373]">{stat.icon}<span>{stat.label}</span></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/chapter/stereostatics" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-xl transition-colors">
                <Play className="w-4 h-4" />Start Learning<ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/practice" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ec4899]/15 hover:bg-[#ec4899]/25 border border-[#ec4899]/30 text-[#ec4899] text-sm font-medium rounded-xl transition-colors">
                <Dices className="w-4 h-4" />Practice Generator
              </Link>
              <Link href="/exercises" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#f6f6f6] text-sm font-medium rounded-xl border border-white/10 transition-colors">
                <Calculator className="w-4 h-4" />Math Exercises
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DAILY INSPIRATION */}
      <DailyInspiration />

      {/* LEARNING PATH */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-xs font-mono text-[#8b5cf6] inline-flex items-center gap-1.5 mb-4">
              <Compass className="w-3 h-3" />YOUR LEARNING PATH
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">From Theory to <span className="text-gradient">Mastery</span></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {learningPathSteps.map((step, index) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative">
                {index < learningPathSteps.length - 1 && <div className="hidden md:block absolute top-6 left-[60%] right-[-20%] h-px bg-white/10 z-0" />}
                <div className="relative z-10 p-5 rounded-2xl border border-white/10 bg-[#111111]/50 hover:border-white/20 transition-all group text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                    <span style={{ color: step.color }}>{step.icon}</span>
                  </div>
                  <div className="font-mono text-[10px] mb-1.5" style={{ color: step.color }}>STEP {step.step}</div>
                  <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                  <p className="text-[11px] text-[#737373] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER CARDS */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
            <div>
              <div className="px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-xs font-mono text-[#3b82f6] inline-flex items-center gap-1.5 mb-3">
                <BookOpen className="w-3 h-3" />TECHNICAL MECHANICS
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Learning Modules</h2>
            </div>
            <span className="text-xs text-[#737373] font-mono">{chapterList.length} CHAPTERS</span>
          </motion.div>

          <div className="grid gap-4">
            {chapterList.map((chapter, index) => {
              const progress = chapter.sections.reduce((a, s) => a + s.lessons.filter(l => l.completed).length, 0);
              const total = chapter.sections.reduce((a, s) => a + s.lessons.length, 0);
              const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
              return (
                <motion.div key={chapter.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                  <Link href={`/chapter/${chapter.id}`} className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111]/50 hover:border-white/20 transition-all duration-300">
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle at 90% 50%, ${chapter.color}, transparent 60%)` }} />
                    <div className="relative flex flex-col md:flex-row md:items-center gap-6 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${chapter.color}15`, border: `1px solid ${chapter.color}30` }}>
                          <span style={{ color: chapter.color }}>{chapterIcons[chapter.id]}</span>
                        </div>
                        <div className="md:hidden">
                          <div className="font-mono text-xs text-[#737373] mb-1">CHAPTER {String(chapter.number).padStart(2, '0')}</div>
                          <h3 className="text-lg font-semibold">{chapter.title}</h3>
                        </div>
                      </div>
                      <div className="flex-1 hidden md:block">
                        <div className="font-mono text-xs text-[#737373] mb-1">CHAPTER {String(chapter.number).padStart(2, '0')}</div>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">{chapter.title}</h3>
                        <p className="text-sm text-[#737373]">{chapter.subtitle}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#737373]">{pct}%</span>
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : chapter.color }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                          <span>{chapter.sections.length} sections</span><span>•</span><span>{total} lessons</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center">
                        <ArrowRight className="w-5 h-5 text-[#737373] group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Math Exercises Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.4 }}>
              <Link href="/exercises" className="group block relative overflow-hidden rounded-2xl border border-[#8b5cf6]/20 bg-[#111111]/50 hover:border-[#8b5cf6]/40 transition-all duration-300">
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: 'radial-gradient(circle at 90% 50%, #8b5cf6, transparent 60%)' }} />
                <div className="relative flex flex-col md:flex-row md:items-center gap-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#8b5cf6]/15 border border-[#8b5cf6]/30">
                      <Calculator className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div className="md:hidden">
                      <div className="font-mono text-xs text-[#737373] mb-1">EXERCISE CENTER</div>
                      <h3 className="text-lg font-semibold">Mathematics Exercises</h3>
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block">
                    <div className="font-mono text-xs text-[#737373] mb-1">EXERCISE CENTER</div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">Mathematics Exercises</h3>
                    <p className="text-sm text-[#737373]">Practice-driven learning with complete worked solutions</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                      <span>{exercises.length} exercises</span><span>•</span><span>10 topics</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    <ArrowRight className="w-5 h-5 text-[#737373] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Practice Generator Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }}>
              <Link href="/practice" className="group block relative overflow-hidden rounded-2xl border border-[#ec4899]/20 bg-[#111111]/50 hover:border-[#ec4899]/40 transition-all duration-300">
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: 'radial-gradient(circle at 90% 50%, #ec4899, transparent 60%)' }} />
                <div className="relative flex flex-col md:flex-row md:items-center gap-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#ec4899]/15 border border-[#ec4899]/30">
                      <Dices className="w-6 h-6 text-[#ec4899]" />
                    </div>
                    <div className="md:hidden">
                      <div className="font-mono text-xs text-[#737373] mb-1">INFINITE PRACTICE</div>
                      <h3 className="text-lg font-semibold">Dark Phoenix Generator</h3>
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block">
                    <div className="font-mono text-xs text-[#737373] mb-1">INFINITE PRACTICE</div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">Dark Phoenix Generator</h3>
                    <p className="text-sm text-[#737373]">Millions of unique exercises across 15 topics with 7 difficulty levels</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                      <span>15 topics</span><span>•</span><span>7 difficulty levels</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    <ArrowRight className="w-5 h-5 text-[#737373] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DC CIRCUIT ANALYSIS */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-xs font-mono text-[#10b981] inline-flex items-center gap-1.5 mb-3">
                  <CircuitBoard className="w-3 h-3" />DC CIRCUIT ANALYSIS
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">DC Electrical Circuits</h2>
                <p className="text-sm text-[#737373] mt-1">Based on Fiore — A Practical Approach with 12-point expert analysis</p>
              </div>
              <span className="text-xs text-[#737373] font-mono">{dcChapterList.length} CHAPTERS • {getDCTotalLessons()} LESSONS</span>
            </div>
          </motion.div>

          <div className="grid gap-3 mb-8">
            {dcChapterList.map((ch, index) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <Link href={`/dc-circuit/${ch.id}`} className="group flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ch.color}15`, border: `1px solid ${ch.color}30` }}>
                    <span className="text-xs font-bold font-mono" style={{ color: ch.color }}>{String(ch.number).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium group-hover:text-white transition-colors">{ch.title}</div>
                    <div className="text-xs text-[#737373]">{ch.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#737373]">
                    <span>{ch.sections.reduce((a, s) => a + s.lessons.length, 0)} lessons</span>
                    <ArrowRight className="w-4 h-4 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#10b981]" />
              <span className="text-sm font-semibold">12-Point Analysis Framework</span>
            </div>
            <p className="text-xs text-[#737373] mb-3">Every lesson includes comprehensive expert analysis:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Executive Summary', 'Deep Technical', 'EE Perspective', 'Math Analysis', 'Code Analysis', 'Critical Review', 'Teaching Mode', 'Key Takeaways'].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#d4d4d4]">
                  <CheckCircle className="w-3 h-3 text-[#10b981] shrink-0" />{item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ADVANCED MATHEMATICS */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-xs font-mono text-[#f59e0b] inline-flex items-center gap-1.5 mb-3">
                  <Sigma className="w-3 h-3" />ADVANCED MATHEMATICS
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">6 Math Modules</h2>
                <p className="text-sm text-[#737373] mt-1">University-level math with worked examples, common mistakes, and graded exercises</p>
              </div>
              <Link href="/math" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-medium rounded-xl transition-all">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {mathModules.map((mod, index) => (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <Link href="/math" className="group block rounded-2xl border border-white/10 bg-[#111111]/50 hover:border-white/20 transition-all p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${mod.color}15`, border: `1px solid ${mod.color}30`, color: mod.color }}>
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono" style={{ color: mod.color }}>{mod.num}</span>
                        <h3 className="text-sm font-semibold group-hover:text-white transition-colors">{mod.title}</h3>
                      </div>
                      <p className="text-[11px] text-[#737373] leading-relaxed">{mod.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#525252] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden text-center">
            <Link href="/math" className="inline-flex items-center gap-2 px-4 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-medium rounded-xl transition-all">
              View All Modules <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* EM & MAGNETISM */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-xs font-mono text-[#00d4ff] inline-flex items-center gap-1.5 mb-3">
                  <ZapOff className="w-3 h-3" />ELECTROMAGNETISM
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">EM & Magnetism</h2>
                <p className="text-sm text-[#737373] mt-1">Based on Sadiku — 4 comprehensive parts covering electrostatics, magnetostatics, fields, and applications</p>
              </div>
              <Link href="/em" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-medium rounded-xl transition-all">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link href="/em" className="group block rounded-2xl border border-[#00d4ff]/15 bg-[#111111]/50 hover:border-[#00d4ff]/30 transition-all p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#00d4ff]/10 border border-[#00d4ff]/20">
                  <ZapOff className="w-7 h-7 text-[#00d4ff]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">Electromagnetics & Magnetic Fields</h3>
                  <p className="text-sm text-[#737373] mb-3">Complete coverage from vector analysis through electrostatics, magnetostatics, field theory, and real-world applications.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Vector Analysis', 'Electrostatics', 'Magnetostatics', 'Field Theory', 'Maxwell Equations', 'Wave Propagation'].map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-[#a3a3a3] border border-white/5">{tag}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#525252] group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CREDIBILITY */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: '34', label: 'Tech Mech Lessons', icon: <BookOpen className="w-4 h-4" /> },
              { value: String(getDCTotalLessons()), label: 'DC Circuit Lessons', icon: <CircuitBoard className="w-4 h-4" /> },
              { value: '6', label: 'Math Modules', icon: <Sigma className="w-4 h-4" /> },
              { value: '15', label: 'Generator Topics', icon: <Dices className="w-4 h-4" /> },
            ].map((metric, index) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="glass-panel rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#3b82f6]">{metric.icon}</span>
                </div>
                <div className="text-3xl font-bold text-[#f6f6f6] mb-1">{metric.value}</div>
                <div className="text-xs text-[#737373]">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-xs font-mono text-[#f59e0b] inline-flex items-center gap-1.5 mb-3">
                <Users className="w-3 h-3" />LEARNER VOICES
              </div>
              <h2 className="text-xl font-semibold">What Students Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel rounded-2xl p-5 relative">
                  <Quote className="w-6 h-6 text-[#8b5cf6]/30 absolute top-4 right-4" />
                  <p className="text-xs text-[#d4d4d4] leading-relaxed mb-4 relative z-10">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[10px] font-bold text-[#3b82f6]">{t.author.charAt(0)}</div>
                    <div><div className="text-xs font-medium">{t.author}</div><div className="text-[10px] text-[#737373]">{t.role}</div></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CHILL GAMES */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="px-3 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 text-xs font-mono text-[#ec4899] inline-flex items-center gap-1.5 mb-3">
                  <Gamepad2 className="w-3 h-3" />CHILL GAMES
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Learn Through Play</h2>
                <p className="text-sm text-[#737373] mt-1">10 engineering & math games to relax and reinforce your learning</p>
              </div>
              <Link href="/games" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#ec4899]/10 hover:bg-[#ec4899]/20 border border-[#ec4899]/30 text-[#ec4899] text-xs font-medium rounded-xl transition-all">
                All Games <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'function-garden', title: 'Function Garden', desc: 'Draw math functions, watch them bloom into art', color: '#10b981', tag: 'Creative' },
              { id: 'circuit-flow', title: 'Circuit Flow', desc: 'Rotate components to complete circuit paths', color: '#f59e0b', tag: 'Puzzle' },
              { id: 'complex-plane', title: 'Complex Plane', desc: 'Transform complex numbers visually', color: '#06b6d4', tag: 'Toy' },
              { id: 'math-chess', title: 'Math Speed Chess', desc: 'Solve fast to capture squares', color: '#ef4444', tag: 'Competitive' },
              { id: 'lorenz-flight', title: 'Lorenz Flight', desc: 'Fly through chaos theory art', color: '#a855f7', tag: 'Visual' },
              { id: 'balance-beam', title: 'Balance Beam', desc: 'Keep the beam balanced with physics', color: '#14b8a6', tag: 'Physics' },
            ].map((game, i) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link href={`/games/${game.id}`} className="group block rounded-2xl border border-white/10 bg-[#111118]/50 hover:border-white/20 transition-all p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${game.color}15`, border: `1px solid ${game.color}30`, color: game.color }}>
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold group-hover:text-white transition-colors">{game.title}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ backgroundColor: `${game.color}15`, color: game.color }}>{game.tag}</span>
                      </div>
                      <p className="text-[11px] text-[#737373] mt-0.5">{game.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#737373]">
            <Box className="w-3.5 h-3.5" />
            <span>Project school Learn</span>
            <span>•</span>
            <span>Technical Mechanics & Mathematics</span>
          </div>
          <div className="text-xs text-[#737373]">
            &copy; {new Date().getFullYear()} Dark Phoenix Inc. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
