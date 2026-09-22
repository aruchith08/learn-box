import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Bookmark,
  CheckCircle2,
  FileText,
  FolderClosed,
  ArrowLeft,
  Play,
  Share2,
  ExternalLink,
  Copy,
  Check,
} from '../common/focusIcons';
import { Video, Playlist } from '../../types/focusLearn';
import { useLearning } from '../../context/LearningContext';
import { VideoNotes } from './VideoNotes';
import { FocusModePlayer } from './FocusModePlayer';
import { YouTubeIframePlayer, YouTubePlayerRef } from './YouTubeIframePlayer';

interface VideoPlayerViewProps {
  videoId: string;
  onBack: () => void;
  onSelectVideo: (id: string) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoId,
  onBack,
  onSelectVideo,
}) => {
  const {
    allVideos,
    playlists,
    progress,
    updateVideoProgress,
    markVideoComplete,
    toggleBookmark,
    isBookmarked,
    settings,
  } = useLearning();

  const [activeSideTab, setActiveSideTab] = useState<'playlist' | 'notes'>('playlist');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const playerRef = useRef<YouTubePlayerRef>(null);

  // Find active video
  const video = allVideos.find((v) => v.id === videoId) || allVideos[0];

  // Find the playlist this video belongs to
  const currentPlaylist = React.useMemo(() => {
    if (!video?.playlistId) return null;
    return playlists.find((p) => p.id === video.playlistId) || null;
  }, [playlists, video]);

  // Playlist videos list (or standalone list)
  const relatedVideos: Video[] = React.useMemo(() => {
    if (currentPlaylist && currentPlaylist.videos && currentPlaylist.videos.length > 0) {
      return currentPlaylist.videos;
    }
    return allVideos.filter((v) => !v.playlistId || v.category === video?.category);
  }, [currentPlaylist, allVideos, video]);

  const currentIndex = relatedVideos.findIndex((v) => v.id === video?.id);
  const prevVideo = currentIndex > 0 ? relatedVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex >= 0 && currentIndex < relatedVideos.length - 1
      ? relatedVideos[currentIndex + 1]
      : null;

  const bookmarked = video ? isBookmarked(video.id) : false;
  const currentProgress = video ? progress[video.id] : null;
  const isCompleted =
    currentProgress?.status === 'completed' ||
    (currentProgress?.status as string) === 'COMPLETED';

  // Seek handler called from Notes timestamp click
  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  };

  // Keyboard shortcuts while viewing player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c' && video) {
        e.preventDefault();
        markVideoComplete(video.id);
      } else if (e.key.toLowerCase() === 'b' && video) {
        e.preventDefault();
        toggleBookmark(video.id);
      } else if (e.key.toLowerCase() === 'n' && nextVideo) {
        e.preventDefault();
        onSelectVideo(nextVideo.id);
      } else if (e.key.toLowerCase() === 'p' && prevVideo) {
        e.preventDefault();
        onSelectVideo(prevVideo.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [video, nextVideo, prevVideo, markVideoComplete, toggleBookmark, onSelectVideo]);

  const handleCopyLink = () => {
    if (!video) return;
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Stable callbacks — wrapped in useCallback so their identity doesn't change
  // on every re-render. This prevents the YouTubeIframePlayer from destroying
  // and re-creating the YT.Player instance every time progress state updates.
  const handleProgress = useCallback(
    (currTime: number, dur: number) => {
      if (video) updateVideoProgress(video.id, currTime, dur);
    },
    // video.id changes only when a different video is selected, which is correct
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video?.id, updateVideoProgress]
  );

  const handleEnded = useCallback(() => {
    if (video) {
      markVideoComplete(video.id);
      if (settings.autoPlayNext && nextVideo) {
        onSelectVideo(nextVideo.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id, settings.autoPlayNext, nextVideo?.id, markVideoComplete, onSelectVideo]);

  if (!video) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-black mb-4">Video Not Found</h2>
        <button
          onClick={onBack}
          className="bg-[#FFE600] border-2 border-black px-4 py-2 rounded-lg font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_#000]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // If in Focus Mode, render FocusModePlayer overlay
  if (isFocusMode) {
    return (
      <FocusModePlayer
        video={video}
        onExitFocusMode={() => setIsFocusMode(false)}
        onNextVideo={() => nextVideo && onSelectVideo(nextVideo.id)}
        onPrevVideo={() => prevVideo && onSelectVideo(prevVideo.id)}
        hasNext={!!nextVideo}
        hasPrev={!!prevVideo}
      />
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to {currentPlaylist ? currentPlaylist.title : 'Catalog'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Focus Mode Button */}
          <button
            onClick={() => setIsFocusMode(true)}
            className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-3.5 py-1.5 rounded-lg shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-black uppercase tracking-wider cursor-pointer"
            title="Focus Mode (Press F)"
          >
            <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            <span>Focus Mode (F)</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(video.id)}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase cursor-pointer transition-all ${
              bookmarked ? 'bg-[#FEF08A] text-black' : 'bg-white hover:bg-gray-100'
            }`}
            title="Bookmark (Press B)"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
            <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
          </button>

          {/* Share / Copy YouTube Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase hover:bg-gray-100 cursor-pointer"
            title="Copy YouTube Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Player on Left (8 cols), Sidebar on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player & Control Bar */}
        <div className="lg:col-span-8 space-y-4">
          {/* YouTube Embed Player with official IFrame API & progress tracking */}
          <YouTubeIframePlayer
            ref={playerRef}
            youtubeId={video.youtubeId}
            initialTime={settings.resumePosition ? currentProgress?.currentTime || 0 : 0}
            completionThreshold={settings.markCompleteThreshold || 90}
            onProgress={handleProgress}
            onEnded={handleEnded}
          />

          {/* Player Toolbar & Actions */}
          <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => prevVideo && onSelectVideo(prevVideo.id)}
                disabled={!prevVideo}
                className="flex items-center gap-1 bg-[#F4F0EA] border-2 border-black px-3 py-1.5 rounded-lg text-xs font-black uppercase disabled:opacity-30 disabled:pointer-events-none hover:bg-white shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                title="Previous (Press P)"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                onClick={() => nextVideo && onSelectVideo(nextVideo.id)}
                disabled={!nextVideo}
                className="flex items-center gap-1 bg-[#FFE600] border-2 border-black px-3.5 py-1.5 rounded-lg text-xs font-black uppercase disabled:opacity-30 disabled:pointer-events-none hover:bg-[#FFD000] shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                title="Next (Press N)"
              >
                <span>Next Video</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Video Index Indicator */}
            <div className="text-xs font-mono font-black text-gray-600 bg-[#F4F0EA] border border-black px-2.5 py-1 rounded">
              Video {currentIndex >= 0 ? currentIndex + 1 : 1} of {relatedVideos.length || 1}
            </div>

            {/* Mark Complete Button */}
            <button
              onClick={() => markVideoComplete(video.id)}
              className={`flex items-center gap-2 border-2 border-black px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-[#A7F3D0] text-black'
                  : 'bg-[#FEF08A] text-black hover:bg-white'
              }`}
              title="Toggle Complete (Press C)"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark as Complete (C)'}</span>
            </button>
          </div>

          {/* Video Metadata Card */}
          <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#DDD6FE] text-purple-900 border border-black font-black text-[11px] px-2.5 py-0.5 rounded uppercase">
                {currentPlaylist ? currentPlaylist.title : video.category || 'Curriculum'}
              </span>
              {video.topic && (
                <span className="bg-[#BAE6FD] text-blue-900 border border-black font-bold text-[11px] px-2 py-0.5 rounded">
                  Topic: {video.topic}
                </span>
              )}
              {video.duration && (
                <span className="font-mono text-xs font-bold text-gray-500">
                  • {video.duration}
                </span>
              )}
            </div>

            <h1 className="text-xl font-black text-black leading-tight">
              {video.title}
            </h1>

            {/* Distraction-Free Pledge Note */}
            <div className="mt-4 p-3 bg-[#F4F0EA] border-2 border-black rounded-lg text-xs font-medium text-gray-700 flex items-center justify-between">
              <span>
                🛡️ Focus Mode is active. YouTube comments, sidebar recommendations, and home feeds are disabled.
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="text-black font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Original Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Playlist Course Outline & Notes Tabs */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 gap-2 bg-[#121214] p-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000]">
            <button
              onClick={() => setActiveSideTab('playlist')}
              className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSideTab === 'playlist'
                  ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FolderClosed className="w-3.5 h-3.5" />
              <span>Curriculum ({relatedVideos.length})</span>
            </button>

            <button
              onClick={() => setActiveSideTab('notes')}
              className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSideTab === 'notes'
                  ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          </div>

          {/* Tab 1: Course Outline List */}
          {activeSideTab === 'playlist' ? (
            <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-black truncate max-w-[200px]">
                  {currentPlaylist ? currentPlaylist.title : 'Course Videos'}
                </h3>
                <span className="text-[10px] font-black bg-[#A7F3D0] border border-black px-2 py-0.5 rounded">
                  {
                    relatedVideos.filter(
                      (v) =>
                        progress[v.id]?.status === 'completed' ||
                        (progress[v.id]?.status as string) === 'COMPLETED'
                    ).length
                  }{' '}
                  / {relatedVideos.length} DONE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px] custom-scrollbar">
                {relatedVideos.map((v, idx) => {
                  const isCurrent = v.id === video.id;
                  const itemProgress = progress[v.id];
                  const itemCompleted =
                    itemProgress?.status === 'completed' ||
                    (itemProgress?.status as string) === 'COMPLETED';

                  return (
                    <div
                      key={v.id}
                      onClick={() => onSelectVideo(v.id)}
                      className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-[#FFE600] border-black shadow-[3px_3px_0px_#000] font-black'
                          : itemCompleted
                          ? 'bg-[#F0FDF4] border-gray-300 hover:border-black'
                          : 'bg-white border-gray-200 hover:border-black hover:bg-[#F4F0EA]'
                      }`}
                    >
                      {/* Number or Checkmark */}
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-black shrink-0 border ${
                          itemCompleted
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : isCurrent
                            ? 'bg-black text-[#FFE600] border-black'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        {itemCompleted ? '✓' : idx + 1}
                      </div>

                      {/* Video Title & Duration */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs leading-snug line-clamp-2 ${
                            isCurrent
                              ? 'text-black font-black'
                              : 'text-gray-800 font-bold'
                          }`}
                        >
                          {v.title}
                        </div>
                        {v.duration && (
                          <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                            {v.duration}
                          </div>
                        )}
                      </div>

                      {/* Playing Indicator */}
                      {isCurrent && (
                        <div className="w-2.5 h-2.5 bg-black rounded-full animate-ping mt-1 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Tab 2: Notes Component */
            <VideoNotes
              videoId={video.id}
              videoTitle={video.title}
              currentPlaybackSeconds={currentProgress?.currentTime || 0}
              onSeek={handleSeek}
            />
          )}
        </div>
      </div>
    </div>
  );
};
