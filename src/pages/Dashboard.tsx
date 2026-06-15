import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { getTotalLessons, getCompletedLessons, quizzes } from '../data/courseData';
import Heatmap from '../components/Heatmap';
import { Box, Orbit, Zap, TrendingUp, CheckCircle, Award, Target, Clock, Flame, ArrowRight, Trophy, Timer, Download, Users, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exportAuditLogs } from '../utils/security';
import { motion } from 'framer-motion';

const chapterIcons: Record<string, React.ReactNode> = {
  stereostatics: <Box className="w-5 h-5" />,
  kinematics: <Orbit className="w-5 h-5" />,
  kinetics: <Zap className="w-5 h-5" />,
};

export default function Dashboard() {
  const { chapterList } = useApp();
  const { user } = useAuth();
  const totalLessons = getTotalLessons();
  const completedLessons = getCompletedLessons();
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const studyStreak = 5;
  const totalStudyTime = completedLessons * 15;

  const studySessions = (() => {
    try { return JSON.parse(localStorage.getItem('forceform_sessions') || '[]'); }
    catch { return []; }
  })();

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Learning Dashboard</h1>
          <p className="text-sm text-[#737373]">Track your progress and see how far you&apos;ve come.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall Progress', value: `${overallProgress}%`, icon: <TrendingUp className="w-4 h-4" />, color: '#3b82f6', detail: `${completedLessons}/${totalLessons} lessons` },
            { label: 'Lessons Completed', value: completedLessons, icon: <CheckCircle className="w-4 h-4" />, color: '#10b981', detail: `${totalLessons - completedLessons} remaining` },
            { label: 'Study Streak', value: `${studyStreak} days`, icon: <Flame className="w-4 h-4" />, color: '#f59e0b', detail: 'Keep it going!' },
            { label: 'Study Time', value: `${Math.round(totalStudyTime / 60)}h`, icon: <Clock className="w-4 h-4" />, color: '#8b5cf6', detail: `${totalStudyTime} min total` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
              </div>
              <div className="text-2xl font-semibold mb-0.5">{stat.value}</div>
              <div className="text-xs text-[#737373]">{stat.label}</div>
              <div className="text-[10px] text-[#737373] mt-1">{stat.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Heatmap + Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="md:col-span-2 glass-panel rounded-2xl p-5">
            <Heatmap sessions={studySessions} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link to="/achievements" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
                <div>
                  <div className="text-xs font-medium">Achievements</div>
                  <div className="text-[10px] text-[#737373]">Track your badges</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/study-timer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <Timer className="w-4 h-4 text-[#3b82f6]" />
                <div>
                  <div className="text-xs font-medium">Study Timer</div>
                  <div className="text-[10px] text-[#737373]">Pomodoro focus sessions</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/ai-tutor" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <Zap className="w-4 h-4 text-[#8b5cf6]" />
                <div>
                  <div className="text-xs font-medium">AI Tutor</div>
                  <div className="text-[10px] text-[#737373]">Get help from AI</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/dc-lab" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <Flame className="w-4 h-4 text-[#ef4444]" />
                <div>
                  <div className="text-xs font-medium">DC Circuit Lab</div>
                  <div className="text-[10px] text-[#737373]">Interactive simulators</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button
                type="button"
                onClick={() => exportAuditLogs()}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
              >
                <Download className="w-4 h-4 text-[#10b981]" />
                <div>
                  <div className="text-xs font-medium">Export Auth Log</div>
                  <div className="text-[10px] text-[#737373]">Download login/register history</div>
                </div>
                <Download className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <Users className="w-4 h-4 text-[#8b5cf6]" />
                    <div>
                      <div className="text-xs font-medium">Manage Users</div>
                      <div className="text-[10px] text-[#737373]">View registered users & activity</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </>
              )}
              {user?.email === 'hohenheimvon01@gmail.com' && (
                <Link to="/admin/activity" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <Activity className="w-4 h-4 text-[#10b981]" />
                  <div>
                    <div className="text-xs font-medium">Login Activity</div>
                    <div className="text-[10px] text-[#737373]">Track all login & logout events</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4">Chapter Progress</h2>
            <div className="space-y-4">
              {chapterList.map((chapter) => {
                const chTotal = chapter.sections.reduce((a, s) => a + s.lessons.length, 0);
                const chDone = chapter.sections.reduce((a, s) => a + s.lessons.filter(l => l.completed).length, 0);
                const pct = chTotal > 0 ? Math.round((chDone / chTotal) * 100) : 0;
                return (
                  <Link key={chapter.id} to={`/chapter/${chapter.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${chapter.color}15`, border: `1px solid ${chapter.color}30` }}>
                      <span style={{ color: chapter.color }}>{chapterIcons[chapter.id]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{chapter.title}</span>
                        <span className="text-xs font-mono text-[#737373]">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : chapter.color }} />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-5">
              <h2 className="text-sm font-semibold mb-4">Available Quizzes</h2>
              <div className="space-y-2">
                {quizzes.map((quiz) => {
                  const ch = chapterList.find(c => c.id === quiz.chapterId);
                  if (!ch) return null;
                  return (
                    <Link key={quiz.id} to={`/chapter/${ch.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ch.color}15` }}>
                        <Target className="w-4 h-4" style={{ color: ch.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{quiz.title}</div>
                        <div className="text-[10px] text-[#737373]">{quiz.questions.length} questions</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-2xl p-5">
              <h2 className="text-sm font-semibold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'First Steps', desc: 'Complete 1 lesson', achieved: completedLessons >= 1, color: '#3b82f6' },
                  { label: 'Getting Started', desc: 'Complete 5 lessons', achieved: completedLessons >= 5, color: '#10b981' },
                  { label: 'Halfway There', desc: 'Complete 50%', achieved: overallProgress >= 50, color: '#f59e0b' },
                  { label: 'Master', desc: 'Complete all lessons', achieved: overallProgress >= 100, color: '#ef4444' },
                ].map(a => (
                  <div key={a.label} className={`p-3 rounded-xl border transition-all ${a.achieved ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-50'}`}>
                    <Award className="w-5 h-5 mb-2" style={{ color: a.achieved ? a.color : '#737373' }} />
                    <div className="text-xs font-medium">{a.label}</div>
                    <div className="text-[10px] text-[#737373]">{a.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">Continue Learning</h2>
          <div className="flex flex-wrap gap-3">
            {chapterList.map(ch => (
              <Link key={ch.id} to={`/chapter/${ch.id}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all" style={{ backgroundColor: `${ch.color}10`, border: `1px solid ${ch.color}20`, color: ch.color }}>
                {chapterIcons[ch.id]}
                <span>{ch.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
