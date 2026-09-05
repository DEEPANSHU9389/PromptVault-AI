import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { PromptCard } from './PromptCard';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface PromptGridProps {
  prompts: PromptItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  pageSize?: number;
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  emptyTitle = 'No prompts found',
  emptyDescription = 'Try adjusting your search terms or filter criteria.',
  onResetFilters,
  pageSize = 9,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever prompts array changes
  useEffect(() => {
    setCurrentPage(1);
  }, [prompts.length]);

  if (prompts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onReset={onResetFilters}
      />
    );
  }

  const totalPages = Math.ceil(prompts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePrompts = prompts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visiblePrompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>
              Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
              <strong className="text-white">
                {Math.min(startIndex + pageSize, prompts.length)}
              </strong>{' '}
              of <strong className="text-white">{prompts.length}</strong> prompts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-slate-300 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

