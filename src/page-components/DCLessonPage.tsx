"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { dcChapterList } from '../data/dcCircuitData';
import { dcCircuitExercises } from '../data/dcCircuitExercises';
import { trpc } from '@/providers/trpc';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { withClientOnly } from '../components/withClientOnly';
import {
  BookOpen, CheckCircle, ChevronLeft, ChevronRight, Home,
  FileText, Brain, Cpu, BarChart3,
  AlertTriangle, GraduationCap, Users, Star, HelpCircle,
  MessageSquare, Target, Lightbulb,
  X, Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabConfig = [
  { id: 'theory', label: 'Theory', icon: <BookOpen className="w-3.5 h-3.5" />, color: '#3b82f6' },
  { id: 'executive', label: 'Executive Summary', icon: <FileText className="w-3.5 h-3.5" />, color: '#10b981' },
  { id: 'deep', label: 'Deep Technical', icon: <Brain className="w-3.5 h-3.5" />, color: '#8b5cf6' },
  { id: 'ee', label: 'EE Perspective', icon: <Cpu className="w-3.5 h-3.5" />, color: '#f59e0b' },
  { id: 'math', label: 'Math Analysis', icon: <BarChart3 className="w-3.5 h-3.5" />, color: '#ec4899' },
  { id: 'review', label: 'Critical Review', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#ef4444' },
  { id: 'teaching', label: 'Teaching Mode', icon: <GraduationCap className="w-3.5 h-3.5" />, color: '#06b6d4' },
  { id: 'takeaways', label: 'Key Takeaways', icon: <Star className="w-3.5 h-3.5" />, color: '#f59e0b' },
  { id: 'exercises', label: 'Exercises', icon: <Target className="w-3.5 h-3.5" />, color: '#10b981' },
];

function getLocalProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem('project_school_progress') || '{}'); }
  catch { return {}; }
}

function setLocalProgress(lessonId: string) {
  const p = getLocalProgress();
  p[lessonId] = true;
  localStorage.setItem('project_school_progress', JSON.stringify(p));
}

function DCLessonPage() {
  const params = useParams<{ chapterId: string; sectionId: string; lessonId: string }>();
  const chapterId = params?.chapterId;
  const sectionId = params?.sectionId;
  const lessonId = params?.lessonId;
  const [activeTab, setActiveTab] = useState('theory');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const completeMutation = trpc.progress.completeLesson.useMutation();

  useEffect(() => {
    if (lessonId) {
      setIsCompleted(getLocalProgress()[lessonId] === true);
    }
  }, [lessonId]);

  const handleMarkComplete = async () => {
    if (!lessonId) return;
    setLocalProgress(lessonId);
    setIsCompleted(true);
    addToast('Lesson completed! Great work!', 'success');
    if (isAuthenticated) {
      try {
        await completeMutation.mutateAsync({
          lessonId,
          chapterType: 'dc-circuit',
          timeSpentSeconds: 300,
        });
      } catch (err) {
        console.warn('[DCLessonPage] failed to sync lesson progress to server:', err);
      }
    }
  };

  const chapter = dcChapterList.find(c => c.id === chapterId);
  const section = chapter?.sections.find(s => s.id === sectionId);
  const lesson = section?.lessons.find(l => l.id === lessonId);

  if (!chapter || !section || !lesson) {
    return <div className="py-20 text-center text-[#737373]">Lesson not found</div>;
  }

  const allLessons = chapter.sections.flatMap(s => s.lessons.map(l => ({ ...l, sectionId: s.id })));
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const relatedExercises = dcCircuitExercises.filter(e => e.lessonId === lessonId);

  const quizQuestions = [
    { q: 'What is Ohm\'s Law?', options: ['V = I + R', 'V = I × R', 'V = I / R', 'V = R / I'], correct: 1 },
    { q: 'What is the unit of resistance?', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correct: 2 },
  ];

  const handleQuizSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const correctCount = Object.entries(quizAnswers).filter(([q, a]) => quizQuestions[Number(q)]?.correct === a).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'theory':
        return (
          <div className="space-y-4">
            {lesson.formulas && lesson.formulas.length > 0 && (
              <div className="glass-panel rounded-2xl p-5 mb-4">
                <h3 className="text-xs font-semibold mb-3 text-[#737373] uppercase tracking-wider">Key Formulas</h3>
                <div className="flex flex-wrap gap-2">
                  {lesson.formulas.map((f, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                      <div className="text-[10px] text-[#3b82f6] font-medium mb-0.5">{f.name}</div>
                      <div className="text-xs font-mono text-[#f6f6f6]">{f.formula}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="glass-panel rounded-2xl p-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            {lesson.simpleExplanation && (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#06b6d4' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-[#06b6d4]" />
                  <span className="text-xs font-semibold text-[#06b6d4]">Simple Explanation</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.simpleExplanation}</p>
              </div>
            )}
          </div>
        );
      case 'executive':
        return (
          <div className="space-y-4">
            {lesson.executiveSummary && (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#10b981' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs font-semibold text-[#10b981] uppercase tracking-wider">Executive Summary</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.executiveSummary}</p>
              </div>
            )}
            {lesson.professionalExplanation && (
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#737373]" />
                  <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Professional Context</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.professionalExplanation}</p>
              </div>
            )}
          </div>
        );
      case 'deep':
        return (
          <div className="space-y-4">
            {lesson.deepTechnical ? (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wider">Deep Technical Analysis</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.deepTechnical}</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">Deep technical analysis coming soon for this lesson.</div>
            )}
          </div>
        );
      case 'ee':
        return (
          <div className="space-y-4">
            {lesson.eePerspective ? (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">Electrical Engineering Perspective</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.eePerspective}</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">EE perspective analysis coming soon.</div>
            )}
          </div>
        );
      case 'math':
        return (
          <div className="space-y-4">
            {lesson.mathAnalysis ? (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#ec4899' }}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#ec4899]" />
                  <span className="text-xs font-semibold text-[#ec4899] uppercase tracking-wider">Mathematical Analysis</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.mathAnalysis}</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">Mathematical analysis coming soon.</div>
            )}
          </div>
        );
      case 'review':
        return (
          <div className="space-y-4">
            {lesson.criticalReview ? (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#ef4444' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-xs font-semibold text-[#ef4444] uppercase tracking-wider">Critical Review</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.criticalReview}</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">Critical review coming soon.</div>
            )}
          </div>
        );
      case 'teaching':
        return (
          <div className="space-y-4">
            {lesson.teachingBeginner && (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#06b6d4' }}>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-[#06b6d4]" />
                  <span className="text-xs font-semibold text-[#06b6d4] uppercase tracking-wider">Teaching: Beginner Level</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.teachingBeginner}</p>
              </div>
            )}
            {lesson.teachingStudent && (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wider">Teaching: University Student</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.teachingStudent}</p>
              </div>
            )}
            {lesson.teachingSenior && (
              <div className="glass-panel rounded-2xl p-5 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">Teaching: Senior Engineer</span>
                </div>
                <p className="text-xs text-[#d4d4d4] leading-relaxed">{lesson.teachingSenior}</p>
              </div>
            )}
            {!lesson.teachingBeginner && !lesson.teachingStudent && !lesson.teachingSenior && (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">Teaching mode content coming soon.</div>
            )}
          </div>
        );
      case 'takeaways':
        return (
          <div className="space-y-4">
            {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">Key Takeaways</span>
                </div>
                <div className="space-y-2">
                  {lesson.keyTakeaways.map((tk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" />
                      <span className="text-xs text-[#d4d4d4]">{tk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">Common Mistakes</span>
                </div>
                <div className="space-y-2">
                  {lesson.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-[#ef4444] mt-0.5 shrink-0" />
                      <span className="text-xs text-[#d4d4d4]">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'exercises':
        return (
          <div className="space-y-4">
            {relatedExercises.length > 0 ? (
              relatedExercises.map((ex, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-semibold">Exercise {i + 1}</span>
                    <span className="text-[10px] text-[#737373] ml-auto">{ex.difficulty}</span>
                  </div>
                  <p className="text-xs text-[#d4d4d4] mb-3">{ex.problem}</p>
                  <button onClick={() => setHintOpen(!hintOpen)} className="flex items-center gap-1 text-[10px] text-[#f59e0b]">
                    <Lightbulb className="w-3 h-3" />{hintOpen ? 'Hide Hint' : 'Show Hint'}
                  </button>
                  {hintOpen && ex.hint && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                      <p className="text-xs text-[#d4d4d4]">{ex.hint}</p>
                    </motion.div>
                  )}
                  {ex.solution && (
                    <div className="mt-3 p-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15">
                      <div className="text-[10px] text-[#10b981] mb-1">SOLUTION</div>
                      <p className="text-xs text-[#d4d4d4]">{ex.solution}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-[#737373] text-sm">No exercises yet for this lesson. Check the Practice Generator!</div>
            )}
            {/* Quiz */}
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-[#8b5cf6]" />Knowledge Check</h3>
              <div className="space-y-4">
                {quizQuestions.map((q, qi) => (
                  <div key={qi} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-sm font-medium mb-3">{qi + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = q.correct === oi;
                        const showResult = quizSubmitted;
                        return (
                          <button key={oi} onClick={() => handleQuizSelect(qi, oi)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all border ${
                              showResult && isCorrect ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]' :
                              showResult && selected && !isCorrect ? 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]' :
                              selected ? 'border-[#3b82f6]/30 bg-[#3b82f6]/10' : 'border-white/5 hover:border-white/10'
                            }`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {!quizSubmitted ? (
                <button onClick={() => setQuizSubmitted(true)} className="mt-4 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium rounded-lg transition-colors">Submit Answers</button>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-xs text-[#10b981]">Score: {correctCount}/{quizQuestions.length} correct</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#737373]">
          <Link href="/" className="hover:text-white flex items-center gap-1"><Home className="w-3 h-3" /></Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/dc-circuit/${chapter.id}`} className="hover:text-white">{chapter.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#f6f6f6]">{lesson.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${chapter.color}15`, border: `1px solid ${chapter.color}30` }}>
                <BookOpen className="w-5 h-5" style={{ color: chapter.color }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{lesson.number} {lesson.title}</h1>
                <div className="flex items-center gap-2 text-xs text-[#737373]">
                  <span>{lesson.duration}</span><span>•</span><span className="capitalize">{lesson.difficulty}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isCompleted
                  ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] cursor-default'
                  : 'bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          </div>

          {/* Analysis Tabs */}
          <div className="mb-6 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 w-fit min-w-full">
              {tabConfig.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'
                  }`}
                  style={activeTab === tab.id ? { color: tab.color } : {}}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {prevLesson ? (
              <Link href={`/dc-circuit/${chapter.id}/section/${prevLesson.sectionId}/lesson/${prevLesson.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
            ) : <div />}
            {nextLesson && (
              <Link href={`/dc-circuit/${chapter.id}/section/${nextLesson.sectionId}/lesson/${nextLesson.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default withClientOnly(DCLessonPage);
