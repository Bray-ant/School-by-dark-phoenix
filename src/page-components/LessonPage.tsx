"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { chapters } from '../data/courseData';
import { BookOpen, CheckCircle, ChevronLeft, Home, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonPage() {
  const params = useParams<{ chapterId: string; sectionId: string; lessonId: string }>();
  const chapterId = params?.chapterId;
  const sectionId = params?.sectionId;
  const lessonId = params?.lessonId;
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz'>('theory');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const chapter = chapters.find(c => c.id === chapterId);
  const section = chapter?.sections.find(s => s.id === sectionId);
  const lesson = section?.lessons.find(l => l.id === lessonId);

  if (!chapter || !section || !lesson) {
    return <div className="py-20 text-center text-[#737373]">Lesson not found</div>;
  }

  const allLessons = chapter.sections.flatMap(s => s.lessons.map(l => ({ ...l, sectionId: s.id })));
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const chapterQuizzes = [
    { question: 'What is the equilibrium condition for forces?', options: ['ΣF = 0', 'F = ma', 'ΣM = 0', 'E = mc²'], correct: 0 },
    { question: 'What is the unit of force?', options: ['kg', 'Newton', 'Joule', 'Watt'], correct: 1 },
  ];

  const handleQuizSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const correctCount = Object.entries(quizAnswers).filter(([q, a]) => chapterQuizzes[Number(q)]?.correct === a).length;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#737373]">
          <Link href="/" className="hover:text-white flex items-center gap-1"><Home className="w-3 h-3" /></Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/chapter/${chapter.id}`} className="hover:text-white">{chapter.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#f6f6f6]">{lesson.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${chapter.color}15`, border: `1px solid ${chapter.color}30` }}>
              <BookOpen className="w-5 h-5" style={{ color: chapter.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
              <div className="flex items-center gap-2 text-xs text-[#737373]">
                <span>{lesson.duration}</span>
                <span>•</span>
                <span className="capitalize">{lesson.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/5 w-fit">
            <button onClick={() => setActiveTab('theory')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'theory' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white'}`}>
              <List className="w-3.5 h-3.5 inline mr-1.5" />Theory
            </button>
            <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'quiz' ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white'}`}>
              <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />Quiz
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'theory' ? (
              <motion.div key="theory" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="glass-panel rounded-2xl p-6 mb-6">
                  <div className="prose-custom text-sm text-[#d4d4d4] leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
                {lesson.formulas && (
                  <div className="glass-panel rounded-2xl p-5 mb-6">
                    <h3 className="text-xs font-semibold mb-3 text-[#737373]">Key Formulas</h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.formulas.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-xs font-mono text-[#3b82f6]">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="quiz" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="glass-panel rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-semibold mb-4">Knowledge Check</h3>
                  <div className="space-y-4">
                    {chapterQuizzes.map((q, qi) => (
                      <div key={qi} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-sm font-medium mb-3">{qi + 1}. {q.question}</p>
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
                    <button onClick={() => setQuizSubmitted(true)} className="mt-4 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium rounded-lg transition-colors">
                      Submit Answers
                    </button>
                  ) : (
                    <div className="mt-4 p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-xs text-[#10b981]">
                      Score: {correctCount}/{chapterQuizzes.length} correct
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {prevLesson ? (
              <Link href={`/chapter/${chapter.id}/section/${prevLesson.sectionId}/lesson/${prevLesson.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
            ) : <div />}
            {nextLesson && (
              <Link href={`/chapter/${chapter.id}/section/${nextLesson.sectionId}/lesson/${nextLesson.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
}
