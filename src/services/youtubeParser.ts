/**
 * YouTube URL and Metadata Utilities
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // Handle standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = clean.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  return null;
}

export function getYouTubeThumbnail(youtubeId: string): string {
  if (!youtubeId) return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80';
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function parseYouTubeUrl(url: string) {
  const youtubeId = extractYouTubeId(url);
  return {
    isValid: !!youtubeId,
    youtubeId: youtubeId || '',
    thumbnailUrl: youtubeId ? getYouTubeThumbnail(youtubeId) : ''
  };
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);

  if (hours > 0) {
    const remMins = mins % 60;
    return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseFormattedTime(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function cleanVideoTitle(raw: string): string {
  let cleaned = (raw || '').trim().replace(/^["']|["']$/g, '');

  // Strip common YouTube fluff
  cleaned = cleaned
    .replace(/\|\s*Love Babbar/gi, '')
    .replace(/\|\s*Abdul Bari/gi, '')
    .replace(/\|\s*FreeCodeCamp/gi, '')
    .replace(/\[Hindi\]/gi, '')
    .trim();

  return cleaned;
}
