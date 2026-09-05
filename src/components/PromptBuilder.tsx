import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wand2,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  Layers,
  FileCode,
  ArrowRight,
  BookmarkPlus,
  RefreshCw,
  Info,
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

export const PromptBuilder: React.FC = () => {
  const { createPrompt, addToast, setIsCreateModalOpen, currentUser } = useApp();

  // Block States
  const [role, setRole] = useState('Senior Software Engineer');
  const [taskContext, setTaskContext] = useState(
    'Review the provided React component code for memory leaks, unnecessary re-renders, and performance bottlenecks.'
  );
  const [constraints, setConstraints] = useState(
    'Output as bullet points with code snippets. Provide step-by-step reasoning.'
  );
  const [variables, setVariables] = useState<VariableItem[]>([
    { id: 'v1', key: 'Code', sampleValue: 'useEffect(() => { const timer = setInterval(fetchData, 1000); }, []);' },
    { id: 'v2', key: 'Framework', sampleValue: 'React 19 & TypeScript' },
  ]);

  // Test Execution States
  const [isTesting, setIsTesting] = useState(false);
  const [isFastAssisting, setIsFastAssisting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [copiedAssembled, setCopiedAssembled] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fast Tag Suggestion with gemini-3.1-flash-lite
  const handleFastTagSuggest = async () => {
    if (!taskContext.trim()) {
      addToast('Please enter task context first.', 'error');
      return;
    }
    setIsFastAssisting(true);
    try {
      const res = await fetch('/api/quick-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${role}: ${taskContext}`, taskType: 'tag-suggest' }),
      });
      const data = await res.json();
      if (data.tags && data.tags.length > 0) {
        addToast(`Fast AI Tags (gemini-3.1-flash-lite): ${data.tags.join(', ')}`, 'success');
      } else {
        addToast('Fast assist completed.', 'info');
      }
    } catch (err) {
      console.error(err);
      addToast('Fast assist failed.', 'error');
    } finally {
      setIsFastAssisting(false);
    }
  };

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

  // Compile prompt string
  const compileRawPrompt = () => {
    let p = `Act as a ${role || 'Expert AI Specialist'}.\n\n`;
    if (taskContext.trim()) {
      p += `[CONTEXT & TASK]\n${taskContext.trim()}\n\n`;
    }
    if (constraints.trim()) {
      p += `[CONSTRAINTS & FORMAT]\n${constraints.trim()}\n\n`;
    }
    if (variables.length > 0) {
      p += `[VARIABLES]\n`;
      variables.forEach((v) => {
        if (v.key.trim()) {
          p += `- [${v.key.trim()}]: ${v.sampleValue || 'Variable input'}\n`;
        }
      });
    }
    return p.trim();
  };

  const assembledPrompt = compileRawPrompt();

  // Copy Assembled Prompt
  const handleCopyAssembled = () => {
    navigator.clipboard.writeText(assembledPrompt);
    setCopiedAssembled(true);
    addToast('Assembled prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedAssembled(false), 2000);
  };

  // Copy Test Output
  const handleCopyOutput = () => {
    if (!testOutput) return;
    navigator.clipboard.writeText(testOutput);
    setCopiedOutput(true);
    addToast('AI response output copied!', 'success');
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  // Run Test with Gemini API
  const handleRunTest = async () => {
    setIsTesting(true);
    setTestOutput(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: assembledPrompt, model: 'gemini-3.6-flash' }),
      });

      const data = await response.json();
      if (data.result) {
        setTestOutput(data.result);
        addToast('Gemini API test completed successfully!', 'success');
      } else {
        setTestOutput(data.error || 'Failed to generate output.');
        addToast('API returned an error', 'error');
      }
    } catch (err: any) {
      console.error('Test execution error:', err);
      setTestOutput('Error running Gemini API test: ' + (err.message || String(err)));
      addToast('Execution failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Save to My Prompts
  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    try {
      const tagList = ['Builder', role.split(' ')[0], 'Custom'];
      await createPrompt({
        title: `${role} Prompt Framework`,
        description: `Custom assembled prompt for ${role.toLowerCase()} workflows.`,
        prompt: assembledPrompt,
        category: 'Coding',
        tags: tagList,
        models: ['ChatGPT', 'Claude', 'Gemini'],
        difficulty: 'Intermediate',
        author: currentUser?.displayName || 'Prompt Builder User',
      });
      addToast('Saved prompt to your Firestore library!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save prompt', 'error');
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
            <h1 className="text-xl font-extrabold text-white">Interactive Step-by-Step Prompt Builder</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Construct modular, variable-rich prompt blocks and test directly with Gemini API.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFastTagSuggest}
            disabled={isFastAssisting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-all"
            title="Fast task with gemini-3.1-flash-lite"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isFastAssisting ? 'Extracting...' : 'Fast AI Tags (Flash-Lite)'}</span>
          </button>

          <button
            onClick={() => {
              setRole('Senior Software Engineer');
              setTaskContext('');
              setConstraints('');
              setVariables([]);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Blocks</span>
          </button>

          <button
            onClick={handleSaveToLibrary}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save to Library'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Blocks (Builder) & Right Panel (Live Gemini Test) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Blocks */}
        <div className="lg:col-span-7 space-y-5">
          {/* Block 1: Role / Persona */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px]">1</span>
              <span>Role & Persona Block</span>
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

            {/* Presets */}
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
              <span>Task & Context Block</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Core Instruction & Context</label>
              <textarea
                rows={4}
                value={taskContext}
                onChange={(e) => setTaskContext(e.target.value)}
                placeholder="Describe the background context, objective, or problem to solve..."
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Block 3: Constraints & Format */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px]">3</span>
              <span>Constraints & Output Format Block</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Output Rules & Guardrails</label>
              <textarea
                rows={3}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Tone, length limit, output schema, edge case handling..."
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Constraint Chips */}
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

          {/* Block 4: Dynamic Variable Placeholders */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px]">4</span>
                <span>Dynamic Variable Placeholders</span>
              </div>
              <button
                onClick={addVariable}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Variable</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Variables created here are automatically compiled into square bracket placeholders like <code className="text-purple-300 bg-purple-500/10 px-1 py-0.5 rounded">[Variable_Name]</code>.
            </p>

            <div className="space-y-2.5 pt-1">
              {variables.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  No custom variables added. Click "+ Add Variable" above.
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
                      <label className="text-[10px] text-slate-500 font-semibold block">Sample Test Value</label>
                      <input
                        type="text"
                        value={v.sampleValue}
                        onChange={(e) => updateVariable(v.id, 'sampleValue', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Sample input text..."
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
        </div>

        {/* Right Column: Assembled Live Preview & Test with Gemini */}
        <div className="lg:col-span-5 space-y-5">
          {/* Assembled Compiled Prompt Card */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl space-y-3 sticky top-20 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assembled Prompt</h3>
              </div>
              <button
                onClick={handleCopyAssembled}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
              >
                {copiedAssembled ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAssembled ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed border-l-2 border-l-cyan-500">
              {assembledPrompt}
            </pre>

            {/* Run Gemini Test Button */}
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Test...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Test</span>
                </>
              )}
            </button>

            {/* Live Test Output Display */}
            {testOutput && (
              <div className="pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini API Output</span>
                  </div>
                  <button
                    onClick={handleCopyOutput}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy AI output"
                  >
                    {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-sans max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {testOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
