import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '@/providers/trpc';
import {
  Mic, MicOff, Send, ChevronLeft, Volume2, VolumeX,
  Settings, X, Radio, Play, CircleUser, Sparkles,
  Keyboard, Headphones, Zap, AlertTriangle, RefreshCw, Trash2, Lock,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface Msg { id: string; role: 'user' | 'assistant'; text: string }

interface VoiceSettings {
  rate: number;
  pitch: number;
  voiceURI: string;
}

const QUICK_PROMPTS = [
  "Explain Ohm's Law",
  "What is KVL?",
  "How do capacitors work?",
  "Tell me about Thevenin",
  "What is KCL?",
  "Explain transformers",
];

// ─── Component ──────────────────────────────────────────
export default function VoiceAI() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({ rate: 1.0, pitch: 1.0, voiceURI: '' });
  const [liveTranscript, setLiveTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // tRPC mutation for AI responses
  const askMutation = trpc.ai.ask.useMutation();
  const quickChatMutation = trpc.ai.quickChat.useMutation();

  // Load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        const en = v.filter(x => x.lang.startsWith('en'));
        const best = en.find(x => /Google|Apple|Samantha|Daniel/.test(x.name)) || en[0] || v[0];
        setSettings(s => ({ ...s, voiceURI: best?.voiceURI || '' }));
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // Check mic availability (non-blocking)
  useEffect(() => {
    const hasAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setMicAvailable(hasAPI);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ─── TTS ───
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === settings.voiceURI);
    if (voice) u.voice = voice;
    u.rate = settings.rate;
    u.pitch = settings.pitch;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [voices, settings]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // ─── Send message ───
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const userText = text.trim();
    setInput('');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      let response: string;

      if (isAuthenticated) {
        // Use real Kimi API
        const result = await quickChatMutation.mutateAsync({ message: userText });
        response = result.response.content;
      } else {
        // Use public endpoint
        const result = await askMutation.mutateAsync({ question: userText });
        response = result.response;
      }

      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: response }]);
      speak(response);
    } catch {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: "I'm sorry, I encountered an error. Please try again in a moment.",
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isAuthenticated, quickChatMutation, askMutation, speak]);

  // ─── Voice recognition ───
  const startListening = useCallback(async () => {
    const API = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!API) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicAvailable(false);
      return;
    }
    const rec = new API();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => { setIsListening(true); setLiveTranscript(''); };
    rec.onresult = (e: any) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
      }
      setLiveTranscript(txt);
    };
    rec.onend = () => {
      setIsListening(false);
      if (liveTranscript.trim()) {
        sendMessage(liveTranscript);
        setLiveTranscript('');
      }
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, [sendMessage, liveTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clearChat = useCallback(() => {
    stopSpeaking();
    stopListening();
    setMessages([]);
    setLiveTranscript('');
  }, [stopSpeaking, stopListening]);

  // ─── Demo conversation ───
  const startDemo = useCallback(() => {
    clearChat();
    const demo: Msg[] = [
      { id: 'd1', role: 'user', text: "Explain Ohm's Law" },
      { id: 'd2', role: 'assistant', text: "Ohm's Law is the foundation of circuit analysis: V equals I times R. Voltage equals current times resistance. If you have a 12V battery across a 4 ohm resistor, the current is 3 amps. The three forms are V equals IR, I equals V over R, and R equals V over I." },
      { id: 'd3', role: 'user', text: "What about capacitors?" },
      { id: 'd4', role: 'assistant', text: "A capacitor stores energy in an electric field. The current is I equals C times dV over dt — current only flows when voltage changes. At DC steady state, a capacitor acts as an open circuit. The time constant tau equals RC. After five tau, it's 99.3 percent charged." },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= demo.length) { clearInterval(interval); return; }
      setMessages(prev => [...prev, demo[i]]);
      if (demo[i].role === 'assistant') speak(demo[i].text);
      i++;
    }, 1500);
  }, [clearChat, speak]);

  // ─── Render ───
  const hasTTS = 'speechSynthesis' in window;
  const currentVoice = voices.find(v => v.voiceURI === settings.voiceURI);

  return (
    <div className="min-h-screen flex flex-col bg-[#060606]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-[#737373] hover:text-white transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-[#ec4899]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold">Voice AI Tutor</h1>
            <p className="text-[10px] text-[#737373] truncate">
              {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : isProcessing ? 'Thinking...' : 'Type or speak to chat'}
            </p>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-1 text-[10px] text-[#10b981]">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Kimi AI</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-[#737373]">
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">Sign in for AI</span>
            </div>
          )}
          <button onClick={() => setShowSettings(s => !s)} className="p-2 rounded-lg bg-white/5 text-[#737373] hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 rounded-lg bg-white/5 text-[#737373] hover:text-[#ef4444] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6">
                <div className="w-20 h-20 rounded-3xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center mb-4 mx-auto">
                  <Headphones className="w-10 h-10 text-[#ec4899]" />
                </div>
                <h2 className="text-base font-semibold mb-1">Voice AI Tutor</h2>
                <p className="text-xs text-[#737373] max-w-xs mb-4">
                  Ask questions about DC circuits and hear spoken answers. Type below or use your microphone.
                  {isAuthenticated ? ' Powered by Kimi AI.' : ' Sign in to unlock Kimi AI power.'}
                </p>

                {/* Mic status */}
                <div className="flex items-center gap-2 justify-center mb-4">
                  <span className={`w-2 h-2 rounded-full ${micAvailable ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
                  <span className="text-[10px] text-[#737373]">
                    {micAvailable === null ? 'Checking...' : micAvailable ? 'Microphone ready' : 'Text input mode'}
                  </span>
                </div>

                {/* Start buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {hasTTS && (
                    <button
                      onClick={() => speak("Hello! I'm your voice circuit tutor. Ask me anything about DC circuits, Ohm's Law, KVL, KCL, or any topic you're studying.")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ec4899]/15 border border-[#ec4899]/30 text-xs text-[#ec4899] hover:bg-[#ec4899]/25 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Test Voice
                    </button>
                  )}
                  <button
                    onClick={startDemo}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#d4d4d4] hover:bg-white/10 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" /> Demo Chat
                  </button>
                </div>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#a3a3a3] hover:bg-white/10 hover:text-white transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      m.role === 'user' ? 'bg-[#3b82f6]/15' : 'bg-[#ec4899]/15'
                    }`}>
                      {m.role === 'user' ? <CircleUser className="w-3.5 h-3.5 text-[#3b82f6]" /> : <Sparkles className="w-3.5 h-3.5 text-[#ec4899]" />}
                    </div>
                    <div className={`max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        m.role === 'user' ? 'bg-[#3b82f6]/15 text-[#d4d4d4]' : 'bg-white/5 text-[#d4d4d4]'
                      }`}>
                        {m.text}
                      </div>
                      {/* TTS replay button for assistant messages */}
                      {m.role === 'assistant' && hasTTS && (
                        <button
                          onClick={() => speak(m.text)}
                          className="ml-2 mt-1 p-1 rounded-md bg-white/5 text-[#525252] hover:text-[#ec4899] transition-colors inline-flex"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Live transcript */}
              {isListening && liveTranscript && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#10b981]/15 flex items-center justify-center shrink-0">
                    <Mic className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
                  </div>
                  <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-2xl px-4 py-3 text-xs text-[#d4d4d4]">
                    {liveTranscript}
                    <span className="inline-block w-1.5 h-3.5 bg-[#10b981] ml-1 animate-pulse" />
                  </div>
                </motion.div>
              )}

              {/* Processing */}
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#ec4899]/15 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 text-[#ec4899] animate-spin" />
                  </div>
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-xs text-[#737373]">
                    {isAuthenticated ? 'Kimi AI is thinking...' : 'Thinking...'}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Mic warning (non-intrusive) */}
        {micAvailable === false && messages.length === 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/15">
              <AlertTriangle className="w-3 h-3 text-[#f59e0b] shrink-0" />
              <p className="text-[10px] text-[#f59e0b]">
                Microphone not available — use text input below. For voice features, open in Chrome or Safari.
              </p>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm px-4 py-3 shrink-0">
          <div className="flex items-end gap-2">
            {/* Mic button */}
            {micAvailable && (
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`p-3 rounded-xl transition-all shrink-0 ${
                  isListening
                    ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20'
                    : 'bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10'
                }`}
              >
                {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder={micAvailable ? "Type or tap mic..." : "Type your question..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-[#f6f6f6] placeholder-[#737373] outline-none resize-none min-h-[44px] max-h-[100px] focus:border-[#ec4899]/30"
                rows={1}
              />
              {input && (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isProcessing}
                  className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-[#ec4899] hover:bg-[#db2777] disabled:opacity-30 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stop speaking */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors shrink-0 animate-pulse"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status line */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {hasTTS && (
                <span className="text-[9px] text-[#525252] flex items-center gap-1">
                  <Volume2 className="w-2.5 h-2.5" />
                  {currentVoice?.name?.split(' ').slice(0, 2).join(' ') || 'Default'}
                </span>
              )}
              {micAvailable && (
                <span className="text-[9px] text-[#525252] flex items-center gap-1">
                  <Keyboard className="w-2.5 h-2.5" />
                  {isListening ? 'Listening' : 'Mic ready'}
                </span>
              )}
            </div>
            {messages.length > 0 && (
              <button onClick={startDemo} className="text-[9px] text-[#525252] hover:text-[#ec4899] transition-colors flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Replay demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Voice Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-[#737373] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Voice */}
              <div>
                <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-2 block">Voice</label>
                <select
                  value={settings.voiceURI}
                  onChange={e => setSettings(s => ({ ...s, voiceURI: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#f6f6f6] outline-none"
                >
                  {voices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI} className="bg-[#1a1a1a]">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed */}
              <div>
                <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-2 block">Speed: {settings.rate.toFixed(1)}x</label>
                <input type="range" min={0.5} max={2} step={0.1} value={settings.rate}
                  onChange={e => setSettings(s => ({ ...s, rate: parseFloat(e.target.value) }))}
                  className="w-full accent-[#ec4899]" />
              </div>

              {/* Pitch */}
              <div>
                <label className="text-[10px] text-[#737373] uppercase tracking-wider mb-2 block">Pitch: {settings.pitch.toFixed(1)}</label>
                <input type="range" min={0.5} max={2} step={0.1} value={settings.pitch}
                  onChange={e => setSettings(s => ({ ...s, pitch: parseFloat(e.target.value) }))}
                  className="w-full accent-[#ec4899]" />
              </div>

              {/* Test */}
              <button
                onClick={() => speak("Hello! I'm your voice circuit tutor, ready to help you learn DC circuits.")}
                className="w-full py-2.5 rounded-xl bg-[#ec4899]/15 border border-[#ec4899]/30 text-xs text-[#ec4899] hover:bg-[#ec4899]/25 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Test Voice
              </button>

              {/* Capabilities */}
              <div className="pt-3 border-t border-white/5 space-y-1.5">
                {[
                  { label: 'Speech Synthesis', ok: hasTTS },
                  { label: 'Microphone', ok: micAvailable === true },
                  { label: 'Recognition API', ok: micAvailable !== null },
                  { label: 'Kimi AI Backend', ok: isAuthenticated },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-[#737373]">{c.label}</span>
                    <span className={c.ok ? 'text-[#10b981]' : 'text-[#737373]'}>{c.ok ? 'Ready' : 'Unavailable'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
