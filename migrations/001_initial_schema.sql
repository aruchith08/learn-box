-- FOCUS LEARN / LEARNBOX
-- Relational PostgreSQL Schema for Production Learning Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlists (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    creator VARCHAR(255),
    thumbnail_url TEXT,
    color VARCHAR(32) DEFAULT '#FFE600',
    icon_name VARCHAR(64) DEFAULT 'folder',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(128) PRIMARY KEY,
    youtube_id VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_name VARCHAR(255),
    duration INTEGER DEFAULT 0, -- in seconds
    duration_formatted VARCHAR(32),
    category VARCHAR(128),
    topic VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist_videos (
    id VARCHAR(128) PRIMARY KEY,
    playlist_id VARCHAR(128) NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    video_id VARCHAR(128) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (playlist_id, video_id)
);

CREATE TABLE IF NOT EXISTS video_progress (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(128) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    current_time NUMERIC(10, 2) NOT NULL DEFAULT 0, -- in seconds
    duration NUMERIC(10, 2) NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    sessions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(128) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp_seconds INTEGER DEFAULT 0,
    timestamp_formatted VARCHAR(32) DEFAULT '0:00',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(128) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    timestamp_seconds INTEGER DEFAULT 0,
    timestamp_formatted VARCHAR(32) DEFAULT '0:00',
    label VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, video_id, timestamp_seconds)
);

CREATE TABLE IF NOT EXISTS activity_log (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- watched, completed, bookmarked, added, noted
    video_id VARCHAR(128) REFERENCES videos(id) ON DELETE SET NULL,
    playlist_id VARCHAR(128) REFERENCES playlists(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(32) DEFAULT 'light',
    autoplay_next BOOLEAN DEFAULT TRUE,
    resume_playback BOOLEAN DEFAULT TRUE,
    auto_complete BOOLEAN DEFAULT TRUE,
    completion_threshold INTEGER DEFAULT 90, -- percentage
    user_name VARCHAR(128) DEFAULT 'Learner',
    tagline VARCHAR(255) DEFAULT 'KEEP LEARNING.',
    streak_days INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist ON playlist_videos(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_video ON playlist_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_user_video ON notes(user_id, video_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_time ON activity_log(user_id, created_at DESC);
