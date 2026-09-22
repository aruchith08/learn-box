import React, { useState } from 'react';
import {
  FolderClosed,
  Plus,
  Play,
  CheckCircle2,
  MoreVertical,
  Search,
  Upload,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  Coffee,
  LineChart,
  Bot,
  Binary,
  Trash2,
  Edit,
  Copy,
  FolderPlus,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Playlist } from '../../types/focusLearn';

interface PlaylistsViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onPlayVideo: (videoId: string) => void;
  onOpenAddModal: () => void;
  onOpenImportCSV: () => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  onSelectPlaylist,
  onPlayVideo,
  onOpenAddModal,
  onOpenImportCSV,
}) => {
  const { playlists, progress, deletePlaylist, addPlaylist } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const filteredPlaylists = playlists.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPlaylistStats = (pl: Playlist) => {
    const vids = pl.videos || [];
    const total = vids.length;
    let completed = 0;
    let firstUnfinishedId: string | null = null;

    for (const v of vids) {
      const p = progress[v.id];
      const isDone = p?.status === 'completed' || (p?.status as string) === 'COMPLETED';
      if (isDone) {
        completed++;
      } else if (!firstUnfinishedId) {
        firstUnfinishedId = v.id;
      }
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      completed,
      percent,
      firstUnfinished: firstUnfinishedId || vids[0]?.id,
    };
  };

  const getIconForPlaylist = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('web dev') || lower.includes('mern')) return { icon: Code2, bg: 'bg-[#FECDD3]' };
    if (lower.includes('advanced level') || lower.includes('top python')) return { icon: Cpu, bg: 'bg-[#DDD6FE]' };
    if (lower.includes('python')) return { icon: Terminal, bg: 'bg-[#A7F3D0]' };
    if (lower.includes('java') || lower.includes('dsa in 30')) return { icon: Coffee, bg: 'bg-[#FEF08A]' };
    if (lower.includes('data science')) return { icon: LineChart, bg: 'bg-[#BAE6FD]' };
    if (lower.includes('ai agent') || lower.includes('building ai')) return { icon: Bot, bg: 'bg-[#FECDD3]' };
    return { icon: Binary, bg: 'bg-[#E9D5FF]' };
  };

  const handleDuplicatePlaylist = (pl: Playlist) => {
    addPlaylist({
      title: `${pl.title} (Copy)`,
      description: pl.description,
      category: pl.category,
      color: pl.color,
      iconName: pl.iconName,
    });
    setActiveMenuId(null);
  };

  const handleDelete = (pl: Playlist) => {
    setActiveMenuId(null);
    if (
      confirm(
        `Are you sure you want to delete playlist "${pl.title}"?\n\nNOTE: The canonical video lessons in this playlist will NOT be deleted from your library.`
      )
    ) {
      deletePlaylist(pl.id);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFE600] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
              STRUCTURED COURSES
            </span>
            <span className="text-xs font-bold text-gray-500">
              {playlists.length} Curriculums Available
            </span>
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            MY PLAYLISTS & COURSES
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Browse through all imported YouTube playlists, track completion, and take notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenImportCSV}
            className="flex items-center gap-2 bg-[#F4F0EA] border-2 border-black px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:bg-white transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter playlists by name or category..."
            className="w-full bg-white border-2 border-black rounded-lg pl-10 pr-4 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists.map((pl) => {
          const stats = getPlaylistStats(pl);
          const { icon: Icon, bg } = getIconForPlaylist(pl.title);

          return (
            <div
              key={pl.id}
              className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 ${bg} border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]`}
                  >
                    <Icon className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md border-2 border-black bg-[#F4F0EA]">
                      {stats.percent}% COMPLETE
                    </span>

                    {/* Three-dot menu requested by prompt */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === pl.id ? null : pl.id);
                        }}
                        className="p-1 text-gray-500 hover:text-black rounded border border-transparent hover:border-black cursor-pointer"
                        title="Playlist Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === pl.id && (
                        <div
                          className="absolute right-0 top-7 w-48 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] py-1.5 z-30 font-sans text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectPlaylist(pl);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#FFE600] flex items-center gap-2 cursor-pointer"
                          >
                            <FolderClosed className="w-3.5 h-3.5" />
                            <span>Open Playlist</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectPlaylist(pl);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#FFE600] flex items-center gap-2 cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Reorder Videos</span>
                          </button>

                          <button
                            onClick={() => handleDuplicatePlaylist(pl)}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#FFE600] flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate Playlist</span>
                          </button>

                          <div className="border-t border-gray-200 my-1" />

                          <button
                            onClick={() => handleDelete(pl)}
                            className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Playlist</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h3
                  onClick={() => onSelectPlaylist(pl)}
                  className="font-black text-lg text-black mb-1 line-clamp-2 hover:text-[#B45309] cursor-pointer transition-colors"
                >
                  {pl.title}
                </h3>

                {pl.description && (
                  <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-3">
                    {pl.description}
                  </p>
                )}

                <div className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <span>{pl.videos?.length || 0} videos</span>
                  <span>•</span>
                  <span>{stats.completed} completed</span>
                </div>
              </div>

              <div>
                {/* Progress bar */}
                <div className="w-full bg-[#E5E5E5] border-2 border-black rounded-full h-3.5 overflow-hidden p-0.5 mb-4 shadow-inner">
                  <div
                    className="bg-[#FFE600] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(stats.percent, 3)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectPlaylist(pl)}
                    className="w-full bg-[#F4F0EA] border-2 border-black py-2 rounded-lg text-xs font-black uppercase text-black hover:bg-white transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    View Videos
                  </button>

                  <button
                    onClick={() => {
                      if (stats.firstUnfinished) {
                        onPlayVideo(stats.firstUnfinished);
                      }
                    }}
                    className="w-full bg-[#FFE600] border-2 border-black py-2 rounded-lg text-xs font-black uppercase text-black hover:bg-[#FFD000] transition-all shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
