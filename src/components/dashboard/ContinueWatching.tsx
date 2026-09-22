import React from 'react';
import { Play, CheckCircle2 } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface ContinueWatchingProps {
  onPlayVideo: (videoId: string) => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onPlayVideo }) => {
  const { continueWatchingVideo, progress, markVideoComplete } = useLearning();

  if (!continueWatchingVideo) return null;

  const prog = progress[continueWatchingVideo.id];
  const percent = prog ? prog.percent : 0;
  const currentTime = prog?.currentTime || 0;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] relative overflow-hidden flex flex-col justify-between">
      {/* Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            CONTINUE WATCHING
          </span>
        </div>
        <span className="bg-[#FFE600] text-black border-2 border-black px-2.5 py-0.5 rounded text-[11px] font-black uppercase shadow-[1px_1px_0px_#000]">
          {percent}% WATCHED
        </span>
      </div>

      {/* Main Content: Thumbnail + Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-5">
        {/* Thumbnail with overlay play button */}
        <div
          onClick={() => onPlayVideo(continueWatchingVideo.id)}
          className="md:col-span-5 relative group cursor-pointer border-2 border-black rounded-lg overflow-hidden shadow-[3px_3px_0px_#000] aspect-video bg-black"
        >
          <img
            src={continueWatchingVideo.thumbnailUrl}
            alt={continueWatchingVideo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 bg-[#FFE600] border-2 border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_#000] group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
            </div>
          </div>
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700">
            {continueWatchingVideo.duration || '28:00'}
          </div>
        </div>

        {/* Video details */}
        <div className="md:col-span-7 flex flex-col justify-between h-full">
          <div>
            <div className="text-[11px] font-black text-purple-700 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded inline-block uppercase mb-1.5">
              {continueWatchingVideo.playlistTitle || continueWatchingVideo.category || 'Curriculum'}
            </div>
            <h3
              onClick={() => onPlayVideo(continueWatchingVideo.id)}
              className="text-lg font-black text-black leading-snug line-clamp-2 hover:text-[#B45309] cursor-pointer transition-colors"
            >
              {continueWatchingVideo.title}
            </h3>
            {continueWatchingVideo.topic && (
              <p className="text-xs font-bold text-gray-600 mt-1">
                Topic: {continueWatchingVideo.topic}
              </p>
            )}
          </div>

          {/* Progress bar and time */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="text-gray-500">RESUME AT</span>
              <span className="font-mono text-black">
                {formatSecs(currentTime)} / {continueWatchingVideo.duration || '28:00'}
              </span>
            </div>
            <div className="w-full bg-[#E5E5E5] border-2 border-black rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-black h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(percent, 5)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t-2 border-gray-200">
        <button
          onClick={() => onPlayVideo(continueWatchingVideo.id)}
          className="flex-1 bg-[#FFE600] border-2 border-black py-2.5 px-4 rounded-lg font-black text-xs uppercase tracking-wider text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] shadow-[3px_3px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-black stroke-black" />
          <span>Resume Playing Now →</span>
        </button>

        <button
          onClick={() => markVideoComplete(continueWatchingVideo.id)}
          className="bg-white border-2 border-black py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider text-black hover:bg-emerald-50 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
          title="Mark as complete"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Mark Done</span>
        </button>
      </div>
    </div>
  );
};
