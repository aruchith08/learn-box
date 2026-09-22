import React, { useState, useEffect } from 'react';
import { Film, X, Plus, Play, FolderPlus, AlertCircle } from '../common/focusIcons';
import { parseYouTubeUrl, cleanVideoTitle } from '../../services/youtubeParser';
import { useLearning } from '../../context/LearningContext';
import { Video } from '../../types/focusLearn';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaylistId?: string;
  onOpenVideo?: (videoId: string) => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  defaultPlaylistId,
  onOpenVideo,
}) => {
  const { playlists, addVideo, findCanonicalVideo } = useLearning();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [duration, setDuration] = useState('25:00');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(defaultPlaylistId || '');

  const [parsed, setParsed] = useState<ReturnType<typeof parseYouTubeUrl> | null>(null);
  const [existingVideo, setExistingVideo] = useState<Video | null>(null);
  const [showAddToPlaylistOnly, setShowAddToPlaylistOnly] = useState(false);

  useEffect(() => {
    if (url.trim()) {
      const p = parseYouTubeUrl(url);
      setParsed(p);
      if (p.isValid && p.youtubeId) {
        const found = findCanonicalVideo(p.youtubeId);
        if (found) {
          setExistingVideo(found);
          setTitle(found.title);
        } else {
          setExistingVideo(null);
          if (!title.trim()) {
            setTitle(cleanVideoTitle(`Video: ${p.youtubeId}`));
          }
        }
      } else {
        setExistingVideo(null);
      }
    } else {
      setParsed(null);
      setExistingVideo(null);
      setShowAddToPlaylistOnly(false);
    }
  }, [url, findCanonicalVideo]);

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.isValid || !parsed.youtubeId) return;

    addVideo({
      youtubeId: parsed.youtubeId,
      title: title.trim() || `YouTube Video (${parsed.youtubeId})`,
      topic: topic.trim() || undefined,
      category: category.trim() || undefined,
      duration: duration.trim() || undefined,
      playlistId: selectedPlaylistId ? selectedPlaylistId : undefined,
    });

    handleResetAndClose();
  };

  const handleLinkExistingToPlaylist = () => {
    if (!existingVideo || !selectedPlaylistId) return;

    addVideo({
      youtubeId: existingVideo.youtubeId,
      title: existingVideo.title,
      playlistId: selectedPlaylistId,
    });

    handleResetAndClose();
  };

  const handleOpenExisting = () => {
    if (existingVideo && onOpenVideo) {
      onOpenVideo(existingVideo.id);
      handleResetAndClose();
    }
  };

  const handleResetAndClose = () => {
    setUrl('');
    setTitle('');
    setTopic('');
    setExistingVideo(null);
    setShowAddToPlaylistOnly(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-lg relative">
        <button
          onClick={handleResetAndClose}
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

        {/* Existing Video Alert Box */}
        {existingVideo && !showAddToPlaylistOnly ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#FEF08A] border-3 border-black rounded-xl shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="font-black text-sm uppercase text-black">
                  VIDEO ALREADY EXISTS
                </h3>
              </div>
              <p className="text-xs font-bold text-gray-800 mb-3">
                "This video is already in your library."
              </p>
              <div className="p-2.5 bg-white border-2 border-black rounded-lg flex items-center gap-3">
                <img
                  src={existingVideo.thumbnailUrl || existingVideo.thumbnail}
                  alt={existingVideo.title}
                  className="w-16 h-10 object-cover rounded border border-black"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-black truncate">
                    {existingVideo.title}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 truncate">
                    Canonical ID: {existingVideo.youtubeId}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenExisting}
                className="w-full bg-[#FFE600] border-2 border-black py-2.5 px-3 rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Open Video</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddToPlaylistOnly(true)}
                className="w-full bg-white border-2 border-black py-2.5 px-3 rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add To Playlist</span>
              </button>
            </div>
          </div>
        ) : existingVideo && showAddToPlaylistOnly ? (
          /* Add existing video to a specific playlist */
          <div className="space-y-4">
            <div className="p-3 bg-white border-2 border-black rounded-lg text-xs font-bold text-gray-700">
              Select which playlist you want to link <strong>"{existingVideo.title}"</strong> into.
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Select Destination Playlist *
              </label>
              <select
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Playlist --</option>
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddToPlaylistOnly(false)}
                className="px-4 py-2 bg-white border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!selectedPlaylistId}
                onClick={handleLinkExistingToPlaylist}
                className="px-5 py-2 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40"
              >
                Confirm Add To Playlist
              </button>
            </div>
          </div>
        ) : (
          /* Normal Add New Video Form */
          <form onSubmit={handleSubmitNew} className="space-y-3.5">
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
                  <div className="font-mono text-[11px] text-gray-500">
                    ID: {parsed.youtubeId}
                  </div>
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
                onClick={handleResetAndClose}
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
        )}
      </div>
    </div>
  );
};
