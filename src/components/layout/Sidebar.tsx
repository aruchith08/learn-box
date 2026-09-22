import React from 'react';
import {
  LayoutDashboard,
  FolderClosed,
  Film,
  CheckSquare2,
  Bookmark,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Zap,
  BookOpen,
  Keyboard,
  IconProps
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { TabType } from '../../types/focusLearn';

interface SidebarProps {
  onOpenAddModal: () => void;
  onOpenShortcutsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAddModal,
  onOpenShortcutsModal
}) => {
  const { activeTab, setActiveTab, metrics, settings } = useLearning();

  const navItems: { id: TabType; label: string; icon: React.FC<IconProps>; count?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'playlists', label: 'My Playlists', icon: FolderClosed, count: metrics.totalPlaylists },
    { id: 'my-videos', label: 'My Videos', icon: Film, count: metrics.totalVideos },
    { id: 'tracker', label: 'Global Tracker', icon: CheckSquare2 },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: metrics.totalBookmarks },
    { id: 'notes', label: 'Notes', icon: FileText, count: metrics.totalNotes },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#121214] text-white flex flex-col justify-between h-screen sticky top-0 border-r-4 border-black z-30 select-none shrink-0 font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b-2 border-[#242429]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FFE600] border-2 border-black rounded-lg flex items-center justify-center font-black text-black shadow-[2px_2px_0px_#000] transform -rotate-3">
            <Zap className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="font-black text-lg tracking-wider text-white flex items-center gap-1">
              FOCUS<span className="text-[#FFE600]">LEARN</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              NO ADS • NO SHORTS • DEEP WORK
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="w-full mt-4 bg-[#FFE600] text-black font-black text-xs py-2.5 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Content</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer text-left font-bold text-xs uppercase tracking-wide ${
                isActive
                  ? 'bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_#000] font-black translate-x-0.5'
                  : 'bg-transparent text-gray-300 border-transparent hover:bg-[#1C1C21] hover:text-white hover:border-[#2C2C33]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-black stroke-[2.5]' : 'stroke-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                    isActive
                      ? 'bg-black text-[#FFE600] border-black'
                      : 'bg-[#202026] text-gray-400 border-[#33333D]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t-2 border-[#242429] space-y-3 bg-[#0D0D0F]">
        {/* Quote Badge */}
        <div className="bg-[#1A1A1F] border-2 border-black p-3 rounded-lg shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[#FFE600] uppercase mb-1">
            <BookOpen className="w-3 h-3" />
            <span>DISCIPLINE PROTOCOL</span>
          </div>
          <p className="text-[11px] text-gray-300 font-medium italic leading-relaxed">
            "A little progress each day adds up to big results."
          </p>
          <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 text-right">
            — DISCIPLINE BUILDS FREEDOM
          </div>
        </div>

        {/* Shortcuts & Streak */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <button
            onClick={onOpenShortcutsModal}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="View Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] bg-[#222228] px-1 py-0.5 rounded border border-gray-700">? Keys</span>
          </button>
          <div className="flex items-center gap-1 font-bold text-emerald-400">
            <span>🔥 {settings.streakDays}d streak</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
