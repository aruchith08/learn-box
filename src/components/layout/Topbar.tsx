import React from 'react';
import { Search, Flame, Plus, Keyboard } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenAddModal: () => void;
  onOpenShortcutsModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenAddModal,
  onOpenShortcutsModal
}) => {
  const { settings, metrics, setActiveTab } = useLearning();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <header className="h-16 bg-[#F4F0EA] border-b-4 border-black px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Search Bar Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 bg-white border-2 border-black rounded-lg px-3.5 py-1.5 shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-gray-700 min-w-[280px]"
        >
          <Search className="w-4 h-4 text-black stroke-[2.5]" />
          <span className="text-xs font-bold text-gray-500 flex-1 text-left">
            Search playlists, videos, topics...
          </span>
          <kbd className="text-[10px] font-mono font-black bg-gray-100 border border-gray-400 px-1.5 py-0.5 rounded shadow-sm text-gray-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Keyboard helper */}
        <button
          onClick={onOpenShortcutsModal}
          className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-[#E8E2D5] border-2 border-black px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] hover:bg-white transition-all cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black">?</span>
        </button>
      </div>

      {/* Greeting & User Status */}
      <div className="flex items-center gap-4">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] font-black text-xs">
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
          <span>{settings.streakDays} DAY STREAK</span>
        </div>

        {/* Completed Count */}
        <div className="hidden lg:flex items-center gap-2 bg-[#A7F3D0] border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] font-black text-xs">
          <span>✓ {metrics.completedVideos} FINISHED</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#FFE600] border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] font-black text-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* User Badge */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2.5 bg-white border-2 border-black pl-2 pr-3 py-1 rounded-lg shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
        >
          <div className="w-7 h-7 bg-black text-[#FFE600] font-black text-xs rounded-md flex items-center justify-center border border-black">
            {settings.userName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block leading-tight">
            <div className="text-[10px] font-black tracking-wide text-gray-500 uppercase">
              {getGreeting()}
            </div>
            <div className="text-xs font-black text-black">
              {settings.userName}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
