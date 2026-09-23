import React, { useState } from 'react';
import { Search, ChevronDown } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenAddModal: () => void;
  onOpenShortcutsModal: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenAddModal,
  onOpenShortcutsModal,
  onToggleMobileSidebar,
}) => {
  const { settings, setActiveTab } = useLearning();
  const { currentUser, openAuthModal, signOutUser } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const displayName = currentUser?.displayName || settings.userName || 'Aruchith';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 sm:h-18 shrink-0 bg-[#F4F1EB] border-b-[3px] border-[#111111] px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 font-sans w-full max-w-full">
      {/* Mobile Hamburger Menu */}
      <div className="flex items-center gap-2 lg:hidden mr-1 sm:mr-2 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 sm:p-2 bg-white border-2 border-[#111111] rounded-lg shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          title="Open Menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-[2.5] text-[#111111] fill-none">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Search Input matching reference screenshot */}
      <div className="flex-1 min-w-0 max-w-2xl mx-1 sm:mx-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2 sm:gap-3.5 bg-white border-2 sm:border-[2.5px] border-[#111111] rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#111111] transition-all cursor-pointer text-gray-700 group"
        >
          <Search className="w-4 h-4 text-[#111111] stroke-[2.5] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-gray-400 flex-1 text-left truncate">
            Search videos, playlists...
          </span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-black bg-[#F4F1EB] border-2 border-[#111111] px-2 py-0.5 rounded shadow-[1px_1px_0px_#111111] text-[#111111] shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: User Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-1 sm:ml-4 shrink-0">
        {/* User Badge matching reference screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 sm:gap-3 bg-white border-2 sm:border-[2.5px] border-[#111111] p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#111111] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#111111] text-white font-display font-black text-xs sm:text-sm rounded-full flex items-center justify-center border-2 border-[#111111] shrink-0">
              {initial}
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <div className="text-xs font-black text-[#111111] font-display tracking-tight">
                Hi, {displayName}
              </div>
              <div className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                {settings.tagline || 'KEEP LEARNING.'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#111111] stroke-[2.5]" />
          </button>

          {/* Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border-[3px] border-[#111111] rounded-xl shadow-[4px_4px_0px_#111111] py-1.5 z-40">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  setActiveTab('settings');
                }}
                className="w-full text-left px-4 py-2 text-xs font-black hover:bg-[#FFE600] cursor-pointer"
              >
                Settings & Preferences
              </button>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenShortcutsModal();
                }}
                className="w-full text-left px-4 py-2 text-xs font-black hover:bg-[#FFE600] cursor-pointer"
              >
                Keyboard Shortcuts (?)
              </button>

              <div className="border-t border-gray-200 my-1" />

              {currentUser ? (
                <button
                  onClick={async () => {
                    setShowUserDropdown(false);
                    await signOutUser();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    openAuthModal();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                >
                  Sign In / Sync Account
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
