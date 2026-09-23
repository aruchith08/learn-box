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
  ChevronLeft,
  ChevronRight,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenAddModal,
  onOpenShortcutsModal,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
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
        className={`fixed lg:static top-0 left-0 h-screen h-[100dvh] bg-[#111111] text-white flex flex-col justify-between border-r-[3px] border-[#111111] z-50 select-none shrink-0 font-sans transition-[width,transform] duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-[280px] ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-[280px] xl:w-[290px]'}`}
      >
        {/* Brand Header */}
        <div
          className={`border-b-2 border-[#242429] flex items-center justify-between transition-all duration-300 p-6 ${
            isCollapsed ? 'lg:p-3.5 lg:flex-col lg:gap-3 lg:justify-center' : ''
          }`}
        >
          {/* Logo & Brand text */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center shrink-0" title="LEARNBOX">
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
            <div className={`min-w-0 overflow-hidden ${isCollapsed ? 'block lg:hidden' : 'block'}`}>
              <div className="font-display font-black text-2xl tracking-wider text-white uppercase leading-none truncate">
                LEARNBOX
              </div>
              <div className="text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase mt-1 truncate">
                VIDEOS. DISCIPLINE. PROGRESS.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Desktop Collapse / Expand Toggle Button (Hidden on Mobile) */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg bg-[#242429] text-gray-400 hover:text-white hover:bg-[#2F2F36] border border-[#3A3A42] cursor-pointer transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            )}

            {/* Mobile Close Button (Always visible on mobile when drawer is open) */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg bg-[#242429] text-gray-300 hover:text-white border border-[#3A3A42] cursor-pointer"
                title="Close Navigation"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          className={`flex-1 space-y-2 overflow-y-auto custom-scrollbar transition-all duration-300 p-4 ${
            isCollapsed ? 'lg:px-2 lg:py-4' : ''
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl border-2 transition-all cursor-pointer gap-3.5 px-4 py-3 text-left ${
                  isCollapsed ? 'lg:justify-center lg:p-3' : ''
                } ${
                  isActive
                    ? 'bg-[#FFE600] text-black border-black shadow-[4px_4px_0px_#000000] translate-x-0.5'
                    : 'bg-transparent text-gray-300 border-transparent hover:bg-[#1C1C21] hover:text-white hover:border-[#2C2C33]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'stroke-black stroke-[2.5]' : 'stroke-gray-400'
                  }`}
                />
                <span
                  className={`font-display text-sm tracking-wide ${
                    isCollapsed ? 'block lg:hidden' : 'block'
                  } ${isActive ? 'font-black' : 'font-semibold'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div
          className={`border-t-2 border-[#242429] bg-[#0D0D0F] transition-all duration-300 p-4 space-y-3 ${
            isCollapsed ? 'lg:p-2.5 lg:space-y-0' : ''
          }`}
        >
          <button
            onClick={() => handleNavClick('settings')}
            title={isCollapsed ? 'Settings' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 gap-3 px-4 py-2.5 ${
              isCollapsed ? 'lg:justify-center lg:p-3' : ''
            } ${
              activeTab === 'settings'
                ? 'bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_#000]'
                : 'text-gray-400 hover:text-white hover:bg-[#1C1C21] border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span className={isCollapsed ? 'inline lg:hidden' : 'inline'}>Settings</span>
          </button>

          <div
            className={`pt-3 border-t border-[#242429] items-center justify-between px-2 text-[11px] font-display font-black tracking-widest text-gray-400 uppercase ${
              isCollapsed ? 'flex lg:hidden' : 'flex'
            }`}
          >
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
