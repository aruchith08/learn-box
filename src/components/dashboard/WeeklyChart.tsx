import React, { useMemo } from 'react';
import { BarChart3 } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const WeeklyChart: React.FC = () => {
  const { metrics, playlists, activities, progress } = useLearning();

  // Real active playlists count (any video with progress or completion)
  const activePlaylistsCount = useMemo(() => {
    return playlists.filter((pl) => {
      return (pl.videos || []).some((v) => {
        const p = progress[v.id];
        return p && (p.status === 'in_progress' || p.status === 'completed' || (p.status as string) === 'COMPLETED');
      });
    }).length;
  }, [playlists, progress]);

  // Real weekly activity aggregation (Monday through Sunday)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const orderedDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const daysArr = orderedDayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateKey = d.toLocaleDateString('en-CA');
      return {
        day: dayName,
        dateKey,
        isToday: dateKey === now.toLocaleDateString('en-CA'),
        seconds: 0,
        completedCount: 0,
      };
    });

    const dayMap = new Map(daysArr.map((d) => [d.dateKey, d]));

    // Aggregate watch time and completion from progress
    Object.values(progress).forEach((p) => {
      if (p.lastWatchedAt) {
        const d = new Date(p.lastWatchedAt);
        const k = d.toLocaleDateString('en-CA');
        const item = dayMap.get(k);
        if (item) {
          const sec = typeof p.currentTime === 'number' && p.currentTime > 0 ? p.currentTime : 600;
          item.seconds += sec;
        }
      }
      if (p.completedAt) {
        const d = new Date(p.completedAt);
        const k = d.toLocaleDateString('en-CA');
        const item = dayMap.get(k);
        if (item) {
          item.completedCount++;
        }
      }
    });

    // Also factor in logged activity events for this week
    (activities || []).forEach((act) => {
      if (act.timestamp) {
        const d = new Date(act.timestamp);
        const k = d.toLocaleDateString('en-CA');
        const item = dayMap.get(k);
        if (item) {
          if (act.type === 'completed_video' || act.type === 'completed') {
            item.completedCount = Math.max(item.completedCount, 1);
          }
          if (item.seconds === 0) {
            item.seconds += 900;
          }
        }
      }
    });

    const totalWeeklySeconds = daysArr.reduce((acc, d) => acc + d.seconds, 0);
    const totalWeeklyCompleted = daysArr.reduce((acc, d) => acc + d.completedCount, 0);

    const maxSeconds = Math.max(...daysArr.map((d) => d.seconds), 1);

    const daysWithHeights = daysArr.map((d) => {
      let height = '8px';
      if (d.seconds > 0 || d.completedCount > 0) {
        const ratio = d.seconds / maxSeconds;
        const pct = Math.max(16, Math.min(100, Math.round(ratio * 92)));
        height = `${pct}%`;
      }
      return {
        ...d,
        height,
        minutes: Math.round(d.seconds / 60),
      };
    });

    return {
      days: daysWithHeights,
      weeklyHours: Math.floor(totalWeeklySeconds / 3600),
      weeklyMinutes: Math.round((totalWeeklySeconds % 3600) / 60),
      totalWeeklyCompleted,
      hasWeeklyActivity: totalWeeklySeconds > 0 || totalWeeklyCompleted > 0,
    };
  }, [progress, activities]);

  // Overall fallback hours if week is brand new
  const displayHours = weeklyData.hasWeeklyActivity
    ? weeklyData.weeklyHours
    : Math.floor(metrics.totalWatchHours || 0);
  const displayMinutes = weeklyData.hasWeeklyActivity
    ? weeklyData.weeklyMinutes
    : Math.round(((metrics.totalWatchHours || 0) % 1) * 60);

  const displayCompleted = weeklyData.hasWeeklyActivity
    ? weeklyData.totalWeeklyCompleted
    : metrics.completedVideos;

  return (
    <div className="bg-white border-[2.5px] sm:border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#111111] stroke-[2.5]" />
            <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111]">
              THIS WEEK
            </h2>
          </div>
          {metrics.streakDays > 0 && (
            <span className="text-[10px] font-mono font-bold bg-[#FFE600] border border-[#111111] px-2 py-0.5 rounded shadow-[1px_1px_0px_#111111]">
              🔥 {metrics.streakDays}D STREAK
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Stats on left */}
          <div className="col-span-5 space-y-2.5">
            <div>
              <div className="text-xl font-display font-black text-[#111111] leading-none">
                {displayHours}h {displayMinutes}m
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mt-0.5">
                {weeklyData.hasWeeklyActivity ? 'This Week Watch' : 'Total Focus Time'}
              </div>
            </div>

            <div>
              <div className="text-lg font-display font-black text-[#111111] leading-none">
                {displayCompleted}
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mt-0.5">
                {weeklyData.hasWeeklyActivity ? 'Completed This Week' : 'Videos Completed'}
              </div>
            </div>

            <div>
              <div className="text-lg font-display font-black text-[#111111] leading-none">
                {activePlaylistsCount}
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mt-0.5">
                Playlists Active
              </div>
            </div>
          </div>

          {/* Bar Chart on right */}
          <div className="col-span-7 h-28 flex items-end justify-between gap-1 sm:gap-1.5 pt-2 px-1 sm:px-2 border-b-2 border-[#111111]">
            {weeklyData.days.map((item) => {
              const hasDayActivity = item.seconds > 0 || item.completedCount > 0;
              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  title={`${item.day}: ${item.minutes}m studied, ${item.completedCount} completed`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 hidden group-hover:flex bg-[#111111] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none">
                    {item.minutes}m
                  </div>

                  <div
                    className={`w-full max-w-[14px] rounded-t-sm transition-all ${
                      item.isToday
                        ? 'bg-[#FFE600] border-t-2 border-x-2 border-[#111111]'
                        : hasDayActivity
                        ? 'bg-[#111111] group-hover:bg-[#FFE600]'
                        : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}
                    style={{ height: item.height }}
                  />
                  <span
                    className={`text-[8px] font-mono font-black mt-1 uppercase ${
                      item.isToday ? 'text-black underline underline-offset-2' : 'text-gray-600'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
