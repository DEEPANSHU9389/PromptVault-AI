import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../StatsCard';
import { PromptCard } from '../PromptCard';
import { CategoryCard } from '../CategoryCard';
import { CategoryType } from '../../types';
import {
  Library,
  Bookmark,
  Star,
  User,
  Sparkles,
  Wand2,
  TrendingUp,
  Flame,
  Plus,
  ArrowRight,
  Zap,
  Shield,
  FileText
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    stats,
    globalPrompts,
    setViewMode,
    setIsCreateModalOpen,
  } = useApp();

  // Strictly global library prompts (excluding drafts & scheduled)
  const libraryPrompts = globalPrompts.filter((p) => p.status !== 'draft' && p.status !== 'scheduled');

  // Trending Prompts (sorted by usage count)
  const trendingPrompts = [...libraryPrompts]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 3);

  // Recently Used / Highest Rated
  const recentlyUsedPrompts = [...libraryPrompts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  // Popular Categories
  const popularCategories: { category: CategoryType; count: number }[] = [
    {
      category: 'Marketing',
      count: libraryPrompts.filter((p) => p.category === 'Marketing').length,
    },
    {
      category: 'Coding',
      count: libraryPrompts.filter((p) => p.category === 'Coding').length,
    },
    {
      category: 'Image Generation',
      count: libraryPrompts.filter((p) => p.category === 'Image Generation').length,
    },
    {
      category: 'SEO',
      count: libraryPrompts.filter((p) => p.category === 'SEO').length,
    },
    {
      category: 'Productivity',
      count: libraryPrompts.filter((p) => p.category === 'Productivity').length,
    },
    {
      category: 'AI Automation',
      count: libraryPrompts.filter((p) => p.category === 'AI Automation').length,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              Stage 2: Production-Ready Multi-User SaaS Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              PromptVault AI Daily Workflows
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Upload tested daily custom prompts to your live Firestore library or use the Admin Bulk Importer.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode('admin')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin CMS</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Create Prompt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Prompts"
          value={stats.totalPrompts}
          description="Live in Firestore library"
          icon={Library}
          gradient="bg-cyan-500"
          onClick={() => setViewMode('library')}
        />
        <StatsCard
          title="Saved Prompts"
          value={stats.savedPromptsCount}
          description="Saved to quick library"
          icon={Bookmark}
          gradient="bg-blue-500"
          onClick={() => setViewMode('saved')}
        />
        <StatsCard
          title="Favorites"
          value={stats.favoritesCount}
          description="Starred for daily workflow"
          icon={Star}
          gradient="bg-amber-500"
          onClick={() => setViewMode('favorites')}
        />
        <StatsCard
          title="My Prompts"
          value={stats.myPromptsCount}
          description="Custom user templates"
          icon={User}
          gradient="bg-purple-500"
          onClick={() => setViewMode('my-prompts')}
        />
      </div>

      {/* Quick Actions Row */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Workflow Tools
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Create Prompt</p>
              <p className="text-[11px] text-slate-400">Add daily custom prompt</p>
            </div>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Admin Bulk Import</p>
              <p className="text-[11px] text-slate-400">Batch upload JSON/CSV</p>
            </div>
          </button>

          <button
            onClick={() => setViewMode('builder')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Build a Prompt</p>
              <p className="text-[11px] text-slate-400">Interactive framework</p>
            </div>
          </button>

          <button
            onClick={() => setViewMode('optimizer')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-left transition-colors group"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Optimize Prompt</p>
              <p className="text-[11px] text-slate-400">AI quality enhancement</p>
            </div>
          </button>
        </div>
      </div>

      {/* Prompts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Global Library Prompts ({libraryPrompts.length})</h2>
          </div>
          <button
            onClick={() => setViewMode('library')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {libraryPrompts.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Prompt Library is Empty & Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                You have started with 0 initial prompts as requested. Click "+ Create Prompt" to publish your first tested daily prompt, or use Admin Bulk Importer to populate 5 production samples in 1 click!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Create Daily Prompt</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Bulk Importer</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Taxonomy & Categories</h2>
          <button
            onClick={() => setViewMode('library')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCategories.map((cat) => (
            <CategoryCard key={cat.category} category={cat.category} count={cat.count} />
          ))}
        </div>
      </div>
    </div>
  );
};
