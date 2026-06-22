"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Headphones, ChevronLeft, Play, Pause, Square, SkipForward, SkipBack,
  Volume2, Gauge, BookOpen, Zap, Cpu, Lightbulb, Clock,
  ListMusic,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = [
    'Google US English', 'Google UK English Female', 'Google UK English Male',
    'Microsoft Zira', 'Microsoft David', 'Samantha', 'Daniel',
    'Karen', 'Moira', 'Tessa',
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  const english = voices.filter(v => v.lang.startsWith('en'));
  return english.find(v => !v.localService) || english[0] || voices[0];
}

interface SpeechTopic {
  id: string;
  title: string;
  category: string;
  duration: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

const topics: SpeechTopic[] = [
  {
    id: 'ohms-law',
    title: "Ohm's Law Explained",
    category: 'Fundamentals',
    duration: '2 min',
    color: '#3b82f6',
    icon: <Zap className="w-4 h-4" />,
    content: "Ohm's Law is the cornerstone of circuit analysis. It states that the voltage across a conductor is directly proportional to the current flowing through it. The formula is V equals I times R. Voltage equals current times resistance. This means if you know any two quantities, you can calculate the third. For example, a 12 volt battery across a 4 ohm resistor produces 3 amperes of current. Three equivalent forms exist: V equals I R for finding voltage, I equals V over R for current, and R equals V over I for resistance. The VIR triangle is a helpful memory aid. Cover the quantity you want to find, and the remaining two show you how to calculate it. Ohm's Law applies to ohmic materials at constant temperature. Most metals are ohmic, meaning their resistance stays constant regardless of voltage or current. However, components like diodes are non-ohmic because their resistance changes with applied voltage.",
  },
  {
    id: 'kvl',
    title: "Kirchhoff's Voltage Law",
    category: 'Fundamentals',
    duration: '2 min',
    color: '#f59e0b',
    icon: <BookOpen className="w-4 h-4" />,
    content: "Kirchhoff's Voltage Law, or KVL, is one of the two fundamental laws of circuit analysis. It states that the algebraic sum of all voltages around any closed loop in a circuit equals zero. In simpler terms, the total voltage rise equals the total voltage drop in any loop. Think of it like walking around a hilly circular track. No matter what path you take, when you return to your starting point, your net change in elevation is zero. KVL is essentially the conservation of energy principle applied to electrical circuits. Energy gained from sources must equal energy lost in loads. For a series circuit with a 12 volt battery and two resistors, the sum of voltage drops across both resistors must equal 12 volts. KVL combined with Ohm's Law provides a complete framework for analyzing any series circuit. When applying KVL, choose a direction around the loop -- clockwise or counterclockwise. Traverse each element and add voltages with appropriate signs: positive for voltage rises, negative for drops.",
  },
  {
    id: 'kcl',
    title: "Kirchhoff's Current Law",
    category: 'Fundamentals',
    duration: '2 min',
    color: '#10b981',
    icon: <BookOpen className="w-4 h-4" />,
    content: "Kirchhoff's Current Law, or KCL, states that the sum of currents entering any node equals the sum of currents leaving that node. Alternatively, the algebraic sum of all currents at a node is zero. This is the principle of conservation of charge applied to electrical circuits. Charge cannot accumulate at a point, so what flows in must flow out. Think of water pipes splitting at a junction -- the total water flowing into the junction equals the total flowing out. For example, if 5 amperes enters a node and splits into two branches, the branch currents must sum to 5 amperes. If one branch carries 2 amperes, the other must carry 3 amperes. KCL is the foundation for nodal analysis, a systematic method for solving complex circuits. It also explains how current divides in parallel circuits. The current divider formula states that current through a branch is inversely proportional to its resistance compared to other branches.",
  },
  {
    id: 'thevenin',
    title: 'Thevenin Theorem',
    category: 'Theorems',
    duration: '3 min',
    color: '#8b5cf6',
    icon: <Lightbulb className="w-4 h-4" />,
    content: "Thevenin's Theorem is one of the most powerful tools in circuit analysis. It states that any linear electrical network containing voltage sources, current sources, and resistances can be replaced by an equivalent circuit consisting of a single voltage source, V-th, in series with a single resistance, R-th. To find the Thevenin equivalent, you perform two calculations. First, to find V-th, remove the load and calculate the open-circuit voltage across the terminals where the load was connected. Second, to find R-th, deactivate all independent sources -- replace voltage sources with short circuits and current sources with open circuits -- then calculate the equivalent resistance looking into those same terminals. Thevenin's theorem is incredibly useful when you need to analyze how different loads affect a circuit. Instead of re-analyzing the entire circuit for each load, you find the Thevenin equivalent once, then simply attach different loads to it. The Norton equivalent uses a current source instead of a voltage source, but the resistance is identical.",
  },
  {
    id: 'capacitors',
    title: 'Capacitors and RC Circuits',
    category: 'Components',
    duration: '3 min',
    color: '#ef4444',
    icon: <Cpu className="w-4 h-4" />,
    content: "A capacitor is a passive component that stores energy in an electric field. It consists of two conductive plates separated by an insulating material called a dielectric. The fundamental relationship is Q equals C times V, where Q is charge in coulombs, C is capacitance in farads, and V is voltage. The current through a capacitor is given by I equals C times dV over dt. This is crucial: current only flows when the voltage across the capacitor is changing. At DC steady state, where voltage is constant, a capacitor acts as an open circuit -- no current flows through it. The energy stored in a capacitor is W equals one half C V squared. In RC circuits, the time constant tau equals R times C. This determines how quickly the capacitor charges or discharges. After one time constant, the capacitor reaches about 63 percent of its final voltage. After five time constants, it's over 99 percent charged and we consider the transient complete. The charging equation is V of t equals V-final times the quantity 1 minus e to the minus t over tau. The discharging equation is V of t equals V-zero times e to the minus t over tau.",
  },
  {
    id: 'inductors',
    title: 'Inductors and RL Circuits',
    category: 'Components',
    duration: '3 min',
    color: '#ec4899',
    icon: <Cpu className="w-4 h-4" />,
    content: "An inductor is a passive component that stores energy in a magnetic field. It typically consists of a coil of wire. The voltage across an inductor is V equals L times dI over dt, where L is inductance in henries. This means the voltage depends on how fast the current changes. At DC steady state, where current is constant, an inductor acts as a short circuit -- zero voltage across it. The energy stored is W equals one half L I squared. A crucial property: the current through an inductor cannot change instantaneously. That would require infinite voltage, which is physically impossible. In RL circuits, the time constant tau equals L over R. After one tau, current reaches about 63 percent of its final value. The current growth equation is I of t equals I-final times the quantity 1 minus e to the minus t over tau. Inductors oppose changes in current through self-inductance. When current tries to increase, the inductor generates a back EMF opposing that increase. When current tries to decrease, the inductor generates a forward EMF trying to maintain it.",
  },
  {
    id: 'transformers',
    title: 'Transformers',
    category: 'Components',
    duration: '2 min',
    color: '#06b6d4',
    icon: <Zap className="w-4 h-4" />,
    content: "A transformer is a device that transfers electrical energy between two or more circuits through electromagnetic induction. It consists of two coils -- primary and secondary -- wound around a shared magnetic core. The turns ratio a equals N-p over N-s, which equals V-p over V-s. In a step-up transformer, the secondary has more turns than the primary, increasing the voltage. In a step-down transformer, the secondary has fewer turns, decreasing the voltage. Importantly, transformers only work with alternating current -- they require a changing magnetic field to induce voltage in the secondary coil. With DC, there's no changing field, so no energy transfer occurs. Current transforms inversely with voltage: I-s equals I-p times the turns ratio. Power is ideally conserved: V-p times I-p approximately equals V-s times I-s. The reflected impedance formula is Z-p equals a squared times Z-s. Transformers are essential in power distribution systems, allowing efficient long-distance transmission at high voltages and safe consumer voltages.",
  },
  {
    id: 'superposition',
    title: 'Superposition Theorem',
    category: 'Theorems',
    duration: '2 min',
    color: '#14b8a6',
    icon: <Lightbulb className="w-4 h-4" />,
    content: "The Superposition Theorem states that in a linear circuit containing multiple independent sources, the voltage across or current through any element is the algebraic sum of the voltages or currents produced by each source acting independently. To apply superposition, consider one source at a time while deactivating all others. Replace voltage sources with short circuits and current sources with open circuits. Calculate the contribution from the active source, then repeat for each source. Finally, algebraically sum all contributions. Superposition only works for linear circuits -- circuits with linear elements like resistors, capacitors, and inductors. A critical limitation: superposition applies to voltage and current, but NOT to power. Power is a quadratic function of current -- P equals I squared R. Squaring a sum is not the same as summing squares. For example, if two sources each produce 2 amperes through a resistor, the total current is 4 amperes, but power is 16 I-squared-R, not 4 plus 4 equals 8 I-squared-R. Despite this limitation, superposition remains a powerful analysis tool, especially for circuits with many sources.",
  },
  {
    id: 'mars-orbiter',
    title: 'The Mars Climate Orbiter',
    category: 'Case Study',
    duration: '1 min',
    color: '#f97316',
    icon: <Gauge className="w-4 h-4" />,
    content: "The Mars Climate Orbiter was a 327 million dollar NASA mission launched in 1998. In September 1999, as the spacecraft approached Mars, it fired its main engine to enter orbit. But something went terribly wrong. The spacecraft passed 56 kilometers closer to Mars than planned -- too close for survival. It entered the atmosphere and disintegrated. The root cause? A unit mismatch. One engineering team used English units -- pound-force seconds -- while another used metric units -- newton-seconds. The conversion factor between these units is approximately 4.45. This tiny error in the impulse calculation meant the spacecraft's trajectory was off by hundreds of kilometers. The incident became a legendary lesson in engineering: always include units in every calculation. Verify unit consistency across all interfaces. The spacecraft's own software detected the anomaly but was programmed to trust the ground controllers' input. The orbiter was destroyed. No human lives were lost, but 327 million dollars and years of scientific work vanished.",
  },
];

const categories = ['All', ...Array.from(new Set(topics.map(t => t.category)))];

const VISUALIZER_BARS = Array.from({ length: 32 }, (_, i) => ({
  height: 20 + ((Math.sin(i * 1.7 + 3) * 0.5 + 0.5) * 40),
  duration: 0.4 + ((Math.sin(i * 2.3 + 7) * 0.5 + 0.5) * 0.4),
}));

export default function Chronos() {
  const [selectedTopic, setSelectedTopic] = useState<SpeechTopic>(topics[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [filter, setFilter] = useState('All');
  const [elapsed, setElapsed] = useState(0);
  const [activeUtterance, setActiveUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addToast } = useToast();

  const filteredTopics = filter === 'All' ? topics : topics.filter(t => t.category === filter);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
  }, [stopTimer]);

  const speak = useCallback((topic: SpeechTopic) => {
    if (!('speechSynthesis' in window)) {
      addToast('Text-to-speech not supported in this browser', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(topic.content);
    utter.rate = rate;
    utter.pitch = 1;
    utter.volume = 1;
    const voice = getBestVoice();
    if (voice) utter.voice = voice;
    const words = topic.content.split(/\s+/);
    const totalWords = words.length;
    utter.onboundary = (e) => {
      if (e.name === 'word') {
        const charIdx = e.charIndex;
        let wordIdx = 0;
        let pos = 0;
        for (let i = 0; i < words.length; i++) {
          if (pos >= charIdx) { wordIdx = i; break; }
          pos += words[i].length + 1;
        }
        setSpokenWordIndex(wordIdx);
        setProgress(Math.min(100, Math.round((wordIdx / totalWords) * 100)));
      }
    };
    utter.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setSpokenWordIndex(-1);
      setProgress(0);
      startTimer();
    };
    utter.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setSpokenWordIndex(-1);
      setProgress(100);
      stopTimer();
    };
    utter.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
      stopTimer();
    };
    utter.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
      startTimer();
    };
    utter.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setSpokenWordIndex(-1);
      setProgress(0);
      stopTimer();
    };
    setActiveUtterance(utter);
    window.speechSynthesis.speak(utter);
  }, [rate, addToast, startTimer, stopTimer]);

  const handlePlay = () => {
    if (isPaused && activeUtterance) {
      window.speechSynthesis.resume();
    } else {
      speak(selectedTopic);
      setElapsed(0);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setSpokenWordIndex(-1);
    setProgress(0);
    stopTimer();
    setElapsed(0);
  };

  const handleTopicSelect = (topic: SpeechTopic) => {
    handleStop();
    setSelectedTopic(topic);
    setTimeout(() => speak(topic), 100);
  };

  const handleSkipForward = () => {
    const idx = topics.findIndex(t => t.id === selectedTopic.id);
    const next = topics[(idx + 1) % topics.length];
    handleTopicSelect(next);
  };

  const handleSkipBack = () => {
    const idx = topics.findIndex(t => t.id === selectedTopic.id);
    const prev = topics[(idx - 1 + topics.length) % topics.length];
    handleTopicSelect(prev);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopTimer();
    };
  }, [stopTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-[#737373] hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-[#8b5cf6]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Chronos</h1>
          <p className="text-xs text-[#737373]">Interactive audio learning for DC circuits</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Topic List */}
        <div className="md:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  filter === cat ? 'bg-white/10 text-white' : 'text-[#737373] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topic Cards */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredTopics.map((topic, i) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedTopic.id === topic.id
                    ? 'bg-white/10 border border-white/10'
                    : 'bg-white/[0.02] border border-transparent hover:bg-white/5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                >
                  {topic.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{topic.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                    <span>{topic.category}</span>
                    <span className="text-[#525252]">|</span>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{topic.duration}</span>
                  </div>
                </div>
                {selectedTopic.id === topic.id && isPlaying && (
                  <div className="flex items-end gap-[2px] h-3">
                    {[0, 1, 2, 3].map(b => (
                      <motion.div
                        key={b}
                        className="w-[2px] rounded-full"
                        style={{ backgroundColor: topic.color }}
                        animate={{ height: ['4px', '12px', '4px'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: b * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Player + Content */}
        <div className="md:col-span-3 space-y-4">
          {/* Player Card */}
          <div className="glass-panel rounded-2xl p-6">
            {/* Visualizer */}
            <div className="flex items-center justify-center h-20 mb-4">
              {isPlaying ? (
                <div className="flex items-end gap-[3px] h-16">
                  {VISUALIZER_BARS.map((bar, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full"
                      style={{ backgroundColor: selectedTopic.color }}
                      animate={{
                        height: ['12px', `${bar.height}px`, '12px'],
                      }}
                      transition={{
                        duration: bar.duration,
                        repeat: Infinity,
                        delay: i * 0.02,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-end gap-[3px] h-16 opacity-30">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-white/20"
                      style={{ height: `${8 + Math.sin(i * 0.5) * 6 + 6}px` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Topic Info */}
            <div className="text-center mb-4">
              <h2 className="text-sm font-semibold mb-1">{selectedTopic.title}</h2>
              <p className="text-[10px] text-[#737373]">{selectedTopic.category} &middot; {formatTime(elapsed)}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 rounded-full bg-white/5 mb-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: selectedTopic.color }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={handleSkipBack}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handleStop}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#737373] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
              >
                <Square className="w-4 h-4" />
              </button>
              {isPlaying ? (
                <button
                  onClick={handlePause}
                  className="p-4 rounded-2xl text-white transition-all"
                  style={{ backgroundColor: selectedTopic.color }}
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="p-4 rounded-2xl text-white transition-all"
                  style={{ backgroundColor: selectedTopic.color }}
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              )}
              <button
                onClick={handleSkipForward}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#737373] hover:text-white hover:bg-white/10 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-3 h-3 text-[#525252]" />
              <span className="text-[10px] text-[#737373]">Speed:</span>
              {[0.5, 0.75, 1.0, 1.25, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => { setRate(s); if (isPlaying) speak(selectedTopic); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    Math.abs(rate - s) < 0.01
                      ? 'bg-white/10 text-white'
                      : 'text-[#737373] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Content Transcript */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ListMusic className="w-4 h-4 text-[#737373]" />
              <h3 className="text-xs font-semibold">Transcript</h3>
            </div>
            <p className="text-xs leading-relaxed">
              {selectedTopic.content.split(/\s+/).map((word, i) => (
                <span
                  key={i}
                  className={`transition-colors duration-150 ${
                    spokenWordIndex >= 0 && i <= spokenWordIndex
                      ? 'text-[#f6f6f6]'
                      : 'text-[#a3a3a3]'
                  }${i === spokenWordIndex ? ' font-medium' : ''}`}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>

          {/* Info Card */}
          {(typeof window === 'undefined' || !('speechSynthesis' in window)) && (
            <div className="glass-panel rounded-xl p-4 bg-[#f59e0b]/5 border-[#f59e0b]/20">
              <p className="text-[10px] text-[#f59e0b]">
                Your browser does not support text-to-speech. Try Chrome, Edge, or Safari for the full audio experience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
