import React, { useState } from 'react';
import { FolderClosed, X, Plus } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addPlaylist } = useLearning();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Full Stack Development');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addPlaylist({
      title: title.trim(),
      category: category.trim(),
      description: description.trim()
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-red-100 cursor-pointer"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#DDD6FE] text-purple-900 px-2 py-0.5 rounded border border-black">
            STRUCTURED COURSE
          </span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1">
            CREATE NEW PLAYLIST
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Playlist Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Design for High Scalability"
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Architecture, Backend, AI..."
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course objectives or roadmap notes..."
              rows={3}
              className="w-full bg-white border-2 border-black rounded-lg p-3 text-xs font-medium shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600] resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Playlist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
