import React from 'react';
import { FilterStatus } from '../../types/dsa';
import { SearchX, Star, CheckCircle, FolderOpen } from './icons';

interface EmptyStateProps {
  searchQuery: string;
  currentFilter: FilterStatus;
  activeCategory: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  currentFilter,
  activeCategory,
  onClearFilters,
}) => {
  let title = 'No problems found';
  let description = 'Try adjusting your search or category filters.';
  let icon = <SearchX className="h-8 w-8 text-arh-submuted" />;

  if (currentFilter === 'revision') {
    title = 'No problems marked for revision yet';
    description = 'Click the star icon (☆) on any problem row to add it to your revision checklist.';
    icon = <Star className="h-8 w-8 text-amber-400/50" />;
  } else if (currentFilter === 'completed') {
    title = "You haven't completed any problems yet";
    description = 'Check off problems as you solve them to track your learning journey.';
    icon = <CheckCircle className="h-8 w-8 text-arh-orange/50" />;
  } else if (currentFilter === 'pending') {
    title = 'All caught up!';
    description = 'You have completed all problems in this view.';
    icon = <CheckCircle className="h-8 w-8 text-emerald-400/50" />;
  } else if (searchQuery) {
    title = `No matches for "${searchQuery}"`;
    description = 'Double check the spelling or search by topic name (e.g., "recursion", "greedy").';
    icon = <SearchX className="h-8 w-8 text-arh-submuted" />;
  } else if (activeCategory !== 'all') {
    title = `No problems in ${activeCategory}`;
    description = 'Select "All Problems" from the roadmap sidebar to browse all lessons.';
    icon = <FolderOpen className="h-8 w-8 text-arh-submuted" />;
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 border-black bg-white p-8 sm:p-12 text-center my-6 shadow-[4px_4px_0px_#000000]">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#ECECEC] text-black shadow-[2px_2px_0px_#000000] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-black uppercase text-black tracking-tight mb-1.5">{title}</h3>
      <p className="max-w-md text-xs sm:text-sm font-medium text-[#555555] mb-5 leading-relaxed">
        {description}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="border-2 border-black bg-[#FF5E1E] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};
