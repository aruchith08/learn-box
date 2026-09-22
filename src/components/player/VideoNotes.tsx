import React, { useState } from 'react';
import { Plus, Trash2, Clock, FileText, Check } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Note } from '../../types/focusLearn';

interface VideoNotesProps {
  videoId: string;
  videoTitle: string;
  currentPlaybackSeconds: number;
  onSeek: (seconds: number) => void;
}

export const VideoNotes: React.FC<VideoNotesProps> = ({
  videoId,
  videoTitle,
  currentPlaybackSeconds,
  onSeek
}) => {
  const { notes, addNote, deleteNote } = useLearning();
  const [noteContent, setNoteContent] = useState('');
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  const videoNotes = notes.filter((n) => n.videoId === videoId);

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addNote({
      videoId,
      videoTitle,
      timestampSeconds: useCurrentTime ? Math.floor(currentPlaybackSeconds) : 0,
      timestampFormatted: useCurrentTime ? formatTimestamp(currentPlaybackSeconds) : '0:00',
      content: noteContent.trim()
    });

    setNoteContent('');
  };

  return (
    <div className="bg-[#F4F0EA] border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] flex flex-col h-full font-sans">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-black stroke-[2.5]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            TIMESTAMPED NOTES
          </h3>
        </div>
        <span className="text-[10px] font-black bg-white border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
          {videoNotes.length} SAVED
        </span>
      </div>

      {/* Note Input Form */}
      <form onSubmit={handleCreateNote} className="mb-4 space-y-2">
        <div className="relative">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Capture insight, formula, or code note..."
            rows={2}
            className="w-full text-xs font-medium p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600] resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setUseCurrentTime(!useCurrentTime)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black border transition-all cursor-pointer ${
              useCurrentTime
                ? 'bg-[#FEF08A] text-black border-black shadow-[1px_1px_0px_#000]'
                : 'bg-white text-gray-500 border-gray-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>@ {formatTimestamp(currentPlaybackSeconds)}</span>
          </button>

          <button
            type="submit"
            disabled={!noteContent.trim()}
            className="bg-[#FFE600] text-black border-2 border-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Save Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] custom-scrollbar">
        {videoNotes.length === 0 ? (
          <div className="text-center py-8 px-4 bg-white/70 border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-xs font-bold text-gray-600">
              No notes for this video yet.
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Click pause or hit <kbd className="font-mono bg-gray-200 px-1 border border-gray-400 rounded">N</kbd> while learning to log important concepts.
            </p>
          </div>
        ) : (
          videoNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white border-2 border-black rounded-lg p-2.5 shadow-[2px_2px_0px_#000] group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <button
                  type="button"
                  onClick={() => onSeek(note.timestampSeconds)}
                  className="bg-[#FFE600] border border-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black text-black hover:bg-black hover:text-[#FFE600] transition-colors cursor-pointer flex items-center gap-1"
                  title="Jump to this moment in video"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{note.timestampFormatted}</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
