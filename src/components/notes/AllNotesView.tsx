import React, { useState } from 'react';
import { FileText, Clock, Play, Trash2, Search, Download, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface AllNotesViewProps {
  onPlayVideo: (videoId: string) => void;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({ onPlayVideo }) => {
  const { notes, deleteNote, setActiveTab, updateVideoProgress } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(
    (n) =>
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.videoTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportMarkdown = () => {
    let md = `# FOCUS LEARN - Study Notes & Takeaways\nExported on: ${new Date().toLocaleDateString()}\n\n`;
    notes.forEach((note, idx) => {
      md += `### ${idx + 1}. ${note.videoTitle} (@ ${note.timestampFormatted || '0:00'})\n`;
      md += `${note.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-learn-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePlayWithTimestamp = (videoId: string, seconds?: number) => {
    if (seconds && seconds > 0) {
      updateVideoProgress(videoId, seconds);
    }
    onPlayVideo(videoId);
  };

  return (
    <div className="px-3.5 sm:px-6 py-4 max-w-[1600px] mx-auto font-sans w-full box-border">
      {/* Header Banner */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#DDD6FE] text-purple-900 text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              KNOWLEDGE BASE
            </span>
            <span className="text-xs font-bold text-gray-500">
              {notes.length} Notes Captured
            </span>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            ALL TIMESTAMPED NOTES
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            All your insights, formulas, code snippets, and timestamps indexed in one place.
          </p>
        </div>

        {notes.length > 0 && (
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Notes (.md)</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by concept or video title..."
            className="w-full bg-white border-2 border-black rounded-lg pl-10 pr-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-xl p-12 text-center shadow-[4px_4px_0px_#000] max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#DDD6FE] border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#000]">
            <FileText className="w-8 h-8 text-purple-900" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">
            No Notes Found
          </h3>
          <p className="text-xs font-medium text-gray-600 mb-6 leading-relaxed">
            While learning from any video, click the "Take Note" button or hit{' '}
            <kbd className="font-mono bg-gray-100 border border-gray-400 px-1 py-0.5 rounded">
              N
            </kbd>{' '}
            to record timestamped takeaways.
          </p>
          <button
            onClick={() => setActiveTab('my-videos')}
            className="bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase text-black hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#000] cursor-pointer inline-flex items-center gap-2"
          >
            <span>Start Watching</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    onClick={() => handlePlayWithTimestamp(note.videoId, note.timestampSeconds)}
                    className="bg-[#FFE600] border-2 border-black px-2 py-0.5 rounded text-[11px] font-mono font-black text-black hover:bg-black hover:text-[#FFE600] transition-colors cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                    title="Jump to video moment"
                  >
                    <Clock className="w-3 h-3" />
                    <span>@ {note.timestampFormatted || '0:00'}</span>
                  </button>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4
                  onClick={() => handlePlayWithTimestamp(note.videoId, note.timestampSeconds)}
                  className="font-black text-xs text-gray-500 uppercase tracking-wider mb-2 line-clamp-1 hover:text-black cursor-pointer"
                >
                  {note.videoTitle}
                </h4>

                <p className="text-xs font-medium text-gray-900 leading-relaxed whitespace-pre-wrap bg-[#F4F0EA] border-2 border-black rounded-lg p-3 shadow-inner">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handlePlayWithTimestamp(note.videoId, note.timestampSeconds)}
                  className="text-xs font-black uppercase text-black hover:text-[#B45309] flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-black" />
                  <span>Review Lesson</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
