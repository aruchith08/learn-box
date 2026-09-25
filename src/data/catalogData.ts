export interface CatalogItem {
  id: string;
  title: string;
  platform: string;
  url: string;
  domain: string;
  icon: string;
  fallbackIcon?: string;
  bgColor: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  // HackerRank items
  {
    id: 'hr-algorithms',
    title: 'Algorithms',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/algorithms',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7', // Pastel Mint
  },
  {
    id: 'hr-data-structures',
    title: 'Data Structures',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/data-structures',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-ai',
    title: 'AI',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/ai',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-java',
    title: 'Java',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/java',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-python',
    title: 'Python',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/python',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-react',
    title: 'React',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/react',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-sql',
    title: 'SQL',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/sql',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },
  {
    id: 'hr-databases',
    title: 'Databases',
    platform: 'HackerRank',
    url: 'https://www.hackerrank.com/domains/databases',
    domain: 'hackerrank.com',
    icon: 'https://www.google.com/s2/favicons?domain=hackerrank.com&sz=128',
    bgColor: '#DCFCE7',
  },

  // CodeChef
  {
    id: 'cc-programming-languages',
    title: 'Programming Languages',
    platform: 'CodeChef',
    url: 'https://www.codechef.com/practice#programming-languages',
    domain: 'codechef.com',
    icon: 'https://www.google.com/s2/favicons?domain=codechef.com&sz=128',
    bgColor: '#FFEDD5', // Pastel Peach
  },

  // GeeksforGeeks
  {
    id: 'gfg-75-problems',
    title: 'Most Asked 75 Coding Problems',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/blogs/most-asked-75-coding-problems/',
    domain: 'geeksforgeeks.org',
    icon: '/geeksforgeeks-logo.png',
    bgColor: '#D1FAE5', // Pastel Emerald
  },
  {
    id: 'gfg-explore',
    title: 'Explore',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/explore',
    domain: 'geeksforgeeks.org',
    icon: '/geeksforgeeks-logo.png',
    bgColor: '#D1FAE5',
  },
  {
    id: 'gfg-competitive-programming',
    title: 'Competitive Programming',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/dsa/competitive-programming-cp-handbook-with-complete-roadmap/',
    domain: 'geeksforgeeks.org',
    icon: '/geeksforgeeks-logo.png',
    bgColor: '#D1FAE5',
  },

  // Unstop
  {
    id: 'unstop-100-days-code',
    title: '100 Days of Code',
    platform: 'Unstop',
    url: 'https://unstop.com/practice/100-days-of-code',
    domain: 'unstop.com',
    icon: 'https://www.google.com/s2/favicons?domain=unstop.com&sz=128',
    bgColor: '#DBEAFE', // Pastel Sky
  },
  {
    id: 'unstop-coding',
    title: 'Coding',
    platform: 'Unstop',
    url: 'https://unstop.com/practice/coding',
    domain: 'unstop.com',
    icon: 'https://www.google.com/s2/favicons?domain=unstop.com&sz=128',
    bgColor: '#DBEAFE',
  },

  // BossCoder Academy
  {
    id: 'bosscoder-interview-guides',
    title: 'Interview Guides',
    platform: 'BossCoder Academy',
    url: 'https://www.bosscoderacademy.com/interview-guides',
    domain: 'bosscoderacademy.com',
    icon: 'https://www.google.com/s2/favicons?domain=bosscoderacademy.com&sz=128',
    bgColor: '#EDE9FE', // Pastel Lavender
  },
  {
    id: 'bosscoder-practice-test',
    title: 'Practice Test',
    platform: 'BossCoder Academy',
    url: 'https://www.bosscoderacademy.com/practice-test',
    domain: 'bosscoderacademy.com',
    icon: 'https://www.google.com/s2/favicons?domain=bosscoderacademy.com&sz=128',
    bgColor: '#EDE9FE',
  },

  // Abdul Bari
  {
    id: 'abdulbari-arh',
    title: 'Abdul Bari ARH',
    platform: 'Abdul Bari',
    url: 'https://abdulbari-arh.vercel.app/',
    domain: 'abdulbari-arh.vercel.app',
    icon: '/abdul-bari-logo.png',
    fallbackIcon: '/abdul-bari.png',
    bgColor: '#FFFFFF', // Clean white background for dark metallic badge
  },

  // Apna College
  {
    id: 'apna-dsa',
    title: 'DSA',
    platform: 'Apna College',
    url: 'https://dsa.apnacollege.in/',
    domain: 'dsa.apnacollege.in',
    icon: '/apna-college-logo.png',
    bgColor: '#FFFBEB', // Light warm tint to complement orange/black brand
  },
  {
    id: 'apna-dp-sheet',
    title: 'DP Sheet',
    platform: 'Apna College',
    url: 'https://dsa.apnacollege.in/sheet/dp-sheet',
    domain: 'dsa.apnacollege.in',
    icon: '/apna-college-logo.png',
    bgColor: '#FFFBEB',
  },

  // LeetCode
  {
    id: 'leetcode-striver-sde-sheet',
    title: 'Striver SDE Sheet',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problem-list/eeudwo2i/',
    domain: 'leetcode.com',
    icon: '/leetcode-logo.png',
    fallbackIcon: 'https://www.google.com/s2/favicons?domain=leetcode.com&sz=128',
    bgColor: '#FEF3C7', // Pastel Amber
  },

  // AWS
  {
    id: 'aws-skill-builder',
    title: 'Skill Builder',
    platform: 'AWS',
    url: 'https://explore.skillbuilder.aws/',
    domain: 'skillbuilder.aws',
    icon: 'https://www.google.com/s2/favicons?domain=skillbuilder.aws&sz=128',
    fallbackIcon: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
    bgColor: '#FFEDD5', // Pastel Peach
  },

  // Microsoft Learn
  {
    id: 'msft-learn-training',
    title: 'Microsoft Learn',
    platform: 'Microsoft',
    url: 'https://learn.microsoft.com/en-gb/training/?source=learn',
    domain: 'learn.microsoft.com',
    icon: 'https://www.google.com/s2/favicons?domain=learn.microsoft.com&sz=128',
    bgColor: '#DBEAFE', // Pastel Sky Blue
  },

  // Google Skills
  {
    id: 'google-skills',
    title: 'Google Skills',
    platform: 'Google',
    url: 'https://www.skills.google/',
    domain: 'skills.google',
    icon: 'https://www.google.com/s2/favicons?domain=skills.google&sz=128',
    fallbackIcon: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128',
    bgColor: '#F3E8FF', // Pastel Lavender
  },

  // Infosys Springboard
  {
    id: 'infosys-springboard',
    title: 'Springboard',
    platform: 'Infosys',
    url: 'https://infyspringboard.onwingspan.com/web/en/page/home',
    domain: 'infyspringboard.onwingspan.com',
    icon: '/infosys-springboard-logo.png',
    fallbackIcon: 'https://www.google.com/s2/favicons?domain=infosys.com&sz=128',
    bgColor: '#E0F2FE', // Pastel Cyan
  },

  // Forage
  {
    id: 'forage-job-simulations',
    title: 'Job Simulations',
    platform: 'Forage',
    url: 'https://www.theforage.com/dashboard',
    domain: 'theforage.com',
    icon: 'https://www.google.com/s2/favicons?domain=theforage.com&sz=128',
    bgColor: '#CCFBF1', // Pastel Mint / Teal
  },
];
