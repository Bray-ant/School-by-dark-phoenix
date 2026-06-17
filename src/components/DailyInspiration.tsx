"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  getTodaysQuote,
  getTodaysChallenge,
  getDateString,
  disciplineColors,
  type Quote,
  type DailyChallenge,
} from '../data/dailyInspirationData';
import {
  Quote as QuoteIcon,
  Lightbulb,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  BookOpen,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyInspiration() {
  const todayQuote: Quote = getTodaysQuote();
  const todayChallenge: DailyChallenge = getTodaysChallenge();
  const todayDate = getDateString();

  const [showReflection, setShowReflection] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showChallengeAnswer, setShowChallengeAnswer] = useState(false);
  const [quoteFlipped, setQuoteFlipped] = useState(false);

  const disciplineColor = disciplineColors[todayQuote.discipline];

  return (
    <section className="py-16 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-xs font-mono text-[#f59e0b] inline-flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3 h-3" />
            DAILY INSPIRATION
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Nurture Your <span className="text-gradient">Intellect</span>
          </h2>
          <p className="text-sm text-[#737373] max-w-lg mx-auto">
            A daily dose of wisdom from history&apos;s greatest mathematical and scientific minds,
            paired with a reflection and a small challenge to sharpen your thinking.
          </p>
        </motion.div>

        {/* Date Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="h-px flex-1 max-w-[100px] bg-white/10" />
          <span className="text-xs font-mono text-[#737373] uppercase tracking-widest">
            {todayDate}
          </span>
          <div className="h-px flex-1 max-w-[100px] bg-white/10" />
        </motion.div>

        {/* Main Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <div
            className="glass-panel rounded-2xl p-6 md:p-8 border-l-4"
            style={{ borderLeftColor: disciplineColor }}
          >
            {/* Discipline Badge */}
            <div className="flex items-center justify-between mb-6">
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium"
                style={{
                  backgroundColor: `${disciplineColor}15`,
                  color: disciplineColor,
                  border: `1px solid ${disciplineColor}30`,
                }}
              >
                {todayQuote.discipline}
                {todayQuote.year && ` • ${todayQuote.year}`}
              </span>
              <button
                onClick={() => setQuoteFlipped(!quoteFlipped)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-[#737373] hover:text-white transition-colors"
              >
                {quoteFlipped ? <BookOpen className="w-3 h-3" /> : <QuoteIcon className="w-3 h-3" />}
                {quoteFlipped ? 'Quote' : 'About Author'}
              </button>
            </div>

            {/* Quote / Author Bio Toggle */}
            <AnimatePresence mode="wait">
              {!quoteFlipped ? (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <QuoteIcon
                    className="w-8 h-8 mb-4 opacity-20"
                    style={{ color: disciplineColor }}
                  />
                  <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6 text-[#f6f6f6]">
                    &ldquo;{todayQuote.text}&rdquo;
                  </blockquote>
                  <footer className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${disciplineColor}20`,
                        color: disciplineColor,
                      }}
                    >
                      {todayQuote.author.charAt(0)}
                    </div>
                    <div>
                      <cite className="text-sm font-medium not-italic text-[#e5e5e5]">
                        {todayQuote.author}
                      </cite>
                    </div>
                  </footer>
                </motion.div>
              ) : (
                <motion.div
                  key="bio"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{
                        backgroundColor: `${disciplineColor}15`,
                        color: disciplineColor,
                        border: `1px solid ${disciplineColor}30`,
                      }}
                    >
                      {todayQuote.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{todayQuote.author}</div>
                      <div className="text-[10px] font-mono" style={{ color: disciplineColor }}>
                        {todayQuote.discipline}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#d4d4d4] leading-relaxed">
                    {todayQuote.authorShortBio}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {todayQuote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-[#737373]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Reflection + Challenge Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setShowReflection(!showReflection)}
              className="w-full glass-panel rounded-2xl p-5 text-left hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-sm font-semibold">Reflection</span>
                </div>
                {showReflection ? (
                  <EyeOff className="w-3.5 h-3.5 text-[#737373]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-[#737373]" />
                )}
              </div>
              <AnimatePresence>
                {showReflection && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-[#d4d4d4] leading-relaxed mt-3"
                  >
                    {todayQuote.reflection}
                  </motion.p>
                )}
              </AnimatePresence>
              {!showReflection && (
                <p className="text-[10px] text-[#737373] mt-1">Click to reveal today&apos;s reflection</p>
              )}
            </button>
          </motion.div>

          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setShowChallenge(!showChallenge)}
              className="w-full glass-panel rounded-2xl p-5 text-left hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-sm font-semibold">Daily Challenge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#737373] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {todayChallenge.estimatedTime}
                  </span>
                  {showChallenge ? (
                    <EyeOff className="w-3.5 h-3.5 text-[#737373]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-[#737373]" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showChallenge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <p className="text-xs text-[#d4d4d4] leading-relaxed mb-3">
                      {todayChallenge.question}
                    </p>

                    {!showChallengeAnswer ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowChallengeAnswer(true);
                        }}
                        className="px-3 py-1.5 bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 text-[#8b5cf6] text-[10px] font-mono rounded-lg transition-colors"
                      >
                        Reveal Answer
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15">
                        <p className="text-xs font-mono text-[#10b981] mb-1">
                          ANSWER: {todayChallenge.answer}
                        </p>
                        <p className="text-[10px] text-[#d4d4d4] leading-relaxed">
                          {todayChallenge.explanation}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowChallengeAnswer(false);
                          }}
                          className="mt-2 flex items-center gap-1 text-[10px] text-[#737373] hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Hide
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showChallenge && (
                <p className="text-[10px] text-[#737373] mt-1">
                  {todayChallenge.category} • {todayChallenge.difficulty} difficulty
                </p>
              )}
            </button>
          </motion.div>
        </div>

        {/* Archive CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#f6f6f6] text-sm font-medium rounded-xl border border-white/10 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Browse Quote Archive
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
