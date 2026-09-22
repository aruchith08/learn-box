import React from 'react';
import { Bookmark, Play, Trash2, ArrowRight } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface BookmarksViewProps {
  onPlayVideo: (videoId: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onPlayVideo }) => {
  const { bookmarks, allVideos, toggleBookmark, setActiveTab } = useLearning();

  const bookmarkedVideos = React.useMemo(() => {
    return bookmarks
      .map((b) => {
        const video = allVideos.find((v) => v.id === b.videoId);
        return video ? { ...video, bookmarkedAt: b.createdAt } : null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  }, [bookmarks, allVideos]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#FEF08A] text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
            QUICK ACCESS
          </span>
          <span className="text-xs font-bold text-gray-500">
            {bookmarkedVideos.length} Saved Lessons
          </span>
        </div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          MY BOOKMARKS
        </h1>
        <p className="text-xs font-bold text-gray-600 mt-1">
          High-yield lessons and revision material saved for quick reference.
        </p>
      </div>

      {bookmarkedVideos.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-xl p-12 text-center shadow-[4px_4px_0px_#000] max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FEF08A] border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#000]">
            <Bookmark className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">
            No Bookmarks Yet
          </h3>
          <p className="text-xs font-medium text-gray-600 mb-6 leading-relaxed">
            While watching any tutorial or lecture, click the bookmark icon or press <kbd className="font-mono bg-gray-100 border border-gray-400 px-1.5 py-0.5 rounded">B</kbd> to save it here for fast revision.
          </p>
          <button
            onClick={() => setActiveTab('my-videos')}
            className="bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase text-black hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#000] cursor-pointer inline-flex items-center gap-2"
          >
            <span>Browse Videos</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {bookmarkedVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div
                onClick={() => onPlayVideo(video.id)}
                className="relative aspect-video bg-black cursor-pointer group"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#FFE600] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-700">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase bg-[#DDD6FE] text-purple-900 border border-black px-2 py-0.5 rounded inline-block mb-1.5">
                    {video.playlistTitle || video.category || 'Lesson'}
                  </span>

                  <h3
                    onClick={() => onPlayVideo(video.id)}
                    className="font-black text-sm text-black line-clamp-2 hover:text-[#B45309] cursor-pointer leading-snug"
                  >
                    {video.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => toggleBookmark(video.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <button
                    onClick={() => onPlayVideo(video.id)}
                    className="bg-[#FFE600] border-2 border-black px-3 py-1 rounded-lg text-xs font-black uppercase text-black hover:bg-[#FFD000] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
