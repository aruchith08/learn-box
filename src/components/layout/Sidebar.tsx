import React from 'react';
import {
  LayoutDashboard,
  FolderClosed,
  Film,
  CheckSquare2,
  Calendar,
  Bookmark,
  FileText,
  BarChart3,
  Settings,
  ArrowUpRight,
  IconProps,
  X,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { TabType } from '../../types/focusLearn';

interface SidebarProps {
  onOpenAddModal: () => void;
  onOpenShortcutsModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAddModal,
  onOpenShortcutsModal,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab } = useLearning();

  const navItems: { id: TabType; label: string; icon: React.FC<IconProps> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'playlists', label: 'My Playlists', icon: FolderClosed },
    { id: 'my-videos', label: 'All Videos', icon: Film },
    { id: 'tracker', label: 'Tracker', icon: CheckSquare2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] xl:w-[290px] bg-[#111111] text-white flex flex-col justify-between border-r-[3px] border-[#111111] z-50 select-none shrink-0 font-sans transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-[#242429] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Stylized Hexagon/Cube Logo matching screenshot */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white fill-none stroke-current stroke-[2.5]"
              >
                <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="12" />
                <line x1="2" y1="8.5" x2="12" y2="12" />
                <line x1="22" y1="8.5" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <div className="font-display font-black text-2xl tracking-wider text-white uppercase leading-none">
                LEARNBOX
              </div>
              <div className="text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase mt-1">
                VIDEOS. DISCIPLINE. PROGRESS.
              </div>
            </div>
          </div>

          {/* Close button visible only on mobile screens */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-[#242429] text-gray-300 hover:text-white border border-[#3A3A42] cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-left font-display font-bold text-sm tracking-wide ${
                  isActive
                    ? 'bg-[#FFE600] text-black border-black shadow-[4px_4px_0px_#000000] translate-x-1'
                    : 'bg-transparent text-gray-300 border-transparent hover:bg-[#1C1C21] hover:text-white hover:border-[#2C2C33]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'stroke-black stroke-[2.5]' : 'stroke-gray-400'
                  }`}
                />
                <span className={isActive ? 'font-black' : 'font-semibold'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t-2 border-[#242429] space-y-3 bg-[#0D0D0F]">
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
              activeTab === 'settings'
                ? 'bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_#000]'
                : 'text-gray-400 hover:text-white hover:bg-[#1C1C21] border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
            <span>Settings</span>
          </button>

          <div className="pt-3 border-t border-[#242429] flex items-center justify-between px-2 text-[11px] font-display font-black tracking-widest text-gray-400 uppercase">
            <div className="leading-tight">
              A BETTER
              <br />
              YOU
              <br />
              EVERYDAY.
            </div>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5] text-gray-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
