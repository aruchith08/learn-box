import React, { useEffect, useMemo } from 'react';
import { ABDUL_BARI_PROBLEMS } from '../../data/abdulBariData';
import { TOPIC_CATEGORIES } from '../../data/topicCategories';
import { FilterStatus } from '../../types/dsa';
import {
  RotateCcw,
  Star,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ProgressIcon,
  RoadmapIcon,
} from '../common/icons';

interface ProgressPageProps {
  completedMap: Record<string, boolean>;
  revisionsMap: Record<string, boolean>;
  notesMap: Record<string, string>;
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  revisionCount: number;
  progressPercentage: number;
  onBackToRoadmap: () => void;
  onFilterCategory: (categoryId: string) => void;
  onFilterStatus: (status: FilterStatus) => void;
  onResetClick: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  completedMap,
  revisionsMap,
  notesMap,
  totalCount,
  completedCount,
  remainingCount,
  revisionCount,
  progressPercentage,
  onBackToRoadmap,
  onFilterCategory,
  onFilterStatus,
  onResetClick,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Compute total problems with notes
  const notesCount = useMemo(() => {
    return Object.values(notesMap).filter((note) => note && note.trim().length > 0).length;
  }, [notesMap]);

  // Compute Difficulty metrics
  const difficultyStats = useMemo(() => {
    let easyTotal = 0;
    let easySolved = 0;
    let medTotal = 0;
    let medSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;

    ABDUL_BARI_PROBLEMS.forEach((problem) => {
      const isDone = Boolean(completedMap[problem.id]);
      if (problem.difficulty === 'Easy') {
        easyTotal++;
        if (isDone) easySolved++;
      } else if (problem.difficulty === 'Medium') {
        medTotal++;
        if (isDone) medSolved++;
      } else if (problem.difficulty === 'Hard') {
        hardTotal++;
        if (isDone) hardSolved++;
      }
    });

    return {
      easy: {
        solved: easySolved,
        total: easyTotal,
        pct: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0,
      },
      medium: {
        solved: medSolved,
        total: medTotal,
        pct: medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0,
      },
      hard: {
        solved: hardSolved,
        total: hardTotal,
        pct: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0,
      },
    };
  }, [completedMap]);

  // Compute Category mastery breakdown
  const categoryStats = useMemo(() => {
    return TOPIC_CATEGORIES.map((cat) => {
      const categoryProblems = ABDUL_BARI_PROBLEMS.filter((p) => p.category === cat.id);
      const catTotal = categoryProblems.length;
      let catSolved = 0;
      let easySolved = 0;
      let easyTotal = 0;
      let medSolved = 0;
      let medTotal = 0;
      let hardSolved = 0;
      let hardTotal = 0;

      categoryProblems.forEach((p) => {
        const isDone = Boolean(completedMap[p.id]);
        if (isDone) catSolved++;

        if (p.difficulty === 'Easy') {
          easyTotal++;
          if (isDone) easySolved++;
        } else if (p.difficulty === 'Medium') {
          medTotal++;
          if (isDone) medSolved++;
        } else if (p.difficulty === 'Hard') {
          hardTotal++;
          if (isDone) hardSolved++;
        }
      });

      const pct = catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        total: catTotal,
        solved: catSolved,
        pct,
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: medSolved, total: medTotal },
        hard: { solved: hardSolved, total: hardTotal },
      };
    });
  }, [completedMap]);

  // Radial SVG calculation
  // Radius = 75, Circumference = 2 * PI * 75 ≈ 471.238
  const radius = 75;
  const circumference = 2 * Math.PI * radius;

  const easyArc = (difficultyStats.easy.solved / (totalCount || 1)) * circumference;
  const medArc = (difficultyStats.medium.solved / (totalCount || 1)) * circumference;
  const hardArc = (difficultyStats.hard.solved / (totalCount || 1)) * circumference;

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-black bg-white p-3.5 sm:p-4 shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRoadmap}
            className="inline-flex items-center gap-1.5 border-2 border-black bg-[#FF5E1E] px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>BACK TO DSA ROADMAP</span>
          </button>
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-black/60 pl-2">
            <span>ARH DSA</span>
            <span>/</span>
            <span className="text-black uppercase">PROGRESS DASHBOARD</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRoadmap}
            className="border-2 border-black bg-[#ECECEC] px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <span>VIEW {totalCount} PROBLEMS</span>
          </button>
          <button
            onClick={onResetClick}
            className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
            title="Reset all progress"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#000000] text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-black bg-[#FF5E1E] px-2.5 py-1 text-[10px] font-mono font-black uppercase text-black shadow-[2px_2px_0px_#000000] mb-2">
              <ProgressIcon className="h-3 w-3" />
              <span>LEETCODE-STYLE MASTERY DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              ALGORITHM PROGRESS &amp; ANALYTICS
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-black/70 font-sans">
              Real-time analytics across all {totalCount} problems, 8 core algorithm paradigms, difficulty tiers, and revision tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="border-2 border-black bg-[#ECECEC] px-4 py-2.5 shadow-[2px_2px_0px_#000000] text-center">
              <div className="text-[10px] font-mono font-bold uppercase text-black/60">OVERALL COMPLETION</div>
              <div className="text-2xl font-black text-black font-mono">{progressPercentage}%</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LEETCODE SOLVED PROBLEMS CARD (Radial Gauge + 3 Difficulty Cards) */}
        {/* ========================================================================= */}
        <div className="mt-6 border-2 border-black bg-[#FAFAFA] p-5 sm:p-7 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black uppercase tracking-wide">Solved Problems</span>
              <span className="border border-black bg-black text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                {completedCount} / {totalCount}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-black/60">
              {remainingCount} problems remaining
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Radial Circle Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border-2 border-black bg-white shadow-[3px_3px_0px_#000000]">
              <div className="relative flex items-center justify-center w-52 h-52">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background Track */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="#ECECEC"
                    strokeWidth="14"
                  />

                  {/* Easy Arc (Emerald) */}
                  {easyArc > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#00B8A3"
                      strokeWidth="14"
                      strokeDasharray={`${easyArc} ${circumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Medium Arc (Amber) */}
                  {medArc > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#FFA116"
                      strokeWidth="14"
                      strokeDasharray={`${medArc} ${circumference}`}
                      strokeDashoffset={-easyArc}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Hard Arc (Rose / Red) */}
                  {hardArc > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#FF375F"
                      strokeWidth="14"
                      strokeDasharray={`${hardArc} ${circumference}`}
                      strokeDashoffset={-(easyArc + medArc)}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Center Stats Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-4xl font-black tracking-tight text-black font-mono">
                    {completedCount}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-black/50 border-b border-black/20 pb-0.5">
                    <span>/</span>
                    <span>{totalCount}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 text-xs font-black uppercase text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Solved</span>
                  </div>
                </div>
              </div>

              {/* Sub Stats Row under Gauge */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-black/10 w-full text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#ECECEC] px-2 py-1 border border-black">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>{revisionCount} Starred</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#ECECEC] px-2 py-1 border border-black">
                  <FileText className="h-3 w-3 text-blue-600" />
                  <span>{notesCount} Notes</span>
                </span>
              </div>
            </div>

            {/* Right Column: 3 Stacked Difficulty Breakdown Cards */}
            <div className="lg:col-span-7 flex flex-col gap-3.5">
              {/* EASY CARD */}
              <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00B8A3] border border-black" />
                    <span className="text-sm font-black uppercase text-[#00B8A3] tracking-wide">Easy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-black">
                      {difficultyStats.easy.solved}
                    </span>
                    <span className="font-mono text-xs font-bold text-black/50">
                      / {difficultyStats.easy.total}
                    </span>
                    <span className="ml-2 border border-black bg-[#E6F9F5] px-2 py-0.5 text-[10px] font-mono font-black text-emerald-800">
                      {difficultyStats.easy.pct}%
                    </span>
                  </div>
                </div>

                {/* Neo-brutalist Progress Bar */}
                <div className="h-3 w-full border-2 border-black bg-[#ECECEC] overflow-hidden">
                  <div
                    className="h-full bg-[#00B8A3] transition-all duration-500"
                    style={{ width: `${difficultyStats.easy.pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-mono text-black/60">
                  <span>Fundamentals &amp; baseline patterns</span>
                  <span>{difficultyStats.easy.total - difficultyStats.easy.solved} remaining</span>
                </div>
              </div>

              {/* MEDIUM CARD */}
              <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FFA116] border border-black" />
                    <span className="text-sm font-black uppercase text-[#FFA116] tracking-wide">Med.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-black">
                      {difficultyStats.medium.solved}
                    </span>
                    <span className="font-mono text-xs font-bold text-black/50">
                      / {difficultyStats.medium.total}
                    </span>
                    <span className="ml-2 border border-black bg-[#FFF7E8] px-2 py-0.5 text-[10px] font-mono font-black text-amber-800">
                      {difficultyStats.medium.pct}%
                    </span>
                  </div>
                </div>

                {/* Neo-brutalist Progress Bar */}
                <div className="h-3 w-full border-2 border-black bg-[#ECECEC] overflow-hidden">
                  <div
                    className="h-full bg-[#FFA116] transition-all duration-500"
                    style={{ width: `${difficultyStats.medium.pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-mono text-black/60">
                  <span>Core interview &amp; algorithmic standard</span>
                  <span>{difficultyStats.medium.total - difficultyStats.medium.solved} remaining</span>
                </div>
              </div>

              {/* HARD CARD */}
              <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF375F] border border-black" />
                    <span className="text-sm font-black uppercase text-[#FF375F] tracking-wide">Hard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-black">
                      {difficultyStats.hard.solved}
                    </span>
                    <span className="font-mono text-xs font-bold text-black/50">
                      / {difficultyStats.hard.total}
                    </span>
                    <span className="ml-2 border border-black bg-[#FFE8EE] px-2 py-0.5 text-[10px] font-mono font-black text-rose-800">
                      {difficultyStats.hard.pct}%
                    </span>
                  </div>
                </div>

                {/* Neo-brutalist Progress Bar */}
                <div className="h-3 w-full border-2 border-black bg-[#ECECEC] overflow-hidden">
                  <div
                    className="h-full bg-[#FF375F] transition-all duration-500"
                    style={{ width: `${difficultyStats.hard.pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-mono text-black/60">
                  <span>Advanced branch, bound &amp; dynamic graphs</span>
                  <span>{difficultyStats.hard.total - difficultyStats.hard.solved} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUICK STATS CARDS (Neo-Brutalist Grid) */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-2 border-black bg-[#FFF7E8] p-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">COMPLETION RATE</span>
              <CheckCircle2 className="h-4 w-4 text-black" />
            </div>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-black">{progressPercentage}%</div>
            <div className="mt-1 text-xs text-black/60 font-sans">{completedCount} of {totalCount} finished</div>
          </div>

          <div className="border-2 border-black bg-[#E6F9F5] p-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">PENDING PROBLEMS</span>
              <Clock className="h-4 w-4 text-black" />
            </div>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-black">{remainingCount}</div>
            <div className="mt-1 text-xs text-black/60 font-sans">Ready to solve next</div>
          </div>

          <div className="border-2 border-black bg-[#FFFBEA] p-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">IN REVISION</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-black">{revisionCount}</div>
            <button
              onClick={() => onFilterStatus('revision')}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-black uppercase text-black hover:underline cursor-pointer"
            >
              <span>Practice Starred →</span>
            </button>
          </div>

          <div className="border-2 border-black bg-[#F0F4FF] p-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">STUDY NOTES</span>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-black">{notesCount}</div>
            <button
              onClick={() => onFilterStatus('notes')}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-black uppercase text-black hover:underline cursor-pointer"
            >
              <span>View Problems With Notes →</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOPIC MASTERY BREAKDOWN (8 Algorithmic Paradigms) */}
        {/* ========================================================================= */}
        <div className="mt-10 border-t-2 border-black pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black">
                <Layers className="h-4 w-4" />
                <span>TOPIC MASTERY BREAKDOWN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mt-1">
                8 CORE ALGORITHM CATEGORIES
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-black/60">
              Curated from Abdul Bari's Algorithms Lecture Series
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryStats.map((category) => (
              <div
                key={category.id}
                className="border-2 border-black bg-white p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base uppercase text-black tracking-tight leading-tight">
                      {category.name}
                    </h3>
                    <span className="shrink-0 border border-black bg-[#ECECEC] px-2 py-0.5 text-xs font-mono font-bold text-black">
                      {category.solved} / {category.total}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2.5 w-full border-2 border-black bg-[#ECECEC] overflow-hidden">
                    <div
                      className="h-full bg-[#FF5E1E] transition-all duration-300"
                      style={{ width: `${category.pct}%` }}
                    />
                  </div>

                  {/* Difficulty Breakdown for this Category */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-black/70">
                    <div className="flex items-center gap-3">
                      <span className="text-[#00B8A3] font-bold">
                        E: {category.easy.solved}/{category.easy.total}
                      </span>
                      <span className="text-[#FFA116] font-bold">
                        M: {category.medium.solved}/{category.medium.total}
                      </span>
                      <span className="text-[#FF375F] font-bold">
                        H: {category.hard.solved}/{category.hard.total}
                      </span>
                    </div>
                    <span className="font-black text-black font-mono">{category.pct}% Complete</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                  <button
                    onClick={() => onFilterCategory(category.id)}
                    className="inline-flex items-center gap-1 text-xs font-black uppercase text-black hover:text-[#FF5E1E] transition-colors cursor-pointer"
                  >
                    <span>Practice Category</span>
                    <span>→</span>
                  </button>
                  <span className="text-[10px] font-mono text-black/50">
                    {category.total - category.solved} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOTIVATIONAL BANNER / RETURN CTA */}
        {/* ========================================================================= */}
        <div className="mt-10 border-2 border-black bg-[#FF5E1E] p-6 shadow-[4px_4px_0px_#000000] text-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase bg-black text-white px-2 py-0.5 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>KEEP SOLVING. KEEP BUILDING.</span>
              </div>
              <p className="text-lg sm:text-xl font-black uppercase tracking-tight">
                "ALGORITHMS ARE NOT ABOUT CODE; THEY ARE ABOUT THINKING CLEARLY."
              </p>
              <p className="text-xs sm:text-sm font-medium text-black/80 mt-1">
                Consistent daily problem-solving turns foundational computer science principles into second nature.
              </p>
            </div>
            <button
              onClick={onBackToRoadmap}
              className="shrink-0 border-2 border-black bg-white px-5 py-3 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-white transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RoadmapIcon className="h-4 w-4" />
              <span>RETURN TO ROADMAP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
