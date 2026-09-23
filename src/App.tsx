import React, { useState, useEffect } from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { VideoPlayerView } from './components/player/VideoPlayerView';
import { PlaylistsView } from './components/playlists/PlaylistsView';
import { PlaylistDetailView } from './components/playlists/PlaylistDetailView';
import { MyVideosView } from './components/videos/MyVideosView';
import { GlobalTrackerView } from './components/tracker/GlobalTrackerView';
import { CalendarView } from './components/calendar/CalendarView';
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
import { AuthModal } from './components/modals/AuthModal';

import { Playlist } from './types/focusLearn';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainApp() {
  const { activeTab, setActiveTab } = useLearning();
  const { isAuthModalOpen, closeAuthModal } = useAuth();

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

      case 'calendar':
        return <CalendarView onPlayVideo={handlePlayVideo} />;

      case 'bookmarks':
        return <BookmarksView onPlayVideo={handlePlayVideo} />;

      case 'notes':
        return <AllNotesView onPlayVideo={handlePlayVideo} />;

      case 'stats':
        return <StatsView />;

      case 'settings':
        return (
          <DashboardView
            onSelectPlaylist={handleSelectPlaylist}
            onPlayVideo={handlePlayVideo}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        );

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
    <div className="flex bg-[#F4F1EB] h-screen h-[100dvh] text-[#111111] font-sans selection:bg-[#FFE600] selection:text-black w-full max-w-full overflow-hidden">
      {/* 1. Dark Sidebar */}
      <Sidebar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] min-w-0 w-full max-w-full overflow-hidden">
        <Topbar
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-8 w-full max-w-full">
          {renderContent()}
        </main>

        {/* Mobile Quick-Access Bottom Bar (hidden when playing a video) */}
        {!activeVideoId && (
          <MobileBottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />
        )}
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
        onOpenVideo={handlePlayVideo}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
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
