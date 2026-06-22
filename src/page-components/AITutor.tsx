"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { useAiStream } from '../hooks/useAiStream';
import {
  Brain, Send, User, Sparkles, ChevronLeft, Loader2,
  MessageSquare, FlipHorizontal, Lock, Bot,
  Sigma, Zap, BookOpen, Square,
} from 'lucide-react';
import { withClientOnly } from '../components/withClientOnly';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'flashcards' | 'solve';
  flashcards?: { front: string; back: string }[];
  topic?: string;
}

type Subject = 'circuits' | 'math';

const CIRCUIT_QUESTIONS = [
  "Explain Ohm's Law with a practical example",
  "What is KVL and how do I apply it?",
  "How do I find Thevenin equivalent resistance?",
  "Explain capacitor charging with time constant",
  "When should I use nodal vs mesh analysis?",
  "What is maximum power transfer theorem?",
];

const MATH_QUESTIONS = [
  "What are level sets and how do I find them?",
  "How do I compute partial derivatives of f(x,y) = x²y + sin(xy)?",
  "Explain Euler's formula e^(ix) = cos x + i sin x",
  "How do I find eigenvalues and classify critical points?",
  "Find the Taylor polynomial T₃ for e^x at x₀ = 0",
  "What is the radius of convergence and how do I find it?",
];

const MATH_MODULE_QUICK_QUESTIONS: Record<string, string[]> = {
  "Module 1": [
    "What is a level set? Give an example.",
    "How do I show a limit doesn't exist in 2D?",
    "Compute the gradient of f(x,y,z) = xyz",
    "When does total differentiability imply continuity?",
  ],
  "Module 2": [
    "Find eigenvalues of A = [[2,1],[1,2]]",
    "What is positive definiteness and why does it matter?",
    "Classify the critical points of f(x,y) = x³ - 3x + y²",
    "How does the Hessian relate to eigenvalues?",
  ],
  "Module 3": [
    "Prove Euler's formula using power series",
    "Convert z = -1 - i to polar form",
    "Find all cube roots of 8i",
    "Why is the complex logarithm multi-valued?",
  ],
  "Module 4": [
    "Find T₂ for ln(x) at x₀ = 1",
    "How do I bound the Taylor remainder?",
    "What is the error when approximating e^0.5 with T₃?",
    "Why is there a 1/k! in the Taylor formula?",
  ],
  "Module 5": [
    "Find the radius of convergence for Σ n·xⁿ",
    "Can I differentiate a power series term-by-term?",
    "Check the endpoints for Σ xⁿ/n",
    "How are Taylor series and power series connected?",
  ],
  "Module 6": [
    "Compute ∫ x·eˣ dx using integration by parts",
    "Evaluate lim_{x→0} (1 - cos x)/x² using L'Hôpital",
    "Decompose 1/[(x-1)(x+2)] using partial fractions",
    "When does L'Hôpital's rule apply?",
  ],
};

// Detect if a question is math-related
function isMathQuestion(q: string): boolean {
  const lower = q.toLowerCase();
  return /(partial derivative|gradient|hessian|level set|limit.*variable|limit.*several|eigenvalue|eigenvector|definite|convex|saddle|critical.*point|complex.*number|euler.*formula|e\^i|polar.*form|taylor|power.*series|radius.*convergence|integration|integral|integrat|l'hopital|lh[ôo]pital|substitution|partial.*fraction|by.*parts|riemann|maclaurin|matrix|matrices|determinant|arg\s|modulus|complex.*log|roots?.*unity|contour|directional|tangent.*plane|multivariable|∂|∇|∫|Σ|sin|cos|tan|ln\s|log\s|exp\s|e\^)/.test(lower);
}

function AITutor() {
  const { isAuthenticated } = useAuth();
  const [subject, setSubject] = useState<Subject>('circuits');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isAuthenticated
        ? "Hello! I'm your AI Tutor powered by Kimi. I can help with **DC Circuit Analysis** and **University Mathematics** (multivariable calculus, linear algebra, complex functions, Taylor series, power series, and integration). Ask me anything!"
        : "Hello! I'm your AI Tutor. Ask me about DC circuits or university math — I cover multivariable calculus, linear algebra, complex functions, Taylor series, power series, and integration. **Sign in to unlock enhanced Kimi AI responses.**",
      type: 'chat',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'flashcards' | 'solve'>('chat');
  const [activeMathModule, setActiveMathModule] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // tRPC mutations — circuit
  const askMutation = trpc.ai.ask.useMutation();
  const flashcardsMutation = trpc.ai.generateFlashcards.useMutation();
  const solveMutation = trpc.ai.solveProblem.useMutation();
  const quickChatMutation = trpc.ai.quickChat.useMutation();

  // tRPC mutations — math
  const mathAskMutation = trpc.math.ask.useMutation();
  const mathTutorMutation = trpc.math.tutor.useMutation();
  const mathExplainMutation = trpc.math.explain.useMutation();

  // Streaming AI
  const aiStream = useAiStream();
  const [streamConvId, setStreamConvId] = useState<number | undefined>();
  const streamingMsgId = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  // Update streaming message in-place
  useEffect(() => {
    if (aiStream.isStreaming && aiStream.content && streamingMsgId.current) {
      const msgId = streamingMsgId.current;
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, content: aiStream.content } : m
      ));
      scrollToBottom();
    }
  }, [aiStream.content, aiStream.isStreaming]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || aiStream.isStreaming) return;

    const text = input.trim();
    const isMath = subject === 'math' || isMathQuestion(text);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      type: mode,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Authenticated chat mode → use streaming
    if (isAuthenticated && mode === 'chat') {
      const assistantId = `stream-${Date.now()}`;
      streamingMsgId.current = assistantId;
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        type: 'chat',
      }]);

      aiStream.send(text, {
        subject: isMath ? 'math' : 'circuits',
        conversationId: streamConvId,
        onDone: (_fullContent, convId) => {
          streamingMsgId.current = null;
          setStreamConvId(convId);
        },
        onError: () => {
          streamingMsgId.current = null;
          setMessages(prev => prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content || "I'm sorry, I encountered an error. Please try again." }
              : m
          ));
        },
      });
      return;
    }

    // Non-streaming paths (unauthenticated, or flashcards/solve modes)
    setIsLoading(true);

    try {
      let response = "";
      let flashcards: { front: string; back: string }[] | undefined;
      let topic = "";

      if (isAuthenticated) {
        // Authenticated but non-chat mode (flashcards/solve) — use tRPC
        if (isMath) {
          const result = await mathTutorMutation.mutateAsync({ message: text });
          response = result.response.content;
          topic = result.topic;
        } else {
          const result = await quickChatMutation.mutateAsync({ message: text });
          response = result.response.content;
        }
      } else {
        // Public endpoints for unauthenticated users
        if (isMath) {
          if (mode === 'flashcards') {
            const result = await mathExplainMutation.mutateAsync({ concept: text, level: 'intermediate' });
            response = result.response;
            topic = result.topic;
          } else if (mode === 'solve') {
            const result = await mathAskMutation.mutateAsync({ question: `Solve this problem step by step: ${text}` });
            response = result.response;
            topic = result.topic;
          } else {
            const result = await mathAskMutation.mutateAsync({ question: text });
            response = result.response;
            topic = result.topic;
          }
        } else {
          if (mode === 'flashcards') {
            const result = await flashcardsMutation.mutateAsync({ topic: text, count: 5 });
            flashcards = result.flashcards;
            response = `Here are ${flashcards.length} flashcards on **${text}**: Click each card to flip it!`;
          } else if (mode === 'solve') {
            const result = await solveMutation.mutateAsync({ problem: text });
            response = result.solution;
          } else {
            const result = await askMutation.mutateAsync({ question: text });
            response = result.response;
          }
        }
      }

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        type: mode,
        flashcards,
        topic,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        type: mode,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, subject, mode, isAuthenticated, aiStream, streamConvId, askMutation, flashcardsMutation, solveMutation, quickChatMutation, mathAskMutation, mathTutorMutation, mathExplainMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  const handleSubjectChange = (s: Subject) => {
    setSubject(s);
    setActiveMathModule(null);
    setMessages([{
      id: `welcome-${s}`,
      role: 'assistant',
      content: s === 'circuits'
        ? "Switched to **DC Circuit Analysis**. Ask me about Ohm's Law, KVL, KCL, Thevenin/Norton, capacitors, inductors, transformers, and more!"
        : "Switched to **Math Tutor** (MathMentor). I cover all 6 modules: Multivariable Calculus, Linear Algebra, Complex Functions, Taylor Polynomials, Power Series, and Engineering Integration. Ask me anything!",
      type: 'chat',
    }]);
  };

  const currentSuggestions = subject === 'circuits'
    ? CIRCUIT_QUESTIONS
    : activeMathModule
      ? MATH_MODULE_QUICK_QUESTIONS[activeMathModule] || MATH_QUESTIONS
      : MATH_QUESTIONS;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-[#737373] hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold">AI Tutor</h1>
            <p className="text-[10px] text-[#737373]">
              {isAuthenticated ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                  Kimi AI — Circuits & Math
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#737373]" />
                  Sign in for Kimi AI power
                </span>
              )}
            </p>
          </div>

          {/* Subject Switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => handleSubjectChange('circuits')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                subject === 'circuits' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-[#737373] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Circuits</span>
            </button>
            <button
              onClick={() => handleSubjectChange('math')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                subject === 'math' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'text-[#737373] hover:text-white'
              }`}
            >
              <Sigma className="w-3 h-3" />
              <span className="hidden sm:inline">Math</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {([
              { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-3 h-3" /> },
              { id: 'flashcards', label: 'Flashcards', icon: <FlipHorizontal className="w-3 h-3" /> },
              { id: 'solve', label: 'Solve', icon: <Sparkles className="w-3 h-3" /> },
            ] as const).map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  mode === m.id ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'text-[#737373] hover:text-white'
                }`}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-[#3b82f6]/15' : msg.topic?.includes('Math') || msg.topic?.includes('Module') ? 'bg-[#10b981]/15' : 'bg-[#8b5cf6]/15'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-[#3b82f6]" /> :
                    msg.topic?.includes('Math') || msg.topic?.includes('Module') ? <Sigma className="w-3.5 h-3.5 text-[#10b981]" /> :
                    <Bot className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.topic && msg.role === 'assistant' && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[9px] mb-1 font-medium">
                      {msg.topic}
                    </span>
                  )}
                  <div className={`inline-block rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user' ? 'bg-[#3b82f6]/15 text-[#d4d4d4]' : 'bg-white/5 text-[#d4d4d4]'
                  }`}>
                    <div dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/```([\s\S]*?)```/g, '<pre class="mt-2 p-2 rounded-lg bg-black/30 text-[10px] font-mono overflow-x-auto"><code>$1</code></pre>')
                        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-[10px] font-mono">$1</code>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                  {msg.flashcards && (
                    <div className="mt-3 space-y-2">
                      {msg.flashcards.map((card, i) => (
                        <Flashcard key={i} front={card.front} back={card.back} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(isLoading || (aiStream.isStreaming && !aiStream.content)) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-[#8b5cf6] animate-spin" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 text-xs text-[#737373]">
                {isAuthenticated ? 'AI is thinking...' : 'Thinking...'}
              </div>
            </motion.div>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-6 space-y-4">
              {/* Subject selector pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSubjectChange('circuits')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                    subject === 'circuits' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' : 'bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-3 h-3" /> DC Circuits
                </button>
                <button
                  onClick={() => handleSubjectChange('math')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                    subject === 'math' ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]' : 'bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10'
                  }`}
                >
                  <Sigma className="w-3 h-3" /> Mathematics
                </button>
              </div>

              {/* Math module quick access */}
              {subject === 'math' && (
                <div>
                  <p className="text-[10px] text-[#737373] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Math Modules — click to explore
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.keys(MATH_MODULE_QUICK_QUESTIONS).map(mod => (
                      <button
                        key={mod}
                        onClick={() => setActiveMathModule(activeMathModule === mod ? null : mod)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                          activeMathModule === mod
                            ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                            : 'bg-white/5 text-[#a3a3a3] hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-[#737373] uppercase tracking-wider mb-2">
                {subject === 'math' ? 'Try asking about' : 'Try asking'}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#d4d4d4] hover:bg-white/10 hover:border-white/20 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              subject === 'math'
                ? mode === 'flashcards' ? "Enter a math topic (e.g., 'Taylor polynomials')..." : mode === 'solve' ? "Enter a math problem to solve..." : "Ask about multivariable calculus, linear algebra, complex functions, Taylor series, power series, integration..."
                : mode === 'flashcards' ? "Enter a topic (e.g., 'capacitors')..." : mode === 'solve' ? "Describe your circuit problem..." : "Ask me anything about DC circuits..."
            }
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-[#f6f6f6] placeholder-[#737373] outline-none resize-none min-h-[44px] max-h-[120px] focus:border-[#8b5cf6]/30"
            rows={1}
          />
          {aiStream.isStreaming ? (
            <button
              onClick={aiStream.abort}
              className="px-4 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-colors"
              title="Stop generating"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Flashcard({ front, back, index }: { front: string; back: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer"
    >
      <div className={`p-4 rounded-xl border transition-all ${
        flipped ? 'bg-[#10b981]/5 border-[#10b981]/20' : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-[#737373] font-mono">{flipped ? 'ANSWER' : 'QUESTION'}</span>
          <FlipHorizontal className="w-3 h-3 text-[#737373]" />
        </div>
        <p className="text-xs text-[#d4d4d4]">{flipped ? back : front}</p>
      </div>
    </motion.div>
  );
}

export default withClientOnly(AITutor);
