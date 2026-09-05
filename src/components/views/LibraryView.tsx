import React from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../FilterBar';
import { PromptGrid } from '../PromptGrid';
import { Bookmark, Star, User, Library, Sparkles, Plus } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { viewMode, filteredPrompts, resetFilters, setIsCreateModalOpen } = useApp();

  let pageTitle = 'Prompt Library';
  let pageSubtitle = 'Discover high-quality prompts for every AI workflow.';
  let Icon = Library;

  if (viewMode === 'saved') {
    pageTitle = 'Saved Prompts';
    pageSubtitle = 'Quick access to all prompts saved in your personal vault.';
    Icon = Bookmark;
  } else if (viewMode === 'favorites') {
    pageTitle = 'Favorite Prompts';
    pageSubtitle = 'Your starred prompts for daily productivity and recurring tasks.';
    Icon = Star;
  } else if (viewMode === 'my-prompts') {
    pageTitle = 'My Custom Prompts';
    pageSubtitle = 'Custom prompts you have authored and saved locally.';
    Icon = User;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Icon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{pageTitle}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{pageSubtitle}</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Prompt</span>
        </button>
      </div>

      {/* Filter Controls */}
      <FilterBar />

      {/* Prompt Grid Results */}
      <PromptGrid
        prompts={filteredPrompts}
        emptyTitle={
          viewMode === 'saved'
            ? 'No saved prompts yet'
            : viewMode === 'favorites'
            ? 'No favorite prompts yet'
            : viewMode === 'my-prompts'
            ? 'No custom prompts created yet'
            : 'No matching prompts found'
        }
        emptyDescription={
          viewMode === 'saved'
            ? 'Click the bookmark icon on any prompt card to save it here.'
            : viewMode === 'favorites'
            ? 'Click the star icon on any prompt to add it to your favorites.'
            : viewMode === 'my-prompts'
            ? 'Click "Create Prompt" to write and save your first custom prompt template.'
            : 'Try adjusting your search query, model, or category filters.'
        }
        onResetFilters={resetFilters}
      />
    </div>
  );
};
