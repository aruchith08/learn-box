import React from 'react';
import { Video, CheckSquare2, PlayCircle, Clock, IconProps } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const MetricCards: React.FC = () => {
  const { metrics } = useLearning();

  const cards: {
    title: string;
    value: string | number;
    bg: string;
    icon: React.FC<IconProps>;
    hasBar?: boolean;
  }[] = [
    {
      title: 'TOTAL VIDEOS',
      value: metrics.totalVideos,
      bg: 'bg-[#A7F3D0]', // Mint green
      icon: Video,
    },
    {
      title: 'COMPLETED',
      value: metrics.completedVideos,
      bg: 'bg-[#FEF08A]', // Bright Yellow
      icon: CheckSquare2,
    },
    {
      title: 'IN PROGRESS',
      value: metrics.inProgressVideos,
      bg: 'bg-[#FECDD3]', // Pink / Coral
      icon: PlayCircle,
    },
    {
      title: 'REMAINING',
      value: metrics.unstartedVideos,
      bg: 'bg-white', // Pure white
      icon: Clock,
    },
    {
      title: 'OVERALL PROGRESS',
      value: `${metrics.overallProgress}%`,
      bg: 'bg-[#DDD6FE]', // Lavender
      icon: Clock,
      hasBar: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`${card.bg} border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all flex flex-col justify-between min-h-[120px]`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-mono font-black tracking-wider text-[#111111] uppercase">
                {card.title}
              </span>
              {!card.hasBar && (
                <div className="w-7 h-7 bg-white/70 border-2 border-[#111111] rounded-lg flex items-center justify-center shadow-[1px_1px_0px_#111111]">
                  <Icon className="w-3.5 h-3.5 text-[#111111] stroke-[2.5]" />
                </div>
              )}
            </div>

            <div className="my-1">
              <div className="text-4xl sm:text-5xl font-display font-black text-[#111111] tracking-tight leading-none">
                {card.value}
              </div>
            </div>

            {card.hasBar && (
              <div className="mt-2 w-full bg-white border-2 border-[#111111] rounded-full h-3.5 overflow-hidden p-0.5 shadow-[1px_1px_0px_#111111]">
                <div
                  className="bg-[#22C55E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.overallProgress > 0 ? Math.min(100, Math.max(3, metrics.overallProgress)) : 0}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
