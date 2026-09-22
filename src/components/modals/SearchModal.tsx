import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, FolderClosed, FileText, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Playlist, Video } from '../../types/focusLearn';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (videoId: string) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
  onSelectPlaylist
}) => {
  const { allVideos, playlists, notes } = useLearning();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingPlaylists = q
    ? playlists.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchingVideos = q
    ? allVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.topic && v.topic.toLowerCase().includes(q))
      ).slice(0, 8)
    : allVideos.slice(0, 6);

  const matchingNotes = q
    ? notes.filter(
        (n) =>
          n.content.toLowerCase().includes(q) ||
          n.videoTitle.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000] w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Top Search Input */}
        <div className="p-4 bg-white border-b-3 border-black flex items-center gap-3">
          <Search className="w-5 h-5 text-black stroke-[3]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all videos, playlists, topics, and notes..."
            className="flex-1 bg-transparent text-sm font-black text-black placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono font-black bg-gray-100 border border-gray-400 px-1.5 py-0.5 rounded text-gray-700">
            Esc
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[480px] overflow-y-auto space-y-4 custom-scrollbar">
          {/* Matching Playlists */}
          {matchingPlaylists.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">
                Playlists & Curriculums
              </div>
              <div className="space-y-1.5">
                {matchingPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      onClose();
                      onSelectPlaylist(pl);
                    }}
                    className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-yellow-100 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderClosed className="w-4 h-4 text-black" />
                      <span className="text-xs font-black text-black truncate max-w-md">
                        {pl.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500">
                      {pl.videos.length} videos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Videos */}
          <div>
            <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">
              {q ? 'Matching Lessons' : 'Recent / Suggested Videos'}
            </div>
            <div className="space-y-1.5">
              {matchingVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => {
                    onClose();
                    onSelectVideo(video.id);
                  }}
                  className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-[#FFE600] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 bg-black text-[#FFE600] rounded flex items-center justify-center shrink-0">
                      <Play className="w-3 h-3 fill-[#FFE600]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-black truncate">
                        {video.title}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 truncate">
                        {video.playlistTitle || video.category || 'Standalone'}
                      </div>
                    </div>
                  </div>

                  {video.duration && (
                    <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-2">
                      {video.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Matching Notes */}
          {matchingNotes.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">
                Saved Notes
              </div>
              <div className="space-y-1.5">
                {matchingNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      onClose();
                      onSelectVideo(note.videoId);
                    }}
                    className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-purple-100 transition-all cursor-pointer flex items-start justify-between gap-2 group"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-800 line-clamp-1">
                          {note.content}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500">
                          {note.videoTitle} (@ {note.timestampFormatted})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#EAE5DC] border-t-2 border-black flex items-center justify-between text-[11px] font-bold text-gray-600">
          <span>Search shortcut: <kbd className="font-mono bg-white px-1 border border-gray-400 rounded">Ctrl+K</kbd></span>
          <span>Press <kbd className="font-mono bg-white px-1 border border-gray-400 rounded">Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
