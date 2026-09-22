import React from 'react';
import { DSAProblem } from '../../types/dsa';
import { Play, Check, FileText } from '../common/icons';
import { PracticeLinks } from './PracticeLinks';
import { DifficultyBadge } from './DifficultyBadge';
import { RevisionButton } from './RevisionButton';

interface ProblemRowProps {
  problem: DSAProblem;
  isCompleted: boolean;
  isRevision: boolean;
  hasNote: boolean;
  onToggleCompleted: (id: number) => void;
  onToggleRevision: (id: number) => void;
  onOpenNote: (problem: DSAProblem) => void;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({
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
      className={`grid grid-cols-[48px_48px_minmax(260px,1.8fr)_80px_100px_100px_90px_60px_70px_95px] items-center border-b border-black/30 transition-colors hover:bg-black/5 ${
        isCompleted ? 'bg-[#F4F4F4]' : 'bg-white'
      }`}
    >
      {/* 1. Checkbox Button */}
      <div className="flex items-center justify-center p-2">
        <button
          type="button"
          onClick={() => onToggleCompleted(problem.id)}
          className={`flex h-5 w-5 items-center justify-center border-2 border-black transition-all cursor-pointer ${
            isCompleted
              ? 'bg-[#FF5E1E] text-white shadow-[1px_1px_0px_#000000]'
              : 'bg-white hover:bg-black/10 active:scale-95 shadow-[1px_1px_0px_#000000]'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3.5] text-white" />}
        </button>
      </div>

      {/* 2. Problem Number # */}
      <div className="text-center font-mono text-xs font-bold text-black border-l border-black/20 py-2.5">
        {problem.id}
      </div>

      {/* 3. Problem Title */}
      <div className="border-l border-black/20 px-3 py-2.5 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold truncate leading-tight ${
              isCompleted ? 'text-black/60 line-through decoration-black/40' : 'text-black'
            }`}
            title={problem.title}
          >
            {problem.cleanTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-mono font-medium text-black/50 uppercase">
            {problem.category}
          </span>
          {problem.originalIndex && (
            <>
              <span className="text-[10px] text-black/40">•</span>
              <span className="text-[10px] font-mono text-black/50">
                Lecture {problem.originalIndex}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 4. Video Link */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        {problem.videoUrl ? (
          <a
            href={problem.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-5 w-8 items-center justify-center rounded-sm bg-[#FF0000] text-white hover:opacity-90 border border-black shadow-[1px_1px_0px_#000000] transition-transform active:scale-95"
            title="Watch Video Lesson"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
          </a>
        ) : (
          <span className="text-xs font-mono text-black/30 select-none">—</span>
        )}
      </div>

      {/* 5. HackerRank */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <PracticeLinks urls={problem.hackerRank} platform="hackerrank" />
      </div>

      {/* 6. LeetCode */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <PracticeLinks urls={problem.leetCode} platform="leetcode" />
      </div>

      {/* 7. CodeChef */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <PracticeLinks urls={problem.codeChef} platform="codechef" />
      </div>

      {/* 8. Note */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <button
          onClick={() => onOpenNote(problem)}
          className={`flex h-6 w-6 items-center justify-center border transition-all ${
            hasNote
              ? 'border-black bg-[#FF5E1E] text-white shadow-[1px_1px_0px_#000000]'
              : 'border-transparent text-black/40 hover:border-black hover:bg-black/5 hover:text-black'
          }`}
          title={hasNote ? 'View/edit note' : 'Add note'}
          aria-label={hasNote ? 'View note' : 'Add note'}
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 9. Revision */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <RevisionButton
          isRevision={isRevision}
          onToggle={() => onToggleRevision(problem.id)}
        />
      </div>

      {/* 10. Difficulty */}
      <div className="border-l border-black/20 flex items-center justify-center py-2.5">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
    </div>
  );
};
