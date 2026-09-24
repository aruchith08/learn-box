import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Playlist,
  Video,
  PlaylistVideo,
  UserVideoProgress,
  Note,
  Bookmark,
  ActivityItem,
  UserSettings,
  TabType,
} from '../types/focusLearn';
import { dbService, UserDatabaseState } from '../services/dbService';
import { useAuth } from './AuthContext';
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
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
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
  playlistVideos: PlaylistVideo[];
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
    duration?: string | number;
    playlistId?: string;
  }) => Video;
  addPlaylist: (data: {
    title: string;
    category?: string;
    description?: string;
    color?: string;
    iconName?: any;
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
  reorderPlaylists: (orderedPlaylistIds: string[]) => void;
  reorderPlaylistVideos: (playlistId: string, orderedVideoIds: string[]) => void;
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
  findCanonicalVideo: (youtubeId: string) => Video | undefined;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid || 'guest';

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Database State - read synchronously from localStorage to prevent flash of default ordering on reload
  const [dbState, setDbState] = useState<UserDatabaseState>(() => {
    try {
      const key = dbService.getStorageKey(currentUserId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version && parsed.version >= 3) {
          return dbService.ensurePlaylistOrder(parsed);
        }
      }
    } catch (e) {
      console.warn('Initial localStorage load error:', e);
    }
    return dbService.createInitialState(currentUserId);
  });

  // Load user data when current user changes (and handle guest migration)
  useEffect(() => {
    let isMounted = true;

    function dedupPlaylistVideos(state: UserDatabaseState): UserDatabaseState {
      const seen = new Set<string>();
      const deduped = state.playlistVideos.filter((pv) => {
        const key = `${pv.playlistId}::${pv.videoId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (deduped.length === state.playlistVideos.length) return state;
      return { ...state, playlistVideos: deduped };
    }

    async function initUser() {
      if (currentUserId && currentUserId !== 'guest') {
        const guestKey = dbService.getStorageKey('guest');
        const hasGuestData = !!localStorage.getItem(guestKey);
        let userState: UserDatabaseState;
        if (hasGuestData) {
          userState = await dbService.migrateGuestData(currentUserId);
        } else {
          userState = await dbService.loadUserData(currentUserId);
        }
        if (isMounted) setDbState(dedupPlaylistVideos(userState));
      } else {
        const loaded = await dbService.loadUserData('guest');
        if (isMounted) setDbState(dedupPlaylistVideos(loaded));
      }
    }

    initUser();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);


  // Persist on database state change
  const persistState = useCallback(
    (newState: UserDatabaseState) => {
      setDbState(newState);
      dbService.saveLocalUserData(currentUserId, newState);
    },
    [currentUserId]
  );

  // Canonical videos enriched with metadata (O(N) indexed with Map for fast resolution)
  const allVideos: Video[] = useMemo(() => {
    const pvByVideoId = new Map<string, PlaylistVideo>();
    for (let i = 0; i < dbState.playlistVideos.length; i++) {
      const pv = dbState.playlistVideos[i];
      if (!pvByVideoId.has(pv.videoId)) {
        pvByVideoId.set(pv.videoId, pv);
      }
    }
    const plById = new Map<string, Playlist>();
    for (let i = 0; i < dbState.playlists.length; i++) {
      const pl = dbState.playlists[i];
      plById.set(pl.id, pl);
    }

    return dbState.videos.map((v) => {
      const pv = pvByVideoId.get(v.id);
      const pl = pv ? plById.get(pv.playlistId) : null;
      const thumbnail =
        v.thumbnailUrl ||
        v.thumbnail ||
        `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
      const dur =
        v.durationFormatted ||
        (typeof v.duration === 'string'
          ? v.duration
          : formatTime(typeof v.duration === 'number' ? v.duration : 1800));

      return {
        ...v,
        thumbnailUrl: thumbnail,
        thumbnail: thumbnail,
        duration: dur,
        durationFormatted: dur,
        playlistId: pl?.id || v.playlistId || null,
        playlistTitle: pl?.title,
        category: pl?.title || v.category || 'Standalone Video',
      };
    });
  }, [dbState.videos, dbState.playlistVideos, dbState.playlists]);

  // Enriched playlists with dynamic calculation of completion and videos (O(N) indexed)
  const playlists: Playlist[] = useMemo(() => {
    let orderedPlaylists = dbState.playlists;
    if (dbState.playlistOrder && dbState.playlistOrder.length > 0) {
      const orderMap = new Map(dbState.playlistOrder.map((id, idx) => [id, idx]));
      orderedPlaylists = [...dbState.playlists].sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
        return idxA - idxB;
      });
    }

    const videoById = new Map<string, Video>(allVideos.map((v) => [v.id, v]));
    const pvsByPlaylistId = new Map<string, PlaylistVideo[]>();
    for (let i = 0; i < dbState.playlistVideos.length; i++) {
      const pv = dbState.playlistVideos[i];
      let list = pvsByPlaylistId.get(pv.playlistId);
      if (!list) {
        list = [];
        pvsByPlaylistId.set(pv.playlistId, list);
      }
      list.push(pv);
    }

    return orderedPlaylists.map((pl) => {
      const pvs = (pvsByPlaylistId.get(pl.id) || [])
        .slice()
        .sort((a, b) => a.position - b.position);

      const plVideos: Video[] = pvs
        .map((pv) => videoById.get(pv.videoId))
        .filter((v): v is Video => !!v);

      const total = plVideos.length;
      let completed = 0;
      for (let i = 0; i < plVideos.length; i++) {
        const p = dbState.progress[plVideos[i].id];
        if (p?.status === 'completed' || (p?.status as string) === 'COMPLETED') {
          completed++;
        }
      }
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...pl,
        videos: plVideos,
        totalVideos: total,
        completedVideos: completed,
        progressPercentage: pct,
      };
    });
  }, [dbState.playlists, dbState.playlistOrder, dbState.playlistVideos, allVideos, dbState.progress]);

  // Dynamic real metrics
  const metrics: Metrics = useMemo(() => {
    const total = allVideos.length;
    let completed = 0;
    let inProgress = 0;

    allVideos.forEach((v) => {
      const p = dbState.progress[v.id];
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
      totalBookmarks: dbState.bookmarks.length,
      totalNotes: dbState.notes.length,
      totalWatchHours:
        Math.round(((completed * 35 + inProgress * 15) / 60) * 10) / 10,
    };
  }, [allVideos, dbState.progress, playlists, dbState.bookmarks, dbState.notes]);

  // Continue Watching: prioritize in-progress video with latest watch time, null if none started
  const continueWatchingVideo: Video | null = useMemo(() => {
    const inProgressList = allVideos
      .filter((v) => {
        const p = dbState.progress[v.id];
        return p?.status === 'in_progress' || (p?.status as string) === 'IN_PROGRESS';
      })
      .sort((a, b) => {
        const timeA = new Date(dbState.progress[a.id]?.lastWatchedAt || 0).getTime();
        const timeB = new Date(dbState.progress[b.id]?.lastWatchedAt || 0).getTime();
        return timeB - timeA;
      });

    if (inProgressList.length > 0) {
      return inProgressList[0];
    }

    return null;
  }, [allVideos, dbState.progress]);

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
      setDbState((prev) => {
        const percent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
        const threshold = prev.settings.markCompleteThreshold || 90;
        const existing = prev.progress[videoId];
        const isPreviouslyCompleted = existing?.status === 'completed' || existing?.status === 'COMPLETED';
        const isNowComplete = isPreviouslyCompleted || percent >= threshold;

        const newStatus = isNowComplete
          ? 'completed'
          : percent > 1
          ? 'in_progress'
          : 'unstarted';

        const updatedProgress = {
          ...prev.progress,
          [videoId]: {
            videoId,
            status: newStatus as any,
            progressPercentage: isNowComplete ? 100 : percent,
            percent: isNowComplete ? 100 : percent,
            currentTime,
            duration,
            lastWatchedAt: new Date().toISOString(),
            completedAt: isNowComplete ? existing?.completedAt || new Date().toISOString() : undefined,
            sessionsCount: (existing?.sessionsCount || 0) + 1,
          },
        };

        const targetVideo = prev.videos.find((v) => v.id === videoId);
        let newActivity = prev.activity;

        // If newly reached completion, log activity
        if (!isPreviouslyCompleted && isNowComplete && targetVideo) {
          newActivity = [
            {
              id: 'act-' + Date.now(),
              type: 'completed_video',
              title: `Completed "${targetVideo.title}"`,
              details: targetVideo.category || 'Curriculum',
              timestamp: new Date().toISOString(),
              videoId,
            },
            ...prev.activity,
          ].slice(0, 60);
        }

        const nextState = {
          ...prev,
          progress: updatedProgress,
          activity: newActivity,
        };

        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const markVideoComplete = useCallback(
    (videoId: string) => {
      setDbState((prev) => {
        const existing = prev.progress[videoId];
        const isDone = existing?.status === 'completed' || existing?.status === 'COMPLETED';
        const nextDone = !isDone;
        const targetVideo = prev.videos.find((v) => v.id === videoId);

        const updatedProgress = {
          ...prev.progress,
          [videoId]: {
            videoId,
            status: (nextDone ? 'completed' : 'unstarted') as any,
            progressPercentage: nextDone ? 100 : 0,
            percent: nextDone ? 100 : 0,
            currentTime: nextDone ? existing?.duration || 1800 : 0,
            duration: existing?.duration || 1800,
            lastWatchedAt: new Date().toISOString(),
            completedAt: nextDone ? new Date().toISOString() : undefined,
            sessionsCount: (existing?.sessionsCount || 0) + 1,
          },
        };

        let newActivity = prev.activity;
        if (nextDone && targetVideo) {
          newActivity = [
            {
              id: 'act-' + Date.now(),
              type: 'completed_video',
              title: `Completed "${targetVideo.title}"`,
              details: targetVideo.category || 'Curriculum',
              timestamp: new Date().toISOString(),
              videoId,
            },
            ...prev.activity,
          ].slice(0, 60);
        }

        const nextState = {
          ...prev,
          progress: updatedProgress,
          activity: newActivity,
        };

        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const toggleVideoComplete = markVideoComplete;

  const findCanonicalVideo = useCallback(
    (youtubeId: string): Video | undefined => {
      return dbService.findCanonicalVideo(dbState.videos, youtubeId);
    },
    [dbState.videos]
  );

  const addVideo = useCallback(
    (data: {
      youtubeId: string;
      title: string;
      topic?: string;
      category?: string;
      duration?: string | number;
      playlistId?: string;
    }) => {
      let resultVideo: Video;

      setDbState((prev) => {
        // 1. Check if canonical video already exists
        let canonical = dbService.findCanonicalVideo(prev.videos, data.youtubeId);
        let updatedVideos = [...prev.videos];

        if (!canonical) {
          canonical = {
            id: 'vid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            youtubeId: data.youtubeId,
            title: data.title,
            topic: data.topic,
            category: data.category || 'Standalone Video',
            duration: typeof data.duration === 'string' ? data.duration : formatTime(data.duration || 1800),
            durationFormatted: typeof data.duration === 'string' ? data.duration : formatTime(data.duration || 1800),
            thumbnailUrl: `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`,
            thumbnail: `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`,
            createdAt: new Date().toISOString(),
          };
          updatedVideos = [canonical, ...updatedVideos];
        }

        resultVideo = canonical;

        // 2. If playlistId provided, associate in playlist_videos
        let updatedPlaylistVideos = [...prev.playlistVideos];
        if (data.playlistId) {
          const alreadyLinked = updatedPlaylistVideos.some(
            (pv) => pv.playlistId === data.playlistId && pv.videoId === canonical!.id
          );
          if (!alreadyLinked) {
            const currentCount = updatedPlaylistVideos.filter((pv) => pv.playlistId === data.playlistId).length;
            updatedPlaylistVideos.push({
              id: `pv-${data.playlistId}-${canonical.id}`,
              playlistId: data.playlistId,
              videoId: canonical.id,
              position: currentCount,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // 3. Log activity
        const newActivity: ActivityItem = {
          id: 'act-' + Date.now(),
          type: 'added',
          title: `Added "${canonical.title}"`,
          details: data.playlistId ? 'Linked to Playlist' : 'Added to My Videos',
          timestamp: new Date().toISOString(),
          videoId: canonical.id,
        };

        const nextState = {
          ...prev,
          videos: updatedVideos,
          playlistVideos: updatedPlaylistVideos,
          activity: [newActivity, ...prev.activity].slice(0, 60),
        };

        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });

      return resultVideo!;
    },
    [currentUserId]
  );

  const addPlaylist = useCallback(
    (data: {
      title: string;
      category?: string;
      description?: string;
      color?: string;
      iconName?: any;
    }) => {
      const plId = 'pl-' + Date.now();
      const newPlaylist: Playlist = {
        id: plId,
        title: data.title,
        creator: 'You',
        category: data.category || 'Course',
        description: data.description || '',
        color: data.color || '#FEF08A',
        iconName: data.iconName || 'folder',
        videos: [],
        totalVideos: 0,
        completedVideos: 0,
        progressPercentage: 0,
        createdAt: new Date().toISOString(),
      };

      setDbState((prev) => {
        const nextOrder = [newPlaylist.id, ...(prev.playlistOrder || prev.playlists.map((p) => p.id))];
        const nextState = {
          ...prev,
          playlists: [newPlaylist, ...prev.playlists],
          playlistOrder: nextOrder,
          updatedAt: new Date().toISOString(),
          activity: [
            {
              id: 'act-' + Date.now(),
              type: 'added' as const,
              title: `Created playlist "${data.title}"`,
              details: data.category || 'Course',
              timestamp: new Date().toISOString(),
              playlistId: plId,
            },
            ...prev.activity,
          ].slice(0, 60),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });

      return newPlaylist;
    },
    [currentUserId]
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
      let createdPlaylist: Playlist;

      setDbState((prev) => {
        const updatedVideos = [...prev.videos];
        const newPlaylistVideos: PlaylistVideo[] = [];

        importedVideos.forEach((v, index) => {
          let canonical = dbService.findCanonicalVideo(updatedVideos, v.youtubeId);
          if (!canonical) {
            canonical = {
              id: `${plId}-v${index + 1}`,
              youtubeId: v.youtubeId,
              title: v.title,
              topic: v.topic,
              category: v.category || title,
              duration: v.duration || '20:00',
              durationFormatted: v.duration || '20:00',
              thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
              thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
              createdAt: new Date().toISOString(),
            };
            updatedVideos.push(canonical);
          }

          newPlaylistVideos.push({
            id: `pv-${plId}-${canonical.id}`,
            playlistId: plId,
            videoId: canonical.id,
            position: index,
            createdAt: new Date().toISOString(),
          });
        });

        createdPlaylist = {
          id: plId,
          title,
          creator: 'Imported',
          category: 'Course',
          description: `Imported with ${importedVideos.length} lessons.`,
          color: '#A7F3D0',
          iconName: 'folder',
          createdAt: new Date().toISOString(),
        };

        const nextOrder = [createdPlaylist.id, ...(prev.playlistOrder || prev.playlists.map((p) => p.id))];
        const nextState = {
          ...prev,
          playlists: [createdPlaylist, ...prev.playlists],
          playlistOrder: nextOrder,
          videos: updatedVideos,
          playlistVideos: [...prev.playlistVideos, ...newPlaylistVideos],
          updatedAt: new Date().toISOString(),
          activity: [
            {
              id: 'act-' + Date.now(),
              type: 'added' as const,
              title: `Imported playlist "${title}"`,
              details: `${importedVideos.length} videos from CSV`,
              timestamp: new Date().toISOString(),
              playlistId: plId,
            },
            ...prev.activity,
          ].slice(0, 60),
        };

        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });

      return createdPlaylist!;
    },
    [currentUserId]
  );

  const reorderPlaylists = useCallback(
    (orderedPlaylistIds: string[]) => {
      setDbState((prev) => {
        const playlistMap = new Map(prev.playlists.map((pl) => [pl.id, pl]));
        const reordered: Playlist[] = [];

        orderedPlaylistIds.forEach((id) => {
          const pl = playlistMap.get(id);
          if (pl) {
            reordered.push(pl);
            playlistMap.delete(id);
          }
        });

        // Add any remaining playlists not in the ordered list
        playlistMap.forEach((pl) => {
          reordered.push(pl);
        });

        const nextOrder = reordered.map((p) => p.id);

        const nextState: UserDatabaseState = {
          ...prev,
          playlists: reordered,
          playlistOrder: nextOrder,
          updatedAt: new Date().toISOString(),
        };

        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const reorderPlaylistVideos = useCallback(
    (playlistId: string, orderedVideoIds: string[]) => {
      setDbState((prev) => {
        const otherPvs = prev.playlistVideos.filter((pv) => pv.playlistId !== playlistId);
        const reorderedPvs: PlaylistVideo[] = orderedVideoIds.map((vid, idx) => ({
          id: `pv-${playlistId}-${vid}`,
          playlistId,
          videoId: vid,
          position: idx,
          createdAt: new Date().toISOString(),
        }));

        const nextState = {
          ...prev,
          playlistVideos: [...otherPvs, ...reorderedPvs],
          updatedAt: new Date().toISOString(),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const deleteVideo = useCallback(
    (videoId: string) => {
      setDbState((prev) => {
        const updatedVideos = prev.videos.filter((v) => v.id !== videoId);
        const updatedPlaylistVideos = prev.playlistVideos.filter((pv) => pv.videoId !== videoId);
        const nextProgress = { ...prev.progress };
        delete nextProgress[videoId];
        const nextBookmarks = prev.bookmarks.filter((b) => b.videoId !== videoId);
        const nextNotes = prev.notes.filter((n) => n.videoId !== videoId);

        const nextState = {
          ...prev,
          videos: updatedVideos,
          playlistVideos: updatedPlaylistVideos,
          progress: nextProgress,
          bookmarks: nextBookmarks,
          notes: nextNotes,
          updatedAt: new Date().toISOString(),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      setDbState((prev) => {
        // Preserves canonical videos! Only removes playlist and its playlist_videos join records
        const updatedPlaylists = prev.playlists.filter((p) => p.id !== playlistId);
        const updatedPlaylistVideos = prev.playlistVideos.filter((pv) => pv.playlistId !== playlistId);
        const updatedOrder = (prev.playlistOrder || prev.playlists.map((p) => p.id)).filter(
          (id) => id !== playlistId
        );

        const nextState: UserDatabaseState = {
          ...prev,
          playlists: updatedPlaylists,
          playlistOrder: updatedOrder,
          playlistVideos: updatedPlaylistVideos,
          updatedAt: new Date().toISOString(),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

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

      setDbState((prev) => {
        const nextState = {
          ...prev,
          notes: [newNote, ...prev.notes],
          activity: [
            {
              id: 'act-' + Date.now(),
              type: 'added_note' as const,
              title: `Note on "${data.videoTitle}"`,
              details: `@ ${newNote.timestampFormatted}: "${data.content.slice(0, 30)}..."`,
              timestamp: new Date().toISOString(),
              videoId: data.videoId,
            },
            ...prev.activity,
          ].slice(0, 60),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      setDbState((prev) => {
        const nextState = {
          ...prev,
          notes: prev.notes.filter((n) => n.id !== noteId),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const toggleBookmark = useCallback(
    (videoId: string) => {
      setDbState((prev) => {
        const existing = prev.bookmarks.find((b) => b.videoId === videoId);
        if (existing) {
          const nextState = {
            ...prev,
            bookmarks: prev.bookmarks.filter((b) => b.videoId !== videoId),
          };
          dbService.saveLocalUserData(currentUserId, nextState);
          return nextState;
        }

        const video = prev.videos.find((v) => v.id === videoId);
        const newBm: Bookmark = {
          id: 'bm-' + Date.now(),
          videoId,
          title: video?.title || 'Saved Video',
          createdAt: new Date().toISOString(),
        };

        const nextState = {
          ...prev,
          bookmarks: [newBm, ...prev.bookmarks],
          activity: [
            {
              id: 'act-' + Date.now(),
              type: 'bookmarked' as const,
              title: `Bookmarked "${video?.title || 'Video'}"`,
              details: 'Saved for quick revision',
              timestamp: new Date().toISOString(),
              videoId,
            },
            ...prev.activity,
          ].slice(0, 60),
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const isBookmarked = useCallback(
    (videoId: string) => {
      return dbState.bookmarks.some((b) => b.videoId === videoId);
    },
    [dbState.bookmarks]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setDbState((prev) => {
        const nextState = {
          ...prev,
          settings: { ...prev.settings, ...newSettings },
        };
        dbService.saveLocalUserData(currentUserId, nextState);
        return nextState;
      });
    },
    [currentUserId]
  );

  const resetToDefaults = useCallback(() => {
    const initialState = dbService.createInitialState(currentUserId);
    setDbState(initialState);
    dbService.saveLocalUserData(currentUserId, initialState);
  }, [currentUserId]);

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
        videos: dbState.videos,
        allVideos,
        playlistVideos: dbState.playlistVideos,
        progress: dbState.progress,
        notes: dbState.notes,
        bookmarks: dbState.bookmarks,
        activity: dbState.activity,
        activities: dbState.activity,
        settings: dbState.settings,

        metrics,
        continueWatchingVideo,

        playVideo,
        updateVideoProgress,
        markVideoComplete,
        toggleVideoComplete,
        addVideo,
        addPlaylist,
        importPlaylistFromCSV,
        reorderPlaylists,
        reorderPlaylistVideos,
        deleteVideo,
        deletePlaylist,
        addNote,
        deleteNote,
        toggleBookmark,
        isBookmarked,
        updateSettings,
        resetToDefaults,
        findCanonicalVideo,
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
