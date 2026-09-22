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
  onOpenAddModal,
}) => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans">
      {/* 1. Canvas Welcome Greeting & Quote Card */}
      <WelcomeBanner />

      {/* 2. 5 Key Metrics Row (Total Videos, Completed, In Progress, Remaining, Overall Progress) */}
      <MetricCards />

      {/* 3. Main 2-Column Editorial Grid matching reference screenshot */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Playlists + Activity & This Week */}
        <div className="xl:col-span-8 space-y-6">
          {/* Active Playlists Grid (2x3 = 6 courses) */}
          <PlaylistGrid
            onSelectPlaylist={onSelectPlaylist}
            onPlayVideo={onPlayVideo}
          />

          {/* Bottom Row: Recent Activity (left) + This Week (right) side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <ActivityFeed onPlayVideo={onPlayVideo} />
            <WeeklyChart />
          </div>
        </div>

        {/* Right Column (4 cols): Continue Watching + Up Next + Tilted Sticker */}
        <div className="xl:col-span-4 space-y-5">
          {/* Continue Watching Card */}
          <ContinueWatching onPlayVideo={onPlayVideo} />

          {/* Up Next in Queue */}
          <UpNextList onPlayVideo={onPlayVideo} />

          {/* Yellow Motivational Card */}
          <WorkSticker onAddClick={onOpenAddModal} />
        </div>
      </div>
    </div>
  );
};
