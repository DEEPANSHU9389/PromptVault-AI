import React, { useState } from 'react';
import { PromptItem, AIModelType } from '../types';
import { useApp } from '../context/AppContext';
import {
  Bookmark,
  Star,
  Copy,
  Check,
  Eye,
  Sparkles,
  Zap,
  Bot,
  Flame,
  Award,
  Cpu,
} from 'lucide-react';

interface PromptCardProps {
  prompt: PromptItem;
}

const getModelBadgeColor = (model: AIModelType): string => {
  switch (model) {
    case 'ChatGPT':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Claude':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Gemini':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Midjourney':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Perplexity':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Flux':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'Runway':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

const getDifficultyColor = (diff: string): string => {
  switch (diff) {
    case 'Beginner':
      return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
    case 'Intermediate':
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    case 'Advanced':
      return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const {
    savedIds,
    favoriteIds,
    toggleSavePrompt,
    toggleFavoritePrompt,
    copyPromptToClipboard,
    setSelectedPrompt,
  } = useApp();

  const [copied, setCopied] = useState(false);

  const isSaved = savedIds.includes(prompt.id);
  const isFavorite = favoriteIds.includes(prompt.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyPromptToClipboard(prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavePrompt(prompt.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoritePrompt(prompt.id);
  };

  return (
    <div
      onClick={() => setSelectedPrompt(prompt)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer"
    >
      <div>
        {/* Top Header: Category & Top Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700/60">
              {prompt.category}
            </span>
            <span
              className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-medium border ${getDifficultyColor(
                prompt.difficulty
              )}`}
            >
              {prompt.difficulty}
            </span>
            {prompt.isUserCreated && (
              <span className="inline-flex items-center rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                Custom
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleFavorite}
              title={isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
              className={`p-1.5 rounded-lg border transition-all duration-200 ${
                isFavorite
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 fill-amber-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleSave}
              title={isSaved ? 'Unsave Prompt' : 'Save Prompt'}
              className={`p-1.5 rounded-lg border transition-all duration-200 ${
                isSaved
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 fill-indigo-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
          {prompt.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {prompt.description}
        </p>

        {/* Prompt Snippet Box */}
        <div className="relative mb-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 font-mono text-xs text-slate-300 overflow-hidden group-hover:border-slate-700/60 transition-colors">
          <p className="line-clamp-2 opacity-90 select-none">{prompt.prompt}</p>
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-md border border-slate-800"
            >
              #{tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-[11px] text-slate-500 py-0.5 px-1">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Models, Stats & Actions */}
      <div className="pt-3 border-t border-slate-800/60 flex flex-col gap-3">
        {/* Models & Tested Versions list */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 items-center">
            {(prompt.compatibleApps && prompt.compatibleApps.length > 0 ? prompt.compatibleApps : prompt.models).slice(0, 3).map((model) => (
              <span
                key={model}
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${getModelBadgeColor(
                  model
                )}`}
              >
                {model}
              </span>
            ))}
            {(prompt.compatibleApps || prompt.models || []).length > 3 && (
              <span className="text-[9px] text-slate-500 font-medium">
                +{(prompt.compatibleApps || prompt.models || []).length - 3}
              </span>
            )}

            {/* Dedicated Model Version badge if present */}
            {((prompt.compatibleModels && prompt.compatibleModels.length > 0) || (prompt.modelVersions && prompt.modelVersions.length > 0)) && (
              <span
                title={`Tested model versions: ${(prompt.compatibleModels || prompt.modelVersions || []).join(', ')}`}
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
              >
                <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                <span>{(prompt.compatibleModels || prompt.modelVersions || [])[0]}</span>
                {(prompt.compatibleModels || prompt.modelVersions || []).length > 1 && (
                  <span className="text-cyan-400/80">+{((prompt.compatibleModels || prompt.modelVersions || []).length - 1)}</span>
                )}
              </span>
            )}
          </div>

          {/* Rating & Uses */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="w-3 h-3 fill-amber-400" />
              {prompt.rating.toFixed(1)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-slate-400" />
              {(prompt.usageCount / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        {/* Bottom Bar: View & Quick Copy */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setSelectedPrompt(prompt)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            View Details
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
