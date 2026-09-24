import React, { useState } from 'react';
import {
  Laptop,
  Terminal,
  Rocket,
  Coffee,
  BarChart3,
  Bot,
  FolderClosed,
  MoreVertical,
  Play,
  Trash2,
  Edit2,
  ArrowRight,
  IconProps,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Playlist } from '../../types/focusLearn';

interface PlaylistGridProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onPlayVideo: (videoId: string) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  onSelectPlaylist,
  onPlayVideo,
}) => {
  const { playlists, progress, setActiveTab, deletePlaylist } = useLearning();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getPlaylistVisuals = (index: number, title: string) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('web dev') || lower.includes('mern')) {
      return { icon: Laptop, bg: 'bg-[#FECDD3]', label: '#1' };
    }
    if (lower.includes('advanced') || lower.includes('rocket')) {
      return { icon: Rocket, bg: 'bg-[#DDD6FE]', label: '#3' };
    }
    if (lower.includes('python')) {
      return { icon: Terminal, bg: 'bg-[#A7F3D0]', label: '#2' };
    }
    if (lower.includes('java') || lower.includes('dsa in 30')) {
      return { icon: Coffee, bg: 'bg-[#FEF08A]', label: '#4' };
    }
    if (lower.includes('data science')) {
      return { icon: BarChart3, bg: 'bg-[#BAE6FD]', label: '#5' };
    }
    if (lower.includes('ai agent') || lower.includes('building ai')) {
      return { icon: Bot, bg: 'bg-[#FECACA]', label: '#6' };
    }
    if (lower.includes('django')) {
      return { icon: Laptop, bg: 'bg-[#BBF7D0]', label: '#7' };
    }
    if (lower.includes('fastapi')) {
      return { icon: Rocket, bg: 'bg-[#99F6E4]', label: '#8' };
    }

    const defaultColors = ['bg-[#FECDD3]', 'bg-[#A7F3D0]', 'bg-[#DDD6FE]', 'bg-[#FEF08A]', 'bg-[#BAE6FD]', 'bg-[#FECACA]', 'bg-[#BBF7D0]', 'bg-[#99F6E4]'];
    const defaultIcons = [Laptop, Terminal, Rocket, Coffee, BarChart3, Bot, Laptop, Rocket];
    return {
      icon: defaultIcons[index % defaultIcons.length],
      bg: defaultColors[index % defaultColors.length],
      label: `#${index + 1}`,
    };
  };

  // Show up to 8 on the dashboard grid
  const displayPlaylists = playlists.slice(0, 8);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-black text-[#111111] uppercase tracking-tight">
          MY PLAYLISTS
        </h2>

        <button
          onClick={() => setActiveTab('playlists')}
          className="flex items-center gap-1.5 text-xs font-display font-black text-[#111111] hover:underline transition-all cursor-pointer group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Empty State */}
      {displayPlaylists.length === 0 ? (
        <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-8 text-center shadow-[4px_4px_0px_#111111]">
          <p className="font-display font-bold text-lg text-[#111111]">No playlists added yet.</p>
          <p className="text-xs font-mono text-gray-500 mt-1">Start learning by adding a video or importing a playlist.</p>
        </div>
      ) : (
        /* 2 columns x 3 rows grid matching reference screenshot */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayPlaylists.map((pl, idx) => {
            const { icon: Icon, bg, label } = getPlaylistVisuals(idx, pl.title);
            const vids = pl.videos || [];
            const total = vids.length;
            const completed = vids.filter((v) => {
              const p = progress[v.id];
              return p?.status === 'completed' || (p?.status as string) === 'COMPLETED';
            }).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : pl.progressPercentage || 0;

            const firstUnfinished = vids.find((v) => {
              const p = progress[v.id];
              return p?.status !== 'completed' && (p?.status as string) !== 'COMPLETED';
            })?.id || vids[0]?.id;

            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                className="bg-white border-[2.5px] sm:border-[3px] border-[#111111] rounded-2xl p-3 sm:p-4 shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all cursor-pointer flex items-center gap-3 sm:gap-4 relative group w-full"
              >
                {/* Left Colored Square with Icon and # Label */}
                <div
                  className={`w-14 h-14 sm:w-18 sm:h-18 ${bg} border-2 border-[#111111] rounded-xl flex items-center justify-center relative shrink-0 shadow-[2px_2px_0px_#111111]`}
                >
                  <span className="absolute top-1 left-1.5 font-mono text-[9px] font-black text-[#111111]/70">
                    {label}
                  </span>
                  <Icon className="w-7 h-7 text-[#111111] stroke-[2.5]" />
                </div>

                {/* Middle & Right Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-black text-sm sm:text-base text-[#111111] leading-snug truncate pr-6 group-hover:text-[#B45309]">
                      {pl.title}
                    </h3>

                    {/* Three-dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === pl.id ? null : pl.id);
                        }}
                        className="p-1 text-gray-500 hover:text-black rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 text-[#111111]" />
                      </button>

                      {activeMenuId === pl.id && (
                        <div
                        className="absolute right-0 top-6 w-44 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] py-1 z-30 font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectPlaylist(pl);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-yellow-100 flex items-center gap-2 cursor-pointer"
                        >
                          <FolderClosed className="w-3.5 h-3.5" />
                          <span>Open Playlist</span>
                        </button>
                        {firstUnfinished && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onPlayVideo(firstUnfinished);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 flex items-center gap-2 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Continue Watching</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (confirm(`Delete playlist "${pl.title}"? Your canonical video records will not be deleted.`)) {
                              deletePlaylist(pl.id);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Playlist</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {pl.creator && (
                  <div className="text-[11px] font-bold text-gray-500 truncate">
                    {pl.creator}
                  </div>
                )}

                <div className="text-xs font-black text-gray-700 mt-0.5">
                  {total} videos
                </div>

                {/* Bottom Progress Bar matching screenshot */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-[#E5E5E5] border border-black rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(pct, 0)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-black text-black">
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
