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
  Trash2,
  FolderPlus,
  MoreVertical,
  Check,
} from '../common/focusIcons';
import { Video } from '../../types/focusLearn';
import { useLearning } from '../../context/LearningContext';

interface MyVideosViewProps {
  onPlayVideo: (videoId: string) => void;
  onOpenAddVideo: () => void;
}

type MyVideosFilterType = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'BOOKMARKED' | 'NOT_STARTED';

export const MyVideosView: React.FC<MyVideosViewProps> = ({
  onPlayVideo,
  onOpenAddVideo,
}) => {
  const {
    allVideos,
    playlists,
    progress,
    markVideoComplete,
    toggleBookmark,
    isBookmarked,
    deleteVideo,
    addVideo,
    notes,
    addNote,
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<MyVideosFilterType>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [targetPlaylistVideo, setTargetPlaylistVideo] = useState<Video | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [noteTargetVideo, setNoteTargetVideo] = useState<Video | null>(null);
  const [noteText, setNoteText] = useState('');

  // Filter videos
  const filteredVideos = allVideos.filter((v) => {
    const prog = progress[v.id];
    const isDone = prog?.status === 'completed' || (prog?.status as string) === 'COMPLETED';
    const isInProg = prog?.status === 'in_progress' || (prog?.status as string) === 'IN_PROGRESS';
    const isUnstarted = !isDone && !isInProg;
    const isBm = isBookmarked(v.id);

    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.topic && v.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'IN_PROGRESS') return isInProg;
    if (filterMode === 'COMPLETED') return isDone;
    if (filterMode === 'BOOKMARKED') return isBm;
    if (filterMode === 'NOT_STARTED') return isUnstarted;
    return true;
  });

  const handleLinkToPlaylist = () => {
    if (!targetPlaylistVideo || !selectedPlaylistId) return;
    addVideo({
      youtubeId: targetPlaylistVideo.youtubeId,
      title: targetPlaylistVideo.title,
      playlistId: selectedPlaylistId,
    });
    setTargetPlaylistVideo(null);
    setSelectedPlaylistId('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTargetVideo || !noteText.trim()) return;
    addNote({
      videoId: noteTargetVideo.id,
      videoTitle: noteTargetVideo.title,
      timestampSeconds: 0,
      timestampFormatted: '0:00',
      content: noteText.trim(),
    });
    setNoteTargetVideo(null);
    setNoteText('');
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FECDD3] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              ALL LEARNING VIDEOS
            </span>
            <span className="text-xs font-bold text-gray-500">
              {allVideos.length} Total Lessons Tracked
            </span>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            MY VIDEOS & LECTURES
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Unified catalog across all curriculums and individual tutorials.
          </p>
        </div>

        <button
          onClick={onOpenAddVideo}
          className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Video</span>
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

        {/* Filter Pills matching prompt: ALL, IN PROGRESS, COMPLETED, BOOKMARKED, NOT STARTED */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All (${allVideos.length})` },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'BOOKMARKED', label: 'Bookmarked' },
            { id: 'NOT_STARTED', label: 'Not Started' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                filterMode === tab.id
                  ? 'bg-black text-[#FFE600] translate-x-0.5'
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
          const isDone = prog?.status === 'completed' || (prog?.status as string) === 'COMPLETED';
          const isInProgress = prog?.status === 'in_progress' || (prog?.status as string) === 'IN_PROGRESS';
          const percent = isDone ? 100 : prog ? prog.percent || prog.progressPercentage : 0;
          const bookmarked = isBookmarked(video.id);

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
                  src={video.thumbnailUrl || video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#FFE600] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Play className="w-4 h-4 fill-black stroke-black translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-700">
                  {video.duration || '25:00'}
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
                      isDone
                        ? 'bg-[#A7F3D0] text-black'
                        : isInProgress
                        ? 'bg-[#FECDD3] text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Info & Progress */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                    <span className="truncate max-w-[180px]">
                      {video.playlistTitle || video.category || 'Standalone Video'}
                    </span>
                    <span className="font-mono text-black font-black">{percent}%</span>
                  </div>

                  <h3
                    onClick={() => onPlayVideo(video.id)}
                    className="font-black text-sm text-black leading-snug line-clamp-2 hover:text-[#B45309] cursor-pointer mb-2"
                  >
                    {video.title}
                  </h3>

                  {video.channel && (
                    <div className="text-[11px] font-bold text-gray-500 truncate mb-2">
                      {video.channel}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-2 mb-3">
                  <div className="w-full bg-[#E5E5E5] border border-black rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-[#FFE600]'
                      }`}
                      style={{ width: `${Math.max(percent, 0)}%` }}
                    />
                  </div>
                </div>

                {/* Actions: Play, Complete, Bookmark, Add Note, Add to Playlist, Remove */}
                <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-1">
                  <button
                    onClick={() => onPlayVideo(video.id)}
                    className="p-1.5 bg-[#FFE600] border-2 border-black rounded shadow-[1px_1px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>

                  <button
                    onClick={() => markVideoComplete(video.id)}
                    className={`p-1.5 border-2 border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer ${
                      isDone ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-emerald-50'
                    }`}
                    title="Toggle Complete"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleBookmark(video.id)}
                    className={`p-1.5 border-2 border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer ${
                      bookmarked ? 'bg-[#FEF08A]' : 'bg-white hover:bg-yellow-50'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
                  </button>

                  <button
                    onClick={() => setNoteTargetVideo(video)}
                    className="p-1.5 bg-white border-2 border-black rounded shadow-[1px_1px_0px_#000] hover:bg-gray-100 cursor-pointer"
                    title="Add Note"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setTargetPlaylistVideo(video)}
                    className="p-1.5 bg-white border-2 border-black rounded shadow-[1px_1px_0px_#000] hover:bg-gray-100 cursor-pointer"
                    title="Add to Playlist"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove "${video.title}" from your library?`)) {
                        deleteVideo(video.id);
                      }
                    }}
                    className="p-1.5 bg-white text-gray-500 hover:text-red-600 border-2 border-black rounded shadow-[1px_1px_0px_#000] hover:bg-red-50 cursor-pointer"
                    title="Remove Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add To Playlist Modal */}
      {targetPlaylistVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F0EA] border-4 border-black rounded-xl p-5 shadow-[8px_8px_0px_#000] w-full max-w-md">
            <h3 className="text-sm font-black uppercase mb-2">
              Add "{targetPlaylistVideo.title}" to Playlist
            </h3>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold mb-4 shadow-[2px_2px_0px_#000]"
            >
              <option value="">-- Select Playlist --</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTargetPlaylistVideo(null)}
                className="px-3 py-1.5 border-2 border-black rounded bg-white text-xs font-black uppercase"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPlaylistId}
                onClick={handleLinkToPlaylist}
                className="px-4 py-1.5 border-2 border-black rounded bg-[#FFE600] text-xs font-black uppercase text-black disabled:opacity-50"
              >
                Link Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Note Modal */}
      {noteTargetVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4F0EA] border-4 border-black rounded-xl p-5 shadow-[8px_8px_0px_#000] w-full max-w-md">
            <h3 className="text-sm font-black uppercase mb-2">
              Add Note for "{noteTargetVideo.title}"
            </h3>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <textarea
                autoFocus
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter learning takeaway or formula..."
                className="w-full bg-white border-2 border-black rounded-lg p-2.5 text-xs font-medium focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNoteTargetVideo(null)}
                  className="px-3 py-1.5 border-2 border-black rounded bg-white text-xs font-black uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-1.5 border-2 border-black rounded bg-[#FFE600] text-xs font-black uppercase text-black disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
