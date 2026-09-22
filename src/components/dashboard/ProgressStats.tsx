import React from 'react';
import { Check, Minus, FileText } from '../common/icons';

interface ProgressStatsProps {
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  progressPercentage: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  totalCount,
  completedCount,
  remainingCount,
  progressPercentage,
}) => {
  return (
    <div id="progress-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 scroll-mt-20">
      {/* 1. TOTAL PROBLEMS */}
      <div className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black tracking-wider text-black uppercase">
            Total Problems
          </span>
          <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#E5E5E5]">
            <FileText className="h-4 w-4 text-black" />
          </div>
        </div>
        <div className="text-3xl font-black font-mono tracking-tight text-black mt-1">
          {totalCount}
        </div>
      </div>

      {/* 2. COMPLETED */}
      <div className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black tracking-wider text-black uppercase">
            Completed
          </span>
          <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#4ADE80]">
            <Check className="h-4 w-4 text-black stroke-[3.5]" />
          </div>
        </div>
        <div className="text-3xl font-black font-mono tracking-tight text-black mt-1">
          {completedCount}
        </div>
      </div>

      {/* 3. REMAINING */}
      <div className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black tracking-wider text-black uppercase">
            Remaining
          </span>
          <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#E5E5E5]">
            <Minus className="h-4 w-4 text-black stroke-[3]" />
          </div>
        </div>
        <div className="text-3xl font-black font-mono tracking-tight text-black mt-1">
          {remainingCount}
        </div>
      </div>

      {/* 4. PROGRESS */}
      <div className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000000] flex flex-col justify-between">
        <div className="text-[11px] font-black tracking-wider text-black uppercase mb-1.5">
          Progress
        </div>

        {/* Thick brutalist progress bar */}
        <div className="h-5 w-full border-2 border-black bg-[#E5E5E5] overflow-hidden">
          <div
            className="h-full bg-[#FF5E1E] transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <span className="text-[11px] font-mono font-bold text-black/70">
            {completedCount} / {totalCount} completed
          </span>
          <span className="text-xl font-black font-mono text-black">
            {progressPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
