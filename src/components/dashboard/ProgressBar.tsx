import React from 'react';

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedCount,
  totalCount,
  percentage,
}) => {
  return (
    <div className="mb-6 rounded-xl border border-arh-border bg-arh-panel p-3.5 sm:p-4">
      <div className="flex items-center justify-between text-xs font-medium text-arh-muted mb-2">
        <span className="flex items-center gap-1.5">
          <span className="text-white font-mono font-semibold">{completedCount}</span>
          <span>/</span>
          <span className="font-mono">{totalCount}</span>
          <span className="text-arh-submuted">completed</span>
        </span>
        <span className="font-mono font-semibold text-arh-orange">
          {percentage}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c1c1c]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-arh-orangeDark via-arh-orange to-arh-orangeLight transition-all duration-300 ease-out shadow-glow-orange"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
