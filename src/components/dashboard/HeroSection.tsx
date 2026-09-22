import React from 'react';
import { ABDUL_BARI_PROBLEMS } from '../../data/abdulBariData';

export const HeroSection: React.FC = () => {
  return (
    <section className="mb-4 border-2 border-black bg-black text-white p-4 sm:p-5 shadow-[3px_3px_0px_#000000]">
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-5">
        {/* Left: Main Headings and Badges */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest text-[#999999] uppercase mb-1">
              <span>ARH LEARNING SYSTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              ABDUL BARI DSA WITH PROBLEMS
              <span className="block sm:inline sm:ml-2.5 text-[#FF5E1E] text-base sm:text-xl font-bold font-mono tracking-normal">
                — BY ARH
              </span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed max-w-xl">
              Follow a structured DSA learning roadmap, watch the lessons, practice problems, and track your progress.
            </p>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="border border-white/60 bg-black px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-white uppercase">
              {ABDUL_BARI_PROBLEMS.length} Problems
            </span>
            <span className="border border-white/60 bg-black px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-white uppercase">
              Structured Learning
            </span>
            <span className="border border-white/60 bg-black px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-white uppercase">
              Practice Links
            </span>
            <span className="border border-white/60 bg-black px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-white uppercase">
              Track Progress
            </span>
          </div>
        </div>

        {/* Middle: Brutalist Quote Box */}
        <div className="border-2 border-black bg-[#F5F5F5] p-4 text-black flex flex-col justify-center max-w-xs shadow-[2px_2px_0px_#000000] lg:w-56 shrink-0">
          <p className="text-xs font-black uppercase tracking-tight leading-snug">
            &ldquo;A LITTLE PROGRESS EACH DAY ADDS UP TO BIG RESULTS.&rdquo;
          </p>
          <span className="mt-3 text-[10px] font-mono font-bold text-black/70 text-right">
            — ARH
          </span>
        </div>

        {/* Right: Architectural Graphic + Action Words */}
        <div className="hidden lg:flex items-center gap-3.5 pl-3 border-l border-white/20 shrink-0">
          <div className="relative h-36 sm:h-40 w-56 sm:w-64 lg:w-72 overflow-hidden border border-white/40 bg-[#151515]">
            <img
              src="/brutalist-building.jpg"
              alt="Brutalist Architecture"
              className="w-full h-full object-cover object-center grayscale contrast-125"
            />
          </div>

          <div className="flex flex-col justify-center text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-[#999999] leading-5 select-none">
            <span>SOLVE</span>
            <span>LEARN</span>
            <span>PRACTICE</span>
            <span>REVISE</span>
            <span>REPEAT</span>
          </div>
        </div>
      </div>
    </section>
  );
};
