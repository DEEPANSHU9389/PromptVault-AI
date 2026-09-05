import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Globe,
  Edit,
  Calendar,
  Star,
  Send,
  Eye,
  Sparkles,
  Check,
  RotateCcw,
  Linkedin,
  Instagram,
  Twitter,
  Share2,
  Upload,
  Image as ImageIcon,
  X as XIcon,
  CheckCircle2,
  Cpu,
  Plus,
  Layers,
  Sparkle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem, CategoryType, DifficultyType } from '../../types';
import { CATEGORIES, DIFFICULTIES } from '../../config/categories';
import { uploadImageWithProgress } from '../../utils/imageCompressor';
import { sanitizeTags } from '../../utils/storage';

const POPULAR_CATEGORY_SUGGESTIONS = [
  'Marketing',
  'Image Generation',
  'Coding',
  'Cybersecurity',
  'Prompt Engineering',
  'Productivity',
  'SEO',
  'Business',
  'AI Automation',
  'Video Generation',
  'Education',
  'Content Creation'
];

const POPULAR_APPS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Midjourney',
  'Perplexity',
  'Cursor',
  'Copilot',
  'v0',
  'Flux',
  'Runway'
];

const POPULAR_MODEL_VERSIONS = [
  'Claude 3.7 Sonnet',
  'GPT-4o',
  'Gemini 2.0 Flash',
  'DeepSeek R1',
  'Midjourney v6.1',
  'o3-mini',
  'Flux Schnell'
];

interface CreatorStudioProps {
  editingDraftId: string | null;
  onClearEditing: () => void;
  onSaved: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  editingDraftId,
  onClearEditing,
  onSaved
}) => {
  const { currentUser, allPrompts, createPrompt, updatePrompt, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<string>('Marketing');
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');

  // Dynamic Compatible Apps state
  const [compatibleApps, setCompatibleApps] = useState<string[]>(['ChatGPT', 'Claude']);
  const [appInput, setAppInput] = useState<string>('');

  // Dedicated Model Versions state
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState<string>('');

  // Extract all existing unique categories from allPrompts and suggestions
  const availableCategories = Array.from(
    new Set([
      ...CATEGORIES,
      ...POPULAR_CATEGORY_SUGGESTIONS,
      ...allPrompts.map((p) => p.category).filter(Boolean)
    ])
  ).sort();

  const [tags, setTags] = useState<string>('SaaS, Copywriting, Growth');
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<'library' | 'linkedin' | 'instagram' | 'x'>('library');

  // Load editing prompt if provided
  useEffect(() => {
    if (editingDraftId) {
      const existing = allPrompts.find((p) => p.id === editingDraftId);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description);
        setPrompt(existing.prompt);
        setCategory(existing.category || 'Marketing');
        setDifficulty(existing.difficulty || 'Intermediate');
        setCompatibleApps(
          existing.compatibleApps && existing.compatibleApps.length > 0
            ? existing.compatibleApps
            : existing.models && existing.models.length > 0
            ? existing.models
            : ['ChatGPT', 'Claude']
        );
        setCompatibleModels(
          existing.compatibleModels && existing.compatibleModels.length > 0
            ? existing.compatibleModels
            : existing.modelVersions && existing.modelVersions.length > 0
            ? existing.modelVersions
            : []
        );
        setTags(existing.tags?.join(', ') || '');
        setStatus(existing.status || 'draft');
        setScheduledAt(existing.scheduledAt || '');
        setIsFeatured(Boolean(existing.isFeatured));
        setImageUrl(existing.imageUrl || '');
      }
    }
  }, [editingDraftId, allPrompts]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'warning');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      const url = await uploadImageWithProgress(file, 'prompt-covers', (progress) => {
        setUploadProgress(progress);
      });
      setImageUrl(url);
      addToast('Image compressed (~300KB) and uploaded successfully!', 'success');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      addToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Compatible Apps helpers
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
    setCompatibleApps((prev) => prev.filter((app) => app.toLowerCase() !== appToRemove.toLowerCase()));
  };

  const handleAppKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddApp(appInput);
    } else if (e.key === 'Backspace' && !appInput && compatibleApps.length > 0) {
      handleRemoveApp(compatibleApps[compatibleApps.length - 1]);
    }
  };

  const handleAppBlur = () => {
    if (appInput.trim()) {
      handleAddApp(appInput);
    }
  };

  // Compatible Models / Versions helpers
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

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddModel(modelInput);
    } else if (e.key === 'Backspace' && !modelInput && compatibleModels.length > 0) {
      handleRemoveModel(compatibleModels[compatibleModels.length - 1]);
    }
  };

  const handleModelBlur = () => {
    if (modelInput.trim()) {
      handleAddModel(modelInput);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setPrompt('');
    setCategory('Marketing');
    setDifficulty('Intermediate');
    setCompatibleApps(['ChatGPT', 'Claude']);
    setAppInput('');
    setCompatibleModels([]);
    setModelInput('');
    setTags('SaaS, Copywriting, Growth');
    setStatus('published');
    setScheduledAt('');
    setIsFeatured(false);
    setImageUrl('');
    setUploadProgress(0);
    onClearEditing();
  };

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanPrompt = prompt.trim();
    const cleanCategory = category.trim() || 'General';

    if (!cleanTitle) {
      addToast('Please enter a prompt title', 'warning');
      return;
    }
    if (!cleanPrompt) {
      addToast('Please enter prompt instructions', 'warning');
      return;
    }
    if (status === 'scheduled' && !scheduledAt) {
      addToast('Please select a scheduled date and time', 'warning');
      return;
    }

    // Flush any pending text in appInput or modelInput
    let finalApps = [...compatibleApps];
    if (appInput.trim()) {
      const parts = appInput.split(',').map((p) => p.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (!finalApps.some((e) => e.toLowerCase() === p.toLowerCase())) {
          finalApps.push(p);
        }
      });
    }
    if (finalApps.length === 0) {
      finalApps = ['ChatGPT'];
    }

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
      const parsedTags = sanitizeTags(tags);
      const safeTags = parsedTags.length > 0 ? parsedTags : [cleanCategory, 'AI'];

      const payload: Omit<PromptItem, 'id' | 'createdAt' | 'usageCount' | 'rating' | 'ratingCount' | 'isUserCreated'> & Record<string, any> = {
        title: cleanTitle,
        description: description.trim() || 'High-output production prompt template.',
        prompt: cleanPrompt,
        category: cleanCategory,
        difficulty,
        models: finalApps,
        compatibleApps: finalApps,
        compatibleModels: finalModels,
        modelVersions: finalModels,
        tags: safeTags,
        status,
        isPublic: status === 'published',
        isFeatured: Boolean(isFeatured),
        author: currentUser?.displayName || 'Admin Creator Studio',
        authorId: currentUser?.uid || 'admin',
        imageUrl: imageUrl.trim() || undefined,
      };

      if (status === 'scheduled' && scheduledAt) {
        payload.scheduledAt = scheduledAt;
      }
      if (currentUser?.email) {
        payload.authorEmail = currentUser.email;
      }

      if (editingDraftId) {
        await updatePrompt(editingDraftId, payload);
        addToast(
          status === 'published'
            ? 'Prompt Published Successfully!'
            : status === 'scheduled'
            ? 'Scheduled Release Updated!'
            : 'Draft Saved Successfully!',
          'success',
          cleanTitle
        );
      } else {
        await createPrompt(payload);
        addToast(
          status === 'published'
            ? 'Prompt Published Successfully!'
            : status === 'scheduled'
            ? `Scheduled for Release on ${new Date(scheduledAt).toLocaleString()}`
            : 'Saved to Private Drafts!',
          'success',
          cleanTitle
        );
      }

      handleReset();
      onSaved();
    } catch (err: any) {
      console.error('CreatorStudio submit error:', err);
      addToast('Failed to save prompt', 'error', err?.message || 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Editor Form Column */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              <span>{editingDraftId ? 'Edit Prompt in Studio' : 'Create & Publish New Prompt'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft, schedule, or instantly publish tested prompts with multi-model capability.
            </p>
          </div>

          {editingDraftId && (
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Editing</span>
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior SaaS Growth Copywriter & PAS Strategist"
              className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Prompt Cover Image / Asset Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Prompt Cover Image / Asset</span>
              <span className="text-[11px] text-purple-400 font-mono">Client-side Compressed (~300KB)</span>
            </label>

            {imageUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2.5 flex items-center space-x-4">
                <img src={imageUrl} alt="Cover Preview" className="w-20 h-16 object-cover rounded-lg border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Prompt Asset Uploaded</p>
                  <p className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Stored via uploadBytesResumable()</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg border border-slate-800 transition-colors"
                  title="Remove Image"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 text-center bg-slate-950/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  id="prompt-image-upload"
                  className="hidden"
                />
                <label htmlFor="prompt-image-upload" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 hover:underline">Click to upload cover image</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, or WEBP (Max ~300KB auto-compressed)</p>
                  </div>
                </label>

                {/* Real-time Upload Progress Bar */}
                {isUploadingImage && (
                  <div className="mt-3 space-y-1.5 text-left">
                    <div className="flex justify-between text-[11px] font-bold text-purple-300">
                      <span>Compressing & Resumable Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what this prompt outputs and target outcome..."
              className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Prompt Instructions & System Body *</span>
              <span className="text-[11px] text-purple-400 font-mono">Use [Variables] for user inputs</span>
            </label>
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Act as a Senior SaaS Marketing Strategist. Write landing page copy using the PAS framework..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 font-mono text-xs rounded-xl focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Taxonomy Category: Custom text input / Autocomplete */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Taxonomy Category *
                </label>
                <span className="text-[11px] text-purple-400 font-medium">Custom text / suggestions</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  list="category-suggestions-list"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Marketing, Cybersecurity, Prompt Engineering..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-xs focus:outline-none transition-colors"
                />
                <datalist id="category-suggestions-list">
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Quick Suggestions Pills */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Quick Pick:</span>
                {POPULAR_CATEGORY_SUGGESTIONS.slice(0, 6).map((cat) => {
                  const isActive = category.trim().toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                        isActive
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500 font-bold'
                          : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:border-purple-500 focus:outline-none"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Compatible AI Apps / Tools: Dynamic Tag/Chip Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Compatible AI Apps / Tools *
              </label>
              <span className="text-[11px] text-slate-400">
                Type name & press Enter or comma
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 focus-within:border-purple-500 rounded-xl transition-colors">
              <div className="flex flex-wrap gap-1.5 items-center">
                {compatibleApps.map((app) => (
                  <span
                    key={app}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30 group"
                  >
                    <span>{app}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveApp(app)}
                      className="text-purple-300/70 hover:text-rose-400 rounded transition-colors"
                      title={`Remove ${app}`}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={appInput}
                  onChange={(e) => setAppInput(e.target.value)}
                  onKeyDown={handleAppKeyDown}
                  onBlur={handleAppBlur}
                  placeholder={
                    compatibleApps.length === 0
                      ? 'e.g. ChatGPT, Claude, Midjourney, Cursor...'
                      : '+ Add app / tool...'
                  }
                  className="flex-1 min-w-[140px] bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none py-1"
                />
              </div>
            </div>

            {/* Quick add popular apps */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Quick Add:</span>
              {POPULAR_APPS.map((app) => {
                const isSelected = compatibleApps.some((a) => a.toLowerCase() === app.toLowerCase());
                return (
                  <button
                    key={app}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveApp(app);
                      } else {
                        handleAddApp(app);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-sm shadow-purple-600/30'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                    <span>{app}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Specific AI Model Versions: Dedicated Model Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Compatible Models / Versions (Optional)
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">
                Exact model versions tested
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 focus-within:border-cyan-500 rounded-xl transition-colors">
              <div className="flex flex-wrap gap-1.5 items-center">
                {compatibleModels.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  >
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(m)}
                      className="text-cyan-300/70 hover:text-rose-400 rounded transition-colors ml-0.5"
                      title={`Remove ${m}`}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  onKeyDown={handleModelKeyDown}
                  onBlur={handleModelBlur}
                  placeholder={
                    compatibleModels.length === 0
                      ? 'e.g., Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Flash, Midjourney v6.1'
                      : '+ Add model version...'
                  }
                  className="flex-1 min-w-[180px] bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none py-1"
                />
              </div>
            </div>

            {/* Quick add popular model versions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Presets:</span>
              {POPULAR_MODEL_VERSIONS.map((m) => {
                const isSelected = compatibleModels.some((v) => v.toLowerCase() === m.toLowerCase());
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveModel(m);
                      } else {
                        handleAddModel(m);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow-sm shadow-cyan-600/30'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="SaaS, Copywriting, Growth, PAS"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Status Options */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Publishing Workflow Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  status === 'published'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Publish Now</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Live in public library</div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  status === 'draft'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <Edit className="w-4 h-4 text-amber-400" />
                  <span>Save as Draft</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Private admin drafts</div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  status === 'scheduled'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Schedule Post</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Automated date release</div>
              </button>
            </div>

            {status === 'scheduled' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                <label className="block text-xs font-semibold text-blue-300">
                  Target Release Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">Featured Prompt</div>
                <div className="text-[11px] text-slate-400">Pin to top of Library carousel</div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Reset Form
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {status === 'published'
                      ? 'Publish Prompt Live'
                      : status === 'scheduled'
                      ? 'Schedule Release'
                      : 'Save Private Draft'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 space-y-4">
        <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {/* Format Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Multi-Platform Preview</span>
            </h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              status === 'published'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : status === 'scheduled'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              type="button"
              onClick={() => setPreviewPlatform('library')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                previewPlatform === 'library'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3 h-3" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform('linkedin')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                previewPlatform === 'linkedin'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Linkedin className="w-3 h-3" />
              <span>LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform('instagram')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                previewPlatform === 'instagram'
                  ? 'bg-pink-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Instagram className="w-3 h-3" />
              <span>Insta</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform('x')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                previewPlatform === 'x'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Twitter className="w-3 h-3" />
              <span>X / Tweet</span>
            </button>
          </div>

          {/* Render Preview according to selected platform */}
          {previewPlatform === 'library' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-300 rounded-md text-[11px] font-semibold border border-purple-500/30">
                    {category.trim() || 'General'}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-[10px] font-semibold">
                    {difficulty}
                  </span>
                </div>
                {isFeatured && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-md flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>Featured</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-white leading-snug">
                  {title || 'Untitled Prompt Card'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {description || 'Short description preview will appear here...'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-slate-300 max-h-32 overflow-y-auto">
                {prompt || 'Prompt body instructions will render live here...'}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                {/* Compatible AI Apps / Tools */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Apps:</span>
                    {compatibleApps.length > 0 ? (
                      compatibleApps.map((m) => (
                        <span key={m} className="px-2 py-0.5 text-[10px] bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/30 font-semibold">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">None specified</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">By {currentUser?.displayName || 'Admin'}</span>
                </div>

                {/* Specific Model Versions */}
                {compatibleModels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Tested Models:</span>
                    </span>
                    {compatibleModels.map((m) => (
                      <span key={m} className="px-2 py-0.5 text-[10px] bg-cyan-500/15 text-cyan-300 rounded-md border border-cyan-500/30 font-mono font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {previewPlatform === 'linkedin' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                  IN
                </div>
                <div>
                  <div className="font-bold text-white">{currentUser?.displayName || 'Prompt Creator Studio'}</div>
                  <div className="text-[10px] text-slate-500">AI Prompt Engineer • 1m</div>
                </div>
              </div>
              <p className="text-slate-200 leading-relaxed">
                🚀 <strong>{title || 'New AI Prompt Released'}</strong>
                <br /><br />
                {description || 'Check out this production-ready AI prompt template.'}
                <br /><br />
                <code>{prompt.slice(0, 140)}...</code>
              </p>
              <div className="text-blue-400 text-[11px] font-semibold space-y-1">
                <div>#{(category.trim() || 'AI').replace(/\s+/g, '')} #AIPrompts #PromptEngineering #GenerativeAI</div>
                {compatibleApps.length > 0 && (
                  <div className="text-slate-400 text-[10px] font-normal">
                    Compatible with: <span className="text-blue-300">{compatibleApps.join(', ')}</span>
                  </div>
                )}
                {compatibleModels.length > 0 && (
                  <div className="text-slate-400 text-[10px] font-normal">
                    ⚡ Tested on: <span className="text-cyan-300 font-mono">{compatibleModels.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {previewPlatform === 'instagram' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
              <div className="p-4 bg-gradient-to-tr from-purple-900 via-pink-900 to-amber-900 rounded-xl text-center font-bold text-white shadow-inner">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-pink-300 animate-pulse" />
                <h4 className="text-sm font-extrabold">{title || 'PROMPT CARD'}</h4>
                <p className="text-[11px] text-pink-200 font-normal mt-1">{category.trim() || 'General'} • {difficulty}</p>
                {compatibleApps.length > 0 && (
                  <div className="flex justify-center flex-wrap gap-1 mt-2">
                    {compatibleApps.map((a) => (
                      <span key={a} className="px-1.5 py-0.5 text-[9px] bg-black/40 text-pink-200 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-slate-300 text-[11px]">
                <strong>@promptvault.ai</strong> {description || 'Save this prompt for your next workflow!'}
                {compatibleModels.length > 0 && (
                  <span className="block text-pink-300/90 mt-1 font-mono text-[10px]">
                    ⚡ Tested models: {compatibleModels.join(', ')}
                  </span>
                )}
              </p>
            </div>
          )}

          {previewPlatform === 'x' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                  𝕏
                </div>
                <div>
                  <span className="font-bold text-white">{currentUser?.displayName || 'Prompt Vault'}</span>
                  <span className="text-slate-500 ml-1">@promptvault</span>
                </div>
              </div>
              <p className="text-slate-200 leading-normal">
                🔥 <strong>{title || 'AI Prompt Template'}</strong>
                <br />
                <span className="text-purple-400 text-[11px] font-semibold">[{category.trim() || 'General'}]</span>
                <br />
                {description}
                <br /><br />
                Tested with {compatibleApps.join(', ') || 'AI'}.
                {compatibleModels.length > 0 && ` (${compatibleModels.join(', ')})`}
              </p>
            </div>
          )}

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
            <span>Updates in real-time as you type in the editor.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
