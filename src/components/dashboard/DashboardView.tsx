import React from 'react';
import { WelcomeBanner } from './WelcomeBanner';
import { MetricCards } from './MetricCards';
import { PlaylistGrid } from './PlaylistGrid';
import { ContinueWatching } from './ContinueWatching';
import { UpNextList } from './UpNextList';
import { WorkSticker } from './WorkSticker';
import { WeeklyChart } from './WeeklyChart';
import { ActivityFeed } from './ActivityFeed';
import { Playlist } from '../../types/focusLearn';

interface DashboardViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onPlayVideo: (videoId: string) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectPlaylist,
  onPlayVideo,
  onOpenAddModal
}) => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* 1. Welcome & Mindset Banners */}
      <WelcomeBanner />

      {/* 2. Key Metrics Row */}
      <MetricCards />

      {/* 3. Main Dashboard Grid (Playlists + Continue Watching on Left, Widgets on Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Active Playlists Grid */}
          <PlaylistGrid
            onSelectPlaylist={onSelectPlaylist}
            onPlayVideo={onPlayVideo}
          />

          {/* Continue Watching Section */}
          <ContinueWatching onPlayVideo={onPlayVideo} />
        </div>

        {/* Right Side (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Tilted Motivational Sticker */}
          <WorkSticker onAddClick={onOpenAddModal} />

          {/* Up Next List */}
          <UpNextList onPlayVideo={onPlayVideo} />

          {/* Weekly Watch Time Chart */}
          <WeeklyChart />

          {/* Live Activity Feed */}
          <ActivityFeed onPlayVideo={onPlayVideo} />
        </div>
      </div>
    </div>
  );
};
