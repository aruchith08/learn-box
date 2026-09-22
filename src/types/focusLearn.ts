export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Video {
  id: string; // unique ID or canonical YouTube ID
  youtubeId: string;
  title: string;
  url: string;
  thumbnail: string;
  channel?: string;
  duration?: number; // duration in seconds
  durationFormatted?: string; // e.g. "28:17"
  category?: string;
  topic?: string;
  playlistId?: string | null; // null if standalone "MY VIDEO"
  position?: number; // order in playlist
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  creator: string;
  description?: string;
  color: string; // neo-brutalist accent color: pink, yellow, mint, purple, blue, red
  iconName: 'laptop' | 'python' | 'rocket' | 'coffee' | 'barchart' | 'robot' | 'algorithm' | 'folder';
  totalVideos: number;
  completedVideos: number;
  progressPercentage: number;
  lastWatchedVideoId?: string;
  lastWatchedAt?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserVideoProgress {
  videoId: string;
  status: LearningStatus;
  progressPercentage: number;
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastWatchedAt: string;
  completedAt?: string;
  sessionsCount: number;
}

export interface Note {
  id: string;
  videoId: string;
  videoTitle: string;
  content: string;
  timestamp?: number; // seconds into video
  timestampFormatted?: string; // e.g. "12:43"
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  type: 'video' | 'playlist' | 'timestamp';
  targetId: string; // videoId or playlistId
  title: string;
  subtitle?: string;
  url?: string;
  timestamp?: number;
  timestampFormatted?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'watched' | 'completed' | 'bookmarked' | 'added' | 'noted';
  title: string;
  description: string;
  timestamp: string;
  videoId?: string;
  playlistId?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autoPlayNext: boolean;
  resumePosition: boolean;
  markCompleteThreshold: number; // percentage (e.g. 90)
  userName: string;
  tagline: string;
}

export interface CSVImportPreview {
  playlistName: string;
  creator: string;
  color: string;
  totalFound: number;
  validUrls: number;
  duplicates: number;
  videos: {
    title: string;
    youtubeUrl: string;
    youtubeId: string;
    topic?: string;
  }[];
}
