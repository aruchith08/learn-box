import React from 'react';
import { ArrowUpRight } from '../common/focusIcons';

interface WorkStickerProps {
  onAddClick?: () => void;
}

export const WorkSticker: React.FC<WorkStickerProps> = ({ onAddClick }) => {
  return (
    <div
      onClick={onAddClick}
      className="bg-[#FFE600] border-[2.5px] sm:border-[3.5px] border-[#111111] rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#111111] sm:shadow-[6px_6px_0px_#111111] transition-all cursor-pointer relative overflow-hidden group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#111111] select-none"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl sm:text-3xl font-display font-black text-[#111111] uppercase tracking-tight leading-[0.92]">
          ALOT OF
          <br />
          WORK TO DO,
          <br />
          NO TIME TO WASTE.
        </h3>
        <ArrowUpRight className="w-9 h-9 stroke-[3.5] text-[#111111] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </div>
  );
};
