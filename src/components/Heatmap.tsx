import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  sessions: { completedAt: string; duration: number }[];
  className?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getIntensityLevel(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 60) return 3;
  return 4;
}

const levelColors = [
  'bg-white/[0.03]',   // 0 - no activity
  'bg-[#3b82f6]/20',   // 1 - < 15 min
  'bg-[#3b82f6]/40',   // 2 - < 30 min
  'bg-[#3b82f6]/60',   // 3 - < 60 min
  'bg-[#3b82f6]',      // 4 - >= 60 min
];

export default function Heatmap({ sessions, className = '' }: HeatmapProps) {
  const weeks = useMemo(() => {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setDate(yearAgo.getDate() - 364);
    yearAgo.setHours(0, 0, 0, 0);

    // Start from the Monday of the week containing yearAgo
    const start = new Date(yearAgo);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - ((dayOfWeek + 7 - 1) % 7));

    // Build a map of date -> minutes
    const dateMap = new Map<string, number>();
    sessions.forEach(s => {
      const d = new Date(s.completedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateMap.set(key, (dateMap.get(key) || 0) + Math.floor(s.duration / 60));
    });

    // Build weeks array
    const result: { date: string; day: number; level: number; minutes: number }[][] = [];
    let currentWeek: typeof result[0] = [];
    const curr = new Date(start);

    while (curr <= now) {
      const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
      const minutes = dateMap.get(key) || 0;
      const day = curr.getDay() === 0 ? 6 : curr.getDay() - 1; // Mon=0, Sun=6

      currentWeek.push({
        date: key,
        day,
        level: getIntensityLevel(minutes),
        minutes,
      });

      if (curr.getDay() === 0) {
        result.push([...currentWeek]);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [sessions]);

  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIdx) => {
      const firstDay = week[0];
      if (firstDay) {
        const [, month] = firstDay.date.split('-').map(Number);
        if (month - 1 !== lastMonth) {
          positions.push({
            label: MONTH_LABELS[month - 1],
            col: weekIdx,
          });
          lastMonth = month - 1;
        }
      }
    });

    return positions;
  }, [weeks]);

  const totalMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
  const activeDays = new Set(sessions.map(s => {
    const d = new Date(s.completedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  })).size;
  const maxStreak = useMemo(() => {
    const dates = [...new Set(sessions.map(s => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))].sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    dates.forEach(d => {
      const curr = new Date(d + 'T00:00:00');
      if (prevDate) {
        const diff = (curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = curr;
      maxStreak = Math.max(maxStreak, currentStreak);
    });
    return maxStreak;
  }, [sessions]);

  return (
    <div className={className}>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-lg font-bold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
          <p className="text-[10px] text-[#737373]">Total study time</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <p className="text-lg font-bold">{activeDays}</p>
          <p className="text-[10px] text-[#737373]">Active days</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <p className="text-lg font-bold">{maxStreak}d</p>
          <p className="text-[10px] text-[#737373]">Best streak</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthPositions.map((m, i) => (
              <span
                key={i}
                className="text-[9px] text-[#737373] absolute"
                style={{ marginLeft: `${m.col * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="text-[8px] text-[#525252] w-6 h-[10px] leading-[10px]">
                  {i % 2 === 0 ? d : ''}
                </span>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const day = week.find(d => d.day === dayIdx);
                  if (!day) return <div key={dayIdx} className="w-[10px] h-[10px]" />;
                  return (
                    <motion.div
                      key={dayIdx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIdx * 0.002 + dayIdx * 0.001 }}
                      className={`w-[10px] h-[10px] rounded-sm ${levelColors[day.level]} hover:ring-1 hover:ring-white/30 transition-all cursor-pointer`}
                      title={`${day.date}: ${day.minutes} min`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[9px] text-[#525252]">Less</span>
            {levelColors.map((c, i) => (
              <div key={i} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
            ))}
            <span className="text-[9px] text-[#525252]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
