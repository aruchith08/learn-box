import React, { useRef, useState } from 'react';
import { Search, ChevronDown, Menu, X, LogOut, Check, RoadmapIcon, ProgressIcon, RevisionIcon, NotesIcon, AboutIcon, Share2 } from '../common/icons';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  syncStatus?: 'synced' | 'saving' | 'offline';
  cloudError?: string | null;
  onOpenShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeNavTab,
  onSelectNavTab,
  mobileMenuOpen,
  onToggleMobileMenu,
  searchInputRef,
  syncStatus = 'synced',
  cloudError,
  onOpenShare,
}) => {
  const { currentUser, loading: authLoading, openAuthModal, signOutUser } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef || localRef;

  const navTabs = [
    { id: 'roadmap', label: 'DSA ROADMAP', icon: RoadmapIcon },
    { id: 'progress', label: 'PROGRESS', icon: ProgressIcon },
    { id: 'revision', label: 'REVISION', icon: RevisionIcon },
    { id: 'notes', label: 'NOTES', icon: NotesIcon },
    { id: 'about', label: 'ABOUT', icon: AboutIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-[#ECECEC] text-black">
      <div className="flex h-14 items-stretch justify-between">
        {/* Left Brand Section */}
        <div className="flex items-stretch">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileMenu}
            className="flex w-12 items-center justify-center border-r-2 border-black bg-white hover:bg-[#FF5E1E] transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* ARH Logo Black Box */}
          <button
            type="button"
            onClick={() => onSelectNavTab('roadmap')}
            className="flex items-center gap-2.5 bg-black px-4 py-2 text-white border-r-2 border-black hover:bg-[#222222] transition-colors cursor-pointer"
            title="Return to DSA Roadmap"
          >
            <img
              src="/arh-logo.png"
              alt="ARH Logo"
              className="h-7 w-auto object-contain brightness-200 contrast-200"
            />
          </button>

          {/* Tagline Box */}
          <div className="hidden sm:flex flex-col justify-center border-r-2 border-black bg-[#ECECEC] px-3.5 py-1 text-[8px] font-black leading-[1.1] tracking-wider text-black select-none">
            <span>KEEP</span>
            <span>SOLVING.</span>
            <span>KEEP</span>
            <span>BUILDING.</span>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-stretch">
            {navTabs.map((tab) => {
              const isActive = activeNavTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectNavTab(tab.id)}
                  className={`border-r-2 border-black px-3.5 py-2 text-xs font-black tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5E1E] text-black'
                      : 'bg-transparent text-black hover:bg-black/5'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Search & Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
          {/* Share Button (Visible on mobile and desktop) */}
          <button
            type="button"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 border-2 border-black bg-white px-2.5 sm:px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FF5E1E] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer shrink-0"
            title="Share this website with friends"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0 text-[#FF5E1E] group-hover:text-black" />
            <span className="hidden sm:inline">SHARE</span>
          </button>

          {/* Search Box */}
          <div className="relative flex items-center">
            <div className="flex items-center border-2 border-black bg-[#111111] px-3 py-1.5 text-white">
              <Search className="h-3.5 w-3.5 text-[#888888] mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search problems..."
                className="w-24 sm:w-40 md:w-52 bg-transparent text-xs text-white placeholder-[#777777] outline-none font-mono"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#888888] hover:text-white ml-1.5"
                >
                  ✕
                </button>
              ) : (
                <div className="hidden sm:flex ml-2 items-center justify-center border border-[#333333] bg-[#222222] px-1.5 py-0.5 text-[10px] font-mono text-[#888888]">
                  /
                </div>
              )}
            </div>
          </div>


          {authLoading && !currentUser ? (
            /* Subtle connecting pill to prevent flicker on reload */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1 text-[10px] font-mono font-bold text-black shadow-[1px_1px_0px_#000000]">
                <span className="h-2 w-2 border border-black bg-amber-400 animate-pulse" />
                <span>CONNECTING...</span>
              </div>
            </div>
          ) : !currentUser ? (
            /* Sign In Button for Guests */
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 border-2 border-black bg-white px-2 py-1 text-[10px] font-mono font-bold text-black shadow-[1px_1px_0px_#000000]">
                <span className="h-2 w-2 border border-black bg-amber-400" />
                <span>GUEST (LOCAL)</span>
              </div>
              <button
                type="button"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 border-2 border-black bg-[#FF5E1E] px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <span>SIGN IN TO SYNC</span>
              </button>
            </div>
          ) : (
            /* User Profile Badge with Dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-stretch border-2 border-black bg-white shadow-[2px_2px_0px_#000000] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="h-8 w-8 object-cover border-r-2 border-black"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center bg-black font-bold text-xs text-white">
                    {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-black">
                  <span className="max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-black" />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-64 border-2 border-black bg-white p-3 shadow-[4px_4px_0px_#000000]">
                    <div className="pb-2.5 mb-2.5 border-b-2 border-black">
                      <div className="text-[11px] font-mono text-black/60 truncate">
                        {currentUser.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`inline-block h-2 w-2 ${
                            syncStatus === 'saving'
                              ? 'bg-amber-400 animate-pulse'
                              : syncStatus === 'synced'
                              ? 'bg-emerald-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="text-[10px] font-mono font-bold uppercase text-black">
                          {syncStatus === 'saving'
                            ? 'SAVING TO CLOUD...'
                            : syncStatus === 'synced'
                            ? 'CLOUD SYNCED ✓'
                            : 'SYNC ERROR ⚠'}
                        </span>
                      </div>
                      {cloudError && (
                        <div className="mt-2 border-2 border-red-600 bg-red-50 p-2 text-[10px] font-bold text-red-700 leading-tight">
                          {cloudError}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOutUser();
                      }}
                      className="flex w-full items-center justify-between border-2 border-black bg-[#ECECEC] px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Sign Out</span>
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
