import {
  Playlist,
  Video,
  PlaylistVideo,
  UserVideoProgress,
  Note,
  Bookmark,
  ActivityItem,
  UserSettings,
} from '../types/focusLearn';
import {
  INITIAL_PLAYLISTS,
  INITIAL_VIDEOS,
  INITIAL_PROGRESS,
  INITIAL_NOTES,
  INITIAL_BOOKMARKS,
  INITIAL_ACTIVITY,
  INITIAL_SETTINGS,
} from './preloadedData';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserDatabaseState {
  version: number;
  userId: string;
  playlists: Playlist[];
  videos: Video[]; // Canonical video table
  playlistVideos: PlaylistVideo[]; // Join table
  progress: Record<string, UserVideoProgress>;
  notes: Note[];
  bookmarks: Bookmark[];
  activity: ActivityItem[];
  settings: UserSettings;
  updatedAt: string;
}

const STORAGE_PREFIX = 'focus_learn_db_v3_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export const dbService = {
  /**
   * Initialize and load data for a specific user.
   */
  async loadUserData(userId: string): Promise<UserDatabaseState> {
    const key = getStorageKey(userId);
    let localState: UserDatabaseState | null = null;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        localState = JSON.parse(raw);
        // If older version or legacy state, discard and re-initialize with 0 progress
        if (!localState || (localState.version && localState.version < 3)) {
          localState = null;
        }
      }
    } catch (e) {
      console.warn('Error reading local user data:', e);
    }

    // Try cloud sync if user is authenticated and Firestore is available
    if (userId && userId !== 'guest' && db) {
      try {
        const docRef = doc(db, 'user_learning', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as UserDatabaseState;
          if (cloudData && cloudData.version && cloudData.version >= 3) {
            // If cloud is newer or local is empty, use cloud
            if (!localState || new Date(cloudData.updatedAt) > new Date(localState.updatedAt || 0)) {
              this.saveLocalUserData(userId, cloudData);
              return cloudData;
            }
          }
        }
      } catch (err) {
        console.warn('Firestore load warning:', err);
      }
    }

    if (localState) {
      return localState;
    }

    // If new user, initialize with clean zero-progress curriculum data
    return this.createInitialState(userId);
  },

  createInitialState(userId: string): UserDatabaseState {
    // Generate initial playlist_videos join records from preloaded playlists & videos
    const playlistVideos: PlaylistVideo[] = [];
    INITIAL_VIDEOS.forEach((vid, idx) => {
      if (vid.playlistId) {
        playlistVideos.push({
          id: `pv-${vid.playlistId}-${vid.id}`,
          playlistId: vid.playlistId,
          videoId: vid.id,
          position: typeof vid.position === 'number' ? vid.position : idx,
          createdAt: vid.createdAt || new Date().toISOString(),
        });
      }
    });

    const state: UserDatabaseState = {
      version: 3,
      userId,
      playlists: INITIAL_PLAYLISTS.map((pl) => ({
        ...pl,
        completedVideos: 0,
        progressPercentage: 0,
        lastWatchedVideoId: undefined,
        lastWatchedAt: undefined,
      })),
      videos: INITIAL_VIDEOS,
      playlistVideos,
      progress: {}, // Fresh start has 0 progress
      notes: [],
      bookmarks: [],
      activity: [],
      settings: {
        ...INITIAL_SETTINGS,
        autoPlayNext: true,
        resumePosition: true,
        markCompleteThreshold: 90,
      } as any,
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalUserData(userId, state);
    return state;
  },

  /**
   * Save user database state locally and schedule cloud sync if logged in
   */
  saveLocalUserData(userId: string, state: UserDatabaseState): void {
    try {
      const key = getStorageKey(userId);
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving local user state:', e);
    }

    // Sync to Firestore in background
    if (userId && userId !== 'guest' && db) {
      this.syncToCloud(userId, state).catch((err) => console.warn('Cloud sync error:', err));
    }
  },

  async syncToCloud(userId: string, state: UserDatabaseState): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      const docRef = doc(db, 'user_learning', userId);
      await setDoc(docRef, state, { merge: true });
    } catch (err) {
      console.warn('Background Firestore sync error:', err);
    }
  },

  /**
   * Migrate guest data into authenticated user account upon sign in
   */
  async migrateGuestData(newUserId: string): Promise<UserDatabaseState> {
    const guestState = await this.loadUserData('guest');
    const existingUserState = await this.loadUserData(newUserId);

    // Merge progress, bookmarks, notes, and added playlists
    const mergedProgress = {
      ...existingUserState.progress,
      ...guestState.progress,
    };

    const existingVideoIds = new Set(existingUserState.videos.map((v) => v.id));
    const mergedVideos = [...existingUserState.videos];
    guestState.videos.forEach((v) => {
      if (!existingVideoIds.has(v.id)) {
        mergedVideos.push(v);
        existingVideoIds.add(v.id);
      }
    });

    const existingPlaylistIds = new Set(existingUserState.playlists.map((p) => p.id));
    const mergedPlaylists = [...existingUserState.playlists];
    guestState.playlists.forEach((p) => {
      if (!existingPlaylistIds.has(p.id)) {
        mergedPlaylists.push(p);
        existingPlaylistIds.add(p.id);
      }
    });

    const existingNoteIds = new Set(existingUserState.notes.map((n) => n.id));
    const mergedNotes = [...existingUserState.notes];
    guestState.notes.forEach((n) => {
      if (!existingNoteIds.has(n.id)) {
        mergedNotes.push(n);
        existingNoteIds.add(n.id);
      }
    });

    const existingBmIds = new Set(existingUserState.bookmarks.map((b) => b.id));
    const mergedBookmarks = [...existingUserState.bookmarks];
    guestState.bookmarks.forEach((b) => {
      if (!existingBmIds.has(b.id)) {
        mergedBookmarks.push(b);
        existingBmIds.add(b.id);
      }
    });

    const mergedState: UserDatabaseState = {
      version: 2,
      userId: newUserId,
      playlists: mergedPlaylists,
      videos: mergedVideos,
      playlistVideos: [...existingUserState.playlistVideos, ...guestState.playlistVideos],
      progress: mergedProgress,
      notes: mergedNotes,
      bookmarks: mergedBookmarks,
      activity: [...guestState.activity, ...existingUserState.activity].slice(0, 60),
      settings: existingUserState.settings,
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalUserData(newUserId, mergedState);
    return mergedState;
  },

  /**
   * Find canonical video by YouTube video ID
   */
  findCanonicalVideo(videos: Video[], youtubeId: string): Video | undefined {
    const cleanId = youtubeId.trim();
    return videos.find((v) => v.youtubeId === cleanId);
  },

  /**
   * Export complete user data as JSON
   */
  exportBackup(state: UserDatabaseState): string {
    return JSON.stringify(state, null, 2);
  },

  /**
   * Validate and parse imported JSON
   */
  validateAndParseBackup(jsonText: string): UserDatabaseState | null {
    try {
      const parsed = JSON.parse(jsonText);
      if (
        Array.isArray(parsed.playlists) &&
        Array.isArray(parsed.videos) &&
        parsed.progress &&
        typeof parsed.progress === 'object'
      ) {
        return parsed as UserDatabaseState;
      }
      return null;
    } catch {
      return null;
    }
  },
};
