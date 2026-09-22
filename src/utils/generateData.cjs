const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../Links_DSA___Abdul_Bari.csv');
const rawContent = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let current = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(current.trim());
      if (row.some(c => c.length > 0)) lines.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(c => c.length > 0)) lines.push(row);
  }
  return lines;
}

const parsed = parseCSV(rawContent);
const header = parsed[0];
const dataRows = parsed.slice(1);

console.log(`Parsed ${dataRows.length} data rows from CSV.`);

function determineCategory(title) {
  const t = title.toLowerCase();
  
  // Specific checks first
  if (t.includes('java')) return 'Java Core';
  if (t.includes('kmp') || t.includes('rabin-karp') || t.includes('string matching')) return 'Strings';
  if (t.includes('avl tree') || t.includes('b tree') || t.includes('b+ tree') || t.includes('binary tree')) return 'Trees & BST';
  if (t.includes('heap') || t.includes('priority queue')) return 'Heaps';
  if (t.includes('mergesort') || t.includes('merge sort') || t.includes('quicksort') || t.includes('quick sort')) return 'Sorting';
  if (t.includes('binary search')) return 'Binary Search';
  if (t.includes('branch and bound')) return 'Branch & Bound';
  if (t.includes('backtracking') || t.includes('n queens') || t.includes('sum of subsets') || t.includes('graph coloring') || t.includes('hamiltonian cycle')) return 'Backtracking';
  if (t.includes('np-hard') || t.includes('np-complete') || t.includes('clique')) return 'NP-Completeness';
  if (t.includes('dynamic programming') || t.includes('0/1 knapsack') || t.includes('matrix chain') || t.includes('optimal binary search') || t.includes('longest common subsequence') || t.includes('lcs') || t.includes('traveling sales') || t.includes('traveling salesperson') || t.includes('reliability design') || t.includes('multistage graph') || t.includes('principle  of optimality') || t.includes('principle of optimality')) {
    return 'Dynamic Programming';
  }
  if (t.includes('greedy') || t.includes('job sequencing') || t.includes('optimal merge') || t.includes('huffman') || t.includes('prims') || t.includes('kruskal') || t.includes('dijkstra')) {
    return 'Greedy';
  }
  if (t.includes('graph') || t.includes('bfs') || t.includes('dfs') || t.includes('articulation') || t.includes('biconnected') || t.includes('bellman') || t.includes('shortest path') || t.includes('disjoint set')) {
    return 'Graphs';
  }
  if (t.includes('divide and conquer') || t.includes('recurrence relation') || t.includes('master') || t.includes('root function') || t.includes('strassen')) {
    return 'Divide & Conquer';
  }
  if (t.includes('tower of hanoi')) return 'Recursion';
  if (t.includes('row-major') || t.includes('column-major') || t.includes('matrix')) return 'Arrays';
  if (t.includes('hashing')) return 'Hashing';
  if (t.includes('bresenham') || t.includes('dda')) return 'Mathematical & Graphics';
  
  return 'Fundamentals';
}

function determineDifficulty(title, category) {
  const t = title.toLowerCase();
  
  // Hard algorithms
  if (
    category === 'Branch & Bound' ||
    category === 'NP-Completeness' ||
    t.includes('matrix chain') ||
    t.includes('traveling sales') ||
    t.includes('clique') ||
    t.includes('biconnected') ||
    t.includes('optimal binary search tree') ||
    t.includes('kmp') ||
    t.includes('rabin-karp') ||
    t.includes('hamiltonian') ||
    t.includes('strassen')
  ) {
    return 'Hard';
  }

  // Easy introductory and fundamental topics
  if (
    category === 'Java Core' ||
    t.includes('introduction') ||
    t.includes('priori') ||
    t.includes('characteristics') ||
    t.includes('how write') ||
    t.includes('frequency count') ||
    t.includes('classes of functions') ||
    t.includes('simplified') ||
    t.includes('tower of hanoi') ||
    t.includes('row-major') ||
    t.includes('binary search iterative')
  ) {
    return 'Easy';
  }

  // Default to Medium for core algorithms (MergeSort, QuickSort, Knapsack, Trees, BFS, DFS, Dijkstra, Prims, etc.)
  return 'Medium';
}

function cleanTitleAndIndex(rawTitle) {
  // e.g. "1. Introduction to Algorithms" -> index: "1.", clean: "Introduction to Algorithms"
  // e.g. "2.6.3 Heap - Heap Sort..." -> index: "2.6.3", clean: "Heap - Heap Sort..."
  const match = rawTitle.match(/^(\d+(\.\d+)*\.?)\s*(.*)$/);
  if (match) {
    return {
      index: match[1].replace(/\.$/, ''),
      cleanTitle: match[3].trim()
    };
  }
  return {
    index: '',
    cleanTitle: rawTitle.trim()
  };
}

const problems = dataRows.map((row, idx) => {
  const id = idx + 1;
  const rawTitle = row[0] || `Problem ${id}`;
  const videoUrl = row[1] || '';
  
  const hackerrank = (row[2] || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && /^https?:\/\//i.test(s));

  const leetcode = (row[3] || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && /^https?:\/\//i.test(s));

  const codechef = (row[4] || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && /^https?:\/\//i.test(s));

  const category = determineCategory(rawTitle);
  const difficulty = determineDifficulty(rawTitle, category);
  const { index, cleanTitle } = cleanTitleAndIndex(rawTitle);

  return {
    id,
    originalIndex: index,
    title: rawTitle,
    cleanTitle: cleanTitle || rawTitle,
    videoUrl,
    hackerRank: hackerrank,
    leetCode: leetcode,
    codeChef: codechef,
    category,
    difficulty
  };
});

// Calculate category statistics
const categoryCounts = {};
problems.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});

console.log('Category Counts:', categoryCounts);

// Generate TypeScript files
const tsCode = `import { DSAProblem } from '../types/dsa';

export const ABDUL_BARI_PROBLEMS: DSAProblem[] = ${JSON.stringify(problems, null, 2)};
`;

const categoriesList = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    count
  }));

const categoriesCode = `import { TopicCategory } from '../types/dsa';

export const TOPIC_CATEGORIES: TopicCategory[] = ${JSON.stringify(categoriesList, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../data/abdulBariData.ts'), tsCode);
fs.writeFileSync(path.resolve(__dirname, '../data/topicCategories.ts'), categoriesCode);

console.log('Successfully written abdulBariData.ts and topicCategories.ts!');
