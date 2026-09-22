import React, { useState } from 'react';
import { Settings, X, Download, Upload, RotateCcw, Check } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';
import { exportBackupJSON, importBackupJSON } from '../../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults } = useLearning();

  const [userName, setUserName] = useState(settings.userName);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'Learner',
      dailyGoalMinutes: Number(dailyGoalMinutes) || 120
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
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
      const success = importBackupJSON(json);
      if (success) {
        window.location.reload();
      } else {
        alert('Failed to restore backup: Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
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

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-black text-[#FFE600] border-2 border-black rounded-lg flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">
              SETTINGS & DATA
            </h2>
            <p className="text-[11px] font-bold text-gray-600">
              Customize your learning environment and manage your backups.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="600"
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess && (
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4 stroke-[3]" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-1.5 bg-[#FFE600] border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Data Backup & Restore */}
        <div className="border-t-2 border-black pt-4 space-y-3">
          <div className="text-xs font-black uppercase text-black">
            DATA PERSISTENCE & LOCAL BACKUPS
          </div>
          <p className="text-[11px] font-medium text-gray-600">
            All your playlists, videos, progress, and timestamped notes are saved locally in your browser.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase hover:bg-gray-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-black uppercase hover:bg-gray-100 cursor-pointer relative">
              <Upload className="w-4 h-4" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="border-t-2 border-black pt-4 mt-4">
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="text-xs font-black uppercase text-red-600 hover:text-red-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default 7 Curriculums...</span>
            </button>
          ) : (
            <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg space-y-2">
              <p className="text-xs font-bold text-red-700">
                Are you sure? This will reload the 7 default course playlists and restore initial state.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-600 text-white rounded font-black text-xs uppercase"
                >
                  Yes, Reset Everything
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-1 bg-white border border-gray-400 rounded font-bold text-xs uppercase"
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
