import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckSquare2,
  Search,
  Play,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Film,
  FolderClosed,
  Loader2,
  Plus,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface GlobalTrackerViewProps {
  onPlayVideo: (videoId: string) => void;
}

type TrackerFilterType =
  | 'ALL'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BOOKMARKED'
  | 'PLAYLISTS'
  | 'INDIVIDUAL_VIDEOS';

const BATCH_SIZE = 25;

export const GlobalTrackerView: React.FC<GlobalTrackerViewProps> = ({ onPlayVideo }) => {
  const {
    allVideos,
    playlists,
    progress,
    markVideoComplete,
    toggleBookmark,
    isBookmarked,
    metrics,
  } = useLearning();

  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TrackerFilterType>('ALL');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Instant navigation: mount skeleton immediately, then reveal table smoothly
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  // Reset pagination batch when filter or search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedFilter, searchQuery]);

  // Memoize filtered videos for fast resolution
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const prog = progress[v.id];
      const isDone =
        prog?.status === 'completed' || (prog?.status as string) === 'COMPLETED';
      const isInProg =
        prog?.status === 'in_progress' || (prog?.status as string) === 'IN_PROGRESS';
      const isUnstarted = !isDone && !isInProg;
      const isBm = isBookmarked(v.id);
      const isIndividual = !v.playlistId;
      const isFromPlaylist = !!v.playlistId;

      // Filter type check
      if (selectedFilter === 'NOT_STARTED' && !isUnstarted) return false;
      if (selectedFilter === 'IN_PROGRESS' && !isInProg) return false;
      if (selectedFilter === 'COMPLETED' && !isDone) return false;
      if (selectedFilter === 'BOOKMARKED' && !isBm) return false;
      if (selectedFilter === 'PLAYLISTS' && !isFromPlaylist) return false;
      if (selectedFilter === 'INDIVIDUAL_VIDEOS' && !isIndividual) return false;

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchTopic = v.topic && v.topic.toLowerCase().includes(q);
        const matchPl = v.playlistTitle && v.playlistTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchPl) return false;
      }

      return true;
    });
  }, [allVideos, progress, isBookmarked, selectedFilter, searchQuery]);

  // Auto-load next batch on scroll
  useEffect(() => {
    if (isLoading || visibleCount >= filteredVideos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredVideos.length));
        }
      },
      { rootMargin: '350px' }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [isLoading, visibleCount, filteredVideos.length]);

  const displayedVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const filterButtons: { id: TrackerFilterType; label: string }[] = [
    { id: 'ALL', label: 'ALL' },
    { id: 'NOT_STARTED', label: 'NOT STARTED' },
    { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { id: 'COMPLETED', label: 'COMPLETED' },
    { id: 'BOOKMARKED', label: 'BOOKMARKED' },
    { id: 'PLAYLISTS', label: 'PLAYLISTS' },
    { id: 'INDIVIDUAL_VIDEOS', label: 'INDIVIDUAL VIDEOS' },
  ];

  return (
    <div className="px-3.5 sm:px-6 py-4 max-w-[1600px] mx-auto font-sans w-full box-border">
      {/* Header Banner */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#A7F3D0] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
                LEARNING MATRIX
              </span>
              <span className="text-xs font-bold text-gray-500">
                {metrics.completedVideos} of {metrics.totalVideos} Completed ({metrics.overallProgress}%)
              </span>
            </div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              CURRICULUM & VIDEO TRACKER
            </h1>
            <p className="text-xs font-bold text-gray-600 mt-1">
              Filter by status, origin, or bookmarking across your complete personal learning catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FEF08A] border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black">
              ⚡ {filteredVideos.length} Matching Lessons
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar matching prompt specification */}
      <div className="bg-[#F4F0EA] border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] mb-6 space-y-3">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos by title, topic, or playlist..."
            className="w-full bg-white border-2 border-black rounded-lg pl-10 pr-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
          />
        </div>

        {/* Filters Row matching prompt: ALL, NOT STARTED, IN PROGRESS, COMPLETED, BOOKMARKED, PLAYLISTS, INDIVIDUAL VIDEOS */}
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((btn) => {
            const isSelected = selectedFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setSelectedFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                  isSelected
                    ? 'bg-black text-[#FFE600] translate-x-0.5'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Status Banner */}
      {isLoading && (
        <div className="bg-[#A7F3D0] border-2 sm:border-3 border-black rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-black text-[#A7F3D0] rounded-lg border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              <Loader2 className="w-5 h-5 animate-spin stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded border border-black">
                  SYNCING
                </span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">
                  Loading Tracker Matrix...
                </span>
              </div>
              <p className="text-[11px] font-bold text-black/75 mt-0.5">
                Calculating completion percentages, timestamps, and active study sessions.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-white border-2 border-black rounded-full h-3.5 p-0.5 overflow-hidden shadow-[1px_1px_0px_#000]">
            <div className="h-full bg-black rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* Columns: TYPE, TITLE, PLAYLIST, STATUS, PROGRESS, LAST WATCHED, ACTIONS */}
      <div className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[5px_5px_0px_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121214] text-white border-b-3 border-black text-[11px] font-black uppercase tracking-wider">
                <th className="p-3.5 text-center w-20">TYPE</th>
                <th className="p-3.5">TITLE</th>
                <th className="p-3.5">PLAYLIST</th>
                <th className="p-3.5 text-center w-28">STATUS</th>
                <th className="p-3.5 text-center w-28">PROGRESS</th>
                <th className="p-3.5 text-center w-32">LAST WATCHED</th>
                <th className="p-3.5 text-right w-36">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-medium">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    {/* TYPE */}
                    <td className="p-3 text-center">
                      <div className="w-14 h-5 bg-neutral-200 rounded border border-neutral-300 mx-auto" />
                    </td>
                    {/* TITLE */}
                    <td className="p-3">
                      <div className="w-3/4 h-4 bg-neutral-200 rounded border border-neutral-300 mb-1.5" />
                      <div className="w-1/3 h-2.5 bg-neutral-200 rounded border border-neutral-300" />
                    </td>
                    {/* PLAYLIST */}
                    <td className="p-3">
                      <div className="w-28 h-3.5 bg-neutral-200 rounded border border-neutral-300" />
                    </td>
                    {/* STATUS */}
                    <td className="p-3 text-center">
                      <div className="w-24 h-5 bg-neutral-200 rounded border border-neutral-300 mx-auto" />
                    </td>
                    {/* PROGRESS */}
                    <td className="p-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-neutral-200 border border-black rounded-full h-2" />
                        <div className="w-6 h-2.5 bg-neutral-200 rounded" />
                      </div>
                    </td>
                    {/* LAST WATCHED */}
                    <td className="p-3 text-center">
                      <div className="w-16 h-3 bg-neutral-200 rounded mx-auto" />
                    </td>
                    {/* ACTIONS */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-7 h-7 bg-neutral-200 border-2 border-black rounded shadow-[1px_1px_0px_#000]" />
                        <div className="w-7 h-7 bg-neutral-200 border-2 border-black rounded shadow-[1px_1px_0px_#000]" />
                        <div className="w-7 h-7 bg-neutral-200 border-2 border-black rounded shadow-[1px_1px_0px_#000]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    No videos match the selected filters.
                  </td>
                </tr>
              ) : (
                displayedVideos.map((v) => {
                  const prog = progress[v.id];
                  const isCompleted =
                    prog?.status === 'completed' ||
                    (prog?.status as string) === 'COMPLETED';
                  const isInProgress =
                    prog?.status === 'in_progress' ||
                    (prog?.status as string) === 'IN_PROGRESS';
                  const pct = isCompleted ? 100 : prog?.percent || prog?.progressPercentage || 0;
                  const bookmarked = isBookmarked(v.id);
                  const isStandalone = !v.playlistId;

                  const lastWatched = prog?.lastWatchedAt
                    ? new Date(prog.lastWatchedAt).toLocaleDateString()
                    : 'Never';

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-[#F4F0EA] transition-colors ${
                        isCompleted ? 'bg-[#F0FDF4]/50' : ''
                      }`}
                    >
                      {/* TYPE */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                            isStandalone
                              ? 'bg-[#FECDD3] text-black'
                              : 'bg-[#DDD6FE] text-black'
                          }`}
                        >
                          {isStandalone ? 'Video' : 'Course'}
                        </span>
                      </td>

                      {/* TITLE */}
                      <td className="p-3">
                        <div
                          onClick={() => onPlayVideo(v.id)}
                          className={`font-black text-black hover:text-[#B45309] cursor-pointer line-clamp-1 ${
                            isCompleted ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {v.title}
                        </div>
                        {v.topic && (
                          <div className="text-[10px] font-bold text-gray-400 truncate">
                            Topic: {v.topic}
                          </div>
                        )}
                      </td>

                      {/* PLAYLIST */}
                      <td className="p-3 font-bold text-gray-700">
                        {v.playlistTitle ? (
                          <span className="truncate block max-w-xs">
                            {v.playlistTitle}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Standalone</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black inline-block shadow-[1px_1px_0px_#000] ${
                            isCompleted
                              ? 'bg-[#A7F3D0] text-black'
                              : isInProgress
                              ? 'bg-[#FECDD3] text-black'
                              : 'bg-white text-gray-700'
                          }`}
                        >
                          {isCompleted
                            ? 'COMPLETED'
                            : isInProgress
                            ? 'IN PROGRESS'
                            : 'NOT STARTED'}
                        </span>
                      </td>

                      {/* PROGRESS */}
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-[#E5E5E5] border border-black rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-black h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono font-black text-[10px]">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      {/* LAST WATCHED */}
                      <td className="p-3 text-center font-mono text-[11px] text-gray-600">
                        {lastWatched}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPlayVideo(v.id)}
                            className="p-1.5 bg-[#FFE600] border-2 border-black rounded shadow-[1px_1px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                            title="Play Video"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" />
                          </button>

                          <button
                            onClick={() => markVideoComplete(v.id)}
                            className={`p-1.5 border-2 border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer ${
                              isCompleted ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-emerald-50'
                            }`}
                            title="Toggle Complete"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleBookmark(v.id)}
                            className={`p-1.5 border-2 border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer ${
                              bookmarked ? 'bg-[#FEF08A]' : 'bg-white hover:bg-yellow-50'
                            }`}
                            title="Bookmark"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
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

      {/* Progressive Load / Pagination Controls */}
      {!isLoading && filteredVideos.length > visibleCount && (
        <div ref={loadMoreRef} className="mt-6 mb-4 py-6 border-t-2 border-black flex flex-col items-center justify-center gap-3">
          <div className="text-xs font-black uppercase text-gray-500 tracking-wider">
            Showing {displayedVideos.length} of {filteredVideos.length} Lessons
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredVideos.length))}
              className="px-5 py-2.5 bg-white hover:bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Load More (+{Math.min(BATCH_SIZE, filteredVideos.length - displayedVideos.length)})</span>
            </button>
            <button
              onClick={() => setVisibleCount(filteredVideos.length)}
              className="px-5 py-2.5 bg-[#F4F0EA] hover:bg-black hover:text-white border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Show All ({filteredVideos.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
