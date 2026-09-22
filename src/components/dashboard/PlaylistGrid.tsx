import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Cpu,
  Coffee,
  LineChart,
  Bot,
  Binary,
  MoreVertical,
  Play,
  FolderClosed,
  ArrowRight
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { Playlist } from '../../types/focusLearn';

interface PlaylistGridProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onPlayVideo: (videoId: string) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  onSelectPlaylist,
  onPlayVideo
}) => {
  const { playlists, progress, setActiveTab } = useLearning();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Map playlist categories/tags to cool icons
  const getIconForPlaylist = (index: number, title: string) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('web dev') || lower.includes('mern')) return { icon: Code2, bg: 'bg-[#FECDD3]' };
    if (lower.includes('advanced level') || lower.includes('top python')) return { icon: Cpu, bg: 'bg-[#DDD6FE]' };
    if (lower.includes('python')) return { icon: Terminal, bg: 'bg-[#A7F3D0]' };
    if (lower.includes('java') || lower.includes('dsa in 30')) return { icon: Coffee, bg: 'bg-[#FEF08A]' };
    if (lower.includes('data science')) return { icon: LineChart, bg: 'bg-[#BAE6FD]' };
    if (lower.includes('ai agent') || lower.includes('building ai')) return { icon: Bot, bg: 'bg-[#FBCFE8]' };
    return { icon: Binary, bg: 'bg-[#E9D5FF]' };
  };

  const calculatePlaylistStats = (playlist: Playlist) => {
    const vids = playlist.videos || [];
    const total = vids.length;
    if (total === 0) return { completed: 0, percent: 0, firstUnfinished: null };

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

    const percent = Math.round((completed / total) * 100);
    return {
      completed,
      percent,
      firstUnfinished: firstUnfinishedId || vids[0]?.id
    };
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <span>MY PLAYLISTS</span>
            <span className="text-xs bg-black text-[#FFE600] px-2 py-0.5 rounded border border-black font-black">
              {playlists.length} ACTIVE
            </span>
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Structured curriculums with progress tracking
          </p>
        </div>

        <button
          onClick={() => setActiveTab('playlists')}
          className="flex items-center gap-1.5 text-xs font-black text-black bg-white border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer uppercase tracking-wider"
        >
          <span>View All ({playlists.length})</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Grid of 6-7 Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {playlists.map((pl, idx) => {
          const { icon: Icon, bg } = getIconForPlaylist(idx, pl.title);
          const stats = calculatePlaylistStats(pl);
          const vids = pl.videos || [];

          return (
            <div
              key={pl.id}
              className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Top Row: Icon + Badge + Menu */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 ${bg} border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000] transform -rotate-1 group-hover:rotate-0 transition-transform`}>
                    <Icon className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md border-2 border-black bg-[#F4F0EA] shadow-[1px_1px_0px_#000]">
                      {stats.percent}% DONE
                    </span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === pl.id ? null : pl.id);
                        }}
                        className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded border border-transparent hover:border-black cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === pl.id && (
                        <div
                          className="absolute right-0 mt-1 w-44 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] py-1 z-30 font-sans"
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
                            <span>View Curriculum</span>
                          </button>
                          {stats.firstUnfinished && (
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onPlayVideo(stats.firstUnfinished!);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 flex items-center gap-2 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Resume Course</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Playlist Title */}
                <h3
                  onClick={() => onSelectPlaylist(pl)}
                  className="font-black text-base text-black mb-1 line-clamp-2 hover:text-[#B45309] cursor-pointer transition-colors leading-snug"
                >
                  {pl.title}
                </h3>

                <div className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <span>{vids.length} videos</span>
                  <span>•</span>
                  <span>{stats.completed} completed</span>
                </div>
              </div>

              {/* Bottom: Chunky Progress Bar & Action */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-black mb-1.5">
                  <span className="text-gray-600">PROGRESS</span>
                  <span className="font-mono">{stats.completed} / {vids.length}</span>
                </div>

                <div className="w-full bg-[#E5E5E5] border-2 border-black rounded-full h-3.5 overflow-hidden p-0.5 mb-3.5 shadow-inner">
                  <div
                    className="bg-[#FFE600] h-full rounded-full border-r-2 border-black transition-all duration-500"
                    style={{ width: `${Math.max(stats.percent, 3)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectPlaylist(pl)}
                    className="w-full bg-[#F4F0EA] border-2 border-black py-1.5 px-2 rounded-lg text-xs font-black uppercase text-black hover:bg-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View All</span>
                  </button>

                  <button
                    onClick={() => {
                      if (stats.firstUnfinished) {
                        onPlayVideo(stats.firstUnfinished);
                      }
                    }}
                    className="w-full bg-[#FFE600] border-2 border-black py-1.5 px-2 rounded-lg text-xs font-black uppercase text-black hover:bg-[#FFD000] transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5"
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
