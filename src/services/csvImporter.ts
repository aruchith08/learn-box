import { extractYouTubeId } from './youtubeParser';
import { CSVImportPreview } from '../types/focusLearn';

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

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
      if (row.some((c) => c.length > 0)) lines.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((c) => c.length > 0)) lines.push(row);
  }

  return lines;
}

export function detectCSVColumns(headerRow: string[]): {
  urlIndex: number;
  titleIndex: number;
  topicIndex: number;
} {
  const normalized = headerRow.map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));

  // 1. Detect URL column
  let urlIndex = normalized.findIndex((h) =>
    ['url', 'youtubeurl', 'link', 'youtubelink', 'videourl', 'videolink'].includes(h)
  );
  if (urlIndex === -1) {
    urlIndex = normalized.findIndex((h) => h.includes('url') || h.includes('link'));
  }
  if (urlIndex === -1 && headerRow.length >= 2) {
    urlIndex = 1;
  }

  // 2. Detect Title column
  let titleIndex = normalized.findIndex((h) =>
    ['title', 'videotitle', 'name', 'videoname', 'topicname', 'lecture'].includes(h)
  );
  if (titleIndex === -1) {
    titleIndex = normalized.findIndex((h) => h.includes('title') || h.includes('name'));
  }
  if (titleIndex === -1) {
    titleIndex = 0;
  }

  // 3. Detect Topic / Category column
  let topicIndex = normalized.findIndex((h) =>
    ['topic', 'category', 'module', 'section', 'chapter'].includes(h)
  );

  return { urlIndex, titleIndex, topicIndex };
}

export function generateCSVPreview(
  csvText: string,
  playlistName: string,
  creator: string,
  existingYouTubeIds: Set<string>
): CSVImportPreview {
  const parsed = parseCSV(csvText);
  if (parsed.length === 0) {
    return {
      playlistName,
      creator,
      color: '#FEF08A',
      totalFound: 0,
      validUrls: 0,
      duplicates: 0,
      videos: [],
    };
  }

  const header = parsed[0];
  const dataRows = parsed.slice(1);
  const { urlIndex, titleIndex, topicIndex } = detectCSVColumns(header);

  let validUrls = 0;
  let duplicates = 0;
  const videos: CSVImportPreview['videos'] = [];
  const seenInCSV = new Set<string>();

  dataRows.forEach((row, idx) => {
    const rawUrl = row[urlIndex] || '';
    const rawTitle = row[titleIndex] || `Video ${idx + 1}`;
    const rawTopic = topicIndex !== -1 ? row[topicIndex] : undefined;

    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) return;

    validUrls++;

    if (existingYouTubeIds.has(youtubeId) || seenInCSV.has(youtubeId)) {
      duplicates++;
    } else {
      seenInCSV.add(youtubeId);
    }

    videos.push({
      title: rawTitle.replace(/^["']|["']$/g, '').trim(),
      youtubeUrl: rawUrl.trim(),
      youtubeId,
      topic: rawTopic?.trim(),
    });
  });

  return {
    playlistName,
    creator,
    color: '#FEF08A',
    totalFound: dataRows.length,
    validUrls,
    duplicates,
    videos,
  };
}

export const parseCSVText = (text: string) => {
  const rows = parseCSV(text);
  return { rows };
};

export function generateImportPreview(dataRows: string[][], existingYouTubeIds: Set<string>) {
  if (dataRows.length === 0) {
    return {
      totalRows: 0,
      newVideosCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      videos: [] as Array<{ youtubeId: string; title: string; topic?: string; isDuplicate: boolean }>
    };
  }

  const header = dataRows[0];
  const body = dataRows.slice(1);
  const { urlIndex, titleIndex, topicIndex } = detectCSVColumns(header);

  let duplicateCount = 0;
  let invalidCount = 0;
  const videos: Array<{ youtubeId: string; title: string; topic?: string; isDuplicate: boolean }> = [];
  const seenInImport = new Set<string>();

  body.forEach((row, idx) => {
    const rawUrl = row[urlIndex] || '';
    const rawTitle = row[titleIndex] || `Video ${idx + 1}`;
    const rawTopic = topicIndex !== -1 ? row[topicIndex] : undefined;

    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) {
      invalidCount++;
      return;
    }

    const isDuplicate = existingYouTubeIds.has(youtubeId) || seenInImport.has(youtubeId);
    if (isDuplicate) {
      duplicateCount++;
    } else {
      seenInImport.add(youtubeId);
    }

    videos.push({
      youtubeId,
      title: rawTitle.replace(/^["']|["']$/g, '').trim(),
      topic: rawTopic?.trim(),
      isDuplicate
    });
  });

  return {
    totalRows: body.length,
    newVideosCount: videos.length - duplicateCount,
    duplicateCount,
    invalidCount,
    videos
  };
}
