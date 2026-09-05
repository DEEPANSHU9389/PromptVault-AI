import React from 'react';
import { useApp } from '../../context/AppContext';
import { FEATURED_COLLECTIONS } from '../../data/initialPrompts';
import { FolderKanban, ArrowRight, Sparkles, TrendingUp, Code, Zap } from 'lucide-react';

export const CollectionsView: React.FC = () => {
  const { setFilters, setViewMode } = useApp();

  const handleSelectCollection = (collectionId: string) => {
    setFilters((prev) => ({
      ...prev,
      collectionFilter: collectionId,
      category: 'All',
    }));
    setViewMode('library');
  };

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return TrendingUp;
      case 'Code':
        return Code;
      case 'Sparkles':
        return Sparkles;
      case 'Zap':
        return Zap;
      default:
        return FolderKanban;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FolderKanban className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Curated Collections</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Hand-picked prompt toolkits organized for specific professional workflows.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURED_COLLECTIONS.map((col) => {
          const Icon = getCollectionIcon(col.iconName);
          return (
            <div
              key={col.id}
              onClick={() => handleSelectCollection(col.id)}
              className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`p-3 rounded-xl border ${col.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {col.promptCount} Prompts
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{col.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
