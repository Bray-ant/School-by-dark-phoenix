import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Send, Loader2, User, Brain, Zap, ChevronUp,
  Lightbulb, BookOpen, Calculator, FlaskConical, MessageSquare,
  Sigma, FunctionSquare, Grid3x3, Infinity as InfinityIcon, Divide,
} from 'lucide-react';

interface CopilotMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  topic?: string;
}

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  category: 'circuits' | 'math';
};

const QUICK_ACTIONS: QuickAction[] = [
  // Circuit actions
  { icon: <Lightbulb className="w-3 h-3" />, label: "Explain Ohm's Law", prompt: "Explain Ohm's Law like I'm a beginner", category: 'circuits' },
  { icon: <Calculator className="w-3 h-3" />, label: "Solve a circuit", prompt: "A 12V battery is connected to a 4kΩ resistor. Find the current.", category: 'circuits' },
  { icon: <FlaskConical className="w-3 h-3" />, label: "KVL problem", prompt: "Generate a medium difficulty KVL practice problem", category: 'circuits' },
  { icon: <BookOpen className="w-3 h-3" />, label: "Study tips", prompt: "Give me 5 tips for mastering circuit analysis", category: 'circuits' },
  // Math actions
  { icon: <Sigma className="w-3 h-3" />, label: "Partial derivatives", prompt: "How do I compute partial derivatives? Give me a worked example with f(x,y) = x²y + sin(xy)", category: 'math' },
  { icon: <FunctionSquare className="w-3 h-3" />, label: "Euler's formula", prompt: "Explain Euler's formula e^(ix) = cos x + i sin x with a proof sketch", category: 'math' },
  { icon: <Grid3x3 className="w-3 h-3" />, label: "Eigenvalues", prompt: "How do I find eigenvalues of a 2x2 matrix? Work through A = [[2,1],[1,2]]", category: 'math' },
  { icon: <InfinityIcon className="w-3 h-3" />, label: "Power series", prompt: "What is the radius of convergence? Find it for Σ n·xⁿ and check the endpoints", category: 'math' },
  { icon: <Divide className="w-3 h-3" />, label: "Integration", prompt: "Compute ∫ x·eˣ dx using integration by parts, showing every step", category: 'math' },
  { icon: <Calculator className="w-3 h-3" />, label: "Taylor poly", prompt: "Find the Taylor polynomial T₃ for eˣ at x₀ = 0 and use it to approximate e^0.1", category: 'math' },
];

// Detect if a question is math-related
function isMathQuestion(q: string): boolean {
  const lower = q.toLowerCase();
  return /(partial derivative|gradient|hessian|level set|limit.*variable|limit.*several|eigenvalue|eigenvector|definite|convex|saddle|critical.*point|complex.*number|euler.*formula|e\^i|polar.*form|taylor|power.*series|radius.*convergence|integration|integral|integrat|l'hopital|lh[ôo]pital|substitution|partial.*fraction|by.*parts|riemann|maclaurin|matrix|matrices|determinant|arg\s|modulus|complex.*log|roots?.*unity|contour|directional|tangent.*plane|multivariable|∂|∇|∫|Σ|sin|cos|tan|ln\s|log\s|exp\s|e\^)/.test(lower);
}

export default function GlobalCopilot() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'circuits' | 'math'>('all');
  const [messages, setMessages] = useState<CopilotMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isAuthenticated
        ? "Hi! I'm your AI tutor. I can help with **DC Circuits** and **University Math** (multivariable calculus, linear algebra, complex functions, Taylor series, power series, integration). Ask me anything!"
        : "Hi! I'm your AI tutor. Ask me about DC circuits or university math! Sign in to unlock enhanced AI responses.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickChat = trpc.ai.quickChat.useMutation();
  const askPublic = trpc.ai.ask.useMutation();
  const mathTutor = trpc.math.tutor.useMutation();
  const mathAskPublic = trpc.math.ask.useMutation();
  const explainConcept = trpc.smart.explainConcept.useMutation();
  const generateProblem = trpc.smart.generateProblem.useMutation();

  const filteredActions = QUICK_ACTIONS.filter(a =>
    filter === 'all' ? true : a.category === filter
  );

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: CopilotMsg = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowActions(false);

    try {
      let response: string;
      let topic: string | undefined;
      const lower = text.toLowerCase();
      const isMath = isMathQuestion(text);

      if (isAuthenticated) {
        if (isMath) {
          // Route to math tutor with Kimi
          const result = await mathTutor.mutateAsync({ message: text });
          response = result.response.content;
          topic = result.topic;
        } else {
          // Route to circuit endpoints
          if (lower.includes("generate") && (lower.includes("problem") || lower.includes("question"))) {
            const topicName = lower.includes("kvl") ? "KVL" : lower.includes("kcl") ? "KCL" : lower.includes("thevenin") ? "Thevenin's theorem" : lower.includes("ohm") ? "Ohm's Law" : "DC circuits";
            const diff = lower.includes("hard") ? "Hard" : lower.includes("easy") ? "Easy" : "Medium";
            const result = await generateProblem.mutateAsync({ topic: topicName, difficulty: diff as any });
            response = result.problem;
          } else if (lower.includes("explain") && (lower.includes("concept") || lower.includes("what is") || lower.includes("how does"))) {
            const concept = text.replace(/explain|what is|how does|concept/gi, "").trim() || "Ohm's Law";
            const level = lower.includes("beginner") || lower.includes("simple") ? "beginner" : lower.includes("advanced") || lower.includes("expert") ? "advanced" : "intermediate";
            const result = await explainConcept.mutateAsync({ concept, level: level as any });
            response = result.explanation;
          } else {
            const result = await quickChat.mutateAsync({ message: text });
            response = result.response.content;
          }
        }
      } else {
        // Public endpoints
        if (isMath) {
          const result = await mathAskPublic.mutateAsync({ question: text });
          response = result.response;
          topic = result.topic;
        } else {
          const result = await askPublic.mutateAsync({ question: text });
          response = result.response;
        }
      }

      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response, topic }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAuthenticated, quickChat, askPublic, mathTutor, mathAskPublic, explainConcept, generateProblem]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-lg shadow-[#8b5cf6]/30 flex items-center justify-center transition-colors group"
          >
            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            {isAuthenticated && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full border-2 border-[#060606]" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-[#111118] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-[#16161f]">
              <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold">AI Tutor</h3>
                <p className="text-[9px] text-[#737373]">
                  {isAuthenticated ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-[#f59e0b]" /> AI — Circuits & Math
                    </span>
                  ) : (
                    "Ask about circuits or math"
                  )}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[#737373] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-[#3b82f6]/15' :
                    msg.topic?.includes('Module') || msg.topic?.includes('Math') ? 'bg-[#10b981]/15' : 'bg-[#8b5cf6]/15'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3 h-3 text-[#3b82f6]" /> :
                     msg.topic?.includes('Module') || msg.topic?.includes('Math') ? <Sigma className="w-3 h-3 text-[#10b981]" /> :
                     <Sparkles className="w-3 h-3 text-[#8b5cf6]" />}
                  </div>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.topic && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] text-[8px] mb-0.5 font-medium">
                        {msg.topic}
                      </span>
                    )}
                    <div className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#3b82f6]/15 text-[#d4d4d4]' : 'bg-white/5 text-[#d4d4d4]'
                    }`}>
                      <div dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                          .replace(/```([\s\S]*?)```/g, '<pre class="mt-1 p-1.5 rounded bg-black/40 text-[9px] font-mono overflow-x-auto"><code>$1</code></pre>')
                          .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[9px] font-mono">$1</code>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#8b5cf6]/15 flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 text-[#8b5cf6] animate-spin" />
                  </div>
                  <div className="bg-white/5 rounded-xl px-3 py-2 text-[11px] text-[#737373]">
                    {isAuthenticated ? 'AI is thinking...' : 'Thinking...'}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            {showActions && messages.length === 1 && (
              <div className="shrink-0 px-4 pb-2">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 mb-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                      filter === 'all' ? 'bg-white/10 text-white' : 'text-[#525252] hover:text-[#a3a3a3]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('circuits')}
                    className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all flex items-center gap-0.5 ${
                      filter === 'circuits' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'text-[#525252] hover:text-[#a3a3a3]'
                    }`}
                  >
                    <Zap className="w-2 h-2" /> Circuits
                  </button>
                  <button
                    onClick={() => setFilter('math')}
                    className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all flex items-center gap-0.5 ${
                      filter === 'math' ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' : 'text-[#525252] hover:text-[#a3a3a3]'
                    }`}
                  >
                    <Sigma className="w-2 h-2" /> Math
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action.prompt)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-all text-left ${
                        action.category === 'math'
                          ? 'bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/15 text-[#a3a3a3] hover:text-white'
                          : 'bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white'
                      }`}
                    >
                      <span className={action.category === 'math' ? 'text-[#8b5cf6]' : 'text-[#f59e0b]'}>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 px-3 py-2.5 border-t border-white/5 bg-[#16161f]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about circuits or math..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-[#f6f6f6] placeholder-[#525252] outline-none resize-none min-h-[36px] max-h-[80px] focus:border-[#8b5cf6]/30"
                  rows={1}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="text-[9px] text-[#525252] hover:text-[#8b5cf6] transition-colors flex items-center gap-1"
                >
                  <ChevronUp className={`w-2.5 h-2.5 transition-transform ${showActions ? '' : 'rotate-180'}`} />
                  {showActions ? 'Hide actions' : 'Show actions'}
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/ai-tutor'); }}
                  className="text-[9px] text-[#525252] hover:text-[#8b5cf6] transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-2.5 h-2.5" /> Full Tutor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
