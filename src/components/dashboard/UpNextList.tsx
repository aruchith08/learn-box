import React from 'react';
import { ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface UpNextListProps {
  onPlayVideo: (videoId: string) => void;
}

export const UpNextList: React.FC<UpNextListProps> = ({ onPlayVideo }) => {
  const { allVideos, continueWatchingVideo, progress, setActiveTab } = useLearning();

  const upNextVideos = React.useMemo(() => {
    const list = allVideos.filter((v) => {
      if (continueWatchingVideo && v.id === continueWatchingVideo.id) return false;
      const p = progress[v.id];
      return !p || (p.status !== 'completed' && (p.status as string) !== 'COMPLETED');
    });
    return list.slice(0, 3);
  }, [allVideos, continueWatchingVideo, progress]);

  return (
    <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111]">
          UP NEXT
        </h2>
        <button
          onClick={() => setActiveTab('tracker')}
          className="text-[#111111] hover:translate-x-0.5 transition-transform cursor-pointer"
          title="View Queue in Tracker"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Queue Rows matching reference screenshot */}
      {upNextVideos.length === 0 ? (
        <div className="text-xs font-mono text-gray-500 py-3 text-center">
          All queued videos completed!
        </div>
      ) : (
        <div className="space-y-2.5">
          {upNextVideos.map((video, idx) => {
            const numberLabel = `0${idx + 2}`;
            return (
              <div
                key={video.id}
                onClick={() => onPlayVideo(video.id)}
                className="flex items-center gap-3 p-2 rounded-xl border-2 border-transparent hover:border-[#111111] hover:bg-[#F4F1EB] transition-all cursor-pointer group"
              >
                {/* Number in square box matching screenshot */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F4F1EB] border-2 border-[#111111] rounded-lg flex items-center justify-center font-mono font-black text-xs text-[#111111] shrink-0 shadow-[2px_2px_0px_#111111] group-hover:bg-[#FFE600] transition-colors">
                  {numberLabel}
                </div>

                {/* Title & Playlist subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-display font-black text-[#111111] truncate group-hover:text-[#B45309]">
                    {video.title}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500 truncate">
                    {video.playlistTitle || video.category || 'Java + DSA'}
                  </div>
                </div>

                {/* Duration on right */}
                <div className="font-mono text-[10px] font-bold text-gray-600 shrink-0">
                  {video.duration || '28:17'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
