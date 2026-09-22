import React from 'react';
import { Play, Clock, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface UpNextListProps {
  onPlayVideo: (videoId: string) => void;
}

export const UpNextList: React.FC<UpNextListProps> = ({ onPlayVideo }) => {
  const { allVideos, continueWatchingVideo, progress, setActiveTab } = useLearning();

  // Find up next 4 videos (uncompleted videos right after current or from playlists)
  const upNextVideos = React.useMemo(() => {
    const list = allVideos.filter((v) => {
      if (continueWatchingVideo && v.id === continueWatchingVideo.id) return false;
      const p = progress[v.id];
      return !p || p.status !== 'completed';
    });
    return list.slice(0, 4);
  }, [allVideos, continueWatchingVideo, progress]);

  return (
    <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-black stroke-[2.5]" />
            <span>UP NEXT IN QUEUE</span>
          </h2>
          <span className="text-[10px] font-black bg-[#E8E2D5] border border-black px-2 py-0.5 rounded">
            {upNextVideos.length} QUEUED
          </span>
        </div>

        <div className="space-y-3">
          {upNextVideos.map((video, idx) => (
            <div
              key={video.id}
              onClick={() => onPlayVideo(video.id)}
              className="flex items-center gap-3 p-2.5 rounded-lg border-2 border-transparent hover:border-black hover:bg-[#F4F0EA] transition-all cursor-pointer group"
            >
              {/* Index or Thumbnail */}
              <div className="w-8 h-8 bg-[#FFE600] border-2 border-black rounded-md flex items-center justify-center font-mono font-black text-xs shrink-0 group-hover:scale-105 shadow-[1px_1px_0px_#000]">
                {idx + 1}
              </div>

              {/* Title & Playlist */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-black truncate group-hover:text-[#B45309]">
                  {video.title}
                </div>
                <div className="text-[10px] font-bold text-gray-500 truncate">
                  {video.playlistTitle || video.category || 'Standalone Video'}
                </div>
              </div>

              {/* Duration & Play icon */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  {video.duration || '20:00'}
                </span>
                <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3 fill-white translate-x-0.2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setActiveTab('my-videos')}
        className="mt-4 w-full bg-[#F4F0EA] border-2 border-black py-2 rounded-lg text-xs font-black uppercase text-black hover:bg-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Explore All Videos</span>
        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </div>
  );
};
