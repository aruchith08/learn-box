import React from 'react';
import { Activity, CheckCircle2, Play, Bookmark, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface ActivityFeedProps {
  onPlayVideo: (videoId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ onPlayVideo }) => {
  const { activities, setActiveTab } = useLearning();

  const getIcon = (type: string) => {
    switch (type) {
      case 'completed_video':
      case 'completed':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center bg-white shadow-[1px_1px_0px_#111111]">
            <CheckCircle2 className="w-3 h-3 text-[#111111]" />
          </div>
        );
      case 'watched_video':
      case 'watched':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center bg-white shadow-[1px_1px_0px_#111111]">
            <Play className="w-2.5 h-2.5 text-[#111111] fill-[#111111] ml-0.5" />
          </div>
        );
      case 'bookmarked':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center bg-white shadow-[1px_1px_0px_#111111]">
            <Bookmark className="w-2.5 h-2.5 text-[#111111] fill-[#111111]" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center bg-white shadow-[1px_1px_0px_#111111]">
            <Play className="w-2.5 h-2.5 text-[#111111]" />
          </div>
        );
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="bg-white border-[2.5px] sm:border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111] flex items-center gap-2">
            <span className="w-5 h-5 bg-[#111111] text-white rounded flex items-center justify-center text-[10px] font-mono">
              ⊞
            </span>
            <span>RECENT ACTIVITY</span>
          </h2>
          <button
            onClick={() => setActiveTab('tracker')}
            className="flex items-center gap-1 text-xs font-display font-black text-[#111111] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-xs font-mono text-gray-500 py-4 text-center">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {activities.slice(0, 3).map((act) => {
              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (act.videoId) onPlayVideo(act.videoId);
                  }}
                  className={`flex items-start gap-3 transition-colors ${
                    act.videoId ? 'hover:text-[#B45309] cursor-pointer' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(act.type)}
                  </div>

                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                    <div className="text-xs font-display font-bold text-[#111111] truncate leading-snug">
                      {act.title}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 shrink-0 whitespace-nowrap">
                      {formatTimeAgo(act.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
