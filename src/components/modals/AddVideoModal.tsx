import React, { useState, useEffect } from 'react';
import { Film, X, Plus, Play } from '../common/focusIcons';
import { parseYouTubeUrl, cleanVideoTitle } from '../../services/youtubeParser';
import { useLearning } from '../../context/LearningContext';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaylistId?: string;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  defaultPlaylistId
}) => {
  const { playlists, addVideo } = useLearning();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [duration, setDuration] = useState('25:00');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(defaultPlaylistId || '');

  const [parsed, setParsed] = useState<ReturnType<typeof parseYouTubeUrl> | null>(null);

  useEffect(() => {
    if (url.trim()) {
      const p = parseYouTubeUrl(url);
      setParsed(p);
      if (p.isValid && !title.trim()) {
        setTitle(cleanVideoTitle(`Video: ${p.youtubeId}`));
      }
    } else {
      setParsed(null);
    }
  }, [url]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.isValid || !parsed.youtubeId) return;

    addVideo({
      youtubeId: parsed.youtubeId,
      title: title.trim() || `YouTube Video (${parsed.youtubeId})`,
      topic: topic.trim() || undefined,
      category: category.trim() || undefined,
      duration: duration.trim() || undefined,
      playlistId: selectedPlaylistId ? selectedPlaylistId : undefined
    });

    // Reset & close
    setUrl('');
    setTitle('');
    setTopic('');
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
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#FECDD3] text-black px-2 py-0.5 rounded border border-black">
            INDIVIDUAL OR PLAYLIST VIDEO
          </span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1">
            ADD NEW YOUTUBE VIDEO
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* URL input */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              YouTube Video URL or ID *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          {/* Thumbnail preview if valid */}
          {parsed && parsed.isValid && (
            <div className="flex items-center gap-3 p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              <img
                src={parsed.thumbnailUrl}
                alt="Preview"
                className="w-20 h-12 object-cover rounded border border-black shrink-0"
              />
              <div className="text-xs font-bold text-gray-700 truncate">
                <div className="text-emerald-600 font-black text-[10px] uppercase">
                  ✓ Valid YouTube Video Detected
                </div>
                <div className="font-mono text-[11px] text-gray-500">ID: {parsed.youtubeId}</div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Video Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Docker Crash Course for Beginners"
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          {/* Playlist assignment dropdown */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Assign to Playlist (Optional)
            </label>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
            >
              <option value="">None (Keep as Standalone Video)</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title}
                </option>
              ))}
            </select>
            <p className="text-[10px] font-bold text-gray-500 mt-1">
              Leaving this as "None" saves it directly to your standalone "My Videos" vault.
            </p>
          </div>

          {/* Topic & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Topic / Tag
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Containers"
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45:00"
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
              />
            </div>
          </div>

          {/* Submit */}
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
              disabled={!parsed || !parsed.isValid}
              className="px-5 py-2 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save to Focus Learn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
