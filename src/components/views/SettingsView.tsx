import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Sun,
  Moon,
  Trash2,
  Download,
  RotateCcw,
  ShieldCheck,
  Zap,
  Lock,
  FileText,
  Database,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, addToast, userPrompts, allPrompts, setViewMode } = useApp();

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userPrompts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'promptvault_user_prompts_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Data Exported!', 'success', 'Exported your custom prompts JSON backup');
  };

  const handleExportFullLibrary = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allPrompts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'promptvault_full_library_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Full Library Exported!', 'success', `Exported ${allPrompts.length} total prompts backup`);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to reset local storage? This will clear saved bookmarks and custom prompts.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage application theme, security backups, legal documentation, and data persistence.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Appearance & Theme
        </h3>
        <p className="text-xs text-slate-400">
          Choose your visual preference. Dark mode is optimized for low-light SaaS engineering environments.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs">Dark First</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              theme === 'light'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs">Light Mode</span>
          </button>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Backup Strategy & Data Export
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Safely backup your prompt vaults into standard JSON format. Cloud documents are continuously synchronized with Firebase Firestore.
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export My Custom Prompts (JSON)</span>
          </button>

          <button
            onClick={handleExportFullLibrary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Full Library ({allPrompts.length} Prompts)</span>
          </button>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Local Cache</span>
          </button>
        </div>
      </div>

      {/* Legal & Compliance Section */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Legal & Compliance
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Review our terms of acceptable use and data protection policies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setViewMode('privacy')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </p>
                <p className="text-[10px] text-slate-400">Data retention & security</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>

          <button
            onClick={() => setViewMode('terms')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Terms of Service
                </p>
                <p className="text-[10px] text-slate-400">Acceptable use & AI guidelines</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            System & Engine Info
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Engine Version</p>
            <p className="font-bold text-slate-200">PromptVault v1.4.0</p>
          </div>
          <div>
            <p className="text-slate-500">Gemini AI API</p>
            <p className="font-bold text-emerald-400">Server Side Active</p>
          </div>
          <div>
            <p className="text-slate-500">Storage Engine</p>
            <p className="font-bold text-indigo-400">Firestore & Local Cache</p>
          </div>
        </div>
      </div>
    </div>
  );
};

