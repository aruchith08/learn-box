import React, { useState } from 'react';
import {
  CheckSquare2,
  Search,
  Play,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  Check
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface GlobalTrackerViewProps {
  onPlayVideo: (videoId: string) => void;
}

export const GlobalTrackerView: React.FC<GlobalTrackerViewProps> = ({ onPlayVideo }) => {
  const { allVideos, playlists, progress, markVideoComplete, toggleBookmark, isBookmarked, metrics } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in_progress' | 'unstarted'>('all');

  const filteredVideos = allVideos.filter((v) => {
    // Playlist filter
    if (selectedPlaylist !== 'all' && v.playlistId !== selectedPlaylist) {
      if (selectedPlaylist === 'standalone' && v.playlistId) return false;
      if (selectedPlaylist !== 'standalone') return false;
    }

    // Status filter
    const prog = progress[v.id];
    const status = prog?.status || 'unstarted';
    if (selectedStatus !== 'all' && status !== selectedStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchTopic = v.topic && v.topic.toLowerCase().includes(q);
      const matchPl = v.playlistTitle && v.playlistTitle.toLowerCase().includes(q);
      if (!matchTitle && !matchTopic && !matchPl) return false;
    }

    return true;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#A7F3D0] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
                CURRICULUM MATRIX
              </span>
              <span className="text-xs font-bold text-gray-500">
                {metrics.completedVideos} of {metrics.totalVideos} Videos Completed ({metrics.overallProgress}%)
              </span>
            </div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              GLOBAL LEARNING TRACKER
            </h1>
            <p className="text-xs font-bold text-gray-600 mt-1">
              Unified progress matrix across all enrolled playlists and standalone tutorials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FEF08A] border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black">
              ⚡ {filteredVideos.length} Videos Matching Filter
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#F4F0EA] border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all curriculum videos..."
            className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        {/* Playlist Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-black hidden sm:inline">Playlist:</span>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            className="bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="all">All Playlists ({playlists.length})</option>
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.title}
              </option>
            ))}
            <option value="standalone">Standalone Videos Only</option>
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1.5">
          {(['all', 'unstarted', 'in_progress', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border-2 border-black transition-all cursor-pointer shadow-[1px_1px_0px_#000] ${
                selectedStatus === s
                  ? 'bg-black text-[#FFE600]'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tracker Table */}
      <div className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[5px_5px_0px_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121214] text-white border-b-3 border-black text-[11px] font-black uppercase tracking-wider">
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5 text-center w-16">Status</th>
                <th className="p-3.5">Video Title</th>
                <th className="p-3.5">Curriculum / Category</th>
                <th className="p-3.5">Topic</th>
                <th className="p-3.5 text-center w-24">Duration</th>
                <th className="p-3.5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-medium">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    No videos match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredVideos.slice(0, 150).map((v, idx) => {
                  const prog = progress[v.id];
                  const isCompleted = prog?.status === 'completed';
                  const isInProgress = prog?.status === 'in_progress';
                  const bookmarked = isBookmarked(v.id);

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-[#F4F0EA] transition-colors ${
                        isCompleted ? 'bg-[#F0FDF4]/50' : ''
                      }`}
                    >
                      {/* Number */}
                      <td className="p-3 text-center font-mono font-bold text-gray-500">
                        {idx + 1}
                      </td>

                      {/* Checkbox Complete */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => markVideoComplete(v.id)}
                          className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center cursor-pointer transition-all shadow-[1px_1px_0px_#000] ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white hover:bg-emerald-100 text-transparent'
                          }`}
                          title="Toggle completion"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Title */}
                      <td className="p-3">
                        <div
                          onClick={() => onPlayVideo(v.id)}
                          className={`font-black text-black hover:text-[#B45309] cursor-pointer line-clamp-1 ${
                            isCompleted ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {v.title}
                        </div>
                      </td>

                      {/* Curriculum */}
                      <td className="p-3">
                        <span className="bg-[#DDD6FE] text-purple-900 border border-black px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block">
                          {v.playlistTitle ? v.playlistTitle.slice(0, 24) + '...' : v.category || 'Standalone'}
                        </span>
                      </td>

                      {/* Topic */}
                      <td className="p-3 text-gray-700 font-bold">
                        {v.topic || '—'}
                      </td>

                      {/* Duration */}
                      <td className="p-3 text-center font-mono text-gray-600 font-bold text-[11px]">
                        {v.duration || '—'}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleBookmark(v.id)}
                            className={`p-1.5 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer ${
                              bookmarked ? 'bg-[#FEF08A]' : 'bg-white hover:bg-gray-100'
                            }`}
                            title="Bookmark"
                          >
                            <Bookmark className={`w-3 h-3 ${bookmarked ? 'fill-black' : ''}`} />
                          </button>

                          <button
                            onClick={() => onPlayVideo(v.id)}
                            className="bg-[#FFE600] border border-black px-2.5 py-1 rounded text-[10px] font-black uppercase text-black hover:bg-[#FFD000] shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-black" />
                            <span>Play</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
