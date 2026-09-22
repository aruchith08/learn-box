import React from 'react';
import { Difficulty } from '../../types/dsa';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const styles: Record<Difficulty, string> = {
    Easy: 'bg-[#4ADE80] text-black border-2 border-black',
    Medium: 'bg-[#FBBF24] text-black border-2 border-black',
    Hard: 'bg-[#F87171] text-black border-2 border-black',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-black font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 shadow-[1px_1px_0px_#000000] ${styles[difficulty]}`}
    >
      {difficulty.toUpperCase()}
    </span>
  );
};
