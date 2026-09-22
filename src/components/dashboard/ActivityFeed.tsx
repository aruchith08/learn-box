import React from 'react';
import { Activity, CheckCircle2, FileText, Bookmark, Play, Plus } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface ActivityFeedProps {
  onPlayVideo: (videoId: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ onPlayVideo }) => {
  const { activities, allVideos } = useLearning();

  const getIcon = (type: string) => {
    switch (type) {
      case 'completed_video':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'watched_video':
        return <Play className="w-4 h-4 text-blue-600 fill-blue-600" />;
      case 'added_note':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'bookmarked':
        return <Bookmark className="w-4 h-4 text-yellow-600 fill-yellow-600" />;
      default:
        return <Plus className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-black stroke-[2.5]" />
            <span>RECENT ACTIVITY</span>
          </h2>
          <span className="text-[10px] font-black bg-[#DDD6FE] border border-black px-2 py-0.5 rounded uppercase">
            LIVE LOG
          </span>
        </div>

        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => {
            return (
              <div
                key={act.id}
                onClick={() => {
                  if (act.videoId) onPlayVideo(act.videoId);
                }}
                className={`flex items-start gap-3 p-2 rounded-lg border border-transparent transition-all ${
                  act.videoId ? 'hover:bg-[#F4F0EA] hover:border-black cursor-pointer' : ''
                }`}
              >
                <div className="w-7 h-7 bg-[#F4F0EA] border-2 border-black rounded flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#000]">
                  {getIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-black leading-tight truncate">
                    {act.title}
                  </div>
                  {act.details && (
                    <div className="text-[11px] font-medium text-gray-600 truncate mt-0.5">
                      {act.details}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                    {formatTimeAgo(act.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-gray-100 text-center text-xs font-bold text-gray-500">
        All activity is saved locally on your device.
      </div>
    </div>
  );
};
