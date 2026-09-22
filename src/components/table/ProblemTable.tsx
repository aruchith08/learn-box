import React from 'react';
import { DSAProblem } from '../../types/dsa';
import { ProblemRow } from './ProblemRow';

interface ProblemTableProps {
  problems: DSAProblem[];
  completedMap: Record<number, boolean>;
  revisionsMap: Record<number, boolean>;
  notesMap: Record<number, string>;
  onToggleCompleted: (id: number) => void;
  onToggleRevision: (id: number) => void;
  onOpenNote: (problem: DSAProblem) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  completedMap,
  revisionsMap,
  notesMap,
  onToggleCompleted,
  onToggleRevision,
  onOpenNote,
}) => {
  return (
    <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000000] overflow-x-auto">
      {/* Table Header */}
      <div className="grid grid-cols-[48px_48px_minmax(260px,1.8fr)_80px_100px_100px_90px_60px_70px_95px] items-center bg-black text-white text-[10px] font-black tracking-wider uppercase select-none border-b-2 border-black min-w-[950px]">
        <div className="flex items-center justify-center py-2.5">
          <span className="inline-block h-4 w-4 border-2 border-white/80 bg-transparent" title="Checklist" />
        </div>
        <div className="text-center border-l border-white/20 py-2.5 font-mono">#</div>
        <div className="border-l border-white/20 px-3 py-2.5">Problem</div>
        <div className="text-center border-l border-white/20 py-2.5">Video</div>
        <div className="text-center border-l border-white/20 py-2.5">HackerRank</div>
        <div className="text-center border-l border-white/20 py-2.5">LeetCode</div>
        <div className="text-center border-l border-white/20 py-2.5">CodeChef</div>
        <div className="text-center border-l border-white/20 py-2.5">Note</div>
        <div className="text-center border-l border-white/20 py-2.5">Revision</div>
        <div className="text-center border-l border-white/20 py-2.5">Difficulty</div>
      </div>

      {/* Problem Rows */}
      <div className="min-w-[950px]">
        {problems.map((problem) => (
          <ProblemRow
            key={problem.id}
            problem={problem}
            isCompleted={Boolean(completedMap[problem.id])}
            isRevision={Boolean(revisionsMap[problem.id])}
            hasNote={Boolean(notesMap[problem.id])}
            onToggleCompleted={onToggleCompleted}
            onToggleRevision={onToggleRevision}
            onOpenNote={onOpenNote}
          />
        ))}
      </div>
    </div>
  );
};
