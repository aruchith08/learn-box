import React, { useState } from 'react';
import { Upload, X, CheckCircle2, FileText, Plus, Check } from '../common/focusIcons';
import { parseCSVText, generateImportPreview } from '../../services/csvImporter';
import { useLearning } from '../../context/LearningContext';
import { CSVImportPreview } from '../../types/focusLearn';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { allVideos, importPlaylistFromCSV } = useLearning();

  const [playlistTitle, setPlaylistTitle] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof generateImportPreview> | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!playlistTitle) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/Links_/i, '')
        .replace(/_+/g, ' ')
        .trim();
      setPlaylistTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      updatePreview(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvContent(text);
    if (text.trim()) {
      updatePreview(text);
    } else {
      setPreview(null);
    }
  };

  const updatePreview = (text: string) => {
    const parsed = parseCSVText(text);
    const existingIds = new Set(allVideos.map((v) => v.youtubeId));
    const p = generateImportPreview(parsed.rows, existingIds);
    setPreview(p);
  };

  const handleImport = () => {
    if (!preview || !playlistTitle.trim()) return;

    const videosToImport = skipDuplicates
      ? preview.videos.filter((v) => !v.isDuplicate)
      : preview.videos;

    importPlaylistFromCSV(
      playlistTitle.trim(),
      videosToImport.map((v) => ({
        youtubeId: v.youtubeId,
        title: v.title,
        topic: v.topic,
        category: playlistTitle.trim(),
        duration: '20:00',
      }))
    );

    // Reset & close
    setCsvContent('');
    setPreview(null);
    setPlaylistTitle('');
    setFileName('');
    onClose();
  };

  const validVideosCount = preview
    ? preview.videos.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-red-100 cursor-pointer"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#A7F3D0] text-black px-2 py-0.5 rounded border border-black">
            CSV PLAYLIST IMPORTER
          </span>
          <h2 className="text-xl font-black text-black uppercase tracking-tight mt-1">
            IMPORT PLAYLIST FROM CSV
          </h2>
          <p className="text-xs font-bold text-gray-600 mt-0.5">
            Flexible URL column detection (URL, Link, YouTube URL, Video URL).
          </p>
        </div>

        <div className="space-y-4">
          {/* Playlist Title */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Playlist Title *
            </label>
            <input
              type="text"
              required
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              placeholder="e.g. Java + DSA in 30 Days"
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          {/* Upload Box */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Upload CSV File
            </label>
            <div className="border-3 border-dashed border-black rounded-xl p-4 bg-white text-center hover:bg-yellow-50/50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-6 h-6 mx-auto text-black mb-1" />
              <div className="text-xs font-black uppercase text-black">
                {fileName ? fileName : 'Choose CSV file or drag & drop here'}
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                Columns supported: URL, Link, YouTube URL, Video URL, Title, Topic
              </div>
            </div>
          </div>

          {/* Raw Text area fallback */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Or Paste Raw CSV Data
            </label>
            <textarea
              value={csvContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="URL,Title,Topic&#10;https://www.youtube.com/watch?v=xyz,Introduction to Trees,Trees"
              rows={3}
              className="w-full bg-white border-2 border-black rounded-lg p-2.5 text-xs font-mono shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600] resize-none"
            />
          </div>

          {/* Live Preview Audit Card matching prompt specification */}
          {preview && (
            <div className="bg-white border-3 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  IMPORT PREVIEW
                </span>
                <span className="text-xs font-black text-black bg-[#FEF08A] border border-black px-2 py-0.5 rounded">
                  {playlistTitle.trim() || 'Untitled Playlist'}
                </span>
              </div>

              {/* Exact summary lines requested by prompt */}
              <div className="bg-[#F4F0EA] border-2 border-black rounded-lg p-3 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Playlist:</span>
                  <span className="font-black text-black">{playlistTitle.trim() || 'Untitled Playlist'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Total rows:</span>
                  <span className="font-black text-black">{preview.totalRows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-700">Valid videos:</span>
                  <span className="font-black text-emerald-800">{validVideosCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-700">Duplicates:</span>
                  <span className="font-black text-red-800">{preview.duplicateCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">Invalid / Skipped:</span>
                  <span className="font-black text-gray-700">{preview.invalidCount}</span>
                </div>
              </div>

              {/* Deduplication option toggle */}
              {preview.duplicateCount > 0 && (
                <label className="flex items-center gap-2 p-2 bg-[#FEF08A] border-2 border-black rounded-lg text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <span>
                    Skip {preview.duplicateCount} duplicate video(s) already present in library
                  </span>
                </label>
              )}

              {/* Sample list */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {preview.videos.slice(0, 10).map((v, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-1.5 rounded border text-[11px] font-bold ${
                      v.isDuplicate
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  >
                    <span className="truncate max-w-sm">
                      {i + 1}. {v.title}
                    </span>
                    <span className="text-[10px] font-mono shrink-0 ml-2">
                      {v.isDuplicate ? 'DUPLICATE' : 'READY'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!preview || preview.videos.length === 0 || !playlistTitle.trim()}
              className="px-5 py-2 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Import Playlist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
