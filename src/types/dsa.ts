export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type PracticePlatform = 'hackerrank' | 'leetcode' | 'codechef';

export interface PracticeLinkItem {
  platform: PracticePlatform;
  url: string;
  label: string;
  slug: string;
}

export interface DSAProblem {
  id: number;
  originalIndex?: string;
  title: string;
  cleanTitle: string;
  videoUrl: string;
  hackerRank: string[];
  leetCode: string[];
  codeChef: string[];
  category: string;
  difficulty: Difficulty;
}

export interface TopicCategory {
  id: string;
  name: string;
  count: number;
}

export type FilterStatus = 'all' | 'pending' | 'completed' | 'revision';

export interface UserProgress {
  completed: Record<number, boolean>;
  completedAt: Record<number, string>; // ISO date strings
  revisions: Record<number, boolean>;
  notes: Record<number, string>;
}
