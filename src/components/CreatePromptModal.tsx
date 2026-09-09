import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryType, DifficultyType } from '../types';
import { X, Sparkles, Plus, Info, Database, Cpu, Check, X as XIcon, Lock, BookmarkPlus, Shield } from 'lucide-react';
import { sanitizeTags } from '../utils/storage';

const POPULAR_CATEGORIES = [
  'Marketing',
  'Content Creation',
  'SEO',
  'Business',
  'Research',
  'Coding',
  'Cybersecurity',
  'Prompt Engineering',
  'Productivity',
  'Education',
  'Image Generation',
  'Video Generation',
  'Social Media',
  'AI Automation',
];

const POPULAR_APPS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'Midjourney',
  'Cursor',
  'Copilot',
  'v0',
];

const POPULAR_MODELS = [
  'Claude 3.7 Sonnet',
  'GPT-4o',
  'Gemini 2.0 Flash',
  'DeepSeek R1',
  'Midjourney v6.1',
  'o3-mini',
];

export const CreatePromptModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createPrompt, currentUser, addToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [category, setCategory] = useState<string>('Marketing');
  const [compatibleApps, setCompatibleApps] = useState<string[]>(['ChatGPT', 'Claude']);
  const [appInput, setAppInput] = useState('');
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyType>('Beginner');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleAddApp = (val: string) => {
    const raw = val.trim();
    if (!raw) return;
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    setCompatibleApps((prev) => {
      const next = [...prev];
      parts.forEach((p) => {
        if (!next.some((item) => item.toLowerCase() === p.toLowerCase())) {
          next.push(p);
        }
      });
      return next;
    });
    setAppInput('');
  };

  const handleRemoveApp = (appToRemove: string) => {
    setCompatibleApps((prev) => prev.filter((a) => a.toLowerCase() !== appToRemove.toLowerCase()));
  };

  const handleAddModel = (val: string) => {
    const raw = val.trim();
    if (!raw) return;
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    setCompatibleModels((prev) => {
      const next = [...prev];
      parts.forEach((p) => {
        if (!next.some((item) => item.toLowerCase() === p.toLowerCase())) {
          next.push(p);
        }
      });
      return next;
    });
    setModelInput('');
  };

  const handleRemoveModel = (modelToRemove: string) => {
    setCompatibleModels((prev) => prev.filter((m) => m.toLowerCase() !== modelToRemove.toLowerCase()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanPrompt = promptContent.trim();
    const cleanCategory = category.trim() || 'General';

    if (!cleanTitle || !cleanDesc || !cleanPrompt) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    let finalApps = [...compatibleApps];
    if (appInput.trim()) {
      const parts = appInput.split(',').map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (!finalApps.some((e) => e.toLowerCase() === p.toLowerCase())) {
          finalApps.push(p);
        }
      });
    }
    if (finalApps.length === 0) finalApps = ['ChatGPT'];

    let finalModels = [...compatibleModels];
    if (modelInput.trim()) {
      const parts = modelInput.split(',').map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (!finalModels.some((e) => e.toLowerCase() === p.toLowerCase())) {
          finalModels.push(p);
        }
      });
    }

    setIsSubmitting(true);

    try {
      const parsedTags = sanitizeTags(tagsInput);
      const tags = parsedTags.length > 0 ? parsedTags : [cleanCategory, 'Custom'];

      await createPrompt({
        title: cleanTitle,
        description: cleanDesc,
        prompt: cleanPrompt,
        category: cleanCategory,
        tags,
        models: finalApps,
        compatibleApps: finalApps,
        compatibleModels: finalModels,
        modelVersions: finalModels,
        difficulty,
        author: currentUser?.displayName || (isAdmin ? 'Admin' : 'You (Custom)'),
        authorId: currentUser?.uid,
        isPublic: isAdmin,
        status: isAdmin ? 'published' : 'draft',
      });

      addToast(
        isAdmin ? 'Prompt Published to Global Library!' : 'Saved to My Prompts (Private)!',
        'success',
        cleanTitle
      );

      // Reset form
      setTitle('');
      setDescription('');
      setPromptContent('');
      setCategory('Marketing');
      setCompatibleApps(['ChatGPT', 'Claude']);
      setAppInput('');
      setCompatibleModels([]);
      setModelInput('');
      setTagsInput('');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('CreatePromptModal submit error:', err);
      addToast('Failed to create prompt', 'error', err?.message || 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isAdmin
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isAdmin ? 'Create & Publish Prompt' : 'Create Personal Prompt'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  <Database className="w-3 h-3" />
                  <span>{isAdmin ? 'Global Library' : 'Personal Vault Only'}</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Add a production-tested prompt to the Global Public Library.'
                  : 'Save a prompt strictly to your personal vault (My Prompts).'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* RBAC Isolation Banner for Regular Users */}
          {!isAdmin && (
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
              <Lock className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-cyan-200">
                  Personal Workspace Isolation
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  This prompt is strictly saved to your private vault (<span className="font-mono text-[10px] text-cyan-300">users/{currentUser?.uid || 'uid'}/myPrompts</span>). Regular users cannot publish to the Global Public Library.
                </div>
              </div>
            </div>
          )}
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Prompt Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., High-Converting Cold Email Generator"
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Short Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Generate personalized cold emails for B2B tech prospects."
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Category *</label>
                <span className="text-[10px] text-slate-500">Type any custom category</span>
              </div>
              <input
                type="text"
                list="modal-category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Marketing, Image Gen, Coding..."
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <datalist id="modal-category-suggestions">
                {POPULAR_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Quick Pick Category Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-slate-500 font-medium">Quick Pick:</span>
            {POPULAR_CATEGORIES.slice(0, 6).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[10px] border transition-all ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Compatible AI Apps / Tools */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Compatible AI Apps / Tools</label>
              <span className="text-[10px] text-slate-500">Press Enter or comma</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-cyan-500">
              {compatibleApps.map((app) => (
                <span
                  key={app}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                >
                  <span>{app}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveApp(app)}
                    className="p-0.5 hover:text-white"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={appInput}
                onChange={(e) => setAppInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddApp(appInput);
                  }
                }}
                onBlur={() => handleAddApp(appInput)}
                placeholder={compatibleApps.length === 0 ? "e.g., ChatGPT, Claude, Cursor..." : "+ add app"}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
            {/* Quick App Presets */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-slate-500">Suggested:</span>
              {POPULAR_APPS.map((app) => {
                const isSelected = compatibleApps.some((a) => a.toLowerCase() === app.toLowerCase());
                return (
                  <button
                    type="button"
                    key={app}
                    onClick={() => (isSelected ? handleRemoveApp(app) : handleAddApp(app))}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {isSelected ? `✓ ${app}` : `+ ${app}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compatible Models / Versions */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compatible Models / Versions (Optional)</span>
              </label>
              <span className="text-[10px] text-slate-500">e.g., Claude 3.7 Sonnet, GPT-4o</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-cyan-500">
              {compatibleModels.map((ver) => (
                <span
                  key={ver}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                >
                  <span>{ver}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveModel(ver)}
                    className="p-0.5 hover:text-white"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddModel(modelInput);
                  }
                }}
                onBlur={() => handleAddModel(modelInput)}
                placeholder={compatibleModels.length === 0 ? "Type model and press Enter (e.g. GPT-4o, Claude 3.7 Sonnet)" : "+ add model"}
                className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
            {/* Quick Model Presets */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-slate-500">Common:</span>
              {POPULAR_MODELS.map((model) => {
                const isSelected = compatibleModels.some((m) => m.toLowerCase() === model.toLowerCase());
                return (
                  <button
                    type="button"
                    key={model}
                    onClick={() => (isSelected ? handleRemoveModel(model) : handleAddModel(model))}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {isSelected ? `✓ ${model}` : `+ ${model}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Body */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Prompt Content *</label>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" />
                Use [Variable Name] for customizable fields
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Act as a Senior Marketer... Target Audience: [Target Audience] Topic: [Topic]"
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Email, B2B, Sales, Outreach"
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
                isAdmin
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <>
                  {isAdmin ? (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Publish to Global Library</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 stroke-[2.5]" />
                      <span>Save to My Prompts (Private)</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
