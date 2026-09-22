import React from 'react';
import { Video, CheckCircle2, PlayCircle, Clock, TrendingUp, IconProps } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const MetricCards: React.FC = () => {
  const { metrics } = useLearning();

  const cards: {
    title: string;
    value: string | number;
    subtitle: string;
    bg: string;
    icon: React.FC<IconProps>;
    hasBar?: boolean;
  }[] = [
    {
      title: 'TOTAL VIDEOS',
      value: metrics.totalVideos,
      subtitle: `${metrics.totalPlaylists} playlists loaded`,
      bg: 'bg-[#A7F3D0]', // Mint
      icon: Video,
    },
    {
      title: 'COMPLETED',
      value: metrics.completedVideos,
      subtitle: `${metrics.overallProgress}% of catalog done`,
      bg: 'bg-[#FEF08A]', // Yellow
      icon: CheckCircle2,
    },
    {
      title: 'IN PROGRESS',
      value: metrics.inProgressVideos,
      subtitle: 'Currently learning',
      bg: 'bg-[#FECDD3]', // Pink
      icon: PlayCircle,
    },
    {
      title: 'REMAINING',
      value: metrics.unstartedVideos,
      subtitle: 'Queued to start',
      bg: 'bg-white', // Clean white
      icon: Clock,
    },
    {
      title: 'OVERALL PROGRESS',
      value: `${metrics.overallProgress}%`,
      subtitle: `${metrics.completedVideos}/${metrics.totalVideos} videos`,
      bg: 'bg-[#DDD6FE]', // Lavender
      icon: TrendingUp,
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
            className={`${card.bg} border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black tracking-wider text-black uppercase">
                {card.title}
              </span>
              <div className="w-7 h-7 bg-white/60 border-2 border-black rounded-md flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-3xl font-black text-black tracking-tight font-mono">
                {card.value}
              </div>
              <div className="text-[11px] font-bold text-gray-700 mt-0.5">
                {card.subtitle}
              </div>
            </div>

            {card.hasBar && (
              <div className="mt-3 w-full bg-white/70 border-2 border-black rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-black h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, metrics.overallProgress))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
