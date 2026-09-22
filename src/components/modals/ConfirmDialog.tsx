import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from '../common/icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepNotes: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [keepNotes, setKeepNotes] = useState(true);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#FF5E1E] text-black shadow-[2px_2px_0px_#000000]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-black tracking-tight">
                Reset Progress?
              </h3>
              <p className="text-xs font-medium text-[#555555] mt-0.5">
                This will uncheck all solved problems and clear revision stars.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-white p-1 text-black hover:bg-black hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 border-2 border-black bg-[#ECECEC] p-3.5 shadow-[2px_2px_0px_#000000]">
          <label className="flex items-center gap-2.5 text-xs font-bold text-black cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepNotes}
              onChange={(e) => setKeepNotes(e.target.checked)}
              className="h-4 w-4 rounded-none border-2 border-black bg-white accent-black cursor-pointer"
            />
            <span>Keep my written problem notes</span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ECECEC] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(keepNotes);
              onClose();
            }}
            className="border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] hover:bg-red-500 transition-all"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};
