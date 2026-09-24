import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Flame, Clock, Play, ChevronLeft, ChevronRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface CalendarViewProps {
  onPlayVideo: (videoId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onPlayVideo }) => {
  const { metrics, activities, allVideos, progress } = useLearning();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayObj = new Date();
  const todayKey = todayObj.toLocaleDateString('en-CA');
  const isCurrentViewingMonth =
    currentMonth.getFullYear() === todayObj.getFullYear() &&
    currentMonth.getMonth() === todayObj.getMonth();

  const studyDatesSet = useMemo(() => new Set(metrics.studyDates || []), [metrics.studyDates]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetToday = () => {
    setCurrentMonth(new Date());
  };

  // Merge recent activity items and logged progress sessions
  const recentSessions = useMemo(() => {
    const list: Array<{ id: string; title: string; timestamp: string; videoId?: string; isCompleted?: boolean }> = [];

    (activities || []).forEach((act) => {
      list.push({
        id: act.id,
        title: act.title,
        timestamp: act.timestamp,
        videoId: act.videoId,
        isCompleted: act.type === 'completed_video' || act.type === 'completed',
      });
    });

    Object.values(progress).forEach((p) => {
      const timeStr = p.completedAt || p.lastWatchedAt;
      if (timeStr) {
        const video = allVideos.find((v) => v.id === p.videoId);
        if (video) {
          const isDone = p.status === 'completed' || (p.status as string) === 'COMPLETED';
          const timeMs = new Date(timeStr).getTime();
          const alreadyExists = list.some(
            (item) => item.videoId === p.videoId && Math.abs(new Date(item.timestamp).getTime() - timeMs) < 60000
          );
          if (!alreadyExists) {
            list.push({
              id: 'prog-' + p.videoId + '-' + timeMs,
              title: isDone ? `Completed "${video.title}"` : `Studied "${video.title}"`,
              timestamp: timeStr,
              videoId: p.videoId,
              isCompleted: isDone,
            });
          }
        }
      }
    });

    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [activities, progress, allVideos]);

  return (
    <div className="px-3.5 sm:px-6 py-4 max-w-[1600px] mx-auto font-sans w-full box-border">
      {/* Header Banner */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FEF08A] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              STUDY SCHEDULE & STREAK
            </span>
            <span className="text-xs font-bold text-gray-500">
              🔥 {metrics.streakDays} Day Active Streak
            </span>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            LEARNING CALENDAR
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Consistency tracking and daily study commitment log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#A7F3D0] border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black">
            ✓ {metrics.completedVideos} Lessons Mastered
          </div>
        </div>
      </div>

      {/* Calendar Grid & Side Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Box (8 cols) */}
        <div className="lg:col-span-8 bg-white border-3 border-black rounded-xl p-5 sm:p-6 shadow-[5px_5px_0px_#000]">
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black uppercase text-black">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-[#F4F1EB] hover:bg-[#FFE600] border-2 border-black rounded-lg transition-colors shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={handleResetToday}
                className={`text-xs font-mono font-black border-2 border-black px-2.5 py-1 rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer transition-colors ${
                  isCurrentViewingMonth
                    ? 'bg-[#FFE600] hover:bg-[#FFD000]'
                    : 'bg-[#F4F1EB] hover:bg-[#FFE600]'
                }`}
                title="Jump to Today"
              >
                TODAY
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-[#F4F1EB] hover:bg-[#FFE600] border-2 border-black rounded-lg transition-colors shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-black uppercase text-gray-600">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-1.5 sm:p-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-16 sm:h-20 bg-gray-50 border border-gray-200 rounded-lg opacity-40"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
              const cellKey = cellDate.toLocaleDateString('en-CA');
              const isToday = isCurrentViewingMonth && dayNum === todayObj.getDate();
              const hasActivity = studyDatesSet.has(cellKey);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-lg border-2 flex flex-col justify-between transition-all ${
                    isToday && hasActivity
                      ? 'bg-[#FFE600] border-black shadow-[3px_3px_0px_#000] font-black'
                      : isToday
                      ? 'bg-[#FEF08A] border-black shadow-[2px_2px_0px_#000] font-black'
                      : hasActivity
                      ? 'bg-[#A7F3D0] border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F4F1EB] border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs font-mono font-black">
                    <span className={isToday ? 'text-black font-black' : 'text-gray-800'}>
                      {dayNum}
                    </span>
                    {hasActivity && <span className="text-[11px] leading-none">🔥</span>}
                  </div>
                  {hasActivity ? (
                    <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-gray-900 truncate">
                      {isToday ? 'Today' : 'Studied'}
                    </div>
                  ) : isToday ? (
                    <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-gray-700 truncate">
                      Today
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-200 text-xs font-bold text-gray-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#A7F3D0] border border-black rounded inline-block" />
              <span>Studied / Active Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#FFE600] border border-black rounded inline-block" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#F4F1EB] border border-gray-300 rounded inline-block" />
              <span>No Activity</span>
            </div>
          </div>
        </div>

        {/* Right Info: Daily Goal & Log (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FEF08A] border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600 fill-orange-500" />
              <h3 className="font-black text-sm uppercase text-black">
                STREAK PROTOCOL
              </h3>
            </div>
            <div className="text-3xl font-black text-black font-mono">
              {metrics.streakDays} {metrics.streakDays === 1 ? 'DAY' : 'DAYS'}
            </div>
            <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
              {metrics.streakDays > 0
                ? `You're on an active ${metrics.streakDays}-day streak! Keep up the momentum today.`
                : 'Start your study streak today by watching a lesson or taking notes.'}
            </p>
            {metrics.longestStreakDays > 0 && (
              <div className="mt-3 pt-3 border-t border-black/20 text-xs font-bold text-gray-800">
                🏆 Best Streak Record: <span className="font-mono font-black">{metrics.longestStreakDays} days</span>
              </div>
            )}
          </div>

          <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000]">
            <h3 className="text-sm font-black uppercase text-black mb-3">
              RECENT LOGGED SESSIONS
            </h3>
            {recentSessions.length === 0 ? (
              <div className="text-xs font-bold text-gray-500 py-4 text-center">
                No study sessions recorded yet. Start watching to build your history!
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => act.videoId && onPlayVideo(act.videoId)}
                    className={`p-2.5 bg-[#F4F1EB] border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_#000] ${
                      act.videoId ? 'cursor-pointer hover:bg-[#FFE600] hover:translate-x-0.5' : ''
                    }`}
                  >
                    <div className="text-xs font-black text-black truncate">
                      {act.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mt-1">
                      <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                      {act.isCompleted && (
                        <span className="text-emerald-700 font-black">✓ Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
