import React from 'react';
import { BarChart3, Clock } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const WeeklyChart: React.FC = () => {
  const { metrics } = useLearning();

  // Days of week data based on watch time metrics or dynamic distribution
  const days = [
    { day: 'Mon', hours: 2.5, height: '62%' },
    { day: 'Tue', hours: 1.8, height: '45%' },
    { day: 'Wed', hours: 3.2, height: '80%' },
    { day: 'Thu', hours: 2.0, height: '50%' },
    { day: 'Fri', hours: 4.0, height: '100%', isBest: true },
    { day: 'Sat', hours: 1.5, height: '38%' },
    { day: 'Sun', hours: 3.1, height: '78%' },
  ];

  const totalHours = days.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = (totalHours / 7).toFixed(1);

  return (
    <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-black stroke-[2.5]" />
            <span>THIS WEEK'S WATCH TIME</span>
          </h2>
          <span className="text-[10px] font-black bg-[#A7F3D0] border border-black px-2 py-0.5 rounded uppercase">
            {totalHours.toFixed(1)}h Total
          </span>
        </div>

        <p className="text-xs font-bold text-gray-500 mb-4">
          Daily learning discipline • Avg {avgHours}h / day
        </p>

        {/* Bar Chart */}
        <div className="h-40 flex items-end justify-between gap-2 pt-4 pb-2 px-2 border-b-2 border-black bg-[#F4F0EA] rounded-lg">
          {days.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="text-[9px] font-mono font-black text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.hours}h
              </div>
              <div
                className={`w-full max-w-[28px] border-2 border-black rounded-t-md transition-all group-hover:scale-y-105 origin-bottom shadow-[2px_2px_0px_#000] ${
                  item.isBest ? 'bg-[#FFE600]' : 'bg-[#BAE6FD]'
                }`}
                style={{ height: item.height }}
              />
              <span className={`text-[10px] font-black mt-1 uppercase ${item.isBest ? 'text-black' : 'text-gray-600'}`}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-600">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Best Day: <strong>Friday (4.0h)</strong>
        </span>
        <span className="font-black text-emerald-600">
          +18% vs last week
        </span>
      </div>
    </div>
  );
};
