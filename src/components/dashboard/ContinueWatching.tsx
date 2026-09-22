import React from 'react';
import { Play, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface ContinueWatchingProps {
  onPlayVideo: (videoId: string) => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onPlayVideo }) => {
  const { continueWatchingVideo, progress, allVideos } = useLearning();

  if (!continueWatchingVideo) {
    return (
      <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111]">
        <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111] mb-2">
          CONTINUE WATCHING
        </h2>
        <div className="text-center py-4">
          <p className="font-display font-bold text-xs text-[#111111]">
            No videos in progress yet.
          </p>
          <p className="text-[11px] font-mono text-gray-500 mt-1 mb-3">
            Start a lesson to track your personal progress!
          </p>
          {allVideos[0] && (
            <button
              onClick={() => onPlayVideo(allVideos[0].id)}
              className="bg-[#FFE600] border-2 border-[#111111] px-4 py-1.5 rounded-lg font-display font-black text-xs uppercase shadow-[2px_2px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Start Learning →
            </button>
          )}
        </div>
      </div>
    );
  }

  const targetVideo = continueWatchingVideo;
  const prog = progress[targetVideo.id];
  const percent = prog ? prog.percent || prog.progressPercentage || 0 : 0;
  const currentTime = prog?.currentTime || 0;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111] flex items-center gap-1.5">
          CONTINUE WATCHING
        </h2>
        <button
          onClick={() => onPlayVideo(continueWatchingVideo.id)}
          className="text-[#111111] hover:translate-x-0.5 transition-transform cursor-pointer"
          title="Watch Now"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Content matching reference screenshot */}
      <div
        onClick={() => onPlayVideo(targetVideo.id)}
        className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group"
      >
        {/* Left Video Thumbnail with IN PROGRESS badge & timestamp */}
        <div className="w-32 sm:w-36 aspect-video bg-[#111111] rounded-xl border-2 border-[#111111] overflow-hidden relative shrink-0 shadow-[2px_2px_0px_#111111]">
          <img
            src={targetVideo.thumbnailUrl || targetVideo.thumbnail}
            alt={targetVideo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Top-left IN PROGRESS badge */}
          <div className="absolute top-1 left-1 bg-[#FECDD3] text-[#111111] font-mono font-black text-[8px] px-1.5 py-0.5 rounded border border-[#111111] uppercase tracking-tight shadow-[1px_1px_0px_#111111]">
            IN PROGRESS
          </div>
          {/* Bottom-right timestamp */}
          <div className="absolute bottom-1 right-1 bg-black/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
            {formatSecs(currentTime)}
          </div>
        </div>

        {/* Right Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-display font-black text-[#111111] leading-snug line-clamp-2 group-hover:text-[#B45309]">
            {targetVideo.title}
          </h3>
          <p className="text-[10px] font-semibold text-gray-500 mt-0.5 truncate">
            {targetVideo.playlistTitle || targetVideo.category || 'Java + DSA in 30 Days'}
          </p>

          {/* Green Progress Bar with Percentage */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 bg-[#E5E5E5] border border-[#111111] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#22C55E] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(percent, 5)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-black text-[#111111]">
              {percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
