import React, { useState } from 'react';
import { Settings, X, Download, Upload, RotateCcw, Check } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults } = useLearning();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid || 'guest';

  const [userName, setUserName] = useState(settings.userName || 'Learner');
  const [autoPlayNext, setAutoPlayNext] = useState(settings.autoPlayNext ?? true);
  const [resumePosition, setResumePosition] = useState(settings.resumePosition ?? true);
  const [completionThreshold, setCompletionThreshold] = useState(settings.markCompleteThreshold || 90);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'Learner',
      autoPlayNext,
      resumePosition,
      markCompleteThreshold: Number(completionThreshold) || 90,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const key = dbService.getStorageKey(currentUserId);
    const raw = localStorage.getItem(key) || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-learn-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const validated = dbService.validateAndParseBackup(json);
      if (validated) {
        dbService.saveLocalUserData(currentUserId, validated);
        window.location.reload();
      } else {
        alert('Invalid backup file. Please select a valid FOCUS LEARN JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (confirm('Clear local cache and re-synchronize? Your progress will remain saved.')) {
      window.location.reload();
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#F4F0EA] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:bg-red-100 cursor-pointer"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b-2 border-black">
          <div className="w-10 h-10 bg-[#FFE600] text-black border-2 border-black rounded-lg flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">
              SETTINGS & PREFERENCES
            </h2>
            <p className="text-[11px] font-bold text-gray-600">
              Configure playback behavior, thresholds, profile, and backups.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          {/* User Profile */}
          <div className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000]">
            <label className="block text-xs font-black uppercase text-black mb-1">
              Your Name / Handle
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Aruchith"
              className="w-full bg-[#F4F0EA] border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          {/* Playback Settings */}
          <div className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000] space-y-3">
            <span className="text-xs font-black uppercase text-black">
              PLAYBACK BEHAVIOR
            </span>

            {/* Auto Play Next */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-black text-black">Auto-play next video</div>
                <div className="text-[10px] font-bold text-gray-500">
                  Automatically loads next playlist lesson upon completion
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(e) => setAutoPlayNext(e.target.checked)}
                className="w-5 h-5 accent-[#FFE600] cursor-pointer"
              />
            </label>

            {/* Resume Playback */}
            <label className="flex items-center justify-between cursor-pointer border-t border-gray-200 pt-2">
              <div>
                <div className="text-xs font-black text-black">Resume playback position</div>
                <div className="text-[10px] font-bold text-gray-500">
                  Resumes from saved timestamp when returning to a video
                </div>
              </div>
              <input
                type="checkbox"
                checked={resumePosition}
                onChange={(e) => setResumePosition(e.target.checked)}
                className="w-5 h-5 accent-[#FFE600] cursor-pointer"
              />
            </label>

            {/* Completion Threshold */}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-black text-black">Auto-complete threshold</div>
                <span className="text-xs font-mono font-black bg-[#A7F3D0] border border-black px-1.5 rounded">
                  {completionThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={completionThreshold}
                onChange={(e) => setCompletionThreshold(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                Automatically marks video COMPLETED when playback reaches this percentage.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess && (
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4 stroke-[3]" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>

        {/* Data Persistence & Backups */}
        <div className="border-t-2 border-black pt-4 space-y-3">
          <div className="text-xs font-black uppercase text-black">
            DATA MANAGEMENT & BACKUPS
          </div>
          <p className="text-[11px] font-medium text-gray-600">
            Export and import complete JSON backups of your playlists, videos, progress, and notes.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase hover:bg-gray-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase hover:bg-gray-100 cursor-pointer relative">
              <Upload className="w-4 h-4" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="w-full text-center text-xs font-bold text-gray-600 hover:text-black hover:underline cursor-pointer pt-1"
          >
            Clear Local Cache
          </button>
        </div>

        {/* Reset */}
        <div className="border-t-2 border-black pt-4 mt-4">
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="text-xs font-black uppercase text-red-600 hover:text-red-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Factory Defaults...</span>
            </button>
          ) : (
            <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg space-y-2">
              <p className="text-xs font-bold text-red-700">
                Are you sure? This will reload the default curriculums and reset viewing progress.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-600 text-white rounded font-black text-xs uppercase cursor-pointer"
                >
                  Yes, Reset Everything
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-1 bg-white border border-gray-400 rounded font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
