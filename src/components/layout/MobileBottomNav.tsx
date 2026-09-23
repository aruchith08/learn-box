import React from 'react';
import {
  LayoutDashboard,
  FolderClosed,
  Film,
  CheckSquare2,
  FileText,
  Bookmark,
  IconProps,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { TabType } from '../../types/focusLearn';

interface MobileBottomNavProps {
  onOpenAddModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAddModal }) => {
  const { activeTab, setActiveTab } = useLearning();

  const navItems: { id: TabType; label: string; icon: React.FC<IconProps> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'playlists', label: 'Playlists', icon: FolderClosed },
    { id: 'my-videos', label: 'Videos', icon: Film },
    { id: 'tracker', label: 'Tracker', icon: CheckSquare2 },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t-[3px] border-[#111111] px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'bg-[#FFE600] text-black font-black shadow-[2px_2px_0px_#000]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-black stroke-[2.5]' : 'stroke-gray-400'}`} />
            <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
