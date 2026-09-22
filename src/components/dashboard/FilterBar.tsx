import React, { useState, useRef, useEffect } from 'react';
import { FilterStatus, TopicCategory, Difficulty } from '../../types/dsa';
import { RotateCcw, ChevronDown } from '../common/icons';

interface FilterBarProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  revisionCount: number;
  categories: TopicCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  onResetClick: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  totalCount,
  pendingCount,
  completedCount,
  revisionCount,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  onResetClick,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (difficultyRef.current && !difficultyRef.current.contains(e.target as Node)) {
        setIsDifficultyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterTabs: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'ALL', count: totalCount },
    { id: 'pending', label: 'PENDING', count: pendingCount },
    { id: 'completed', label: 'COMPLETED', count: completedCount },
    { id: 'revision', label: 'REVISION', count: revisionCount },
  ];

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  const getSelectedCategoryLabel = () => {
    if (selectedCategory === 'all') return 'ALL TOPICS';
    return selectedCategory.toUpperCase();
  };

  const getSelectedDifficultyLabel = () => {
    if (selectedDifficulty === 'all') return 'ALL DIFFICULTIES';
    return selectedDifficulty.toUpperCase();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
      {/* Left: Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`border-2 border-black px-3.5 py-1.5 text-xs font-black tracking-wide uppercase transition-all shadow-[2px_2px_0px_#000000] whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF5E1E] text-black translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_#000000]'
                  : 'bg-white text-black hover:bg-[#F5F5F5]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Right: Custom Neo-Brutalist Dropdowns and Reset Button */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Topic Dropdown */}
        <div className="relative inline-block" ref={categoryRef}>
          <button
            type="button"
            onClick={() => {
              setIsCategoryOpen((prev) => !prev);
              setIsDifficultyOpen(false);
            }}
            className="flex items-center justify-between gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {getSelectedCategoryLabel()}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-black transition-transform duration-150 ${
                isCategoryOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-50 w-60 max-h-64 overflow-y-auto border-2 border-black bg-white p-1.5 shadow-[4px_4px_0px_#000000]">
              <div className="px-2 py-1 text-[10px] font-mono font-black uppercase text-black/60 border-b-2 border-black mb-1 flex items-center justify-between">
                <span>TOPIC CATEGORIES</span>
                <span>{totalCount}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('all');
                  setIsCategoryOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#FF5E1E] text-black border border-black shadow-[1px_1px_0px_#000000]'
                    : 'hover:bg-black hover:text-white'
                }`}
              >
                <span>ALL TOPICS</span>
                <span className="font-mono text-[10px]">{totalCount}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(c.name);
                    setIsCategoryOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                    selectedCategory === c.name
                      ? 'bg-[#FF5E1E] text-black border border-black shadow-[1px_1px_0px_#000000]'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className="font-mono text-[10px]">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty Dropdown */}
        <div className="relative inline-block" ref={difficultyRef}>
          <button
            type="button"
            onClick={() => {
              setIsDifficultyOpen((prev) => !prev);
              setIsCategoryOpen(false);
            }}
            className="flex items-center justify-between gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <span>{getSelectedDifficultyLabel()}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-black transition-transform duration-150 ${
                isDifficultyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDifficultyOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 w-48 border-2 border-black bg-white p-1.5 shadow-[4px_4px_0px_#000000]">
              <div className="px-2 py-1 text-[10px] font-mono font-black uppercase text-black/60 border-b-2 border-black mb-1">
                DIFFICULTY
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectDifficulty('all');
                  setIsDifficultyOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                  selectedDifficulty === 'all'
                    ? 'bg-[#FF5E1E] text-black border border-black shadow-[1px_1px_0px_#000000]'
                    : 'hover:bg-black hover:text-white'
                }`}
              >
                <span>ALL DIFFICULTIES</span>
              </button>
              {difficulties.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    onSelectDifficulty(d);
                    setIsDifficultyOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                    selectedDifficulty.toLowerCase() === d.toLowerCase()
                      ? 'bg-[#FF5E1E] text-black border border-black shadow-[1px_1px_0px_#000000]'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  <span>{d.toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Progress Button */}
        <button
          onClick={onResetClick}
          className="flex items-center gap-1.5 border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-[#FF5E1E] hover:text-black transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-black" />
          <span>RESET PROGRESS</span>
        </button>
      </div>
    </div>
  );
};
