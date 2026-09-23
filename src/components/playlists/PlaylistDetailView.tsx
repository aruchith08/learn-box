import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Bookmark,
  Search,
  Check,
  Clock,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
} from '../common/focusIcons';
import { Playlist, Video } from '../../types/focusLearn';
import { useLearning } from '../../context/LearningContext';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onBack: () => void;
  onPlayVideo: (videoId: string) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  onBack,
  onPlayVideo,
}) => {
  const {
    progress,
    markVideoComplete,
    toggleBookmark,
    isBookmarked,
    reorderPlaylistVideos,
    deleteVideo,
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  const playlistVideos = playlist.videos || [];
  const completedCount = playlistVideos.filter(
    (v) => {
      const s = progress[v.id]?.status as string;
      return s === 'completed' || s === 'COMPLETED';
    }
  ).length;
  const progressPercent = playlistVideos.length > 0
    ? Math.round((completedCount / playlistVideos.length) * 100)
    : 0;

  const firstUnfinished = playlistVideos.find(
    (v) => {
      const s = progress[v.id]?.status as string;
      return s !== 'completed' && s !== 'COMPLETED';
    }
  );

  const filteredVideos = playlistVideos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.topic && v.topic.toLowerCase().includes(searchQuery.toLowerCase()));

    const isDone = progress[v.id]?.status === 'completed' || (progress[v.id]?.status as string) === 'COMPLETED';
    if (statusFilter === 'completed') return matchesSearch && isDone;
    if (statusFilter === 'uncompleted') return matchesSearch && !isDone;
    return matchesSearch;
  });

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= playlistVideos.length) return;

    const newOrder = [...playlistVideos];
    const temp = newOrder[index];
    newOrder[index] = newOrder[newIdx];
    newOrder[newIdx] = temp;

    reorderPlaylistVideos(playlist.id, newOrder.map((v) => v.id));
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto font-sans">
      {/* Top Back Navigation */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to All Playlists</span>
        </button>
      </div>

      {/* Playlist Hero Banner */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#DDD6FE] text-purple-900 border border-black font-black text-[11px] px-2.5 py-0.5 rounded uppercase">
                {playlist.category || 'CURRICULUM'}
              </span>
              <span className="text-xs font-bold text-gray-500">
                {playlistVideos.length} Videos Total
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-black mb-2 leading-tight">
              {playlist.title}
            </h1>

            {playlist.description && (
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-4 max-w-2xl">
                {playlist.description}
              </p>
            )}

            {/* Progress stats */}
            <div className="flex items-center gap-4 text-xs font-black text-black">
              <span>{completedCount} of {playlistVideos.length} completed</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{progressPercent}% complete</span>
            </div>

            <div className="w-full max-w-md bg-[#E5E5E5] border-2 border-black rounded-full h-3.5 overflow-hidden p-0.5 mt-2 shadow-inner">
              <div
                className="bg-[#FFE600] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(progressPercent, 3)}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {firstUnfinished && (
              <button
                onClick={() => onPlayVideo(firstUnfinished.id)}
                className="bg-[#FFE600] border-2 border-black px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black stroke-black" />
                <span>Resume Next Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this playlist..."
            className="w-full bg-white border-2 border-black rounded-lg pl-10 pr-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'uncompleted', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                statusFilter === filter
                  ? 'bg-black text-[#FFE600]'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Video Table List */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000]">
        <div className="divide-y-2 divide-black">
          {filteredVideos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold text-xs">
              No videos matched your search filter.
            </div>
          ) : (
            filteredVideos.map((video, idx) => {
              const prog = progress[video.id];
              const isCompleted = prog?.status === 'completed' || (prog?.status as string) === 'COMPLETED';
              const bookmarked = isBookmarked(video.id);

              return (
                <div
                  key={video.id}
                  className={`p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                    isCompleted ? 'bg-[#F9FCF9]' : 'hover:bg-[#F4F0EA]'
                  }`}
                >
                  {/* Left: Reorder Buttons, Index, Thumbnail & Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Reorder Up/Down */}
                    <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveVideo(idx, 'up')}
                        className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-black" />
                      </button>
                      <button
                        disabled={idx === playlistVideos.length - 1}
                        onClick={() => handleMoveVideo(idx, 'down')}
                        className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-black" />
                      </button>
                    </div>

                    {/* Index */}
                    <span className="w-7 h-7 bg-[#F4F0EA] border-2 border-black rounded flex items-center justify-center font-mono text-xs font-black shrink-0 mt-1 shadow-[1px_1px_0px_#000]">
                      {idx + 1}
                    </span>

                    {/* Thumbnail */}
                    <div
                      onClick={() => onPlayVideo(video.id)}
                      className="w-24 h-14 bg-black border-2 border-black rounded overflow-hidden relative cursor-pointer shrink-0 shadow-[2px_2px_0px_#000] group"
                    >
                      <img
                        src={video.thumbnailUrl || video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40">
                        <Play className="w-4 h-4 fill-white text-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>

                    {/* Title & Topic */}
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => onPlayVideo(video.id)}
                        className={`text-sm font-black text-black line-clamp-2 hover:text-[#B45309] cursor-pointer leading-snug ${
                          isCompleted ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {video.topic && (
                          <span className="text-[10px] font-bold bg-[#BAE6FD] text-blue-900 border border-black px-1.5 py-0.2 rounded">
                            {video.topic}
                          </span>
                        )}
                        {video.duration && (
                          <span className="text-[10px] font-mono text-gray-500">
                            {video.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleBookmark(video.id)}
                      className={`p-2 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer transition-colors ${
                        bookmarked ? 'bg-[#FEF08A]' : 'bg-white hover:bg-gray-100'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
                    </button>

                    {/* Mark Complete Toggle */}
                    <button
                      onClick={() => markVideoComplete(video.id)}
                      className={`px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isCompleted
                          ? 'bg-[#A7F3D0] text-black hover:bg-[#86EFAC]'
                          : 'bg-white hover:bg-emerald-50 text-gray-700'
                      }`}
                      title="Toggle Complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Done' : 'Mark'}</span>
                    </button>

                    {/* Play Video Button */}
                    <button
                      onClick={() => onPlayVideo(video.id)}
                      className="bg-[#FFE600] border-2 border-black px-3 py-1.5 rounded-lg text-xs font-black uppercase text-black hover:bg-[#FFD000] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
