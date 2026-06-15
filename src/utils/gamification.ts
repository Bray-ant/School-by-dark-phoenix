// ═══════════════════════════════════════════════
// GAMIFICATION ENGINE — XP, Streaks, Badges, Levels
// ═══════════════════════════════════════════════

const XP_KEY = 'ff_gamification';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  exercisesCompleted: number;
  gamesPlayed: number;
  perfectScores: number;
  loginDays: string[];
  badgesEarned: string[];
  weeklyGoal: number;
  weeklyProgress: number;
  weakTopics: string[];
  topicMastery: Record<string, number>;
}

export const BADGES: Badge[] = [
  { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '👣', color: '#3b82f6', condition: s => s.lessonsCompleted >= 1 },
  { id: 'lessons_10', name: 'Knowledge Seeker', description: 'Complete 10 lessons', icon: '📚', color: '#8b5cf6', condition: s => s.lessonsCompleted >= 10 },
  { id: 'lessons_50', name: 'Scholar', description: 'Complete 50 lessons', icon: '🎓', color: '#f59e0b', condition: s => s.lessonsCompleted >= 50 },
  { id: 'quiz_first', name: 'Quiz Taker', description: 'Complete your first quiz', icon: '📝', color: '#10b981', condition: s => s.quizzesCompleted >= 1 },
  { id: 'quiz_20', name: 'Quiz Master', description: 'Complete 20 quizzes', icon: '🏆', color: '#ec4899', condition: s => s.quizzesCompleted >= 20 },
  { id: 'perfect_5', name: 'Perfectionist', description: 'Get 5 perfect quiz scores', icon: '💯', color: '#f59e0b', condition: s => s.perfectScores >= 5 },
  { id: 'streak_3', name: 'On Fire', description: '3-day learning streak', icon: '🔥', color: '#f97316', condition: s => s.streak >= 3 },
  { id: 'streak_7', name: 'Unstoppable', description: '7-day learning streak', icon: '⚡', color: '#f59e0b', condition: s => s.streak >= 7 },
  { id: 'streak_30', name: 'Legend', description: '30-day learning streak', icon: '👑', color: '#a855f7', condition: s => s.streak >= 30 },
  { id: 'xp_1000', name: 'Rising Star', description: 'Earn 1,000 XP', icon: '⭐', color: '#3b82f6', condition: s => s.totalXp >= 1000 },
  { id: 'xp_5000', name: 'Expert', description: 'Earn 5,000 XP', icon: '🚀', color: '#ec4899', condition: s => s.totalXp >= 5000 },
  { id: 'xp_10000', name: 'Grandmaster', description: 'Earn 10,000 XP', icon: '🏅', color: '#f59e0b', condition: s => s.totalXp >= 10000 },
  { id: 'games_10', name: 'Player', description: 'Play 10 games', icon: '🎮', color: '#06b6d4', condition: s => s.gamesPlayed >= 10 },
  { id: 'exercises_20', name: 'Problem Solver', description: 'Complete 20 exercises', icon: '🧩', color: '#10b981', condition: s => s.exercisesCompleted >= 20 },
  { id: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🌙', color: '#8b5cf6', condition: s => s.loginDays.some(d => { const h = new Date(d).getHours(); return h >= 22 || h <= 4; }) },
  { id: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', color: '#f97316', condition: s => s.loginDays.some(d => new Date(d).getHours() < 6) },
];

export const XP_REWARDS = {
  lessonComplete: 50,
  quizComplete: 30,
  quizPerfect: 100,
  exerciseComplete: 40,
  gamePlayed: 20,
  gameWon: 60,
  dailyLogin: 25,
  streakBonus: 15,
  aiTutorUse: 10,
  practiceGenerated: 15,
};

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getDefaultStats(): UserStats {
  return {
    totalXp: 0,
    level: 1,
    currentLevelXp: 0,
    xpToNextLevel: xpForLevel(1),
    streak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    lessonsCompleted: 0,
    quizzesCompleted: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    perfectScores: 0,
    loginDays: [],
    badgesEarned: [],
    weeklyGoal: 5,
    weeklyProgress: 0,
    weakTopics: [],
    topicMastery: {},
  };
}

export function loadStats(): UserStats {
  try {
    const saved = localStorage.getItem(XP_KEY);
    if (saved) return { ...getDefaultStats(), ...JSON.parse(saved) };
  } catch (err) { console.warn('[gamification] failed to load XP stats:', err); }
  return getDefaultStats();
}

function saveStats(stats: UserStats) {
  localStorage.setItem(XP_KEY, JSON.stringify(stats));
}

export function addXp(amount: number, topic?: string): { stats: UserStats; leveledUp: boolean; newBadges: Badge[] } {
  const stats = loadStats();

  stats.totalXp += amount;
  stats.currentLevelXp += amount;

  // Level up check
  let leveledUp = false;
  while (stats.currentLevelXp >= stats.xpToNextLevel) {
    stats.currentLevelXp -= stats.xpToNextLevel;
    stats.level++;
    stats.xpToNextLevel = xpForLevel(stats.level);
    leveledUp = true;
  }

  // Topic mastery
  if (topic) {
    stats.topicMastery[topic] = (stats.topicMastery[topic] || 0) + amount;
  }

  // Check badges
  const newBadges = BADGES.filter(b => !stats.badgesEarned.includes(b.id) && b.condition(stats));
  newBadges.forEach(b => stats.badgesEarned.push(b.id));

  saveStats(stats);
  return { stats, leveledUp, newBadges };
}

export function recordLessonComplete(topic?: string): { stats: UserStats; leveledUp: boolean; newBadges: Badge[] } {
  const stats = loadStats();
  stats.lessonsCompleted++;
  saveStats(stats);
  return addXp(XP_REWARDS.lessonComplete, topic);
}

export function recordQuizComplete(score: number, maxScore: number, topic?: string): { stats: UserStats; leveledUp: boolean; newBadges: Badge[] } {
  const stats = loadStats();
  stats.quizzesCompleted++;
  const isPerfect = score === maxScore;
  if (isPerfect) stats.perfectScores++;
  saveStats(stats);

  const xp = isPerfect ? XP_REWARDS.quizPerfect : XP_REWARDS.quizComplete;
  return addXp(xp, topic);
}

export function recordExerciseComplete(topic?: string): { stats: UserStats; leveledUp: boolean; newBadges: Badge[] } {
  const stats = loadStats();
  stats.exercisesCompleted++;
  saveStats(stats);
  return addXp(XP_REWARDS.exerciseComplete, topic);
}

export function recordGamePlayed(won: boolean): { stats: UserStats; leveledUp: boolean; newBadges: Badge[] } {
  const stats = loadStats();
  stats.gamesPlayed++;
  saveStats(stats);
  return addXp(won ? XP_REWARDS.gameWon : XP_REWARDS.gamePlayed);
}

export function recordDailyLogin(): { stats: UserStats; leveledUp: boolean; newBadges: Badge[]; streakExtended: boolean } {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];

  if (stats.lastActiveDate === today) {
    return { stats, leveledUp: false, newBadges: [], streakExtended: false };
  }

  // Check streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (stats.lastActiveDate === yesterdayStr) {
    stats.streak++;
  } else if (stats.lastActiveDate !== today) {
    stats.streak = 1;
  }

  stats.longestStreak = Math.max(stats.longestStreak, stats.streak);
  stats.lastActiveDate = today;
  stats.loginDays.push(new Date().toISOString());
  if (stats.loginDays.length > 100) stats.loginDays = stats.loginDays.slice(-100);

  // Weekly progress
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 1 || stats.weeklyProgress === 0) {
    stats.weeklyProgress = 0;
  }
  stats.weeklyProgress++;

  saveStats(stats);

  const streakBonus = stats.streak >= 3 ? XP_REWARDS.streakBonus * Math.min(stats.streak, 10) : 0;
  const result = addXp(XP_REWARDS.dailyLogin + streakBonus);
  return { ...result, streakExtended: true };
}

export function getWeeklyProgress(): { current: number; goal: number; percent: number } {
  const stats = loadStats();
  return {
    current: stats.weeklyProgress,
    goal: stats.weeklyGoal,
    percent: Math.min(100, Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)),
  };
}

export function getLeaderboard(): { name: string; xp: number; streak: number; level: number; badges: number }[] {
  const stats = loadStats();
  const entries = [
    { name: stats.streak > 0 ? 'You' : 'Guest', xp: stats.totalXp, streak: stats.streak, level: stats.level, badges: stats.badgesEarned.length },
    // Simulated other users for leaderboard feel
    { name: 'EngineerAlex', xp: 8750, streak: 12, level: 14, badges: 9 },
    { name: 'CircuitQueen', xp: 12300, streak: 5, level: 18, badges: 12 },
    { name: 'MathWizard', xp: 6200, streak: 21, level: 11, badges: 8 },
    { name: 'VoltageVixen', xp: 9400, streak: 8, level: 15, badges: 10 },
    { name: 'OhmMyGod', xp: 4100, streak: 3, level: 8, badges: 6 },
    { name: 'KirchhoffKing', xp: 15800, streak: 30, level: 22, badges: 14 },
    { name: 'DeltaStar', xp: 2800, streak: 1, level: 5, badges: 3 },
    { name: 'WattSup', xp: 7300, streak: 14, level: 12, badges: 9 },
  ];
  return entries.sort((a, b) => b.xp - a.xp);
}

export function getWeakAreas(): { topic: string; score: number }[] {
  const stats = loadStats();
  return Object.entries(stats.topicMastery)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

export function exportProgressToCsv(): string {
  const stats = loadStats();
  const headers = ['Date', 'Action', 'XP Earned', 'Total XP', 'Level', 'Streak'];
  const rows = [
    [new Date().toISOString(), 'EXPORT', 0, stats.totalXp, stats.level, stats.streak],
    ['', 'Lessons', stats.lessonsCompleted * XP_REWARDS.lessonComplete, '', '', ''],
    ['', 'Quizzes', stats.quizzesCompleted * XP_REWARDS.quizComplete, '', '', ''],
    ['', 'Exercises', stats.exercisesCompleted * XP_REWARDS.exerciseComplete, '', '', ''],
    ['', 'Games', stats.gamesPlayed * XP_REWARDS.gamePlayed, '', '', ''],
    ['', 'Badges', stats.badgesEarned.length, '', '', ''],
    ['', 'Topic Mastery', '', '', '', ''],
    ...Object.entries(stats.topicMastery).map(([t, s]) => ['', t, s, '', '', '']),
  ];
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
