import { useState } from 'react';
import { Link } from 'react-router-dom';
import { exercises, topicColors } from '../data/mathExercisesData';
import { Calculator, Search, ArrowRight, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const allTopics = [...new Set(exercises.map(e => e.topic))];

export default function MathExercises() {
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('All');

  const filtered = exercises.filter(e => {
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.topic.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter === 'All' || e.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Math Exercises</h1>
              <p className="text-sm text-[#737373]">{exercises.length} exercises across {allTopics.length} topics</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#737373]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..."
              className="flex-1 bg-transparent text-sm text-[#f6f6f6] placeholder-[#737373] outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTopicFilter('All')} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${topicFilter === 'All' ? 'bg-white/10 text-white' : 'bg-white/5 text-[#737373] hover:text-white'}`}>All</button>
            {allTopics.map(t => (
              <button key={t} onClick={() => setTopicFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${topicFilter === t ? 'text-white' : 'bg-white/5 text-[#737373] hover:text-white'}`}
                style={topicFilter === t ? { backgroundColor: `${topicColors[t]}25`, color: topicColors[t] } : {}}>
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Exercise List */}
        <div className="space-y-3">
          {filtered.map((ex, i) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/exercise/${ex.id}`} className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-white/20 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${topicColors[ex.topic]}15`, border: `1px solid ${topicColors[ex.topic]}30` }}>
                  <BarChart3 className="w-5 h-5" style={{ color: topicColors[ex.topic] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{ex.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: `${topicColors[ex.topic]}15`, color: topicColors[ex.topic] }}>{ex.topic}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#737373]">L{ex.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                    <Clock className="w-3 h-3" />{ex.estimatedTime}
                    <span>•</span><span>{ex.subtopic}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
