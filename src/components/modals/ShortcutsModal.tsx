import React from 'react';
import { Keyboard, X } from '../common/focusIcons';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open global search omnibar' },
    { key: 'F', desc: 'Toggle Distraction-Free Focus Mode' },
    { key: 'C', desc: 'Toggle video completion status' },
    { key: 'B', desc: 'Bookmark or remove current video' },
    { key: 'N', desc: 'Skip to next video in curriculum' },
    { key: 'P', desc: 'Return to previous video' },
    { key: '?', desc: 'Show this keyboard shortcuts cheat-sheet' },
    { key: 'Esc', desc: 'Exit Focus Mode / Close active modal' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-red-100 cursor-pointer"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-[#FFE600] border-2 border-black rounded-lg flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
            <Keyboard className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              KEYBOARD SHORTCUTS
            </h2>
            <p className="text-[11px] font-bold text-gray-600">
              Navigate and learn without touching your mouse.
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
            >
              <span className="text-xs font-bold text-gray-700">{sc.desc}</span>
              <kbd className="font-mono text-xs font-black bg-[#FEF08A] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#FFE600] border-2 border-black py-2 rounded-lg text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
        >
          Got It, Let's Focus
        </button>
      </div>
    </div>
  );
};
