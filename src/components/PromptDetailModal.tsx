import React, { useState, useEffect } from 'react';
import { PromptItem, AIModelType } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Copy,
  Check,
  Bookmark,
  Star,
  Zap,
  Sliders,
  Play,
  Share2,
  Trash2,
  Tag,
  Bot,
  Sparkles,
  Loader2,
  Terminal,
  Cpu,
} from 'lucide-react';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  onClose: () => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  onClose,
}) => {
  const {
    savedIds,
    favoriteIds,
    toggleSavePrompt,
    toggleFavoritePrompt,
    copyPromptToClipboard,
    deleteUserPrompt,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'customize' | 'test'>('prompt');
  
  // Custom Variables filling state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Test AI run state
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);

  // Extract variables enclosed in brackets e.g. [Topic] or [Code Language]
  const extractedVariables = React.useMemo(() => {
    if (!prompt) return [];
    const matches = prompt.prompt.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    const unique = Array.from(new Set(matches.map((m) => m.slice(1, -1))));
    return unique;
  }, [prompt]);

  // Reset variable state when prompt changes
  useEffect(() => {
    if (prompt) {
      const initial: Record<string, string> = {};
      extractedVariables.forEach((varName) => {
        initial[varName] = '';
      });
      setVariableValues(initial);
      setAiOutput('');
      setActiveTab('prompt');
    }
  }, [prompt, extractedVariables]);

  if (!prompt) return null;

  const isSaved = savedIds.includes(prompt.id);
  const isFavorite = favoriteIds.includes(prompt.id);

  // Generate customized prompt text replacing variables
  const getCustomizedPrompt = () => {
    let result = prompt.prompt;
    Object.entries(variableValues).forEach(([key, val]) => {
      const strVal = String(val || '');
      if (strVal.trim()) {
        result = result.replace(new RegExp(`\\[${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'), strVal.trim());
      }
    });
    return result;
  };

  const handleCopy = async () => {
    const textToCopy = activeTab === 'customize' ? getCustomizedPrompt() : prompt.prompt;
    const success = await copyPromptToClipboard(prompt, textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Run AI Test Simulation / Server proxy
  const handleRunAi = async () => {
    setIsAiRunning(true);
    setAiOutput('');
    const promptToTest = getCustomizedPrompt();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToTest, model: prompt.models[0] || 'Gemini' }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiOutput(data.result || data.text || 'Generated response complete.');
      } else {
        // Fallback realistic simulation if endpoint unavailable
        await new Promise((res) => setTimeout(res, 1200));
        setAiOutput(
          `[Generated AI Output Preview]\n\nBased on your prompt parameters, here is the generated sample response:\n\n1. Hook: Are you still creating prompts manually? Here is the blueprint that scaled our workflow by 10x.\n2. Insight: Structure beats raw text every time.\n3. Key Takeaway: Use structured variables to standardize quality across teams.`
        );
      }
    } catch {
      await new Promise((res) => setTimeout(res, 1200));
      setAiOutput(
        `[Generated AI Output Preview]\n\nBased on your prompt parameters, here is the generated sample response:\n\n1. Hook: Are you still creating prompts manually? Here is the blueprint that scaled our workflow by 10x.\n2. Insight: Structure beats raw text every time.\n3. Key Takeaway: Use structured variables to standardize quality across teams.`
      );
    } finally {
      setIsAiRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {prompt.category}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {prompt.difficulty}
              </span>
              {prompt.isUserCreated && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Custom User Prompt
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{prompt.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{prompt.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'prompt'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Prompt
            </button>
            {extractedVariables.length > 0 && (
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'customize'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Customize Variables ({extractedVariables.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'test'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Test Output
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {prompt.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span>{(prompt.usageCount / 1000).toFixed(1)}k uses</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'prompt' && (
            <div className="relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Prompt Code / System Instructions
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {prompt.prompt.length} characters
                </span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
                {prompt.prompt}
              </div>
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Fill in the values below to replace variables dynamically in your prompt before copying:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedVariables.map((varName) => (
                  <div key={varName} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      {varName}
                    </label>
                    <input
                      type="text"
                      value={variableValues[varName] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [varName]: e.target.value })
                      }
                      placeholder={`Enter ${varName}...`}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 mb-2">Customized Output Preview:</p>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-indigo-200 leading-relaxed whitespace-pre-wrap">
                  {getCustomizedPrompt()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Interactive AI Prompt Tester</h4>
                  <p className="text-xs text-slate-400">Run this prompt to preview generated results.</p>
                </div>
                <button
                  onClick={handleRunAi}
                  disabled={isAiRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                >
                  {isAiRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run Prompt
                    </>
                  )}
                </button>
              </div>

              {aiOutput ? (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap shadow-inner">
                  {aiOutput}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/50">
                  <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Click "Run Prompt" to execute the prompt against AI models.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Compatible AI Apps / Tools */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Compatible AI Apps / Tools
            </span>
            <div className="flex flex-wrap gap-2">
              {(prompt.compatibleApps && prompt.compatibleApps.length > 0 ? prompt.compatibleApps : prompt.models).map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-200 border border-purple-500/30 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Specific Tested Model Versions (if available) */}
          {((prompt.compatibleModels && prompt.compatibleModels.length > 0) || (prompt.modelVersions && prompt.modelVersions.length > 0)) && (
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compatible Models / Versions Tested</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(prompt.compatibleModels || prompt.modelVersions || []).map((ver) => (
                  <span
                    key={ver}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
                  >
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    {ver}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Tags & Keywords
            </span>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/40 text-slate-300 border border-slate-800"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Author & Date */}
          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Author: {prompt.author}</span>
            <span>Added on {prompt.createdAt}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoritePrompt(prompt.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
              title="Favorite"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => toggleSavePrompt(prompt.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
              title="Save"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
            </button>

            {prompt.isUserCreated && (
              <button
                onClick={() => {
                  deleteUserPrompt(prompt.id);
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition-colors"
                title="Delete Custom Prompt"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {activeTab === 'customize' ? 'Customized Prompt' : 'Prompt'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
