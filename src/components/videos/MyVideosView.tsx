import React, { useState } from 'react';
import {
  Film,
  Plus,
  Play,
  CheckCircle2,
  Bookmark,
  Search,
  Clock,
  FileText,
  Trash2
} from '../common/focusIcons';
import { Video } from '../../types/focusLearn';
import { useLearning } from '../../context/LearningContext';

interface MyVideosViewProps {
  onPlayVideo: (videoId: string) => void;
  onOpenAddVideo: () => void;
}

export const MyVideosView: React.FC<MyVideosViewProps> = ({
  onPlayVideo,
  onOpenAddVideo
}) => {
  const { allVideos, progress, markVideoComplete, toggleBookmark, isBookmarked, deleteVideo, notes } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'standalone' | 'completed' | 'in_progress'>('all');

  // Filter videos
  const filteredVideos = allVideos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.topic && v.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'standalone') return !v.playlistId;
    if (filterMode === 'completed') return progress[v.id]?.status === 'completed';
    if (filterMode === 'in_progress') return progress[v.id]?.status === 'in_progress';
    return true;
  });

  const standaloneCount = allVideos.filter((v) => !v.playlistId).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FECDD3] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              STANDALONE VIDEOS & REPOSITORY
            </span>
            <span className="text-xs font-bold text-gray-500">
              {standaloneCount} Standalone • {allVideos.length} Total Videos
            </span>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            MY VIDEOS & LECTURES
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Save individual one-off tutorials, crash courses, and tech talks without creating a playlist.
          </p>
        </div>

        <button
          onClick={onOpenAddVideo}
          className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Standalone Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all individual videos..."
            className="w-full bg-white border-2 border-black rounded-lg pl-10 pr-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${allVideos.length})` },
            { id: 'standalone', label: `Standalone (${standaloneCount})` },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                filterMode === tab.id
                  ? 'bg-black text-[#FFE600]'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredVideos.map((video) => {
          const prog = progress[video.id];
          const isDone = prog?.status === 'completed';
          const percent = prog ? prog.percent : 0;
          const bookmarked = isBookmarked(video.id);
          const videoNotesCount = notes.filter((n) => n.videoId === video.id).length;

          return (
            <div
              key={video.id}
              className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail */}
              <div
                onClick={() => onPlayVideo(video.id)}
                className="relative aspect-video bg-black overflow-hidden cursor-pointer"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#FFE600] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Play className="w-4 h-4 fill-black stroke-black translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-700">
                    {video.duration}
                  </div>
                )}

                {/* Category / Standalone Tag */}
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] uppercase ${
                    video.playlistId ? 'bg-[#DDD6FE] text-purple-900' : 'bg-[#FEF08A] text-black'
                  }`}>
                    {video.playlistTitle ? video.playlistTitle.slice(0, 16) + '...' : video.category || 'Standalone'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => onPlayVideo(video.id)}
                    className={`font-black text-sm text-black line-clamp-2 hover:text-[#B45309] cursor-pointer mb-2 leading-snug ${
                      isDone ? 'text-gray-500' : ''
                    }`}
                  >
                    {video.title}
                  </h3>

                  {video.topic && (
                    <div className="text-[11px] font-bold text-gray-500 mb-2">
                      Topic: {video.topic}
                    </div>
                  )}
                </div>

                <div>
                  {/* Progress info */}
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-600 mb-1">
                    <span>{percent}% watched</span>
                    {videoNotesCount > 0 && (
                      <span className="flex items-center gap-1 text-purple-700">
                        <FileText className="w-3 h-3" /> {videoNotesCount} notes
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-[#E5E5E5] border-2 border-black rounded-full h-2.5 overflow-hidden p-0.5 mb-3 shadow-inner">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percent, isDone ? 100 : 2)}%` }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => markVideoComplete(video.id)}
                      className={`flex-1 py-1 px-2 rounded-lg border-2 border-black text-[11px] font-black uppercase flex items-center justify-center gap-1 shadow-[1px_1px_0px_#000] cursor-pointer ${
                        isDone ? 'bg-[#A7F3D0] text-black' : 'bg-white hover:bg-emerald-50 text-gray-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Done' : 'Complete'}</span>
                    </button>

                    <button
                      onClick={() => toggleBookmark(video.id)}
                      className={`p-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer ${
                        bookmarked ? 'bg-[#FEF08A]' : 'bg-white hover:bg-gray-100'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
                    </button>

                    <button
                      onClick={() => onPlayVideo(video.id)}
                      className="bg-[#FFE600] border-2 border-black px-3 py-1 rounded-lg text-[11px] font-black uppercase text-black hover:bg-[#FFD000] shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
