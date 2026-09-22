import React from 'react';
import { Star } from '../common/icons';

interface RevisionButtonProps {
  isRevision: boolean;
  onToggle: () => void;
}

export const RevisionButton: React.FC<RevisionButtonProps> = ({
  isRevision,
  onToggle,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="group flex h-7 w-7 items-center justify-center transition-transform hover:scale-110"
      title={isRevision ? 'Remove from revision' : 'Mark for revision'}
      aria-label={isRevision ? 'Remove from revision' : 'Mark for revision'}
    >
      <Star
        className={`h-5 w-5 transition-colors ${
          isRevision
            ? 'fill-[#FF5E1E] text-[#FF5E1E]'
            : 'text-black/35 hover:text-black'
        }`}
      />
    </button>
  );
};
