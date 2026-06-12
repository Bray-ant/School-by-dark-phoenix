import { useParams, Link } from 'react-router-dom';
import { dcChapterList } from '../data/dcCircuitData';
import { BookOpen, CheckCircle, ArrowRight, Zap, Ruler, GitCommitVertical, GitFork, Network, Lightbulb, Grid3x3, Battery, Magnet } from 'lucide-react';
import { motion } from 'framer-motion';

const chapterIcons: Record<string, React.ReactNode> = {
  'dc-fundamentals': <Ruler className="w-6 h-6" />,
  'dc-quantities': <Zap className="w-6 h-6" />,
  'dc-series': <GitCommitVertical className="w-6 h-6" />,
  'dc-parallel': <GitFork className="w-6 h-6" />,
  'dc-series-parallel': <Network className="w-6 h-6" />,
  'dc-theorems': <Lightbulb className="w-6 h-6" />,
  'dc-nodal-mesh': <Grid3x3 className="w-6 h-6" />,
  'dc-capacitors': <Battery className="w-6 h-6" />,
  'dc-inductors': <Magnet className="w-6 h-6" />,
  'dc-magnetics': <Magnet className="w-6 h-6" />,
};

export default function DCChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const chapter = dcChapterList.find(c => c.id === chapterId);

  if (!chapter) return <div className="py-20 text-center text-[#737373]">Chapter not found</div>;

  const totalLessons = chapter.sections.reduce((a, s) => a + s.lessons.length, 0);
  const doneLessons = chapter.sections.reduce((a, s) => a + s.lessons.filter(l => l.completed).length, 0);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${chapter.color}15`, border: `1px solid ${chapter.color}30` }}>
              <span style={{ color: chapter.color }}>{chapterIcons[chapter.id]}</span>
            </div>
            <div>
              <div className="text-xs font-mono text-[#737373]">CHAPTER {String(chapter.number).padStart(2, '0')}</div>
              <h1 className="text-3xl font-semibold tracking-tight">{chapter.title}</h1>
            </div>
          </div>
          <p className="text-sm text-[#737373] max-w-xl mb-4">{chapter.description}</p>
          <div className="flex items-center gap-4 text-xs text-[#737373]">
            <span>{totalLessons} lessons</span>
            <span>{doneLessons} completed</span>
            <span>{chapter.sections.length} sections</span>
          </div>
        </motion.div>

        {/* Learning Objectives */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">Learning Objectives</h2>
          <div className="space-y-2">
            {chapter.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" />
                <span className="text-xs text-[#d4d4d4]">{obj}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {chapter.sections.map((section, si) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4" style={{ color: chapter.color }} />
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <span className="text-xs text-[#737373] ml-auto">{section.lessons.length} lessons</span>
              </div>
              <div className="space-y-2">
                {section.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/dc-circuit/${chapter.id}/section/${section.id}/lesson/${lesson.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${lesson.completed ? 'bg-[#10b981]/15' : 'bg-white/5'}`}>
                      {lesson.completed ? <CheckCircle className="w-4 h-4 text-[#10b981]" /> : <BookOpen className="w-4 h-4 text-[#737373]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{lesson.number} {lesson.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                        <span>{lesson.duration}</span>
                        <span>•</span>
                        <span className="capitalize">{lesson.difficulty}</span>
                        <span>•</span>
                        <span className="capitalize">{lesson.type}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
