import React from 'react';
import { Flame, ArrowUpRight } from '../common/focusIcons';

interface WorkStickerProps {
  onAddClick?: () => void;
}

export const WorkSticker: React.FC<WorkStickerProps> = ({ onAddClick }) => {
  return (
    <div
      onClick={onAddClick}
      className="bg-[#FFE600] border-3 border-black rounded-xl p-5 shadow-[5px_5px_0px_#000] transform rotate-1 hover:rotate-0 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group"
    >
      {/* Tape illusion top-center */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-white/70 border border-black/30 backdrop-blur-sm -rotate-2" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-[#FFE600] rounded-lg flex items-center justify-center font-black">
            <Flame className="w-5 h-5 fill-[#FFE600] text-[#FFE600]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
            RULES OF ENGAGEMENT
          </span>
        </div>
        <ArrowUpRight className="w-6 h-6 stroke-[3] text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-black text-black uppercase tracking-tight leading-tight">
          A LOT OF WORK TO DO.
          <br />
          NO TIME TO WASTE.
        </h3>
        <p className="text-xs font-bold text-black/80 mt-1">
          Every video finished is one step closer to engineering mastery.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-2 border-black/20 pt-3">
        <span className="text-[10px] font-black uppercase text-black">
          ⚡ 0 EXCUSES MODE
        </span>
        <span className="text-[10px] font-black bg-black text-[#FFE600] px-2 py-0.5 rounded uppercase">
          FOCUS NOW →
        </span>
      </div>
    </div>
  );
};
