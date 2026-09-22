import React, { useState, useEffect } from 'react';
import {
  Minimize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  FileText,
  X,
  Clock
} from '../common/focusIcons';
import { Video } from '../../types/focusLearn';
import { useLearning } from '../../context/LearningContext';

interface FocusModePlayerProps {
  video: Video;
  onExitFocusMode: () => void;
  onNextVideo: () => void;
  onPrevVideo: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const FocusModePlayer: React.FC<FocusModePlayerProps> = ({
  video,
  onExitFocusMode,
  onNextVideo,
  onPrevVideo,
  hasNext,
  hasPrev
}) => {
  const { progress, markVideoComplete, toggleBookmark, isBookmarked, addNote } = useLearning();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const bookmarked = isBookmarked(video.id);
  const isComplete = progress[video.id]?.status === 'completed';

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNoteModal) {
          setShowNoteModal(false);
        } else {
          onExitFocusMode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNoteModal, onExitFocusMode]);

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    addNote({
      videoId: video.id,
      videoTitle: video.title,
      timestampSeconds: 0,
      timestampFormatted: 'Focus',
      content: quickNote.trim()
    });

    setQuickNote('');
    setShowNoteModal(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0F0F12] z-50 flex flex-col items-center justify-between p-4 font-sans select-none animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl bg-[#1C1C21] border-3 border-black text-white px-5 py-2.5 rounded-xl shadow-[5px_5px_0px_#000] flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="bg-[#FFE600] text-black font-black text-[10px] px-2 py-0.5 rounded border border-black uppercase tracking-wider shrink-0">
            FOCUS MODE ACTIVE
          </span>
          <h2 className="text-xs md:text-sm font-black text-white truncate max-w-md">
            {video.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Note Button */}
          <button
            onClick={() => setShowNoteModal(true)}
            className="bg-[#2A2A32] hover:bg-white hover:text-black border-2 border-black px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            title="Take Quick Note (N)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Note</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(video.id)}
            className={`border-2 border-black px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer ${
              bookmarked
                ? 'bg-[#FEF08A] text-black'
                : 'bg-[#2A2A32] text-white hover:bg-white hover:text-black'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
          </button>

          {/* Mark Complete */}
          <button
            onClick={() => markVideoComplete(video.id)}
            className={`border-2 border-black px-3 py-1 rounded-lg text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer ${
              isComplete
                ? 'bg-[#A7F3D0] text-black'
                : 'bg-[#FFE600] text-black hover:bg-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isComplete ? 'Done' : 'Complete'}</span>
          </button>

          {/* Exit Focus Mode */}
          <button
            onClick={onExitFocusMode}
            className="bg-red-500 text-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
            title="Exit Focus Mode (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport (Center) */}
      <div className="w-full max-w-5xl flex-1 flex items-center justify-center relative my-auto">
        <div className="w-full aspect-video border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_#000] bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`}
            title={video.title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Bottom Minimal Navigation Dock */}
      <div className="w-full max-w-5xl bg-[#1C1C21] border-3 border-black text-white px-5 py-2.5 rounded-xl shadow-[5px_5px_0px_#000] flex items-center justify-between mt-2">
        <button
          onClick={onPrevVideo}
          disabled={!hasPrev}
          className="bg-[#2A2A32] text-white hover:bg-white hover:text-black border-2 border-black px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>Previous Video</span>
        </button>

        <div className="text-[11px] font-bold text-gray-400">
          Press <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded border border-gray-700 font-mono">Esc</kbd> to exit Focus Mode
        </div>

        <button
          onClick={onNextVideo}
          disabled={!hasNext}
          className="bg-[#FFE600] text-black hover:bg-white border-2 border-black px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          <span>Next Video</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#F4F0EA] border-4 border-black rounded-xl p-5 shadow-[8px_8px_0px_#000] w-full max-w-md">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-3">
              <h3 className="font-black text-sm uppercase text-black flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Add Quick Insight</span>
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-3">
              <textarea
                autoFocus
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Type your takeaway..."
                rows={4}
                className="w-full p-3 bg-white border-2 border-black rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-[2px_2px_0px_#000]"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black uppercase bg-white hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickNote.trim()}
                  className="px-4 py-1.5 border-2 border-black rounded-lg text-xs font-black uppercase bg-[#FFE600] hover:bg-white text-black disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000]"
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
