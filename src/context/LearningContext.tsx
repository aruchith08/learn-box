import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Playlist,
  Video,
  UserVideoProgress,
  Note,
  Bookmark,
  ActivityItem,
  UserSettings,
} from '../types/focusLearn';
import { storageService } from '../services/storageService';
import { formatTime } from '../services/youtubeParser';

export interface Metrics {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  unstartedVideos: number;
  overallProgress: number;
  totalPlaylists: number;
  totalBookmarks: number;
  totalNotes: number;
  totalWatchHours: number;
}

interface LearningContextType {
  // Navigation & View state
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activePlaylistId: string | null;
  setActivePlaylistId: (id: string | null) => void;
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;
  toggleFocusMode: () => void;

  // Data
  playlists: Playlist[];
  videos: Video[];
  allVideos: Video[];
  progress: Record<string, UserVideoProgress>;
  notes: Note[];
  bookmarks: Bookmark[];
  activity: ActivityItem[];
  activities: ActivityItem[];
  settings: UserSettings;

  // Computed metrics
  metrics: Metrics;
  continueWatchingVideo: Video | null;

  // Actions
  playVideo: (videoId: string, playlistId?: string | null) => void;
  updateVideoProgress: (videoId: string, currentTime: number, duration?: number) => void;
  markVideoComplete: (videoId: string) => void;
  toggleVideoComplete: (videoId: string) => void;
  addVideo: (data: {
    youtubeId: string;
    title: string;
    topic?: string;
    category?: string;
    duration?: string;
    playlistId?: string;
  }) => Video;
  addPlaylist: (data: {
    title: string;
    category?: string;
    description?: string;
  }) => Playlist;
  importPlaylistFromCSV: (
    title: string,
    videos: Array<{
      youtubeId: string;
      title: string;
      topic?: string;
      category?: string;
      duration?: string;
    }>
  ) => Playlist;
  deleteVideo: (videoId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addNote: (data: {
    videoId: string;
    videoTitle: string;
    timestampSeconds?: number;
    timestampFormatted?: string;
    content: string;
  }) => void;
  deleteNote: (noteId: string) => void;
  toggleBookmark: (videoId: string) => void;
  isBookmarked: (videoId: string) => boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage once on mount
  useEffect(() => {
    storageService.initialize();
  }, []);

  // State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Storage synced state
  const [rawPlaylists, setRawPlaylists] = useState<Playlist[]>(() => storageService.getPlaylists());
  const [rawVideos, setRawVideos] = useState<Video[]>(() => storageService.getVideos());
  const [progress, setProgress] = useState<Record<string, UserVideoProgress>>(() => storageService.getProgress());
  const [notes, setNotes] = useState<Note[]>(() => storageService.getNotes());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storageService.getBookmarks());
  const [activity, setActivity] = useState<ActivityItem[]>(() => storageService.getActivity());
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());

  // Auto-sync with localStorage
  useEffect(() => {
    storageService.savePlaylists(rawPlaylists);
  }, [rawPlaylists]);

  useEffect(() => {
    storageService.saveVideos(rawVideos);
  }, [rawVideos]);

  useEffect(() => {
    storageService.saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    storageService.saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    storageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    storageService.saveActivity(activity);
  }, [activity]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Aggregate all videos with normalized properties
  const allVideos: Video[] = useMemo(() => {
    return rawVideos.map((v) => {
      const pl = rawPlaylists.find((p) => p.id === v.playlistId);
      const thumbnail = v.thumbnailUrl || (v as any).thumbnail || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
      const dur = (v as any).durationFormatted || (typeof v.duration === 'string' ? v.duration : formatTime(typeof v.duration === 'number' ? v.duration : 1800));

      return {
        ...v,
        thumbnailUrl: thumbnail,
        thumbnail: thumbnail,
        duration: dur,
        playlistTitle: pl?.title,
        category: pl?.title || v.category || 'Standalone Video',
      };
    });
  }, [rawVideos, rawPlaylists]);

  // Enriched playlists: every playlist is GUARANTEED to have a non-null `videos: Video[]` array
  const playlists: Playlist[] = useMemo(() => {
    return rawPlaylists.map((pl) => {
      const plVideos = allVideos.filter((v) => v.playlistId === pl.id);
      const total = plVideos.length;
      const completed = plVideos.filter((v) => {
        const p = progress[v.id];
        return p?.status === 'completed' || (p?.status as string) === 'COMPLETED';
      }).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...pl,
        videos: plVideos,
        totalVideos: total,
        completedVideos: completed,
        progressPercentage: pct,
      };
    });
  }, [rawPlaylists, allVideos, progress]);

  // Dynamic Metrics
  const metrics: Metrics = useMemo(() => {
    const total = allVideos.length;
    let completed = 0;
    let inProgress = 0;

    allVideos.forEach((v) => {
      const p = progress[v.id];
      const status = p?.status as string;
      if (status === 'completed' || status === 'COMPLETED') {
        completed++;
      } else if (status === 'in_progress' || status === 'IN_PROGRESS') {
        inProgress++;
      }
    });

    const unstarted = Math.max(0, total - completed - inProgress);
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalVideos: total,
      completedVideos: completed,
      inProgressVideos: inProgress,
      unstartedVideos: unstarted,
      overallProgress,
      totalPlaylists: playlists.length,
      totalBookmarks: bookmarks.length,
      totalNotes: notes.length,
      totalWatchHours: Math.round(((completed * 35 + inProgress * 15) / 60) * 10) / 10,
    };
  }, [allVideos, progress, playlists, bookmarks, notes]);

  // Continue Watching Video
  const continueWatchingVideo: Video | null = useMemo(() => {
    // 1. In-progress video with most recent activity
    const inProgressVideos = allVideos.filter((v) => {
      const s = progress[v.id]?.status as string;
      return s === 'in_progress' || s === 'IN_PROGRESS';
    });
    if (inProgressVideos.length > 0) {
      return inProgressVideos[0];
    }

    // 2. Uncompleted video
    const uncompleted = allVideos.find((v) => {
      const s = progress[v.id]?.status as string;
      return s !== 'completed' && s !== 'COMPLETED';
    });
    if (uncompleted) return uncompleted;

    // 3. Fallback
    return allVideos[0] || null;
  }, [allVideos, progress]);

  // Actions
  const playVideo = useCallback((videoId: string, playlistId?: string | null) => {
    setActiveVideoId(videoId);
    if (playlistId !== undefined) {
      setActivePlaylistId(playlistId);
    }
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  const updateVideoProgress = useCallback(
    (videoId: string, currentTime: number, duration = 1800) => {
      const percent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
      const isComplete = percent >= 90;

      setProgress((prev) => ({
        ...prev,
        [videoId]: {
          videoId,
          status: isComplete ? 'completed' : percent > 1 ? 'in_progress' : 'unstarted',
          currentTime,
          duration,
          percent,
          lastWatchedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const markVideoComplete = useCallback(
    (videoId: string) => {
      setProgress((prev) => {
        const existing = prev[videoId];
        const status = existing?.status as string;
        const nextComplete = status !== 'completed' && status !== 'COMPLETED';

        const video = allVideos.find((v) => v.id === videoId);

        // Add activity
        if (nextComplete && video) {
          setActivity((act) => [
            {
              id: 'act-' + Date.now(),
              type: 'completed_video',
              title: `Completed "${video.title}"`,
              details: video.playlistTitle || video.category || 'Curriculum',
              timestamp: new Date().toISOString(),
              videoId,
            },
            ...act,
          ]);
        }

        return {
          ...prev,
          [videoId]: {
            videoId,
            status: nextComplete ? 'completed' : 'unstarted',
            currentTime: nextComplete ? (existing?.duration || 1800) : 0,
            duration: existing?.duration || 1800,
            percent: nextComplete ? 100 : 0,
            lastWatchedAt: new Date().toISOString(),
          },
        };
      });
    },
    [allVideos]
  );

  const toggleVideoComplete = markVideoComplete;

  const addVideo = useCallback(
    (data: {
      youtubeId: string;
      title: string;
      topic?: string;
      category?: string;
      duration?: string;
      playlistId?: string;
    }) => {
      const newId = 'vid-' + Date.now();
      const newVideo: Video = {
        id: newId,
        youtubeId: data.youtubeId,
        title: data.title,
        topic: data.topic,
        category: data.category || 'Standalone Video',
        duration: data.duration || '25:00',
        thumbnailUrl: `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`,
        playlistId: data.playlistId,
        createdAt: new Date().toISOString(),
      };

      setRawVideos((prev) => [newVideo, ...prev]);

      setActivity((act) => [
        {
          id: 'act-' + Date.now(),
          type: 'watched_video',
          title: `Added "${newVideo.title}"`,
          details: data.playlistId ? 'Added to playlist' : 'Added to My Videos',
          timestamp: new Date().toISOString(),
          videoId: newId,
        },
        ...act,
      ]);

      return newVideo;
    },
    []
  );

  const addPlaylist = useCallback(
    (data: { title: string; category?: string; description?: string }) => {
      const newId = 'pl-' + Date.now();
      const newPlaylist: Playlist = {
        id: newId,
        title: data.title,
        category: data.category || 'Course',
        description: data.description,
        videos: [],
        createdAt: new Date().toISOString(),
      };

      setRawPlaylists((prev) => [newPlaylist, ...prev]);

      setActivity((act) => [
        {
          id: 'act-' + Date.now(),
          type: 'watched_video',
          title: `Created playlist "${data.title}"`,
          details: data.category || 'Course',
          timestamp: new Date().toISOString(),
          playlistId: newId,
        },
        ...act,
      ]);

      return newPlaylist;
    },
    []
  );

  const importPlaylistFromCSV = useCallback(
    (
      title: string,
      importedVideos: Array<{
        youtubeId: string;
        title: string;
        topic?: string;
        category?: string;
        duration?: string;
      }>
    ) => {
      const plId = 'pl-' + Date.now();
      const courseVideos: Video[] = importedVideos.map((v, i) => ({
        id: `${plId}-v${i + 1}`,
        youtubeId: v.youtubeId,
        title: v.title,
        topic: v.topic,
        category: v.category || title,
        duration: v.duration || '20:00',
        thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        playlistId: plId,
        playlistTitle: title,
        createdAt: new Date().toISOString(),
      }));

      const newPlaylist: Playlist = {
        id: plId,
        title,
        category: 'Imported Course',
        description: `Imported with ${courseVideos.length} videos.`,
        videos: courseVideos,
        createdAt: new Date().toISOString(),
      };

      setRawPlaylists((prev) => [newPlaylist, ...prev]);
      setRawVideos((prev) => [...courseVideos, ...prev]);

      setActivity((act) => [
        {
          id: 'act-' + Date.now(),
          type: 'watched_video',
          title: `Imported playlist "${title}"`,
          details: `${courseVideos.length} videos from CSV`,
          timestamp: new Date().toISOString(),
          playlistId: plId,
        },
        ...act,
      ]);

      return newPlaylist;
    },
    []
  );

  const deleteVideo = useCallback((videoId: string) => {
    setRawVideos((prev) => prev.filter((v) => v.id !== videoId));
    setProgress((prev) => {
      const next = { ...prev };
      delete next[videoId];
      return next;
    });
    setBookmarks((prev) => prev.filter((b) => b.videoId !== videoId));
    setNotes((prev) => prev.filter((n) => n.videoId !== videoId));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setRawPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setRawVideos((prev) => prev.filter((v) => v.playlistId !== playlistId));
    setBookmarks((prev) => prev.filter((b) => b.playlistId !== playlistId));
  }, []);

  const addNote = useCallback(
    (data: {
      videoId: string;
      videoTitle: string;
      timestampSeconds?: number;
      timestampFormatted?: string;
      content: string;
    }) => {
      const newNote: Note = {
        id: 'note-' + Date.now(),
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        timestampSeconds: data.timestampSeconds || 0,
        timestampFormatted: data.timestampFormatted || formatTime(data.timestampSeconds || 0),
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      setNotes((prev) => [newNote, ...prev]);

      setActivity((act) => [
        {
          id: 'act-' + Date.now(),
          type: 'added_note',
          title: `Note: "${data.content.slice(0, 30)}..."`,
          details: `${data.videoTitle} (@ ${newNote.timestampFormatted})`,
          timestamp: new Date().toISOString(),
          videoId: data.videoId,
        },
        ...act,
      ]);
    },
    []
  );

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const toggleBookmark = useCallback(
    (videoId: string) => {
      setBookmarks((prev) => {
        const existing = prev.find((b) => b.videoId === videoId);
        if (existing) {
          return prev.filter((b) => b.videoId !== videoId);
        }

        const video = allVideos.find((v) => v.id === videoId);
        const newBm: Bookmark = {
          id: 'bm-' + Date.now(),
          videoId,
          title: video?.title || 'Saved Video',
          createdAt: new Date().toISOString(),
        };

        setActivity((act) => [
          {
            id: 'act-' + Date.now(),
            type: 'bookmarked',
            title: `Bookmarked "${video?.title || 'Video'}"`,
            details: video?.playlistTitle || 'Video',
            timestamp: new Date().toISOString(),
            videoId,
          },
          ...act,
        ]);

        return [newBm, ...prev];
      });
    },
    [allVideos]
  );

  const isBookmarked = useCallback(
    (videoId: string) => {
      return bookmarks.some((b) => b.videoId === videoId);
    },
    [bookmarks]
  );

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetToDefaults = useCallback(() => {
    storageService.resetToDefaults();
    setRawPlaylists(storageService.getPlaylists());
    setRawVideos(storageService.getVideos());
    setProgress(storageService.getProgress());
    setNotes(storageService.getNotes());
    setBookmarks(storageService.getBookmarks());
    setActivity(storageService.getActivity());
    setSettings(storageService.getSettings());
  }, []);

  return (
    <LearningContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activePlaylistId,
        setActivePlaylistId,
        activeVideoId,
        setActiveVideoId,
        focusMode,
        setFocusMode,
        toggleFocusMode,

        playlists,
        videos: rawVideos,
        allVideos,
        progress,
        notes,
        bookmarks,
        activity,
        activities: activity,
        settings,

        metrics,
        continueWatchingVideo,

        playVideo,
        updateVideoProgress,
        markVideoComplete,
        toggleVideoComplete,
        addVideo,
        addPlaylist,
        importPlaylistFromCSV,
        deleteVideo,
        deletePlaylist,
        addNote,
        deleteNote,
        toggleBookmark,
        isBookmarked,
        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = (): LearningContextType => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
