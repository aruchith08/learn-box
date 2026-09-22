export type LearningStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'not_started'
  | 'in_progress'
  | 'completed';

export type TabType =
  | 'dashboard'
  | 'playlists'
  | 'my-videos'
  | 'tracker'
  | 'calendar'
  | 'bookmarks'
  | 'notes'
  | 'stats'
  | 'settings';

export interface Video {
  id: string; // canonical unique ID or canonical YouTube ID
  youtubeId: string;
  title: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  channel?: string;
  channelName?: string;
  duration?: number | string; // in seconds or formatted string
  durationFormatted?: string; // e.g. "28:17"
  category?: string;
  topic?: string;
  playlistId?: string | null; // primary playlist or null
  playlistTitle?: string;
  position?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PlaylistVideo {
  id: string;
  playlistId: string;
  videoId: string;
  position: number;
  createdAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  creator?: string;
  description?: string;
  color?: string; // neo-brutalist accent color
  iconName?: 'laptop' | 'python' | 'rocket' | 'coffee' | 'barchart' | 'robot' | 'algorithm' | 'folder';
  videos?: Video[];
  totalVideos?: number;
  completedVideos?: number;
  progressPercentage?: number;
  lastWatchedVideoId?: string;
  lastWatchedAt?: string;
  isPinned?: boolean;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserVideoProgress {
  videoId: string;
  status: LearningStatus;
  progressPercentage: number;
  percent?: number; // alias for compatibility
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastWatchedAt: string;
  completedAt?: string;
  sessionsCount?: number;
}

export interface Note {
  id: string;
  videoId: string;
  videoTitle: string;
  content: string;
  timestamp?: number; // seconds
  timestampSeconds?: number;
  timestampFormatted?: string; // e.g. "12:43"
  createdAt: string;
  updatedAt?: string;
}

export interface Bookmark {
  id: string;
  type?: 'video' | 'playlist' | 'timestamp';
  videoId?: string;
  playlistId?: string;
  targetId?: string; // videoId or playlistId
  title: string;
  subtitle?: string;
  url?: string;
  timestamp?: number;
  timestampSeconds?: number;
  timestampFormatted?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'watched' | 'completed' | 'bookmarked' | 'added' | 'noted' | 'watched_video' | 'completed_video' | 'added_note';
  title: string;
  description?: string;
  details?: string;
  timestamp: string;
  videoId?: string;
  playlistId?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoPlayNext: boolean;
  resumePosition: boolean;
  markCompleteThreshold: number; // percentage (e.g. 90)
  userName: string;
  tagline: string;
  streakDays: number;
  dailyGoalMinutes?: number;
}

export interface CSVImportPreview {
  playlistName: string;
  creator?: string;
  color?: string;
  totalRows: number;
  totalFound?: number;
  validUrls?: number;
  newVideosCount: number;
  duplicateCount: number;
  duplicates?: number;
  invalidCount: number;
  videos: {
    title: string;
    youtubeUrl: string;
    youtubeId: string;
    topic?: string;
    isDuplicate?: boolean;
  }[];
}
