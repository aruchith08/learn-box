import React from 'react';
import { DSAProblem } from '../../types/dsa';
import { Play, Check, FileText } from '../common/icons';
import { PracticeLinks } from '../table/PracticeLinks';
import { DifficultyBadge } from '../table/DifficultyBadge';
import { RevisionButton } from '../table/RevisionButton';

interface MobileProblemCardProps {
  problem: DSAProblem;
  isCompleted: boolean;
  isRevision: boolean;
  hasNote: boolean;
  onToggleCompleted: (id: number) => void;
  onToggleRevision: (id: number) => void;
  onOpenNote: (problem: DSAProblem) => void;
}

export const MobileProblemCard: React.FC<MobileProblemCardProps> = ({
  problem,
  isCompleted,
  isRevision,
  hasNote,
  onToggleCompleted,
  onToggleRevision,
  onOpenNote,
}) => {
  return (
    <div
      className={`border-2 border-black p-3.5 shadow-[2px_2px_0px_#000000] transition-colors ${
        isCompleted ? 'bg-[#F4F4F4]' : 'bg-white'
      }`}
    >
      {/* Top Header: Checkbox + Number + Title + Revision */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => onToggleCompleted(problem.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-black transition-all cursor-pointer ${
              isCompleted
                ? 'bg-[#FF5E1E] text-white shadow-[1px_1px_0px_#000000]'
                : 'bg-white hover:bg-black/10 active:scale-95 shadow-[1px_1px_0px_#000000]'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3.5] text-white" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-mono text-xs font-black text-black">
                #{problem.id}
              </span>
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-[10px] font-mono text-black/60 uppercase">
                {problem.category}
              </span>
            </div>
            <h4
              className={`text-xs sm:text-sm font-bold leading-snug ${
                isCompleted ? 'text-black/60 line-through decoration-black/40' : 'text-black'
              }`}
            >
              {problem.cleanTitle}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenNote(problem)}
            className={`flex h-7 w-7 items-center justify-center border transition-all ${
              hasNote
                ? 'border-black bg-[#FF5E1E] text-white shadow-[1px_1px_0px_#000000]'
                : 'border-transparent text-black/40 hover:border-black hover:bg-black/5 hover:text-black'
            }`}
            aria-label="Note"
          >
            <FileText className="h-4 w-4" />
          </button>
          <RevisionButton
            isRevision={isRevision}
            onToggle={() => onToggleRevision(problem.id)}
          />
        </div>
      </div>

      {/* Footer: Video & Practice Buttons */}
      <div className="mt-3 pt-2.5 border-t border-black/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {problem.videoUrl ? (
            <a
              href={problem.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-6 px-2 rounded-sm bg-[#FF0000] text-white font-black text-[10px] uppercase border border-black shadow-[1px_1px_0px_#000000] hover:opacity-90"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Watch</span>
            </a>
          ) : (
            <span className="text-xs font-mono text-black/30 select-none">—</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <PracticeLinks urls={problem.hackerRank} platform="hackerrank" align="auto" />
          <PracticeLinks urls={problem.leetCode} platform="leetcode" align="right" />
          <PracticeLinks urls={problem.codeChef} platform="codechef" align="right" />
        </div>
      </div>
    </div>
  );
};
