import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Plus,
  Search,
  ExternalLink,
  Check,
  Trash2,
  Calendar,
  X,
  RefreshCw,
  Trophy,
  Target,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { dbService } from '../../services/dbService';
import { LeetCodeSubmission } from '../../types/focusLearn';
import {
  CURATED_LEETCODE_PROBLEMS,
  CURATED_CATEGORIES,
  CuratedProblem,
} from '../../data/curatedLeetcodeProblems';

export const LeetCodeStreakView: React.FC = () => {
  const {
    leetcode,
    logLeetCodeProblem,
    deleteLeetCodeProblem,
    syncLeetCodeProfile,
    useStreakFreeze,
    updateLeetCodeDailyGoal,
  } = useLearning();

  // State
  const [usernameInput, setUsernameInput] = useState(leetcode.username || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Daily Challenge state
  const [dailyProblem, setDailyProblem] = useState<{
    questionTitle: string;
    questionLink: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topicTags?: { name: string }[];
    date?: string;
  } | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  // Log Problem Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDifficulty, setModalDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [modalUrl, setModalUrl] = useState('');
  const [modalTags, setModalTags] = useState('');
  const [modalTime, setModalTime] = useState<number | ''>('');
  const [modalDate, setModalDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [modalNotes, setModalNotes] = useState('');

  // Curated Sheets Tab & Filter
  const [activeSheet, setActiveSheet] = useState<'blind75' | 'neetcode150' | 'striver' | 'all'>('blind75');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sheetSearch, setSheetSearch] = useState('');

  // History search & filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyDifficulty, setHistoryDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Heatmap tooltip state
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    isFreeze: boolean;
  } | null>(null);

  // Fetch Daily POTD on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDaily() {
      setIsDailyLoading(true);
      try {
        const data = await dbService.fetchDailyLeetCodeProblem();
        if (isMounted && data) {
          setDailyProblem({
            questionTitle: data.questionTitle || data.title || 'Daily LeetCode Challenge',
            questionLink: data.questionLink?.startsWith('http')
              ? data.questionLink
              : `https://leetcode.com${data.questionLink || ''}`,
            difficulty: (data.difficulty as any) || 'Medium',
            topicTags: data.topicTags || [],
            date: data.date,
          });
        }
      } catch (err) {
        console.warn('Could not load daily problem', err);
      } finally {
        if (isMounted) setIsDailyLoading(false);
      }
    }
    loadDaily();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update username input when state updates
  useEffect(() => {
    if (leetcode.username && !usernameInput) {
      setUsernameInput(leetcode.username);
    }
  }, [leetcode.username]);

  // Handle Sync
  const handleSync = async () => {
    if (!usernameInput.trim()) {
      setSyncFeedback({ type: 'error', msg: 'Please enter a username.' });
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await syncLeetCodeProfile(usernameInput.trim());
    setIsSyncing(false);
    if (res.success) {
      setSyncFeedback({ type: 'success', msg: 'Profile synced successfully!' });
      setTimeout(() => setSyncFeedback(null), 4000);
    } else {
      setSyncFeedback({ type: 'error', msg: res.error || 'Failed to sync with LeetCode.' });
    }
  };

  // Dates set for quick checks
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const solvedSlugsOrTitles = useMemo(() => {
    const set = new Set<string>();
    leetcode.submissions.forEach((s) => {
      set.add(s.title.toLowerCase().trim());
      if (s.titleSlug) set.add(s.titleSlug.toLowerCase().trim());
      if (s.url) {
        const match = s.url.match(/problems\/([^/]+)/);
        if (match) set.add(match[1].toLowerCase());
      }
    });
    return set;
  }, [leetcode.submissions]);

  // Today's solved count
  const todaySolvedCount = useMemo(() => {
    return leetcode.submissions.filter((s) => s.date === todayStr).length;
  }, [leetcode.submissions, todayStr]);

  const isSafeToday = useMemo(() => {
    if (todaySolvedCount > 0) return true;
    if (leetcode.lastFreezeDate === todayStr) return true;
    // Check if LeetCode API calendar logged today
    if (leetcode.stats.submissionCalendar) {
      const nowSec = Math.floor(Date.now() / 1000);
      // Check last 24h
      return Object.entries(leetcode.stats.submissionCalendar).some(([tsStr, count]) => {
        if (count <= 0) return false;
        const ts = parseInt(tsStr, 10);
        const d = new Date(ts * 1000).toLocaleDateString('en-CA');
        return d === todayStr;
      });
    }
    return false;
  }, [todaySolvedCount, leetcode.lastFreezeDate, todayStr, leetcode.stats.submissionCalendar]);

  // Handle Log Modal Submit
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    let targetUrl = modalUrl.trim();
    if (!targetUrl) {
      const slug = modalTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      targetUrl = `https://leetcode.com/problems/${slug}/`;
    }

    const tagsArray = modalTags
      ? modalTags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    logLeetCodeProblem({
      title: modalTitle.trim(),
      difficulty: modalDifficulty,
      url: targetUrl,
      tags: tagsArray,
      timeSpentMinutes: typeof modalTime === 'number' ? modalTime : undefined,
      date: modalDate || todayStr,
      notes: modalNotes.trim() || undefined,
    });

    // Reset modal
    setModalTitle('');
    setModalDifficulty('Medium');
    setModalUrl('');
    setModalTags('');
    setModalTime('');
    setModalNotes('');
    setModalDate(todayStr);
    setIsLogModalOpen(false);
  };

  // Quick 1-click log for Daily Challenge
  const handleLogDaily = () => {
    if (!dailyProblem) return;
    logLeetCodeProblem({
      title: dailyProblem.questionTitle,
      difficulty: dailyProblem.difficulty,
      url: dailyProblem.questionLink,
      tags: dailyProblem.topicTags?.map((t) => t.name),
      date: todayStr,
      notes: 'Completed Daily POTD Challenge!',
    });
  };

  // Quick 1-click log for Curated Problem
  const handleToggleCurated = (problem: CuratedProblem) => {
    const isDone = solvedSlugsOrTitles.has(problem.slug.toLowerCase()) || solvedSlugsOrTitles.has(problem.title.toLowerCase());
    if (isDone) {
      // Find and delete matching submission
      const existing = leetcode.submissions.find(
        (s) =>
          s.title.toLowerCase() === problem.title.toLowerCase() ||
          (s.url && s.url.includes(problem.slug))
      );
      if (existing) {
        deleteLeetCodeProblem(existing.id);
      }
    } else {
      // Log it
      logLeetCodeProblem({
        title: problem.title,
        difficulty: problem.difficulty,
        url: problem.url,
        tags: [problem.category],
        date: todayStr,
        notes: `Solved from ${problem.category} roadmap`,
      });
    }
  };

  // Generate Past 180 Days Grid for Neo-Brutalist Heatmap
  const heatmapData = useMemo(() => {
    // Map dates to problem counts
    const dateCounts: Record<string, number> = {};

    // 1. From local submissions
    leetcode.submissions.forEach((s) => {
      if (s.date) {
        dateCounts[s.date] = (dateCounts[s.date] || 0) + 1;
      }
    });

    // 2. From LeetCode API submissionCalendar
    if (leetcode.stats.submissionCalendar) {
      Object.entries(leetcode.stats.submissionCalendar).forEach(([tsStr, count]) => {
        if (count > 0) {
          const d = new Date(parseInt(tsStr, 10) * 1000).toLocaleDateString('en-CA');
          dateCounts[d] = Math.max(dateCounts[d] || 0, count);
        }
      });
    }

    const DAYS_TO_SHOW = 182; // 26 weeks
    const today = new Date();
    const cells = [];

    // Find starting day to align to Monday
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const count = dateCounts[dateStr] || 0;
      const isFreeze = leetcode.lastFreezeDate === dateStr;

      cells.push({
        date: dateStr,
        count,
        isFreeze,
        dayOfWeek: d.getDay(), // 0 = Sun, 1 = Mon ...
        month: d.toLocaleString('default', { month: 'short' }),
        dayOfMonth: d.getDate(),
      });
    }

    return cells;
  }, [leetcode.submissions, leetcode.stats.submissionCalendar, leetcode.lastFreezeDate]);

  // Filter curated problems
  const filteredCurated = useMemo(() => {
    return CURATED_LEETCODE_PROBLEMS.filter((p) => {
      // Sheet filter
      if (activeSheet !== 'all' && !p.sheets.includes(activeSheet as any)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Search
      if (sheetSearch.trim()) {
        const q = sheetSearch.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeSheet, selectedCategory, sheetSearch]);

  // Filter history submissions
  const filteredHistory = useMemo(() => {
    return leetcode.submissions.filter((s) => {
      if (historyDifficulty !== 'All' && s.difficulty !== historyDifficulty) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesTag = s.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesNote = s.notes?.toLowerCase().includes(q);
        return matchesTitle || matchesTag || matchesNote;
      }
      return true;
    });
  }, [leetcode.submissions, historyDifficulty, historySearch]);

  return (
    <div className="min-h-screen bg-[#F4F1EB] text-[#111111] font-sans pb-24">
      {/* Top Banner / Heading */}
      <div className="border-b-[3px] border-[#111111] bg-white px-6 py-8 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0px_#111111] text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-[#111111] text-[#111111]" />
                Streak Maintainer
              </span>
              <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                DSA Discipline Engine
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-[#111111] uppercase">
              LEETCODE STREAK
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium mt-1">
              Build algorithmic mastery daily. Track consistency, protect your streak, and conquer sheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FFE600] hover:bg-[#FFD700] text-[#111111] font-black border-[3px] border-[#111111] rounded-xl shadow-[4px_4px_0px_#111111] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#111111] active:translate-y-0 active:shadow-[2px_2px_0px_#111111] transition-all cursor-pointer text-sm uppercase"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              Log Solved Problem
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Bento Grid: 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Streak Shield / Flame */}
          <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-5 shadow-[5px_5px_0px_#111111] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-wider">
                  CURRENT STREAK
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black font-display text-[#111111]">
                    {leetcode.stats.currentStreak}
                  </span>
                  <span className="text-sm font-black font-mono text-gray-600 uppercase">
                    DAYS
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl border-[2px] border-[#111111] flex items-center justify-center shadow-[3px_3px_0px_#111111] ${
                  isSafeToday ? 'bg-[#C8FACC]' : 'bg-[#FFA69E]'
                }`}
              >
                <Flame className={`w-7 h-7 ${isSafeToday ? 'text-green-700 fill-green-500' : 'text-red-600 fill-red-400'}`} />
              </div>
            </div>

            {/* Streak Status Pill */}
            <div className="mt-4 pt-3 border-t-2 border-[#111111]/15 space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-[#111111] text-xs font-black uppercase ${
                  isSafeToday
                    ? 'bg-[#C8FACC] text-green-950 shadow-[2px_2px_0px_#111111]'
                    : 'bg-[#FFA69E] text-red-950 shadow-[2px_2px_0px_#111111] animate-pulse'
                }`}
              >
                {isSafeToday ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    Streak Secured Today
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    At Risk • Solve 1 Problem
                  </>
                )}
              </div>

              {/* Freeze Protection Action */}
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 pt-1">
                <span>Freezes: {leetcode.streakFreezesAvailable} left</span>
                {leetcode.streakFreezesAvailable > 0 && leetcode.lastFreezeDate !== todayStr && !isSafeToday && (
                  <button
                    onClick={() => {
                      if (confirm('Use 1 streak freeze to protect today?')) {
                        useStreakFreeze();
                      }
                    }}
                    className="text-[10px] font-black px-2 py-0.5 bg-[#BAE6FD] hover:bg-sky-300 border border-[#111111] rounded text-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer"
                  >
                    🧊 Freeze Today
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: LeetCode Profile & Sync */}
          <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-5 shadow-[5px_5px_0px_#111111] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-wider">
                  LEETCODE ACCOUNT
                </span>
                {leetcode.username && (
                  <a
                    href={`https://leetcode.com/${leetcode.username}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-[#111111] hover:underline"
                  >
                    Profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Username Input & Sync Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="LeetCode username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                  className="flex-1 bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white"
                />
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="p-2 bg-[#111111] text-white hover:bg-black rounded-xl border-2 border-[#111111] cursor-pointer shadow-[2px_2px_0px_#111111] active:translate-y-0.5 disabled:opacity-50"
                  title="Sync with LeetCode"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {syncFeedback && (
                <div
                  className={`text-[10px] font-mono font-bold mt-1.5 ${
                    syncFeedback.type === 'success' ? 'text-green-700' : 'text-red-600'
                  }`}
                >
                  {syncFeedback.msg}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#111111]/15 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500 font-bold">Global Rank:</span>
              <span className="font-black text-[#111111]">
                {leetcode.stats.ranking ? `#${leetcode.stats.ranking.toLocaleString()}` : 'Unranked'}
              </span>
            </div>
          </div>

          {/* Card 3: Solved Breakdown */}
          <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-5 shadow-[5px_5px_0px_#111111] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-wider">
                TOTAL SOLVED
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black font-display text-[#111111]">
                  {leetcode.stats.totalSolved}
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">
                  Problems
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#111111]/15 space-y-2">
              {/* Easy */}
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black inline-block" />
                  Easy
                </span>
                <span>{leetcode.stats.easySolved}</span>
              </div>
              {/* Medium */}
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black inline-block" />
                  Medium
                </span>
                <span>{leetcode.stats.mediumSolved}</span>
              </div>
              {/* Hard */}
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-black inline-block" />
                  Hard
                </span>
                <span>{leetcode.stats.hardSolved}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Daily Target & Longest Streak */}
          <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-5 shadow-[5px_5px_0px_#111111] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-wider">
                TODAY'S TARGET
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-display text-[#111111]">
                    {todaySolvedCount}
                  </span>
                  <span className="text-sm font-mono font-bold text-gray-500">
                    / {leetcode.dailyGoal || 1}
                  </span>
                </div>
                {/* Stepper for goal */}
                <div className="flex items-center gap-1 border-2 border-[#111111] rounded-lg p-0.5 bg-[#F4F1EB]">
                  <button
                    onClick={() => updateLeetCodeDailyGoal(Math.max(1, (leetcode.dailyGoal || 1) - 1))}
                    className="w-5 h-5 flex items-center justify-center font-black hover:bg-gray-200 rounded text-xs"
                    title="Decrease daily goal"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black px-1">{leetcode.dailyGoal || 1}</span>
                  <button
                    onClick={() => updateLeetCodeDailyGoal((leetcode.dailyGoal || 1) + 1)}
                    className="w-5 h-5 flex items-center justify-center font-black hover:bg-gray-200 rounded text-xs"
                    title="Increase daily goal"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mini Goal Progress Bar */}
              <div className="w-full bg-[#E5E7EB] border-2 border-[#111111] h-3 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#FFE600] h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (todaySolvedCount / (leetcode.dailyGoal || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#111111]/15 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500 font-bold">Best Record:</span>
              <span className="font-black text-[#111111]">
                🏆 {leetcode.stats.longestStreak} Days
              </span>
            </div>
          </div>
        </div>

        {/* Daily Challenge POTD Banner */}
        {dailyProblem && (
          <div className="bg-[#FFE600] border-[3px] border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase rounded">
                  OFFICIAL LEETCODE POTD
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-black rounded border border-black ${
                    dailyProblem.difficulty === 'Easy'
                      ? 'bg-[#C8FACC] text-green-950'
                      : dailyProblem.difficulty === 'Medium'
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-[#FFA69E] text-red-950'
                  }`}
                >
                  {dailyProblem.difficulty}
                </span>
                {dailyProblem.topicTags && dailyProblem.topicTags.length > 0 && (
                  <span className="text-[11px] font-mono font-bold text-gray-800">
                    • {dailyProblem.topicTags.map((t) => t.name).slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black font-display text-black">
                {dailyProblem.questionTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={dailyProblem.questionLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-black border-2 border-black rounded-xl text-xs uppercase shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all"
              >
                Solve on LeetCode <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </a>
              <button
                onClick={handleLogDaily}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white font-black border-2 border-black rounded-xl text-xs uppercase shadow-[3px_3px_0px_#555] hover:bg-gray-900 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Mark POTD Solved
              </button>
            </div>
          </div>
        )}

        {/* Neo-Brutalist Activity Heatmap */}
        <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-xl font-black font-display uppercase tracking-tight text-[#111111]">
                STREAK ACTIVITY HEATMAP
              </h3>
              <p className="text-xs font-mono text-gray-500 font-bold">
                26-Week contribution matrix (Submissions & Streak Freezes)
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-600">
              <span>Less</span>
              <span className="w-3.5 h-3.5 bg-[#EAE6DF] border border-black rounded-xs" />
              <span className="w-3.5 h-3.5 bg-[#BBF7D0] border border-black rounded-xs" />
              <span className="w-3.5 h-3.5 bg-[#4ADE80] border border-black rounded-xs" />
              <span className="w-3.5 h-3.5 bg-[#16A34A] border border-black rounded-xs" />
              <span>More</span>
              <span className="ml-2 flex items-center gap-1">
                <span className="w-3.5 h-3.5 bg-[#BAE6FD] border border-black rounded-xs" />
                <span>Freeze</span>
              </span>
            </div>
          </div>

          {/* Grid Container */}
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="min-w-[700px]">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                {heatmapData.map((cell) => {
                  let bg = 'bg-[#EAE6DF]';
                  if (cell.isFreeze) {
                    bg = 'bg-[#BAE6FD]';
                  } else if (cell.count >= 4) {
                    bg = 'bg-[#16A34A]';
                  } else if (cell.count >= 2) {
                    bg = 'bg-[#4ADE80]';
                  } else if (cell.count >= 1) {
                    bg = 'bg-[#BBF7D0]';
                  }

                  const isToday = cell.date === todayStr;

                  return (
                    <div
                      key={cell.date}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-xs border border-[#111111] transition-transform hover:scale-125 hover:z-10 cursor-pointer ${bg} ${
                        isToday ? 'ring-2 ring-black ring-offset-1' : ''
                      }`}
                      title={`${cell.date}: ${cell.count} solved${cell.isFreeze ? ' (Streak Freeze)' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hover Status Info */}
          <div className="h-6 mt-3 text-xs font-mono font-bold text-gray-700">
            {hoveredCell ? (
              <span>
                📅 {hoveredCell.date} —{' '}
                <strong className="text-black">
                  {hoveredCell.count} problem{hoveredCell.count === 1 ? '' : 's'} solved
                </strong>{' '}
                {hoveredCell.isFreeze && '• 🧊 Streak Freeze Applied'}
              </span>
            ) : (
              <span className="text-gray-400">Hover over any day square to inspect details</span>
            )}
          </div>
        </div>

        {/* Curated Problem Sheets (Practice Roadmap) */}
        <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight text-[#111111]">
                CURATED PROBLEM ROADMAPS
              </h3>
              <p className="text-xs font-mono text-gray-500 font-bold">
                Follow battle-tested coding roadmaps. 1-click launch and track your progress.
              </p>
            </div>

            {/* Sheet Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'blind75', label: 'Blind 75' },
                  { id: 'neetcode150', label: 'NeetCode 150' },
                  { id: 'striver', label: "Striver's SDE" },
                  { id: 'all', label: 'All Problems' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSheet(tab.id)}
                  className={`px-3 py-1.5 rounded-xl border-2 border-[#111111] text-xs font-black font-mono uppercase transition-all cursor-pointer ${
                    activeSheet === tab.id
                      ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_#111111] -translate-y-0.5'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters: Category & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t-2 border-[#111111]/10">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              {CURATED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border border-[#111111] text-[11px] font-mono font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F4F1EB] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search problem name..."
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F4F1EB] border-2 border-[#111111] rounded-xl text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Problem List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredCurated.map((prob) => {
              const isSolved =
                solvedSlugsOrTitles.has(prob.slug.toLowerCase()) ||
                solvedSlugsOrTitles.has(prob.title.toLowerCase());

              return (
                <div
                  key={prob.id}
                  className={`p-3.5 rounded-xl border-2 border-[#111111] flex items-center justify-between gap-3 transition-all ${
                    isSolved
                      ? 'bg-[#C8FACC]/40 border-green-800 shadow-[2px_2px_0px_#111111]'
                      : 'bg-white hover:bg-amber-50/50 shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleCurated(prob)}
                      className={`w-6 h-6 rounded-md border-2 border-[#111111] flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isSolved ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-100'
                      }`}
                      title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                    >
                      {isSolved && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-black text-sm tracking-tight hover:underline truncate block ${
                          isSolved ? 'line-through text-gray-600' : 'text-[#111111]'
                        }`}
                      >
                        {prob.title}
                      </a>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                            prob.difficulty === 'Easy'
                              ? 'bg-[#C8FACC] text-green-900 border-green-800'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-200 text-amber-900 border-amber-800'
                              : 'bg-[#FFA69E] text-red-900 border-red-800'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-500 truncate">
                          {prob.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-[#111111] bg-[#F4F1EB] hover:bg-[#FFE600] text-[#111111] shrink-0 transition-colors shadow-[1px_1px_0px_#111111]"
                    title="Solve on LeetCode"
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </a>
                </div>
              );
            })}

            {filteredCurated.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs font-mono font-bold text-gray-500">
                No problems found matching filters.
              </div>
            )}
          </div>
        </div>

        {/* Problem History Log Table */}
        <div className="bg-white border-[3px] border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black font-display uppercase tracking-tight text-[#111111]">
                PERSONAL SUBMISSION LOG
              </h3>
              <p className="text-xs font-mono text-gray-500 font-bold">
                {leetcode.submissions.length} problems logged in your streak database
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border-2 border-[#111111] rounded-xl overflow-hidden bg-[#F4F1EB]">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setHistoryDifficulty(diff)}
                    className={`px-3 py-1 text-xs font-mono font-black transition-colors cursor-pointer ${
                      historyDifficulty === diff
                        ? 'bg-[#111111] text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-[#F4F1EB] border-2 border-[#111111] rounded-xl text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto border-2 border-[#111111] rounded-xl">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-white border-b-2 border-[#111111]">
                    <th className="p-3 font-black">DATE</th>
                    <th className="p-3 font-black">PROBLEM</th>
                    <th className="p-3 font-black">DIFFICULTY</th>
                    <th className="p-3 font-black">TIME</th>
                    <th className="p-3 font-black">NOTES</th>
                    <th className="p-3 font-black text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20">
                  {filteredHistory.map((sub) => (
                    <tr key={sub.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-bold whitespace-nowrap text-gray-600">
                        {sub.date}
                      </td>
                      <td className="p-3">
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-black text-sm text-[#111111] hover:underline inline-flex items-center gap-1"
                        >
                          {sub.title}
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </a>
                        {sub.tags && sub.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {sub.tags.slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 bg-[#F4F1EB] text-[9px] font-bold rounded border border-gray-400 text-gray-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] border border-black ${
                            sub.difficulty === 'Easy'
                              ? 'bg-[#C8FACC] text-green-950'
                              : sub.difficulty === 'Medium'
                              ? 'bg-amber-200 text-amber-950'
                              : 'bg-[#FFA69E] text-red-950'
                          }`}
                        >
                          {sub.difficulty}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-gray-600">
                        {sub.timeSpentMinutes ? `${sub.timeSpentMinutes}m` : '—'}
                      </td>
                      <td className="p-3 text-gray-700 max-w-[240px] truncate" title={sub.notes}>
                        {sub.notes || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${sub.title}" from submission history?`)) {
                              deleteLeetCodeProblem(sub.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono font-bold text-gray-500 border-2 border-dashed border-[#111111]/30 rounded-xl">
              No submissions logged yet. Click "Log Solved Problem" or mark curated problems to get started!
            </div>
          )}
        </div>
      </div>

      {/* Log Problem Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-[3px] border-[#111111] rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_#111111] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#FFE600] border-b-[3px] border-[#111111] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 fill-black text-black" />
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-black">
                  LOG SOLVED PROBLEM
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 hover:bg-black/10 rounded-lg border border-black cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Longest Substring Without Repeating Characters"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-sm font-sans font-bold focus:outline-none focus:bg-white"
                />
              </div>

              {/* Difficulty & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={modalDifficulty}
                    onChange={(e) => setModalDifficulty(e.target.value as any)}
                    className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                    Date Solved
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* URL & Time Spent */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                    LeetCode URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={modalUrl}
                    onChange={(e) => setModalUrl(e.target.value)}
                    className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                    Time (Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                  Tags / Topics
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sliding Window, Hash Table, Two Pointers"
                  value={modalTags}
                  onChange={(e) => setModalTags(e.target.value)}
                  className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono font-black uppercase text-[#111111] mb-1">
                  Approach & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="What was tricky? Time/Space complexity: O(n) / O(k)..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-[#F4F1EB] border-2 border-[#111111] rounded-xl px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:bg-white"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t-2 border-[#111111]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#111111] rounded-xl text-xs font-mono font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#111111] rounded-xl text-xs font-mono font-black uppercase shadow-[3px_3px_0px_#111111] active:translate-y-0.5 cursor-pointer"
                >
                  Save & Secure Streak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
