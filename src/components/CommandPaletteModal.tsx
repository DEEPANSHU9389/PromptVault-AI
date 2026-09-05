import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ViewMode, PromptItem } from '../types';
import {
  Search,
  Command,
  X,
  LayoutDashboard,
  Library,
  Bookmark,
  Star,
  User,
  FolderKanban,
  Plus,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    allPrompts,
    setSelectedPrompt,
    setViewMode,
    setIsCreateModalOpen,
    theme,
    toggleTheme,
  } = useApp();

  const [query, setQuery] = useState('');

  // Global keyboard shortcut listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const quickActions = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => setViewMode('dashboard') },
    { label: 'Go to Prompt Library', icon: Library, action: () => setViewMode('library') },
    { label: 'Go to Saved Prompts', icon: Bookmark, action: () => setViewMode('saved') },
    { label: 'Go to Favorites', icon: Star, action: () => setViewMode('favorites') },
    { label: 'Go to My Prompts', icon: User, action: () => setViewMode('my-prompts') },
    { label: 'Go to Collections', icon: FolderKanban, action: () => setViewMode('collections') },
    { label: 'Create New Prompt', icon: Plus, action: () => setIsCreateModalOpen(true) },
    {
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
  ];

  const matchingPrompts = query.trim()
    ? allPrompts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const handleSelectPrompt = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setIsCommandPaletteOpen(false);
  };

  const handleAction = (actionFn: () => void) => {
    actionFn();
    setIsCommandPaletteOpen(false);
  };

  return (
    <div
      onClick={() => setIsCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search prompts..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </span>
          )}
        </div>

        {/* Results Body */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-3">
          {/* Matching Prompts */}
          {matchingPrompts.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Matching Prompts ({matchingPrompts.length})
              </p>
              <div className="space-y-1">
                {matchingPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(prompt)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {prompt.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {prompt.category} • {prompt.models.join(', ')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation Actions */}
          <div>
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {query ? 'Navigation Commands' : 'Quick Actions'}
            </p>
            <div className="space-y-1">
              {quickActions
                .filter((a) => !query || a.label.toLowerCase().includes(query.toLowerCase()))
                .map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAction(act.action)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                          {act.label}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono text-[10px]">PromptVault Palette</span>
        </div>
      </div>
    </div>
  );
};
