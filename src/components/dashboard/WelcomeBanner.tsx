import React from 'react';

export const WelcomeBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-8">
      {/* Left Canvas Greeting (7 cols) */}
      <div className="lg:col-span-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 sm:gap-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-[#111111] tracking-tight uppercase leading-[0.92] select-none">
            GOOD TO SEE YOU
            <br />
            BACK!
          </h1>
          {/* Yellow Chunky Smiley Face Badge matching reference */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#FFE600] border-[2.5px] sm:border-[3px] border-[#111111] rounded-full flex items-center justify-center shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] shrink-0 transform -rotate-6 hover:rotate-6 transition-transform cursor-pointer">
            <svg viewBox="0 0 60 60" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none">
              <circle cx="21" cy="23" r="3.5" fill="#111111" />
              <circle cx="39" cy="23" r="3.5" fill="#111111" />
              <path
                d="M17 34 C 22 47, 38 47, 43 34"
                stroke="#111111"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs sm:text-sm md:text-base font-bold text-gray-700 mt-2 sm:mt-3 tracking-wide font-mono">
          Same goals. More progress.
        </p>
      </div>

      {/* Right Quote & Graphic Card (6 cols) */}
      <div className="lg:col-span-6 bg-[#DDD6FE] border-[3px] border-[#111111] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#111111] sm:shadow-[5px_5px_0px_#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative min-h-[140px] sm:min-h-[170px]">
        <div className="w-full sm:max-w-xs z-10">
          <blockquote className="text-sm sm:text-base md:text-xl font-display font-black text-[#111111] uppercase tracking-tight leading-snug">
            "A LITTLE PROGRESS EACH DAY ADDS UP TO BIG RESULTS."
          </blockquote>
          <div className="text-xs font-bold text-[#111111] mt-3 uppercase tracking-wider font-mono">
            — UNKNOWN
          </div>
        </div>

        {/* Real Manga discipline artwork asset */}
        <div className="w-40 sm:w-52 h-32 sm:h-36 border-2 border-[#111111] rounded-xl overflow-hidden bg-white shadow-[3px_3px_0px_#111111] shrink-0 relative ml-2 group">
          <img
            src="/discipline-builds-freedom.jpg"
            alt="Discipline Builds Freedom"
            className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};
