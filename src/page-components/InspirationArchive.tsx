"use client";
import { useState, useMemo } from 'react';
import {
  quotes,
  disciplineColors,
  getAllAuthors,
  getAllDisciplines,
  searchQuotes,
  type Discipline,
} from '../data/dailyInspirationData';
import {
  Archive,
  Search,
  Quote,
  Filter,
  Users,
  Layers,
  Home,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InspirationArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | 'All'>('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const disciplines = getAllDisciplines();
  const authors = getAllAuthors();

  const filtered = useMemo(() => {
    let result = searchQuery.trim() ? searchQuotes(searchQuery) : [...quotes];
    if (selectedDiscipline !== 'All') {
      result = result.filter((q) => q.discipline === selectedDiscipline);
    }
    if (selectedAuthor !== 'All') {
      result = result.filter((q) => q.author === selectedAuthor);
    }
    return result;
  }, [searchQuery, selectedDiscipline, selectedAuthor]);

  const quoteCountsByDiscipline = useMemo(() => {
    const counts: Record<string, number> = {};
    quotes.forEach((q) => {
      counts[q.discipline] = (counts[q.discipline] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs">
          <a href="/" className="text-[#737373] hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
          </a>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <span className="text-[#f6f6f6]">Inspiration Archive</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center">
              <Archive className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Inspiration Archive</h1>
              <p className="text-sm text-[#737373]">
                Curated wisdom from mathematics, physics, philosophy, and beyond
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#737373]">
            <div className="flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>{quotes.length} Quotes</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>{authors.length} Authors</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{disciplines.length} Disciplines</span>
            </div>
          </div>
        </motion.div>

        {/* Discipline Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDiscipline('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedDiscipline === 'All'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-[#737373] hover:text-white hover:bg-white/10'
              }`}
            >
              All Disciplines ({quotes.length})
            </button>
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() =>
                  setSelectedDiscipline(selectedDiscipline === d ? 'All' : d)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedDiscipline === d
                    ? 'text-white'
                    : 'bg-white/5 border-white/5 text-[#737373] hover:text-white hover:bg-white/10'
                }`}
                style={
                  selectedDiscipline === d
                    ? {
                        backgroundColor: `${disciplineColors[d]}20`,
                        borderColor: `${disciplineColors[d]}50`,
                      }
                    : {}
                }
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: disciplineColors[d] }}
                />
                {d}
                <span className="ml-1 text-[#737373]">({quoteCountsByDiscipline[d] || 0})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search + Author Filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes, authors, or tags..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#f6f6f6] placeholder-[#737373] outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#f6f6f6] outline-none focus:border-white/20 transition-colors cursor-pointer"
            >
              <option value="All">All Authors</option>
              {authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#f59e0b]'
                  : 'bg-white/5 border-white/10 text-[#737373] hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-[#737373] font-mono uppercase tracking-wider mb-2">
                All Authors ({authors.length})
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
                {authors.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAuthor(selectedAuthor === a ? 'All' : a)}
                    className={`px-2 py-1 rounded-md text-[10px] transition-all ${
                      selectedAuthor === a
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-white/5 text-[#737373] border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#737373] font-mono">
            {filtered.length} QUOTE{filtered.length !== 1 ? 'S' : ''}
            {selectedDiscipline !== 'All' ? ` IN ${selectedDiscipline.toUpperCase()}` : ''}
          </span>
          {(selectedDiscipline !== 'All' || selectedAuthor !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDiscipline('All');
                setSelectedAuthor('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Quote Cards */}
        <div className="space-y-4">
          {filtered.map((q, index) => {
            const color = disciplineColors[q.discipline];
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div
                  className="glass-panel rounded-2xl p-5 md:p-6 border-l-4"
                  style={{ borderLeftColor: color }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {q.discipline}
                      </span>
                      {q.year && (
                        <span className="text-[10px] font-mono text-[#737373]">{q.year}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {q.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#737373]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-base md:text-lg font-medium leading-relaxed mb-4 text-[#f6f6f6]">
                    &ldquo;{q.text}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {q.author.charAt(0)}
                    </div>
                    <cite className="text-xs font-medium not-italic text-[#e5e5e5]">
                      {q.author}
                    </cite>
                  </div>

                  {/* Reflection */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-3 h-3 text-[#f59e0b]" />
                      <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
                        Reflection
                      </span>
                    </div>
                    <p className="text-xs text-[#a3a3a3] leading-relaxed">{q.reflection}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Quote className="w-12 h-12 text-[#737373] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#f6f6f6] mb-2">No quotes found</p>
            <p className="text-sm text-[#737373]">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
