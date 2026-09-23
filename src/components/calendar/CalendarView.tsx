import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Flame, Clock, Play } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface CalendarViewProps {
  onPlayVideo: (videoId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onPlayVideo }) => {
  const { metrics, settings, activities, allVideos } = useLearning();

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

  const todayDate = new Date().getDate();

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FEF08A] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              STUDY SCHEDULE & STREAK
            </span>
            <span className="text-xs font-bold text-gray-500">
              🔥 {settings.streakDays} Day Active Streak
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
        <div className="lg:col-span-8 bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
            <h2 className="text-lg font-black uppercase text-black">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="text-xs font-mono font-black bg-[#FFE600] border border-black px-2 py-1 rounded shadow-[1px_1px_0px_#000]">
              TODAY: DAY {todayDate}
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black uppercase text-gray-600">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-gray-50 border border-gray-200 rounded-lg opacity-40" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === todayDate;
              const hasActivity = dayNum <= todayDate && dayNum >= todayDate - settings.streakDays;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-20 p-2 rounded-lg border-2 flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-[#FFE600] border-black shadow-[3px_3px_0px_#000] font-black'
                      : hasActivity
                      ? 'bg-[#A7F3D0] border-black shadow-[1px_1px_0px_#000]'
                      : 'bg-[#F4F0EA] border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs font-mono font-black">
                    <span>{dayNum}</span>
                    {hasActivity && <span className="text-[10px]">🔥</span>}
                  </div>
                  {hasActivity && (
                    <div className="text-[9px] font-black uppercase tracking-tight text-gray-800">
                      {isToday ? 'Today' : 'Studied'}
                    </div>
                  )}
                </div>
              );
            })}
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
              {settings.streakDays} DAYS
            </div>
            <p className="text-xs font-bold text-gray-700 mt-1 leading-relaxed">
              Every day you watch, complete, or take notes counts toward building engineering habits.
            </p>
          </div>

          <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000]">
            <h3 className="text-sm font-black uppercase text-black mb-3">
              RECENT LOGGED SESSIONS
            </h3>
            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  onClick={() => act.videoId && onPlayVideo(act.videoId)}
                  className={`p-2.5 bg-[#F4F0EA] border border-black rounded-lg ${
                    act.videoId ? 'cursor-pointer hover:bg-[#FFE600]' : ''
                  }`}
                >
                  <div className="text-xs font-black text-black truncate">
                    {act.title}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
