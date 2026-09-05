import React from 'react';
import { SearchX, RefreshCw, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No prompts found',
  description = 'We couldn\'t find any prompts matching your current search or filter criteria.',
  onReset,
}) => {
  const { resetFilters, setIsCreateModalOpen } = useApp();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      resetFilters();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 backdrop-blur-sm my-6">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-indigo-400 mb-4 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Prompt
        </button>
      </div>
    </div>
  );
};
