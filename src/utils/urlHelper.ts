import { PracticePlatform, PracticeLinkItem } from '../types/dsa';

export function formatUrlTitle(url: string, platform: PracticePlatform): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, ''); // trim trailing slash
    const parts = path.split('/').filter(Boolean);

    if (platform === 'leetcode') {
      // leetcode.com/problems/<slug>/...
      const probIdx = parts.indexOf('problems');
      if (probIdx !== -1 && parts[probIdx + 1]) {
        return slugToTitle(parts[probIdx + 1]);
      }
    } else if (platform === 'hackerrank') {
      // hackerrank.com/challenges/<slug>/...
      const chalIdx = parts.indexOf('challenges');
      if (chalIdx !== -1 && parts[chalIdx + 1]) {
        return slugToTitle(parts[chalIdx + 1]);
      }
    } else if (platform === 'codechef') {
      // codechef.com/problems/<slug>
      const probIdx = parts.indexOf('problems');
      if (probIdx !== -1 && parts[probIdx + 1]) {
        return parts[probIdx + 1].toUpperCase();
      }
      if (parts.length > 0) {
        return parts[parts.length - 1].toUpperCase();
      }
    }

    if (parts.length > 0) {
      return slugToTitle(parts[parts.length - 1]);
    }
    return url;
  } catch {
    return url;
  }
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function parsePlatformLinks(urls: string[], platform: PracticePlatform): PracticeLinkItem[] {
  return urls
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && /^https?:\/\//i.test(u))
    .map((url) => {
      const label = formatUrlTitle(url, platform);
      return {
        platform,
        url,
        label,
        slug: label.toLowerCase().replace(/\s+/g, '-'),
      };
    });
}
