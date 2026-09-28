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
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  writeBatch,
} from 'firebase/firestore';

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

export const STORAGE_PREFIX = 'focus_learn_db_v4_';
export const LEGACY_STORAGE_PREFIX = 'focus_learn_db_v3_';

export function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export function getLegacyStorageKey(userId: string): string {
  return `${LEGACY_STORAGE_PREFIX}${userId || 'guest'}`;
}

export const DEFAULT_PLAYLIST_IDS = new Set(INITIAL_PLAYLISTS.map((p) => p.id));
export const DEFAULT_VIDEO_IDS = new Set(INITIAL_VIDEOS.map((v) => v.id));

let _cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
let _progressSyncTimer: ReturnType<typeof setTimeout> | null = null;

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

/**
 * Helper to commit writes in chunks to respect Firestore's 500 ops batch limit
 */
async function commitBatches(
  firestoreDb: any,
  operations: Array<(batch: any) => void>
): Promise<void> {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
    const chunk = operations.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(firestoreDb);
    for (const op of chunk) {
      op(batch);
    }
    await batch.commit();
  }
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
      state.videos = state.videos.filter(
        (v) => !v.playlistId || !REMOVED_PLAYLIST_IDS.has(v.playlistId)
      );
    }
    if (state.playlistVideos) {
      state.playlistVideos = state.playlistVideos.filter(
        (pv) => !REMOVED_PLAYLIST_IDS.has(pv.playlistId)
      );
    }

    // Ensure all default initial playlists and their videos exist in user state
    if (!state.playlists) state.playlists = [];
    if (!state.videos) state.videos = [];
    if (!state.playlistVideos) state.playlistVideos = [];

    const currentPlaylistIds = new Set(state.playlists.map((p) => p.id));
    const existingVideoIds = new Set(state.videos.map((v) => v.id));
    const existingPVKeys = new Set(
      state.playlistVideos.map((pv) => `${pv.playlistId}:${pv.videoId}`)
    );

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
    const legacyKey = getLegacyStorageKey(userId);
    let localState: UserDatabaseState | null = null;

    try {
      // Check v4 storage first, fallback to v3 if available
      let raw = localStorage.getItem(key);
      if (!raw) {
        raw = localStorage.getItem(legacyKey);
      }
      if (raw) {
        localState = JSON.parse(raw);
        if (!localState || (localState.version && localState.version < 3)) {
          localState = null;
        } else {
          localState = this.ensurePlaylistOrder(localState);
          localState.version = 4;
        }
      }
    } catch (e) {
      console.warn('Error reading local user data:', e);
    }

    // Try cloud sync if user is authenticated and Firestore is available
    if (userId && userId !== 'guest' && db) {
      try {
        const profileDocRef = doc(db, 'users', userId, 'profile', 'main');
        const profileSnap = await getDoc(profileDocRef);

        if (profileSnap.exists()) {
          // User already migrated to v4 hybrid schema!
          const cloudState = await this.loadFromV4Schema(userId);
          if (cloudState) {
            const normalizedCloud = this.ensurePlaylistOrder(cloudState);
            const cloudTime = new Date(normalizedCloud.updatedAt || 0).getTime();
            const localTime = new Date(localState?.updatedAt || 0).getTime();

            // If cloud is newer or local is empty, use cloud
            if (!localState || cloudTime >= localTime) {
              this.saveLocalUserData(userId, normalizedCloud);
              return normalizedCloud;
            } else if (localState && localTime > cloudTime) {
              // Local is newer, sync to cloud
              this.syncToCloud(userId, localState).catch((err) =>
                console.warn('Cloud sync update error:', err)
              );
            }
          }
        } else {
          // Check for legacy v3 monolithic document at user_learning/{userId}
          const legacyDocRef = doc(db, 'user_learning', userId);
          const legacySnap = await getDoc(legacyDocRef);

          if (legacySnap.exists()) {
            console.info(`[LearnBox] Migrating legacy document for user ${userId} to v4 hybrid schema...`);
            const legacyData = legacySnap.data() as UserDatabaseState;
            const migratedState = await this.migrateLegacyDocument(userId, legacyData);
            this.saveLocalUserData(userId, migratedState);
            return migratedState;
          } else if (localState) {
            // First time cloud upload of existing local state into v4 schema
            this.syncToCloud(userId, localState).catch((err) =>
              console.warn('Initial cloud seed error:', err)
            );
          }
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

  /**
   * Load user data from the v4 hybrid schema:
   * - Static catalog comes from bundled code (0 Firestore reads)
   * - Profile (settings, playlistOrder, schemaVersion)
   * - Progress (data/progress doc)
   * - Subcollections for notes, bookmarks, custom playlists, custom videos, activity
   */
  async loadFromV4Schema(userId: string): Promise<UserDatabaseState | null> {
    if (!db || !userId || userId === 'guest') return null;

    try {
      const profileDocRef = doc(db, 'users', userId, 'profile', 'main');
      const progressDocRef = doc(db, 'users', userId, 'data', 'progress');

      // Fetch profile & progress
      const [profileSnap, progressSnap] = await Promise.all([
        getDoc(profileDocRef),
        getDoc(progressDocRef),
      ]);

      const profileData = profileSnap.exists() ? profileSnap.data() : {};
      let progressMap: Record<string, UserVideoProgress> = {};
      if (progressSnap.exists()) {
        const pData = progressSnap.data();
        progressMap = pData.records || pData.progress || {};
      }

      // Fetch user subcollections concurrently
      const [notesSnap, bookmarksSnap, playlistsSnap, videosSnap, pvSnap, activitySnap] =
        await Promise.all([
          getDocs(collection(db, 'users', userId, 'notes')),
          getDocs(collection(db, 'users', userId, 'bookmarks')),
          getDocs(collection(db, 'users', userId, 'playlists')),
          getDocs(collection(db, 'users', userId, 'videos')),
          getDocs(collection(db, 'users', userId, 'playlistVideos')),
          getDocs(collection(db, 'users', userId, 'activity')),
        ]);

      const customNotes: Note[] = notesSnap.docs.map((d) => d.data() as Note);
      const customBookmarks: Bookmark[] = bookmarksSnap.docs.map((d) => d.data() as Bookmark);
      const customPlaylists: Playlist[] = playlistsSnap.docs.map((d) => d.data() as Playlist);
      const customVideos: Video[] = videosSnap.docs.map((d) => d.data() as Video);
      const customPVs: PlaylistVideo[] = pvSnap.docs.map((d) => d.data() as PlaylistVideo);
      const activities: ActivityItem[] = activitySnap.docs.map((d) => d.data() as ActivityItem);

      // Generate base initial join records for default catalog
      const basePVs: PlaylistVideo[] = [];
      INITIAL_VIDEOS.forEach((vid, idx) => {
        if (vid.playlistId) {
          basePVs.push({
            id: `pv-${vid.playlistId}-${vid.id}`,
            playlistId: vid.playlistId,
            videoId: vid.id,
            position: typeof vid.position === 'number' ? vid.position : idx,
            createdAt: vid.createdAt || new Date().toISOString(),
          });
        }
      });

      // Merge static catalog with custom user content
      const allVideos = [...INITIAL_VIDEOS, ...customVideos];
      const allPlaylists = [...INITIAL_PLAYLISTS, ...customPlaylists];
      const allPVs = [...basePVs, ...customPVs];

      const state: UserDatabaseState = {
        version: 4,
        userId,
        playlists: allPlaylists,
        playlistOrder: profileData.playlistOrder || allPlaylists.map((p) => p.id),
        videos: allVideos,
        playlistVideos: allPVs,
        progress: progressMap,
        notes: customNotes,
        bookmarks: customBookmarks,
        activity: activities.slice(0, 60),
        settings: {
          ...INITIAL_SETTINGS,
          ...(profileData.settings || {}),
        },
        updatedAt: profileData.updatedAt || new Date().toISOString(),
      };

      return state;
    } catch (err) {
      console.warn('Error loading from v4 schema:', err);
      return null;
    }
  },

  /**
   * Migrate existing user from legacy user_learning/{uid} to v4 hybrid architecture.
   * Keeps old legacy document intact for rollback safety while marking migrated.
   */
  async migrateLegacyDocument(
    userId: string,
    legacyData: UserDatabaseState
  ): Promise<UserDatabaseState> {
    if (!db || !userId || userId === 'guest') {
      return legacyData;
    }

    try {
      const now = new Date().toISOString();

      // Separate custom playlists and videos from default catalog
      const customPlaylists = (legacyData.playlists || []).filter(
        (p) => !DEFAULT_PLAYLIST_IDS.has(p.id)
      );
      const customVideos = (legacyData.videos || []).filter(
        (v) => !DEFAULT_VIDEO_IDS.has(v.id)
      );
      const customPVs = (legacyData.playlistVideos || []).filter(
        (pv) => !DEFAULT_PLAYLIST_IDS.has(pv.playlistId) || !DEFAULT_VIDEO_IDS.has(pv.videoId)
      );

      const notes = legacyData.notes || [];
      const bookmarks = legacyData.bookmarks || [];
      const activity = (legacyData.activity || []).slice(0, 60);
      const progress = legacyData.progress || {};
      const settings = legacyData.settings || INITIAL_SETTINGS;
      const playlistOrder = legacyData.playlistOrder || [];

      // 1. Write profile document
      const profileRef = doc(db, 'users', userId, 'profile', 'main');
      await setDoc(profileRef, {
        settings: sanitizeForFirestore(settings),
        playlistOrder,
        schemaVersion: 4,
        migratedAt: now,
        updatedAt: legacyData.updatedAt || now,
      });

      // 2. Write root user doc for visibility in Firestore console
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          schemaVersion: 4,
          migratedAt: now,
          updatedAt: legacyData.updatedAt || now,
        },
        { merge: true }
      );

      // 3. Write progress document
      const progressRef = doc(db, 'users', userId, 'data', 'progress');
      await setDoc(progressRef, {
        records: sanitizeForFirestore(progress),
        updatedAt: legacyData.updatedAt || now,
      });

      // 4. Batch write subcollections
      const batchOps: Array<(batch: any) => void> = [];

      notes.forEach((note) => {
        if (note && note.id) {
          const ref = doc(db, 'users', userId, 'notes', note.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(note), { merge: true }));
        }
      });

      bookmarks.forEach((bm) => {
        if (bm && bm.id) {
          const ref = doc(db, 'users', userId, 'bookmarks', bm.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(bm), { merge: true }));
        }
      });

      customPlaylists.forEach((pl) => {
        if (pl && pl.id) {
          const ref = doc(db, 'users', userId, 'playlists', pl.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(pl), { merge: true }));
        }
      });

      customVideos.forEach((vid) => {
        if (vid && vid.id) {
          const ref = doc(db, 'users', userId, 'videos', vid.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(vid), { merge: true }));
        }
      });

      customPVs.forEach((pv) => {
        if (pv && pv.id) {
          const ref = doc(db, 'users', userId, 'playlistVideos', pv.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(pv), { merge: true }));
        }
      });

      activity.forEach((act) => {
        if (act && act.id) {
          const ref = doc(db, 'users', userId, 'activity', act.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(act), { merge: true }));
        }
      });

      if (batchOps.length > 0) {
        await commitBatches(db, batchOps);
      }

      // 5. Update legacy document to mark migrated without deleting it (safe rollback path)
      const legacyDocRef = doc(db, 'user_learning', userId);
      await setDoc(
        legacyDocRef,
        {
          schemaVersion: 4,
          migratedToV4: true,
          migratedAt: now,
        },
        { merge: true }
      );

      console.info(`[LearnBox] Successfully migrated user ${userId} to v4 hybrid schema!`);

      // Reconstruct combined state
      const reconstructedState: UserDatabaseState = {
        version: 4,
        userId,
        playlists: legacyData.playlists || INITIAL_PLAYLISTS,
        playlistOrder: playlistOrder.length > 0 ? playlistOrder : (legacyData.playlists || []).map((p) => p.id),
        videos: legacyData.videos || INITIAL_VIDEOS,
        playlistVideos: legacyData.playlistVideos || [],
        progress,
        notes,
        bookmarks,
        activity,
        settings,
        updatedAt: legacyData.updatedAt || now,
      };

      return this.ensurePlaylistOrder(reconstructedState);
    } catch (err) {
      console.error('[LearnBox] Error during legacy migration:', err);
      return legacyData;
    }
  },

  createInitialState(userId: string): UserDatabaseState {
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
      version: 4,
      userId,
      playlists: initialPlaylists,
      playlistOrder: initialPlaylists.map((pl) => pl.id),
      videos: INITIAL_VIDEOS,
      playlistVideos,
      progress: {},
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

    return state;
  },

  /**
   * Save user database state locally and schedule cloud sync if logged in
   */
  saveLocalUserData(userId: string, state: UserDatabaseState, immediate = false): void {
    try {
      const key = getStorageKey(userId);
      state.updatedAt = new Date().toISOString();
      state.version = 4;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving local user state:', e);
    }

    if (userId && userId !== 'guest' && db) {
      if (immediate) {
        // Immediate sync for user actions (adding note, bookmark, playlist, settings)
        if (_cloudSyncTimer) {
          clearTimeout(_cloudSyncTimer);
          _cloudSyncTimer = null;
        }
        this.syncToCloud(userId, state).catch((err) =>
          console.warn('Cloud sync error:', err)
        );
      } else {
        // Debounced sync for playback ticks: ONLY writes to data/progress document!
        if (_progressSyncTimer) clearTimeout(_progressSyncTimer);
        _progressSyncTimer = setTimeout(() => {
          this.saveProgressToCloud(userId, state.progress).catch((err) =>
            console.warn('Progress cloud sync error:', err)
          );
          _progressSyncTimer = null;
        }, 1500);
      }
    }
  },

  /**
   * Surgical progress update: ONLY updates the single progress document
   * (Does NOT rewrite notes, bookmarks, playlists, videos, or activity)
   */
  async saveProgressToCloud(
    userId: string,
    progress: Record<string, UserVideoProgress>
  ): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      const progressRef = doc(db, 'users', userId, 'data', 'progress');
      await setDoc(
        progressRef,
        {
          records: sanitizeForFirestore(progress),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Progress sync error:', err);
    }
  },

  /**
   * Comprehensive cloud sync for structure and user creations:
   * Saves profile, progress, and custom-only entities in subcollections.
   * NEVER uploads the 337+ built-in videos or default playlists.
   */
  async syncToCloud(userId: string, state: UserDatabaseState): Promise<void> {
    if (!db || !userId || userId === 'guest') return;

    try {
      const now = state.updatedAt || new Date().toISOString();

      // 1. Sync Profile (settings & playlistOrder)
      const profileRef = doc(db, 'users', userId, 'profile', 'main');
      await setDoc(
        profileRef,
        {
          settings: sanitizeForFirestore(state.settings),
          playlistOrder: state.playlistOrder || [],
          schemaVersion: 4,
          updatedAt: now,
        },
        { merge: true }
      );

      // Root doc update for console index
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { schemaVersion: 4, updatedAt: now }, { merge: true });

      // 2. Sync Progress
      const progressRef = doc(db, 'users', userId, 'data', 'progress');
      await setDoc(
        progressRef,
        {
          records: sanitizeForFirestore(state.progress),
          updatedAt: now,
        },
        { merge: true }
      );

      // 3. Sync Subcollections (custom only)
      const customPlaylists = (state.playlists || []).filter(
        (p) => !DEFAULT_PLAYLIST_IDS.has(p.id)
      );
      const customVideos = (state.videos || []).filter(
        (v) => !DEFAULT_VIDEO_IDS.has(v.id)
      );
      const customPVs = (state.playlistVideos || []).filter(
        (pv) => !DEFAULT_PLAYLIST_IDS.has(pv.playlistId) || !DEFAULT_VIDEO_IDS.has(pv.videoId)
      );

      const batchOps: Array<(batch: any) => void> = [];

      (state.notes || []).forEach((note) => {
        if (note && note.id) {
          const ref = doc(db, 'users', userId, 'notes', note.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(note), { merge: true }));
        }
      });

      (state.bookmarks || []).forEach((bm) => {
        if (bm && bm.id) {
          const ref = doc(db, 'users', userId, 'bookmarks', bm.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(bm), { merge: true }));
        }
      });

      customPlaylists.forEach((pl) => {
        if (pl && pl.id) {
          const ref = doc(db, 'users', userId, 'playlists', pl.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(pl), { merge: true }));
        }
      });

      customVideos.forEach((vid) => {
        if (vid && vid.id) {
          const ref = doc(db, 'users', userId, 'videos', vid.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(vid), { merge: true }));
        }
      });

      customPVs.forEach((pv) => {
        if (pv && pv.id) {
          const ref = doc(db, 'users', userId, 'playlistVideos', pv.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(pv), { merge: true }));
        }
      });

      (state.activity || []).slice(0, 60).forEach((act) => {
        if (act && act.id) {
          const ref = doc(db, 'users', userId, 'activity', act.id);
          batchOps.push((b) => b.set(ref, sanitizeForFirestore(act), { merge: true }));
        }
      });

      if (batchOps.length > 0) {
        await commitBatches(db, batchOps);
      }
    } catch (err) {
      console.warn('Background Firestore sync error:', err);
    }
  },

  /**
   * Explicit subcollection document deletions
   */
  async deleteNoteFromCloud(userId: string, noteId: string): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
    } catch (e) {
      console.warn('Error deleting note from cloud:', e);
    }
  },

  async deleteBookmarkFromCloud(userId: string, bookmarkId: string): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
    } catch (e) {
      console.warn('Error deleting bookmark from cloud:', e);
    }
  },

  async deleteCustomVideoFromCloud(userId: string, videoId: string): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'videos', videoId));
    } catch (e) {
      console.warn('Error deleting custom video from cloud:', e);
    }
  },

  async deleteCustomPlaylistFromCloud(userId: string, playlistId: string): Promise<void> {
    if (!db || !userId || userId === 'guest') return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'playlists', playlistId));
    } catch (e) {
      console.warn('Error deleting custom playlist from cloud:', e);
    }
  },

  /**
   * Migrate guest data into authenticated user account upon sign in
   */
  async migrateGuestData(newUserId: string): Promise<UserDatabaseState> {
    const guestKey = getStorageKey('guest');
    const guestLegacyKey = getLegacyStorageKey('guest');
    const guestRaw = localStorage.getItem(guestKey) || localStorage.getItem(guestLegacyKey);
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

    const hasGuestProgress = guestState && Object.keys(guestState.progress || {}).length > 0;
    const hasGuestNotes = guestState && (guestState.notes || []).length > 0;
    const hasGuestBookmarks = guestState && (guestState.bookmarks || []).length > 0;
    const hasGuestActivity = guestState && (guestState.activity || []).length > 0;

    if (!guestState || (!hasGuestProgress && !hasGuestNotes && !hasGuestBookmarks && !hasGuestActivity)) {
      try {
        localStorage.removeItem(guestKey);
        localStorage.removeItem(guestLegacyKey);
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

    let mergedPlaylistOrder: string[] = [];
    if (existingUserState.playlistOrder && existingUserState.playlistOrder.length > 0) {
      mergedPlaylistOrder = [...existingUserState.playlistOrder];
    } else if (guestState.playlistOrder && guestState.playlistOrder.length > 0) {
      mergedPlaylistOrder = [...guestState.playlistOrder];
    } else {
      mergedPlaylistOrder = mergedPlaylists.map((p) => p.id);
    }

    mergedPlaylists.forEach((p) => {
      if (!mergedPlaylistOrder.includes(p.id)) {
        mergedPlaylistOrder.push(p.id);
      }
    });

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
      version: 4,
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
    this.saveLocalUserData(newUserId, finalState, true);

    try {
      localStorage.removeItem(guestKey);
      localStorage.removeItem(guestLegacyKey);
    } catch (e) {
      console.warn('Error clearing guest storage after migration:', e);
    }

    return finalState;
  },

  findCanonicalVideo(videos: Video[], youtubeId: string): Video | undefined {
    const cleanId = youtubeId.trim();
    return videos.find((v) => v.youtubeId === cleanId);
  },

  exportBackup(state: UserDatabaseState): string {
    return JSON.stringify({ ...state, version: 4 }, null, 2);
  },

  validateAndParseBackup(jsonText: string): UserDatabaseState | null {
    try {
      const parsed = JSON.parse(jsonText);
      if (
        Array.isArray(parsed.playlists) &&
        Array.isArray(parsed.videos) &&
        parsed.progress &&
        typeof parsed.progress === 'object'
      ) {
        return {
          ...parsed,
          version: 4,
        } as UserDatabaseState;
      }
      return null;
    } catch {
      return null;
    }
  },
};
