import React, { useState, useEffect } from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { VideoPlayerView } from './components/player/VideoPlayerView';
import { PlaylistsView } from './components/playlists/PlaylistsView';
import { PlaylistDetailView } from './components/playlists/PlaylistDetailView';
import { MyVideosView } from './components/videos/MyVideosView';
import { GlobalTrackerView } from './components/tracker/GlobalTrackerView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { AllNotesView } from './components/notes/AllNotesView';
import { StatsView } from './components/stats/StatsView';

// Modals
import { AddModal } from './components/modals/AddModal';
import { AddVideoModal } from './components/modals/AddVideoModal';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal';
import { ImportCSVModal } from './components/modals/ImportCSVModal';
import { SearchModal } from './components/modals/SearchModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { SettingsModal } from './components/modals/SettingsModal';

import { Playlist } from './types/focusLearn';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainApp() {
  const { activeTab, setActiveTab } = useLearning();

  // Navigation state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isImportCSVModalOpen, setIsImportCSVModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K and ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively writing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePlayVideo = (videoId: string) => {
    setActiveVideoId(videoId);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab('playlists');
    setActiveVideoId(null);
  };

  const handleBackFromVideo = () => {
    setActiveVideoId(null);
  };

  const handleBackFromPlaylist = () => {
    setSelectedPlaylist(null);
  };

  // Render view router based on state
  const renderContent = () => {
    // If active video is selected, show VideoPlayerView
    if (activeVideoId) {
      return (
        <VideoPlayerView
          videoId={activeVideoId}
          onBack={handleBackFromVideo}
          onSelectVideo={handlePlayVideo}
        />
      );
    }

    // Otherwise show selected tab
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectPlaylist={handleSelectPlaylist}
            onPlayVideo={handlePlayVideo}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        );

      case 'playlists':
        if (selectedPlaylist) {
          return (
            <PlaylistDetailView
              playlist={selectedPlaylist}
              onBack={handleBackFromPlaylist}
              onPlayVideo={handlePlayVideo}
            />
          );
        }
        return (
          <PlaylistsView
            onSelectPlaylist={handleSelectPlaylist}
            onPlayVideo={handlePlayVideo}
            onOpenAddModal={() => setIsCreatePlaylistModalOpen(true)}
            onOpenImportCSV={() => setIsImportCSVModalOpen(true)}
          />
        );

      case 'my-videos':
        return (
          <MyVideosView
            onPlayVideo={handlePlayVideo}
            onOpenAddVideo={() => setIsAddVideoModalOpen(true)}
          />
        );

      case 'tracker':
        return <GlobalTrackerView onPlayVideo={handlePlayVideo} />;

      case 'bookmarks':
        return <BookmarksView onPlayVideo={handlePlayVideo} />;

      case 'notes':
        return <AllNotesView onPlayVideo={handlePlayVideo} />;

      case 'stats':
        return <StatsView />;

      case 'settings':
        return <StatsView />;

      default:
        return (
          <DashboardView
            onSelectPlaylist={handleSelectPlaylist}
            onPlayVideo={handlePlayVideo}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex bg-[#F4F0EA] min-h-screen text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* 1. Dark Sidebar */}
      <Sidebar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* 3. Global Action & Utility Modals */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectAddVideo={() => setIsAddVideoModalOpen(true)}
        onSelectCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
        onSelectImportCSV={() => setIsImportCSVModalOpen(true)}
      />

      <AddVideoModal
        isOpen={isAddVideoModalOpen}
        onClose={() => setIsAddVideoModalOpen(false)}
        defaultPlaylistId={selectedPlaylist?.id}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
      />

      <ImportCSVModal
        isOpen={isImportCSVModalOpen}
        onClose={() => setIsImportCSVModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectVideo={handlePlayVideo}
        onSelectPlaylist={handleSelectPlaylist}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <SettingsModal
        isOpen={activeTab === 'settings'}
        onClose={() => setActiveTab('dashboard')}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <LearningProvider>
        <MainApp />
      </LearningProvider>
    </ErrorBoundary>
  );
}

export default App;
