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
  playlistOrder?: string[];
  videos: Video[]; // Canonical video table
  playlistVideos: PlaylistVideo[]; // Join table
  progress: Record<string, UserVideoProgress>;
  notes: Note[];
  bookmarks: Bookmark[];
  activity: ActivityItem[];
  settings: UserSettings;
  updatedAt: string;
}

export const STORAGE_PREFIX = 'focus_learn_db_v3_';

export function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

/**
 * Clean data recursively to strip unsupported undefined fields before sending to Firestore
 */
function sanitizeForFirestore(val: any): any {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      result[k] = sanitizeForFirestore(v);
    }
  }
  return result;
}

export const dbService = {
  getStorageKey(userId: string): string {
    return getStorageKey(userId);
  },

  /**
   * Ensure playlistOrder array exists, playlists array matches that exact order,
   * and any deprecated/removed default playlists are purged cleanly.
   */
  ensurePlaylistOrder(state: UserDatabaseState): UserDatabaseState {
    if (!state) return state;

    // Filter out removed default playlists and their associated videos
    const REMOVED_PLAYLIST_IDS = new Set(['pl-abdul-bari']);
    if (state.playlists) {
      state.playlists = state.playlists.filter((p) => !REMOVED_PLAYLIST_IDS.has(p.id));
    }
    if (state.videos) {
      state.videos = state.videos.filter((v) => !v.playlistId || !REMOVED_PLAYLIST_IDS.has(v.playlistId));
    }
    if (state.playlistVideos) {
      state.playlistVideos = state.playlistVideos.filter((pv) => !REMOVED_PLAYLIST_IDS.has(pv.playlistId));
    }

    // Ensure all default initial playlists and their videos exist in user state
    if (!state.playlists) state.playlists = [];
    if (!state.videos) state.videos = [];
    if (!state.playlistVideos) state.playlistVideos = [];

    const currentPlaylistIds = new Set(state.playlists.map((p) => p.id));
    const existingVideoIds = new Set(state.videos.map((v) => v.id));
    const existingPVKeys = new Set(state.playlistVideos.map((pv) => `${pv.playlistId}:${pv.videoId}`));

    INITIAL_PLAYLISTS.forEach((initPl) => {
      if (!currentPlaylistIds.has(initPl.id) && !REMOVED_PLAYLIST_IDS.has(initPl.id)) {
        state.playlists.push({
          ...initPl,
          completedVideos: 0,
          progressPercentage: 0,
        });
        currentPlaylistIds.add(initPl.id);

        const initVidsForPl = INITIAL_VIDEOS.filter((v) => v.playlistId === initPl.id);
        initVidsForPl.forEach((v) => {
          if (!existingVideoIds.has(v.id)) {
            state.videos.push(v);
            existingVideoIds.add(v.id);
          }
          const pvKey = `${initPl.id}:${v.id}`;
          if (!existingPVKeys.has(pvKey)) {
            state.playlistVideos.push({
              id: `pv-${initPl.id}-${v.id}`,
              playlistId: initPl.id,
              videoId: v.id,
              position: typeof v.position === 'number' ? v.position : 0,
              createdAt: v.createdAt || new Date().toISOString(),
            });
            existingPVKeys.add(pvKey);
          }
        });
      }
    });

    let order = state.playlistOrder;
    if (!order || !Array.isArray(order) || order.length === 0) {
      order = (state.playlists || []).map((p) => p.id);
    } else {
      order = order.filter((id) => !REMOVED_PLAYLIST_IDS.has(id));
      const set = new Set(order);
      (state.playlists || []).forEach((p) => {
        if (!set.has(p.id)) {
          order!.push(p.id);
        }
      });
    }
    state.playlistOrder = order;

    // Arrange state.playlists according to playlistOrder
    const orderMap = new Map(order.map((id, idx) => [id, idx]));
    state.playlists = [...(state.playlists || [])].sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
      return idxA - idxB;
    });

    return state;
  },

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
        } else {
          localState = this.ensurePlaylistOrder(localState);
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
            const normalizedCloud = this.ensurePlaylistOrder(cloudData);
            const cloudTime = new Date(normalizedCloud.updatedAt || 0).getTime();
            const localTime = new Date(localState?.updatedAt || 0).getTime();
            // If cloud is newer or local is empty, use cloud
            if (!localState || cloudTime >= localTime) {
              this.saveLocalUserData(userId, normalizedCloud);
              return normalizedCloud;
            } else if (localState && localTime > cloudTime) {
              // Local is newer, sync to cloud
              this.syncToCloud(userId, localState).catch((err) => console.warn('Cloud sync update error:', err));
            }
          }
        } else if (localState) {
          // Document does not exist in Firestore yet, push local state
          this.syncToCloud(userId, localState).catch((err) => console.warn('Initial cloud seed error:', err));
        }
      } catch (err) {
        console.warn('Firestore load warning:', err);
      }
    }

    if (localState) {
      return this.ensurePlaylistOrder(localState);
    }

    // If new user, initialize with clean zero-progress curriculum data and save once
    const initialState = this.createInitialState(userId);
    this.saveLocalUserData(userId, initialState);
    return initialState;
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

    const initialPlaylists = INITIAL_PLAYLISTS.map((pl) => ({
      ...pl,
      completedVideos: 0,
      progressPercentage: 0,
      lastWatchedVideoId: undefined,
      lastWatchedAt: undefined,
    }));

    const state: UserDatabaseState = {
      version: 3,
      userId,
      playlists: initialPlaylists,
      playlistOrder: initialPlaylists.map((pl) => pl.id),
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

    // Note: createInitialState is a pure factory. Do not call saveLocalUserData here.
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
      const cleanData = sanitizeForFirestore(state);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (err) {
      console.warn('Background Firestore sync error:', err);
    }
  },

  /**
   * Migrate guest data into authenticated user account upon sign in
   */
  async migrateGuestData(newUserId: string): Promise<UserDatabaseState> {
    const guestKey = getStorageKey('guest');
    const guestRaw = localStorage.getItem(guestKey);
    const existingUserState = await this.loadUserData(newUserId);

    if (!guestRaw) {
      return this.ensurePlaylistOrder(existingUserState);
    }

    let guestState: UserDatabaseState | null = null;
    try {
      guestState = JSON.parse(guestRaw);
    } catch {
      guestState = null;
    }

    // If guest storage is empty or has zero progress/notes/bookmarks/activity, don't clobber user state
    const hasGuestProgress = guestState && Object.keys(guestState.progress || {}).length > 0;
    const hasGuestNotes = guestState && (guestState.notes || []).length > 0;
    const hasGuestBookmarks = guestState && (guestState.bookmarks || []).length > 0;
    const hasGuestActivity = guestState && (guestState.activity || []).length > 0;

    if (!guestState || (!hasGuestProgress && !hasGuestNotes && !hasGuestBookmarks && !hasGuestActivity)) {
      try {
        localStorage.removeItem(guestKey);
      } catch (e) {
        console.warn('Error clearing guest storage:', e);
      }
      return this.ensurePlaylistOrder(existingUserState);
    }

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

    // Merge playlist ordering prioritizing user's cloud/account order
    let mergedPlaylistOrder: string[] = [];
    if (existingUserState.playlistOrder && existingUserState.playlistOrder.length > 0) {
      mergedPlaylistOrder = [...existingUserState.playlistOrder];
    } else if (guestState.playlistOrder && guestState.playlistOrder.length > 0) {
      mergedPlaylistOrder = [...guestState.playlistOrder];
    } else {
      mergedPlaylistOrder = mergedPlaylists.map((p) => p.id);
    }

    // Ensure all merged playlists exist in the playlistOrder
    mergedPlaylists.forEach((p) => {
      if (!mergedPlaylistOrder.includes(p.id)) {
        mergedPlaylistOrder.push(p.id);
      }
    });

    // Order mergedPlaylists according to mergedPlaylistOrder
    const orderMap = new Map(mergedPlaylistOrder.map((id, idx) => [id, idx]));
    mergedPlaylists.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
      return idxA - idxB;
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
      version: 3,
      userId: newUserId,
      playlists: mergedPlaylists,
      playlistOrder: mergedPlaylistOrder,
      videos: mergedVideos,
      playlistVideos: [...existingUserState.playlistVideos, ...guestState.playlistVideos].filter(
        (pv, _, arr) =>
          arr.findIndex((x) => x.playlistId === pv.playlistId && x.videoId === pv.videoId) ===
          arr.indexOf(pv)
      ),
      progress: mergedProgress,
      notes: mergedNotes,
      bookmarks: mergedBookmarks,
      activity: [...guestState.activity, ...existingUserState.activity].slice(0, 60),
      settings: existingUserState.settings,
      updatedAt: new Date().toISOString(),
    };

    const finalState = this.ensurePlaylistOrder(mergedState);
    this.saveLocalUserData(newUserId, finalState);

    // Clean up guest state after successful migration
    try {
      localStorage.removeItem(guestKey);
    } catch (e) {
      console.warn('Error clearing guest storage after migration:', e);
    }

    return finalState;
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
