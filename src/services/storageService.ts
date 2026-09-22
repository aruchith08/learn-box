import { Playlist, Video, UserVideoProgress, Note, Bookmark, ActivityItem, UserSettings } from '../types/focusLearn';
import {
  INITIAL_PLAYLISTS,
  INITIAL_VIDEOS,
  INITIAL_PROGRESS,
  INITIAL_NOTES,
  INITIAL_BOOKMARKS,
  INITIAL_ACTIVITY,
  INITIAL_SETTINGS,
} from './preloadedData';

const KEYS = {
  PLAYLISTS: 'focus_learn_playlists_v1',
  VIDEOS: 'focus_learn_videos_v1',
  PROGRESS: 'focus_learn_progress_v1',
  NOTES: 'focus_learn_notes_v1',
  BOOKMARKS: 'focus_learn_bookmarks_v1',
  ACTIVITY: 'focus_learn_activity_v1',
  SETTINGS: 'focus_learn_settings_v1',
  INITIALIZED: 'focus_learn_initialized_v1',
};

export interface ExportData {
  version: number;
  exportedAt: string;
  playlists: Playlist[];
  videos: Video[];
  progress: Record<string, UserVideoProgress>;
  notes: Note[];
  bookmarks: Bookmark[];
  activity: ActivityItem[];
  settings: UserSettings;
}

export const storageService = {
  initialize(): void {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      this.resetToDefaults();
    }
  },

  resetToDefaults(): void {
    localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(INITIAL_PLAYLISTS));
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(INITIAL_PROGRESS));
    localStorage.setItem(KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(INITIAL_BOOKMARKS));
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  },

  savePlaylists(playlists: Playlist[]): void {
    localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
  },

  getVideos(): Video[] {
    try {
      const data = localStorage.getItem(KEYS.VIDEOS);
      return data ? JSON.parse(data) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  },

  saveVideos(videos: Video[]): void {
    localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
  },

  getProgress(): Record<string, UserVideoProgress> {
    try {
      const data = localStorage.getItem(KEYS.PROGRESS);
      return data ? JSON.parse(data) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  },

  saveProgress(progress: Record<string, UserVideoProgress>): void {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  },

  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  },

  saveNotes(notes: Note[]): void {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  },

  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : INITIAL_BOOKMARKS;
    } catch {
      return INITIAL_BOOKMARKS;
    }
  },

  saveBookmarks(bookmarks: Bookmark[]): void {
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  getActivity(): ActivityItem[] {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITY);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY;
    } catch {
      return INITIAL_ACTIVITY;
    }
  },

  saveActivity(activity: ActivityItem[]): void {
    localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(activity.slice(0, 50))); // Keep last 50
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackup(): string {
    const backup: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      playlists: this.getPlaylists(),
      videos: this.getVideos(),
      progress: this.getProgress(),
      notes: this.getNotes(),
      bookmarks: this.getBookmarks(),
      activity: this.getActivity(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonText: string): boolean {
    try {
      const parsed: ExportData = JSON.parse(jsonText);
      if (!parsed.playlists || !parsed.videos) return false;
      this.savePlaylists(parsed.playlists);
      this.saveVideos(parsed.videos);
      this.saveProgress(parsed.progress || {});
      this.saveNotes(parsed.notes || []);
      this.saveBookmarks(parsed.bookmarks || []);
      this.saveActivity(parsed.activity || []);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch {
      return false;
    }
  },
};

export const exportBackupJSON = () => storageService.exportBackup();
export const importBackupJSON = (jsonText: string) => storageService.importBackup(jsonText);
