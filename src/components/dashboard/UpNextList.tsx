import React from 'react';
import { ArrowRight, Film } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Video } from '../../types/focusLearn';

interface UpNextListProps {
  onPlayVideo: (videoId: string) => void;
}

export const UpNextList: React.FC<UpNextListProps> = ({ onPlayVideo }) => {
  const {
    allVideos,
    playlists,
    continueWatchingVideo,
    lastWatchedVideo,
    progress,
    setActiveTab,
  } = useLearning();

  const { upNextVideos, currentPlaylist } = React.useMemo(() => {
    // 1. Identify the reference video: in-progress continue watching video, or most recently watched video
    const refVideo = continueWatchingVideo || lastWatchedVideo;

    // 2. Identify the active playlist
    let targetPlaylist = refVideo?.playlistId
      ? playlists.find((p) => p.id === refVideo.playlistId) || null
      : null;

    // If no watch history at all, default to the first playlist in the catalog
    if (!refVideo && playlists.length > 0 && playlists[0].videos && playlists[0].videos.length > 0) {
      targetPlaylist = playlists[0];
    }

    let nextList: Video[] = [];

    if (targetPlaylist && targetPlaylist.videos && targetPlaylist.videos.length > 0) {
      const plVideos = targetPlaylist.videos;
      const refIdx = refVideo ? plVideos.findIndex((v) => v.id === refVideo.id) : -1;

      // Start from the video immediately after the reference video (or from index 1 if brand new)
      const startIndex = refIdx >= 0 ? refIdx + 1 : 1;
      const subsequent = plVideos.slice(startIndex);

      // Filter for uncompleted videos
      const uncompletedSubsequent = subsequent.filter((v) => {
        const p = progress[v.id];
        return !p || (p.status !== 'completed' && (p.status as string) !== 'COMPLETED');
      });

      nextList = uncompletedSubsequent.slice(0, 3);

      // If playlist has reached the end or has fewer than 3 uncompleted videos, fill with next playlist
      if (nextList.length < 3) {
        const currentPlIdx = playlists.findIndex((p) => p.id === targetPlaylist!.id);
        for (let i = currentPlIdx + 1; i < playlists.length && nextList.length < 3; i++) {
          const nextPl = playlists[i];
          if (nextPl.videos) {
            for (let j = 0; j < nextPl.videos.length && nextList.length < 3; j++) {
              const cand = nextPl.videos[j];
              const p = progress[cand.id];
              const isDone = p?.status === 'completed' || (p?.status as string) === 'COMPLETED';
              const alreadyInList =
                nextList.some((x) => x.id === cand.id) || (refVideo && cand.id === refVideo.id);
              if (!isDone && !alreadyInList) {
                nextList.push(cand);
              }
            }
          }
        }
      }
    } else {
      // If reference video is standalone or not in a playlist, look for related or library videos
      const candList = allVideos.filter((v) => {
        if (refVideo && v.id === refVideo.id) return false;
        const p = progress[v.id];
        return !p || (p.status !== 'completed' && (p.status as string) !== 'COMPLETED');
      });
      nextList = candList.slice(0, 3);
    }

    return { upNextVideos: nextList, currentPlaylist: targetPlaylist };
  }, [allVideos, playlists, continueWatchingVideo, lastWatchedVideo, progress]);

  return (
    <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#111111]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0 pr-2">
          <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111]">
            UP NEXT
          </h2>
          {currentPlaylist && (
            <div className="text-[10px] font-bold text-gray-500 truncate">
              From {currentPlaylist.title}
            </div>
          )}
        </div>
        <button
          onClick={() => setActiveTab('tracker')}
          className="text-[#111111] hover:translate-x-0.5 transition-transform cursor-pointer shrink-0"
          title="View Queue in Tracker"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Queue Rows */}
      {upNextVideos.length === 0 ? (
        <div className="text-xs font-mono text-gray-500 py-4 text-center">
          All upcoming playlist lessons completed!
        </div>
      ) : (
        <div className="space-y-2.5">
          {upNextVideos.map((video, idx) => {
            // Display actual lesson position in the playlist when available
            let numberLabel = `0${idx + 2}`;
            if (currentPlaylist && currentPlaylist.videos) {
              const plIndex = currentPlaylist.videos.findIndex((v) => v.id === video.id);
              if (plIndex !== -1) {
                const lessonNum = plIndex + 1;
                numberLabel = lessonNum < 10 ? `0${lessonNum}` : `${lessonNum}`;
              }
            }

            return (
              <div
                key={video.id}
                onClick={() => onPlayVideo(video.id)}
                className="flex items-center gap-3 p-2 rounded-xl border-2 border-transparent hover:border-[#111111] hover:bg-[#F4F1EB] transition-all cursor-pointer group"
              >
                {/* Number in square box matching reference design */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F4F1EB] border-2 border-[#111111] rounded-lg flex items-center justify-center font-mono font-black text-xs text-[#111111] shrink-0 shadow-[2px_2px_0px_#111111] group-hover:bg-[#FFE600] transition-colors">
                  {numberLabel}
                </div>

                {/* Title & Playlist subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-display font-black text-[#111111] truncate group-hover:text-[#B45309]">
                    {video.title}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500 truncate">
                    {video.playlistTitle || currentPlaylist?.title || video.category || 'Curriculum'}
                  </div>
                </div>

                {/* Duration on right */}
                <div className="font-mono text-[10px] font-bold text-gray-600 shrink-0">
                  {video.durationFormatted || video.duration || '25:00'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

