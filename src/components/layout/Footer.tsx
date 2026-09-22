import React from 'react';
import { ABDUL_BARI_PROBLEMS } from '../../data/abdulBariData';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t-2 border-black bg-[#ECECEC] py-4 text-xs font-mono font-bold text-black">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
          <span>ARH DSA v1.0.0</span>
          <span>|</span>
          <span>{ABDUL_BARI_PROBLEMS.length} problems</span>
          <span>|</span>
          <span>Stay consistent</span>
          <span>|</span>
          <span>You got this!</span>
        </div>

        <div className="tracking-wider uppercase text-black">
          BUILT FOR LEARNERS, BY ARH <span className="text-[#FF5E1E]">❤</span>
        </div>
      </div>
    </footer>
  );
};
