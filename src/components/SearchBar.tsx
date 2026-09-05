import React from 'react';
import { Search, X, Command } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showShortcut?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search prompts by title, tags, models, or content...',
  showShortcut = true,
}) => {
  const { setIsCommandPaletteOpen } = useApp();

  return (
    <div className="relative flex items-center w-full group">
      <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-20 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-xl transition-all shadow-inner"
      />

      <div className="absolute right-3 flex items-center gap-1.5">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : showShortcut ? (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-800 bg-slate-800/60 text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
            title="Open Command Palette"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
