import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Wand2,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  FileCode,
  BookmarkPlus,
  RefreshCw,
  AlertTriangle,
  Key,
  ShieldCheck,
  User,
  Tag,
} from 'lucide-react';

interface VariableItem {
  id: string;
  key: string;
  sampleValue: string;
}

const ROLE_PRESETS = [
  'Senior Software Engineer',
  'Growth Marketing Strategist',
  'UX/UI Research Lead',
  'Executive Business Analyst',
  'Technical Content Writer',
  'AI Systems Architect',
];

const CONSTRAINT_PRESETS = [
  'Output as concise bullet points with code snippets',
  'Limit response to 250 words',
  'Provide step-by-step rationale before concluding',
  'Maintain an executive, actionable tone',
  'Highlight potential edge cases and safety considerations',
];

const CATEGORY_OPTIONS = [
  'Coding',
  'Marketing',
  'Writing',
  'Business',
  'Creative',
  'Productivity',
  'Education',
  'Personal',
];

export const PromptBuilder: React.FC = () => {
  const { createPrompt, addToast, currentUser } = useApp();

  // Input Block States
  const [role, setRole] = useState('Senior Software Engineer');
  const [taskContext, setTaskContext] = useState(
    'Review the provided React component code for memory leaks, unnecessary re-renders, and performance bottlenecks.'
  );
  const [constraints, setConstraints] = useState(
    'Output as bullet points with code snippets. Provide step-by-step reasoning.'
  );
  const [category, setCategory] = useState('Coding');
  const [variables, setVariables] = useState<VariableItem[]>([
    { id: 'v1', key: 'Code', sampleValue: 'useEffect(() => { const timer = setInterval(fetchData, 1000); }, []);' },
    { id: 'v2', key: 'Framework', sampleValue: 'React 19 & TypeScript' },
  ]);

  // AI Prompt Generation States (Backend API driven)
  const [assembledPrompt, setAssembledPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Interaction States
  const [copiedAssembled, setCopiedAssembled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminSaveTarget, setAdminSaveTarget] = useState<'personal' | 'public'>('personal');

  // Variable Handlers
  const addVariable = () => {
    const nextNum = variables.length + 1;
    setVariables([
      ...variables,
      { id: `v_${Date.now()}`, key: `Variable_${nextNum}`, sampleValue: 'Sample value...' },
    ]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const updateVariable = (id: string, field: 'key' | 'sampleValue', value: string) => {
    setVariables(
      variables.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // Reset inputs
  const handleResetInputs = () => {
    setRole('Senior Software Engineer');
    setTaskContext('');
    setConstraints('');
    setCategory('Coding');
    setVariables([]);
    setApiKeyError(null);
  };

  // =========================================================================
  // 1 & 2. Backend-Powered Gemini Generation Logic (/api/generate)
  // =========================================================================
  const handleGenerateAiPrompt = async () => {
    setApiKeyError(null);

    if (!role.trim() && !taskContext.trim() && !constraints.trim()) {
      addToast('Please fill in at least one input block before generating.', 'warning');
      return;
    }

    // Build the Meta-Prompt Structure
    const roleInput = role.trim() || 'General AI Specialist';
    let taskInput = taskContext.trim() || 'No specific task details provided';

    if (variables.length > 0) {
      const formattedVars = variables
        .filter((v) => v.key.trim())
        .map((v) => `\n  - [${v.key.trim()}]: ${v.sampleValue.trim() || 'dynamic input'}`)
        .join('');
      if (formattedVars) {
        taskInput += `\nDynamic Input Variables:${formattedVars}`;
      }
    }

    const constraintsInput = constraints.trim() || 'Output in clear markdown with actionable steps';

    const metaPrompt = `Act as an Expert Prompt Engineer. I will provide you with rough ideas for an AI prompt. Your job is to rewrite it into a highly professional, detailed, and optimized prompt ready to be used on LLMs like GPT-4 or Claude. Use best practices like clear markdown structure, defining the persona, step-by-step instructions, and formatting constraints. 
Here are the raw inputs:
- Role: ${roleInput}
- Task: ${taskInput}
- Constraints: ${constraintsInput}

Return ONLY the final optimized prompt text without any intro or outro.`;

    setIsGenerating(true);
    setAssembledPrompt('');

    try {
      // Secure backend call to /api/generate (no client-side API keys exposed)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: metaPrompt,
          model: 'gemini-2.5-flash',
        }),
      });

      let data: any = null;
      try {
        const rawText = await response.text();
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('Failed to parse response JSON from /api/generate:', parseErr);
        data = { error: 'Invalid response format from server' };
      }

      if (!response.ok || data?.error) {
        const rawMsg = data?.details || data?.error || 'Failed to generate AI prompt.';
        const isKeyProblem =
          rawMsg.toLowerCase().includes('api key') ||
          rawMsg.toLowerCase().includes('apikey') ||
          rawMsg.toLowerCase().includes('403') ||
          rawMsg.toLowerCase().includes('401') ||
          rawMsg.toLowerCase().includes('unauthorized') ||
          rawMsg.toLowerCase().includes('permission_denied');

        const displayMessage = isKeyProblem
          ? 'API Key is missing or invalid. Please configure GEMINI_API_KEY on the server.'
          : `Generation failed: ${rawMsg}`;

        setApiKeyError(displayMessage);
        addToast(displayMessage, 'error');
        return;
      }

      if (data?.result) {
        setAssembledPrompt(data.result);
        addToast('✨ AI Prompt generated successfully!', 'success');
      } else {
        throw new Error('No output returned from AI model.');
      }
    } catch (err: any) {
      console.error('Generation call error:', err);
      const message = err?.message || 'Failed to connect to backend AI service.';
      setApiKeyError(message);
      addToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================================================
  // 3. Copy Functionality
  // =========================================================================
  const handleCopyAssembled = () => {
    if (!assembledPrompt) {
      addToast('No generated prompt to copy yet. Click "✨ Generate AI Prompt" first.', 'info');
      return;
    }
    navigator.clipboard.writeText(assembledPrompt);
    setCopiedAssembled(true);
    addToast('AI-generated prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedAssembled(false), 2000);
  };

  // =========================================================================
  // 4. Private Saving & Dynamic Categories (Firestore Backend Fix)
  // =========================================================================
  const handleSaveToLibrary = async () => {
    // Strict verification that currentUser and currentUser.uid exist
    if (!currentUser || !currentUser.uid) {
      addToast('Please sign in to save prompts to your private library.', 'warning');
      return;
    }

    if (!assembledPrompt.trim()) {
      addToast('Please generate an AI prompt first before saving.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const isUserAdmin = currentUser.role === 'admin';

      // For normal users: strictly save to their personal private workspace: users/{uid}/myPrompts
      if (!isUserAdmin || adminSaveTarget === 'personal') {
        await createPrompt({
          title: `${role.trim() || 'Custom'} AI Prompt`,
          description: `AI-engineered prompt generated from: ${taskContext.slice(0, 90)}...`,
          prompt: assembledPrompt.trim(),
          category: category,
          tags: ['AI-Generated', 'Personal', category],
          models: ['ChatGPT', 'Claude', 'Gemini'],
          difficulty: 'Intermediate',
          isPersonal: true,
          author: currentUser.displayName || currentUser.email || 'You',
        });

        addToast('Saved prompt to your private workspace (myPrompts)!', 'success');
      } else {
        // Admin user choosing to publish globally using the dynamic category
        await createPrompt({
          title: `${role.trim() || 'Custom'} AI Prompt`,
          description: `Custom assembled prompt for ${role.toLowerCase()} workflows.`,
          prompt: assembledPrompt.trim(),
          category: category,
          tags: ['AI-Generated', 'Admin', category],
          models: ['ChatGPT', 'Claude', 'Gemini'],
          difficulty: 'Intermediate',
          isPersonal: false,
          isPublic: true,
          status: 'published',
          author: currentUser?.displayName || 'Admin',
        });
        addToast(`Published prompt to global public library under '${category}'!`, 'success');
      }
    } catch (err: any) {
      console.error('Save to library error:', err);
      addToast(`Failed to save prompt: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">AI-Powered Prompt Generator</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Server-Side Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transform rough instructions into production-ready, expert prompts and save securely to your personal library.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetInputs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Blocks</span>
          </button>

          <button
            onClick={handleSaveToLibrary}
            disabled={isSaving || !assembledPrompt.trim()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              assembledPrompt.trim()
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save to Library'}</span>
          </button>
        </div>
      </div>

      {/* Global API Key Missing or Invalid Error Banner */}
      {apiKeyError && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-3 shadow-lg animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-300">API Key Configuration Notice</h4>
            <p className="leading-relaxed text-red-200/90">{apiKeyError}</p>
          </div>
        </div>
      )}

      {/* Grid: Left Blocks (Inputs & Generate Button) & Right Panel (Assembled AI Prompt) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Blocks */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Selector Block */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span>Prompt Category:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    category === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Block 1: Role / Persona */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px]">1</span>
              <span>Role & Persona</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Act as / Primary Persona</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Role Presets */}
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRole(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                      role === preset
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block 2: Task & Context */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">2</span>
              <span>Task & Context</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Core Task / Objective</label>
              <textarea
                rows={4}
                value={taskContext}
                onChange={(e) => setTaskContext(e.target.value)}
                placeholder="Describe what you want the AI to do, context, goals, or code to inspect..."
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Block 3: Constraints & Format */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px]">3</span>
              <span>Constraints & Rules</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Guardrails & Output Format</label>
              <textarea
                rows={3}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Length limits, bullet points, tone, step-by-step reasoning..."
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Constraint Preset Chips */}
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Quick Add Rule:</p>
              <div className="flex flex-wrap gap-1.5">
                {CONSTRAINT_PRESETS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!constraints.includes(chip)) {
                        setConstraints((prev) => (prev ? `${prev}\n- ${chip}` : `- ${chip}`));
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-500/30 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-[200px]">{chip}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block 4: Optional Dynamic Variables */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px]">4</span>
                <span>Dynamic Variables (Optional)</span>
              </div>
              <button
                onClick={addVariable}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Variable</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {variables.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  No dynamic variables defined. Click "+ Add Variable" to add inputs like [Code] or [Audience].
                </div>
              ) : (
                variables.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="w-1/3">
                      <label className="text-[10px] text-slate-500 font-semibold block">Variable Name</label>
                      <input
                        type="text"
                        value={v.key}
                        onChange={(e) => updateVariable(v.id, 'key', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Code"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Sample Value</label>
                      <input
                        type="text"
                        value={v.sampleValue}
                        onChange={(e) => updateVariable(v.id, 'sampleValue', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Sample value..."
                      />
                    </div>
                    <button
                      onClick={() => removeVariable(v.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-3"
                      title="Delete variable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prominent "✨ Generate AI Prompt" Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerateAiPrompt}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-sm text-white shadow-xl transition-all ${
                isGenerating
                  ? 'bg-slate-800 cursor-not-allowed text-slate-400 border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Expert Prompt with Server-Side Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <span>✨ Generate AI Prompt</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Rewrites your rough inputs into a structured, professional prompt via server-side Gemini endpoint.
            </p>
          </div>
        </div>

        {/* Right Column: Assembled Prompt Output Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl space-y-4 sticky top-20 shadow-xl">
            {/* Header with Title & Copy Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assembled Prompt</h3>
                {isGenerating && (
                  <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-pulse">
                    Generating...
                  </span>
                )}
              </div>

              {/* Top-Right Copy Button */}
              <button
                onClick={handleCopyAssembled}
                disabled={!assembledPrompt}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  assembledPrompt
                    ? 'text-cyan-400 hover:text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10'
                    : 'text-slate-600 border-transparent cursor-not-allowed'
                }`}
                title="Copy generated prompt to clipboard"
              >
                {copiedAssembled ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Display Area */}
            <div className="relative">
              {assembledPrompt ? (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-200 font-mono whitespace-pre-wrap min-h-[260px] max-h-[480px] overflow-y-auto leading-relaxed border-l-4 border-l-cyan-500 select-text">
                    {assembledPrompt}
                  </pre>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="max-w-[280px]">
                    <h4 className="text-xs font-bold text-slate-300">Ready to Generate</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Configure your Role, Task, and Constraints on the left, then click{' '}
                      <strong className="text-cyan-400">✨ Generate AI Prompt</strong> to craft an optimized prompt.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Save Target Selector (Only shown if currentUser is admin) */}
            {currentUser?.role === 'admin' && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Admin Save Destination:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="saveTarget"
                        value="personal"
                        checked={adminSaveTarget === 'personal'}
                        onChange={() => setAdminSaveTarget('personal')}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Personal</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="saveTarget"
                        value="public"
                        checked={adminSaveTarget === 'public'}
                        onChange={() => setAdminSaveTarget('public')}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span className="text-amber-400 font-semibold">Public</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions inside Assembled Card */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveToLibrary}
                disabled={isSaving || !assembledPrompt.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                  assembledPrompt.trim()
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.99]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'Saving...'
                    : currentUser?.role === 'admin' && adminSaveTarget === 'public'
                    ? `Publish to Public (${category})`
                    : 'Save to My Prompts'}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentUser?.role === 'admin' && adminSaveTarget === 'public'
                  ? `Saving to global prompts with category: "${category}"`
                  : 'Saves privately to collection: users/{uid}/myPrompts'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
