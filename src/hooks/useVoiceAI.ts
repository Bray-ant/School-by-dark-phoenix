import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface VoiceAIState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  messages: VoiceMessage[];
  transcript: string;
  interimTranscript: string;
  error: string | null;
  permissionState: 'unknown' | 'granted' | 'denied';
  mode: 'push-to-talk' | 'hands-free';
  voice: SpeechSynthesisVoice | null;
  availableVoices: SpeechSynthesisVoice[];
  speechRate: number;
  speechPitch: number;
  volume: number;
  conversationId: string;
}

// Client-side knowledge base for voice AI responses
function generateVoiceResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('ohm')) return "Ohm's Law states that voltage equals current times resistance, or V equals I times R. This means if you have a 12 volt battery and a 4 ohm resistor, the current flowing through it is 3 amperes. The three forms are V equals I R, I equals V over R, and R equals V over I.";
  if (q.includes('kvl') || q.includes('kirchhoff') && q.includes('voltage')) return "Kirchhoff's Voltage Law, or KVL, states that the sum of all voltages around any closed loop equals zero. Think of it like walking around a circular track with hills. When you return to the start, your net elevation change is zero. Similarly, voltage rises equal voltage drops in any loop.";
  if (q.includes('kcl') || q.includes('kirchhoff') && q.includes('current')) return "Kirchhoff's Current Law, or KCL, states that the sum of currents entering a node equals the sum of currents leaving it. It's the principle of conservation of charge. What flows in must flow out. This is the foundation for nodal analysis.";
  if (q.includes('thevenin')) return "Thevenin's Theorem lets you replace any linear network with a single voltage source V-th in series with a resistance R-th. To find V-th, calculate the open-circuit voltage. To find R-th, turn off all independent sources and find the equivalent resistance.";
  if (q.includes('norton')) return "Norton's Theorem is the current-source counterpart to Thevenin. Any linear network equals a current source I-n in parallel with a resistance R-n. I-n is the short-circuit current, and R-n equals R-th from the Thevenin equivalent.";
  if (q.includes('capacitor')) return "A capacitor stores energy in an electric field. The current through a capacitor is I equals C times dV over dt. This means current only flows when the voltage is changing. At DC steady state, a capacitor acts as an open circuit. The time constant tau equals R times C. After five time constants, the capacitor is over 99 percent charged.";
  if (q.includes('inductor')) return "An inductor stores energy in a magnetic field. The voltage across it is V equals L times dI over dt. At DC steady state, an inductor acts as a short circuit. Importantly, the current through an inductor cannot change instantaneously. The time constant tau equals L over R.";
  if (q.includes('transformer')) return "A transformer transfers energy between coils through electromagnetic induction. The turns ratio equals N primary over N secondary, which equals V primary over V secondary. They only work with AC. Step-up transformers increase voltage, while step-down transformers decrease it.";
  if (q.includes('series')) return "In a series circuit, the same current flows through all components. The total resistance is the sum of individual resistances. R total equals R1 plus R2 plus R3 and so on. The voltage divider formula is V across a resistor equals V total times that resistance over R total.";
  if (q.includes('parallel')) return "In a parallel circuit, the same voltage appears across all branches. The reciprocal of total resistance equals the sum of reciprocals. One over R total equals one over R1 plus one over R2 plus one over R3. For just two resistors, R total equals R1 times R2 divided by R1 plus R2.";
  if (q.includes('superposition')) return "The Superposition Theorem says that in a linear circuit with multiple sources, you can analyze one source at a time while replacing others with their internal resistances. Then sum the results algebraically. Note, this only works for voltage and current, not power, since power is quadratic.";
  if (q.includes('maximum power') || q.includes('max power')) return "The Maximum Power Transfer Theorem states that maximum power is delivered to the load when the load resistance equals the Thevenin resistance. The maximum power equals V-th squared divided by 4 times R-th. However, this is only 50 percent efficient.";
  if (q.includes('mesh')) return "Mesh analysis applies Kirchhoff's Voltage Law around each independent loop in a circuit. You assign a mesh current to each loop, write KVL equations, and solve the system. This works well for planar circuits and gives you a systematic way to solve complex networks.";
  if (q.includes('nodal')) return "Nodal analysis applies Kirchhoff's Current Law at each node in a circuit, except the reference node. You express branch currents using Ohm's Law, write equations for each node voltage, and solve. Choose the node with the most connections as your reference ground.";
  if (q.includes('resistor color') || q.includes('color code')) return "The resistor color code uses four bands. First band is the first digit, second band is the second digit, third is the multiplier, and fourth is tolerance. Black is zero, brown is one, red is two, orange is three, yellow is four, green is five, blue is six, violet is seven, gray is eight, white is nine. Gold means plus or minus five percent tolerance.";
  if (q.includes('mars') || q.includes('orbiter')) return "The Mars Climate Orbiter was a 330 million dollar NASA mission that failed in 1999 due to a unit conversion error. One team used pound-force seconds while another used newton-seconds. The mismatch caused the spacecraft to enter Mars atmosphere at the wrong angle and disintegrate. Always check your units.";
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) return "Hello! I'm your voice circuit tutor. Ask me anything about DC circuits, Ohm's Law, Kirchhoff's laws, Thevenin equivalents, capacitors, inductors, or transformers. I'm here to help you learn.";
  if (q.includes('thank')) return "You're welcome! Feel free to ask me anything else about circuit analysis. I'm here to help you master DC circuits.";
  if (q.includes('delta') || q.includes('wye') || q.includes('y-') || q.includes('star')) return "Delta-to-Wye transformations are used when circuits cannot be reduced by simple series-parallel combinations. To convert Delta to Wye, each Wye resistor equals the product of the two adjacent Delta resistors divided by the sum of all three Delta resistors.";
  return "That's a great question about circuits. To give you the best answer, could you try rephrasing or ask about a specific topic like Ohm's Law, KVL, KCL, Thevenin's theorem, capacitors, inductors, or series and parallel circuits?";
}

export function useVoiceAI() {
  const [state, setState] = useState<VoiceAIState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    messages: [],
    transcript: '',
    interimTranscript: '',
    error: null,
    permissionState: 'unknown',
    mode: 'hands-free',
    voice: null,
    availableVoices: [],
    speechRate: 1.0,
    speechPitch: 1.0,
    volume: 1.0,
    conversationId: `voice-${Date.now()}`,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<typeof window.speechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef('');
  const isSpeakingRef = useRef(false);
  const interruptPendingRef = useRef(false);
  const conversationHistoryRef = useRef<{ role: string; text: string }[]>([]);

  // Initialize speech synthesis voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synthRef.current!.getVoices();
      if (voices.length > 0) {
        // Prefer English voices, especially high-quality ones
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const preferredVoice = englishVoices.find(v =>
          v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
        ) || englishVoices[0] || voices[0];

        setState(s => ({
          ...s,
          availableVoices: voices,
          voice: s.voice || preferredVoice,
        }));
      }
    };

    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Check microphone permission
  const checkPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setState(s => ({ ...s, permissionState: 'granted' }));
      return true;
    } catch {
      setState(s => ({ ...s, permissionState: 'denied', error: 'Microphone access denied' }));
      return false;
    }
  }, []);

  // Initialize audio context for visualization
  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    } catch (e) {
      console.warn('Audio context init failed:', e);
    }
  }, []);

  // Get frequency data for visualization
  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return new Uint8Array(0);
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  // Stop speaking (for barge-in)
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    isSpeakingRef.current = false;
    setState(s => ({ ...s, isSpeaking: false }));
  }, []);

  // Speak text with TTS
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !state.voice) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = state.voice;
    utter.rate = state.speechRate;
    utter.pitch = state.speechPitch;
    utter.volume = state.volume;

    utter.onstart = () => {
      isSpeakingRef.current = true;
      setState(s => ({ ...s, isSpeaking: true }));
    };
    utter.onend = () => {
      isSpeakingRef.current = false;
      setState(s => ({ ...s, isSpeaking: false }));
    };
    utter.onerror = () => {
      isSpeakingRef.current = false;
      setState(s => ({ ...s, isSpeaking: false }));
    };

    utteranceRef.current = utter;
    synthRef.current.speak(utter);
  }, [state.voice, state.speechRate, state.speechPitch, state.volume]);

  // Process user input and generate response
  const processInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input.trim(),
      timestamp: Date.now(),
      isFinal: true,
    };

    conversationHistoryRef.current.push({ role: 'user', text: input.trim() });

    setState(s => ({
      ...s,
      messages: [...s.messages, userMsg],
      isProcessing: true,
      transcript: '',
      interimTranscript: '',
    }));

    // Simulate processing delay for natural feel
    await new Promise(r => setTimeout(r, 400));

    // Generate response
    const response = generateVoiceResponse(input.trim());

    const assistantMsg: VoiceMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: response,
      timestamp: Date.now(),
      isFinal: true,
    };

    conversationHistoryRef.current.push({ role: 'assistant', text: response });

    setState(s => ({
      ...s,
      messages: [...s.messages, userMsg, assistantMsg],
      isProcessing: false,
    }));

    // Speak the response
    speak(response);
  }, [speak]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setState(s => ({ ...s, error: 'Speech recognition not supported in this browser' }));
      return;
    }

    // If AI is speaking, stop it (barge-in)
    if (isSpeakingRef.current) {
      stopSpeaking();
      interruptPendingRef.current = true;
      // Brief pause to let the user speak
      await new Promise(r => setTimeout(r, 200));
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(s => ({ ...s, isListening: true, error: null }));
      initAudioContext();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        setState(s => ({
          ...s,
          transcript: finalTranscriptRef.current,
          interimTranscript: interim,
        }));

        // Auto-process if hands-free mode
        if (state.mode === 'hands-free') {
          // Debounce: wait for pause then process
          processInput(finalTranscriptRef.current);
          finalTranscriptRef.current = '';
          setState(s => ({ ...s, transcript: '', interimTranscript: '' }));
        }
      } else {
        setState(s => ({
          ...s,
          interimTranscript: interim,
          transcript: finalTranscriptRef.current,
        }));
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setState(s => ({ ...s, error: 'Microphone access denied', isListening: false }));
      } else if (event.error === 'no-speech') {
        // No speech detected, restart in hands-free mode
        if (state.mode === 'hands-free') {
          try { recognition.start(); } catch { /* already started */ }
        }
      }
    };

    recognition.onend = () => {
      setState(s => ({ ...s, isListening: false }));
      // In hands-free mode, restart listening if not speaking
      if (state.mode === 'hands-free' && !isSpeakingRef.current) {
        try {
          recognition.start();
        } catch {
          // May have been manually stopped
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      setState(s => ({ ...s, error: 'Failed to start recognition' }));
    }
  }, [state.mode, stopSpeaking, processInput, initAudioContext]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState(s => ({ ...s, isListening: false, interimTranscript: '' }));

    // Process any remaining transcript
    if (finalTranscriptRef.current.trim()) {
      processInput(finalTranscriptRef.current);
      finalTranscriptRef.current = '';
    }
  }, [processInput]);

  // Toggle listening
  const toggleListening = useCallback(async () => {
    if (state.isListening) {
      stopListening();
    } else {
      const permitted = state.permissionState === 'granted' ? true : await checkPermission();
      if (permitted) {
        await startListening();
      }
    }
  }, [state.isListening, state.permissionState, stopListening, startListening, checkPermission]);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState(s => ({ ...s, voice }));
  }, []);

  // Set speech rate
  const setSpeechRate = useCallback((rate: number) => {
    setState(s => ({ ...s, speechRate: rate }));
  }, []);

  // Set mode
  const setMode = useCallback((mode: 'push-to-talk' | 'hands-free') => {
    setState(s => ({ ...s, mode }));
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    stopSpeaking();
    stopListening();
    finalTranscriptRef.current = '';
    conversationHistoryRef.current = [];
    setState(s => ({
      ...s,
      messages: [],
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, [stopSpeaking, stopListening]);

  // Send text message manually
  const sendText = useCallback((text: string) => {
    if (text.trim()) {
      processInput(text.trim());
    }
  }, [processInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSpeaking, stopListening]);

  return {
    ...state,
    checkPermission,
    startListening,
    stopListening,
    toggleListening,
    stopSpeaking,
    speak,
    setVoice,
    setSpeechRate,
    setMode,
    clearConversation,
    sendText,
    getFrequencyData,
  };
}
