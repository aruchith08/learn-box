import React, { useState, useEffect } from 'react';
import { DSAProblem } from '../../types/dsa';
import { X, Save, Trash2, FileEdit } from '../common/icons';

interface NoteModalProps {
  problem: DSAProblem | null;
  initialNote: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, text: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  problem,
  initialNote,
  isOpen,
  onClose,
  onSave,
}) => {
  const [noteText, setNoteText] = useState(initialNote);

  useEffect(() => {
    setNoteText(initialNote);
  }, [initialNote, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !problem) return null;

  const handleSave = () => {
    onSave(problem.id, noteText);
    onClose();
  };

  const handleClear = () => {
    setNoteText('');
    onSave(problem.id, '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-[#FF5E1E] text-white">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-black/60">
                Problem #{problem.id} • {problem.category}
              </div>
              <h3 className="text-sm font-black uppercase text-black leading-snug">
                {problem.cleanTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-white p-1 hover:bg-black hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <label htmlFor="problem-note" className="block text-xs font-black uppercase text-black mb-1.5">
            Personal Problem Note
          </label>
          <textarea
            id="problem-note"
            rows={5}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write key patterns, recurrence relations, corner cases, or complexity notes..."
            className="w-full border-2 border-black bg-[#F8F8F8] p-3 text-xs font-mono text-black placeholder-black/40 outline-none focus:bg-white focus:ring-0"
            autoFocus
          />
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono font-bold text-black/60">
            <span>Saved locally in browser</span>
            <span>{noteText.length} characters</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t-2 border-black">
          {initialNote ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-red-600 hover:bg-red-600 hover:text-white shadow-[2px_2px_0px_#000000] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Note</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase text-black hover:bg-black/10 shadow-[2px_2px_0px_#000000]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 border-2 border-black bg-[#FF5E1E] px-4 py-1.5 text-xs font-black uppercase text-black hover:bg-[#E04D12] hover:text-white shadow-[2px_2px_0px_#000000] transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
