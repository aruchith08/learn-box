import React from 'react';
import { Film, FolderClosed, Upload, X } from '../common/focusIcons';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddVideo: () => void;
  onSelectCreatePlaylist: () => void;
  onSelectImportCSV: () => void;
}

export const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  onSelectAddVideo,
  onSelectCreatePlaylist,
  onSelectImportCSV
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-red-100 cursor-pointer"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] text-black px-2 py-0.5 rounded border border-black">
            EXPAND YOUR VAULT
          </span>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight mt-1">
            ADD LEARNING CONTENT
          </h2>
          <p className="text-xs font-bold text-gray-600 mt-0.5">
            Choose how you want to expand your distraction-free curriculum:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* Option 1: Add Standalone Video */}
          <button
            onClick={() => {
              onClose();
              onSelectAddVideo();
            }}
            className="flex items-start gap-4 p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-left group"
          >
            <div className="w-12 h-12 bg-[#FECDD3] border-2 border-black rounded-xl flex items-center justify-center font-black shrink-0 group-hover:rotate-2 transition-transform">
              <Film className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-sm font-black text-black uppercase group-hover:text-[#B45309]">
                Add Standalone Video
              </div>
              <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">
                Paste any single YouTube URL. No playlist required. Ideal for crash courses, tech talks, and one-off deep dives.
              </p>
            </div>
          </button>

          {/* Option 2: Create Playlist */}
          <button
            onClick={() => {
              onClose();
              onSelectCreatePlaylist();
            }}
            className="flex items-start gap-4 p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-left group"
          >
            <div className="w-12 h-12 bg-[#DDD6FE] border-2 border-black rounded-xl flex items-center justify-center font-black shrink-0 group-hover:rotate-2 transition-transform">
              <FolderClosed className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-sm font-black text-black uppercase group-hover:text-[#B45309]">
                Create New Playlist
              </div>
              <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">
                Organize multiple videos into a structured sequential course with custom titles, categories, and tracking.
              </p>
            </div>
          </button>

          {/* Option 3: Import from CSV */}
          <button
            onClick={() => {
              onClose();
              onSelectImportCSV();
            }}
            className="flex items-start gap-4 p-4 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-left group"
          >
            <div className="w-12 h-12 bg-[#A7F3D0] border-2 border-black rounded-xl flex items-center justify-center font-black shrink-0 group-hover:rotate-2 transition-transform">
              <Upload className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-sm font-black text-black uppercase group-hover:text-[#B45309]">
                Import Playlist from CSV
              </div>
              <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">
                Upload or paste a spreadsheet. Auto-detects columns (URL, Title, Topic) with duplicate preview before importing.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
