import React from 'react';
import { useApp } from '../context/AppContext';
import { CategoryType, AIModelType, DifficultyType } from '../types';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';

const CATEGORIES: (CategoryType | 'All')[] = [
  'All',
  'Marketing',
  'Content Creation',
  'SEO',
  'Business',
  'Research',
  'Coding',
  'Productivity',
  'Education',
  'Image Generation',
  'Video Generation',
  'Social Media',
  'AI Automation',
];

const MODELS: (AIModelType | 'All')[] = [
  'All',
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'Midjourney',
  'Ideogram',
  'Flux',
  'Runway',
];

const DIFFICULTIES: (DifficultyType | 'All')[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredPrompts } = useApp();

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.category !== 'All' ||
    filters.model !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.collectionFilter !== undefined;

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
      {/* Category Horizontal Scroll Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </span>
          {filters.category !== 'All' && (
            <button
              onClick={() => setFilters((f) => ({ ...f, category: 'All' }))}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilters((f) => ({ ...f, category: cat }))}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Select Filter Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
        {/* AI Model Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400">AI Model</label>
          <div className="relative">
            <select
              value={filters.model}
              onChange={(e) => setFilters((f) => ({ ...f, model: e.target.value }))}
              className="w-full appearance-none bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500/80"
            >
              {MODELS.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">
                  {m === 'All' ? 'All AI Models' : m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400">Difficulty</label>
          <div className="relative">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
              className="w-full appearance-none bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500/80"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-400">Sort By</label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sortBy: e.target.value as any }))
              }
              className="w-full appearance-none bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500/80"
            >
              <option value="popular" className="bg-slate-900 text-slate-200">Most Popular</option>
              <option value="rating" className="bg-slate-900 text-slate-200">Highest Rated</option>
              <option value="newest" className="bg-slate-900 text-slate-200">Newest Added</option>
              <option value="title" className="bg-slate-900 text-slate-200">Title (A-Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status / Reset */}
        <div className="flex items-end justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'Prompt' : 'Prompts'}
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800/60 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
