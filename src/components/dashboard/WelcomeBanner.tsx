import React from 'react';
import { Sparkles, Target, Zap, ShieldCheck } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const WelcomeBanner: React.FC = () => {
  const { settings, metrics } = useLearning();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* Left Welcome Card (7 cols) */}
      <div className="lg:col-span-7 bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background badge */}
        <div className="absolute top-3 right-3 bg-[#FEF08A] border-2 border-black px-2.5 py-1 rounded-md text-[11px] font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>FOCUS ZONE ACTIVE</span>
        </div>

        <div>
          <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
            DASHBOARD OVERVIEW
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight mb-2 flex items-center gap-2">
            GOOD TO SEE YOU BACK! <span className="text-2xl">😃</span>
          </h1>
          <p className="text-base font-bold text-gray-700 mb-5">
            Same goals. More progress. You have completed <span className="text-black bg-[#A7F3D0] px-1.5 py-0.5 border border-black rounded font-black">{metrics.completedVideos} videos</span> across your active curriculums.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#F4F0EA] border-2 border-black p-2.5 rounded-lg flex items-center gap-2.5 shadow-[2px_2px_0px_#000]">
              <div className="w-7 h-7 bg-[#FFE600] border border-black rounded flex items-center justify-center font-black shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-black stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-500 leading-none">Protection</div>
                <div className="text-xs font-black text-black">Zero Shorts</div>
              </div>
            </div>

            <div className="bg-[#F4F0EA] border-2 border-black p-2.5 rounded-lg flex items-center gap-2.5 shadow-[2px_2px_0px_#000]">
              <div className="w-7 h-7 bg-[#BAE6FD] border border-black rounded flex items-center justify-center font-black shrink-0">
                <Zap className="w-4 h-4 stroke-black stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-500 leading-none">Speed</div>
                <div className="text-xs font-black text-black">Deep Learning</div>
              </div>
            </div>

            <div className="bg-[#F4F0EA] border-2 border-black p-2.5 rounded-lg flex items-center gap-2.5 shadow-[2px_2px_0px_#000]">
              <div className="w-7 h-7 bg-[#FECDD3] border border-black rounded flex items-center justify-center font-black shrink-0">
                <Target className="w-4 h-4 stroke-black stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-gray-500 leading-none">Discipline</div>
                <div className="text-xs font-black text-black">{settings.streakDays} Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Quote & Graphic Card (5 cols) */}
      <div className="lg:col-span-5 bg-[#DDD6FE] border-3 border-black rounded-xl p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between relative overflow-hidden">
        {/* Top Quote */}
        <div>
          <div className="text-[10px] font-black tracking-widest text-purple-900 uppercase mb-2">
            DAILY MINDSET
          </div>
          <blockquote className="text-lg font-black text-black uppercase tracking-tight leading-snug">
            "A LITTLE PROGRESS EACH DAY ADDS UP TO BIG RESULTS."
          </blockquote>
          <div className="text-xs font-bold text-purple-900 mt-1 uppercase">
            — UNKNOWN
          </div>
        </div>

        {/* Neo-brutalist Graphic Banner */}
        <div className="mt-4 bg-white border-2 border-black rounded-lg p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFE600] border-2 border-black rounded-lg flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#000]">
              ⚡
            </div>
            <div>
              <div className="text-xs font-black text-black uppercase tracking-wider">
                DISCIPLINE BUILDS FREEDOM
              </div>
              <div className="text-[11px] font-bold text-gray-600">
                Consistency over intensity. Always.
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-black text-[#FFE600] text-[10px] font-black px-2 py-1 rounded border border-black uppercase tracking-wider">
              LEVEL {Math.floor(metrics.completedVideos / 5) + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
