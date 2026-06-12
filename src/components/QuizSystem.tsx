import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { recordQuizComplete } from '../utils/gamification';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuizSystemProps {
  questions: QuizQuestion[];
  title: string;
  onComplete?: (score: number, maxScore: number) => void;
}

export default function QuizSystem({ questions, title, onComplete }: QuizSystemProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; explanation: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const correct = idx === q.correctIndex;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { correct, explanation: q.explanation }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      recordQuizComplete(score + (selected === q.correctIndex ? 1 : 0), questions.length, q.topic);
      onComplete?.(score + (selected === q.correctIndex ? 1 : 0), questions.length);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6 text-center">
        <Trophy className={`w-12 h-12 mx-auto mb-3 ${pct === 100 ? 'text-[#f59e0b]' : pct >= 70 ? 'text-[#10b981]' : 'text-[#f97316]'}`} />
        <h3 className="text-lg font-semibold mb-1">Quiz Complete!</h3>
        <p className="text-2xl font-bold mb-1" style={{ color: pct === 100 ? '#f59e0b' : pct >= 70 ? '#10b981' : '#f97316' }}>
          {score}/{questions.length} ({pct}%)
        </p>
        <p className="text-xs text-[#737373] mb-4">
          {pct === 100 ? 'Perfect score! Outstanding work!' : pct >= 70 ? 'Great job! Keep it up!' : 'Keep practicing, you will improve!'}
        </p>

        <div className="space-y-2 mb-4 text-left">
          {answers.map((a, i) => (
            <div key={i} className={`p-3 rounded-xl ${a.correct ? 'bg-[#10b981]/5 border border-[#10b981]/10' : 'bg-[#ef4444]/5 border border-[#ef4444]/10'}`}>
              <div className="flex items-center gap-2 mb-1">
                {a.correct ? <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" /> : <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />}
                <span className="text-[10px] font-medium" style={{ color: a.correct ? '#10b981' : '#ef4444' }}>
                  Q{i + 1}: {a.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="text-[10px] text-[#737373]">{a.explanation}</p>
            </div>
          ))}
        </div>

        <button onClick={reset} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#d4d4d4] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#8b5cf6]" /> {title}</h3>
        <span className="text-[10px] text-[#737373] font-mono">{current + 1}/{questions.length}</span>
      </div>

      {/* Progress */}
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-5">
        <div className="h-full rounded-full bg-[#8b5cf6] transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <p className="text-xs text-[#d4d4d4] mb-4 leading-relaxed">{q.question}</p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correctIndex;
          let bgClass = 'bg-white/5 border-white/10 hover:bg-white/10';
          if (showResult && isCorrect) bgClass = 'bg-[#10b981]/10 border-[#10b981]/30';
          else if (showResult && isSelected && !isCorrect) bgClass = 'bg-[#ef4444]/10 border-[#ef4444]/30';
          else if (isSelected) bgClass = 'bg-[#8b5cf6]/15 border-[#8b5cf6]/30';

          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={showResult}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${bgClass}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                showResult && isCorrect ? 'bg-[#10b981] text-white' :
                showResult && isSelected && !isCorrect ? 'bg-[#ef4444] text-white' :
                isSelected ? 'bg-[#8b5cf6] text-white' : 'bg-white/10 text-[#737373]'
              }`}>{String.fromCharCode(65 + i)}</span>
              <span className="text-[11px] text-[#d4d4d4]">{opt}</span>
              {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-[#10b981] ml-auto shrink-0" />}
              {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-[#ef4444] ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl mb-4 ${
            selected === q.correctIndex ? 'bg-[#10b981]/5 border border-[#10b981]/10' : 'bg-[#ef4444]/5 border border-[#ef4444]/10'
          }`}>
            <p className="text-[10px] font-medium mb-0.5" style={{ color: selected === q.correctIndex ? '#10b981' : '#ef4444' }}>
              {selected === q.correctIndex ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-[10px] text-[#737373]">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && (
        <button onClick={handleNext}
          className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2">
          {current + 1 >= questions.length ? 'See Results' : 'Next Question'} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
