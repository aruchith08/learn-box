import React from 'react';
import {
  LayoutDashboard,
  FolderClosed,
  Film,
  LayoutGrid,
  FileText,
  IconProps,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { TabType } from '../../types/focusLearn';

interface MobileBottomNavProps {
  onOpenAddModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  const { activeTab, setActiveTab } = useLearning();

  const navItems: { id: TabType; label: string; icon: React.FC<IconProps> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'playlists', label: 'Playlists', icon: FolderClosed },
    { id: 'my-videos', label: 'Videos', icon: Film },
    { id: 'catalog', label: 'Catalog', icon: LayoutGrid },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  return (
    <div
      className="fixed left-0 right-0 z-40 lg:hidden flex justify-center pointer-events-none px-3.5 sm:px-6"
      style={{
        bottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
      }}
    >
      <nav
        role="navigation"
        aria-label="Mobile Navigation"
        className="pointer-events-auto w-full max-w-[420px] relative rounded-[32px] p-1.5 flex items-center justify-between select-none ring-1 ring-black/5"
        style={{
          background: 'rgba(255, 255, 255, 0.68)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          boxShadow:
            '0 10px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Floating Active Capsule with Smooth Sliding Animation */}
        <div
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 rounded-[24px] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `calc((100% - 12px) / ${navItems.length})`,
            left: '6px',
            transform: activeIndex !== -1 ? `translateX(${activeIndex * 100}%)` : 'none',
            opacity: activeIndex !== -1 ? 1 : 0,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)',
          }}
        />

        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 relative z-10 py-1.5 px-0.5 flex flex-col items-center justify-center min-h-[46px] rounded-[24px] cursor-pointer outline-none select-none active:scale-95 transition-transform duration-150"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive
                    ? 'text-neutral-900 stroke-[2.3] scale-105'
                    : 'text-neutral-500 hover:text-neutral-700 stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-neutral-900'
                    : 'font-medium text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
