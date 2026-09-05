import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Zap,
  Play,
  Copy,
  Check,
  BookmarkPlus,
  ArrowRight,
  TrendingUp,
  Sliders,
  FileText,
  AlertCircle,
  Lightbulb,
  Info,
} from 'lucide-react';

interface OptimizationResult {
  score: number;
  enhancedPrompt: string;
  rationale: string;
  suggestedVariables: string[];
  improvements: string[];
}

const SAMPLE_WEAK_PROMPTS = [
  {
    label: 'Cold Email',
    prompt: 'Write an email to a potential client selling our web development services.',
  },
  {
    label: 'Code Review',
    prompt: 'Check this JavaScript code for bugs and fix it.',
  },
  {
    label: 'SEO Article',
    prompt: 'Write a blog post about artificial intelligence in marketing.',
  },
  {
    label: 'Product Pitch',
    prompt: 'Create a pitch deck script for a new SaaS startup.',
  },
];

// Format variable labels into user-friendly plain text
const formatVariableInfo = (rawVar: string): { label: string; placeholder: string } => {
  const cleanVar = rawVar.replace(/^\[|\]$/g, '').trim();
  const lower = cleanVar.toLowerCase();

  if (lower.includes('pain point') || lower.includes('deficit') || lower.includes('problem')) {
    return { label: 'Customer Problem / Challenge', placeholder: 'e.g. Low website conversion rate' };
  }
  if (lower.includes('proposed solution') || lower.includes('key service') || lower.includes('solution')) {
    return { label: 'Your Solution / Service', placeholder: 'e.g. Modern Web Redesign & SEO' };
  }
  if (lower.includes('social proof') || lower.includes('portfolio metric') || lower.includes('achievement')) {
    return { label: 'Success Story / Achievement', placeholder: 'e.g. Boosted lead conversions by 150%' };
  }
  if (lower.includes('prospect name') || lower.includes('client name') || lower.includes('person name') || lower.includes('prospect')) {
    return { label: 'Client or Person Name', placeholder: 'e.g. Sarah Jenkins' };
  }
  if (lower.includes('company name') || lower.includes('business name') || lower.includes('brand') || lower.includes('company')) {
    return { label: 'Company or Brand Name', placeholder: 'e.g. Acme Tech Solutions' };
  }
  if (lower.includes('target audience') || lower.includes('icp') || lower.includes('audience')) {
    return { label: 'Target Audience', placeholder: 'e.g. B2B SaaS Founders' };
  }
  if (lower.includes('topic') || lower.includes('subject')) {
    return { label: 'Topic / Subject', placeholder: 'e.g. AI Workflow Automation' };
  }
  if (lower.includes('goal') || lower.includes('objective')) {
    return { label: 'Primary Goal', placeholder: 'e.g. Increase product signups' };
  }

  // Friendly fallback
  const simplified = cleanVar
    .replace(/[/_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    label: simplified,
    placeholder: `e.g. Enter ${simplified.toLowerCase()}...`,
  };
};

export const PromptOptimizer: React.FC = () => {
  const { createPrompt, addToast, currentUser } = useApp();

  const [rawPrompt, setRawPrompt] = useState(
    'Write an email to a potential client selling our web development services.'
  );
  const [useHighThinking, setUseHighThinking] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult & { modelUsed?: string; highThinking?: boolean } | null>(null);

  // Deep Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    architecturalScore: number;
    securityRating: string;
    reasoningSteps: string[];
    deepInsights: string;
    recommendedTweaks: string[];
  } | null>(null);

  // Variable test inputs for Live Execution Test
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [copiedTestOutput, setCopiedTestOutput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Call /api/optimize
  const handleOptimize = async () => {
    if (!rawPrompt.trim()) {
      addToast('Please enter or select a raw prompt to optimize.', 'error');
      return;
    }

    setIsOptimizing(true);
    setResult(null);
    setTestOutput(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawPrompt: rawPrompt.trim(), useHighThinking }),
      });

      const data = await response.json();
      if (data.enhancedPrompt) {
        setResult({
          score: data.score || 90,
          enhancedPrompt: data.enhancedPrompt,
          rationale: data.rationale || 'Enhanced prompt clarity, role alignment, and variable placeholders.',
          suggestedVariables: data.suggestedVariables || ['Target Audience', 'Topic'],
          improvements: data.improvements || ['Established expert persona', 'Added output constraints', 'Inserted variable placeholders'],
          modelUsed: data.modelUsed || (useHighThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'),
          highThinking: data.highThinking ?? useHighThinking,
        });

        // Initialize variable values map
        const initialVars: { [key: string]: string } = {};
        (data.suggestedVariables || []).forEach((v: string) => {
          initialVars[v] = '';
        });
        setVariableValues(initialVars);

        addToast(
          useHighThinking
            ? 'Prompt optimized using Gemini 3.1 Pro with High Thinking reasoning!'
            : 'Prompt optimized using Gemini 3.5 Flash!',
          'success'
        );
      } else {
        addToast(data.error || 'Failed to optimize prompt', 'error');
      }
    } catch (err: any) {
      console.error('Optimization error:', err);
      addToast('Failed to optimize prompt with Gemini API', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Run Deep Architectural Audit with High Thinking Mode
  const handleRunDeepAudit = async () => {
    const promptToAudit = result?.enhancedPrompt || rawPrompt;
    if (!promptToAudit.trim()) {
      addToast('Please provide a prompt to audit.', 'error');
      return;
    }

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/deep-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: promptToAudit }),
      });

      const data = await response.json();
      if (data.architecturalScore !== undefined) {
        setAuditResult(data);
        addToast('High Thinking Deep Audit complete!', 'success');
      } else {
        addToast(data.error || 'Deep audit failed.', 'error');
      }
    } catch (err) {
      console.error('Deep audit error:', err);
      addToast('Error running deep audit', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  // Run live test of enhanced prompt
  const handleRunLiveTest = async () => {
    if (!result) return;
    setIsTesting(true);
    setTestOutput(null);

    // Replace [Variables] in enhancedPrompt with test values
    let compiledForTest = result.enhancedPrompt;
    Object.entries(variableValues).forEach(([key, val]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'gi');
      const valStr = String(val || '').trim();
      if (valStr) {
        compiledForTest = compiledForTest.replace(regex, valStr);
      }
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: compiledForTest, model: 'gemini-3.6-flash' }),
      });

      const data = await response.json();
      if (data.result) {
        setTestOutput(data.result);
        addToast('Live test completed with Gemini API!', 'success');
      } else {
        setTestOutput(data.error || 'Error generating test result.');
      }
    } catch (err: any) {
      console.error('Live test error:', err);
      setTestOutput('Error running Gemini API test: ' + (err.message || String(err)));
    } finally {
      setIsTesting(false);
    }
  };

  // Save to My Prompts
  const handleSaveToLibrary = async () => {
    if (!result) return;
    setIsSaving(true);

    try {
      await createPrompt({
        title: `Optimized: ${rawPrompt.slice(0, 30)}...`,
        description: result.rationale,
        prompt: result.enhancedPrompt,
        category: 'Marketing',
        tags: ['Optimized', 'Gemini AI', ...result.suggestedVariables],
        models: ['ChatGPT', 'Claude', 'Gemini'],
        difficulty: 'Advanced',
        author: currentUser?.displayName || 'AI Optimizer User',
      });
      addToast('Saved enhanced prompt to your Firestore library!', 'success');
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
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">AI Prompt Optimizer Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                Gemini 3.1 Pro & 3.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by Gemini 3 series intelligence: High Thinking reasoning, guardrail analysis, and dynamic bracketed variable expansion.
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Enhanced Prompt'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Paste Raw or Weak Prompt
            </label>
            <span className="text-[11px] text-slate-400">
              Model: <strong className="text-purple-300">{useHighThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'}</strong>
            </span>
          </div>
          <textarea
            rows={4}
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Paste your raw, simple, or unoptimized prompt here..."
            className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
          />
        </div>

        {/* High Thinking Mode Toggle Bar */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Enable High Thinking Mode</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[10px] font-mono font-semibold">
                  ThinkingLevel.HIGH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Uses <strong>gemini-3.1-pro-preview</strong> for deep architectural reasoning, security analysis, and guardrail synthesis.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
            <input
              type="checkbox"
              checked={useHighThinking}
              onChange={(e) => setUseHighThinking(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Preset Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Try Sample:</span>
          {SAMPLE_WEAK_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setRawPrompt(sample.prompt)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01]"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{useHighThinking ? 'Analyzing with High Thinking...' : 'Optimizing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{useHighThinking ? 'Optimize with High Thinking (Gemini 3.1 Pro)' : 'Optimize (Gemini 3.5 Flash)'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunDeepAudit}
            disabled={isAuditing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all"
          >
            {isAuditing ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                <span>Auditing Security & Architecture...</span>
              </>
            ) : (
              <>
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Deep Architectural Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deep Audit Results Panel */}
      {auditResult && (
        <div className="p-6 rounded-2xl border border-purple-500/40 bg-purple-950/20 backdrop-blur-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white">High Thinking Architectural & Security Audit</h3>
                <p className="text-[11px] text-purple-300">
                  Model: <strong className="font-mono text-white">gemini-3.1-pro-preview</strong> (ThinkingLevel.HIGH)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-slate-950 border border-purple-500/30 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Architectural Score: </span>
                <span className="text-xs font-extrabold text-cyan-400 ml-1">{auditResult.architecturalScore}/100</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Safety Rating: </span>
                <span className="text-xs font-extrabold text-emerald-400 ml-1">{auditResult.securityRating}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reasoning Steps */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Reasoning Steps & Guardrails</span>
              </h4>
              <ul className="space-y-1.5">
                {auditResult.reasoningSteps.map((step, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400 font-bold font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Tweaks */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Architectural Recommendations</span>
              </h4>
              <ul className="space-y-1.5">
                {auditResult.recommendedTweaks.map((tweak, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{tweak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Deep Insights */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Deep Architectural Insights
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {auditResult.deepInsights}
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison UI & Evaluation Card */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Optimization Score & Summary Banner */}
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Score Badge */}
            <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Prompt Health Score
              </span>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                {result.score}<span className="text-xl text-slate-500">/100</span>
              </div>
              <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Production Grade
              </span>
            </div>

            {/* Rationale & Improvements */}
            <div className="md:col-span-9 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Optimization Rationale</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{result.rationale}</p>

              <div className="pt-2 flex flex-wrap gap-2">
                {result.improvements.map((imp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                  >
                    <Check className="w-3 h-3 text-cyan-400" />
                    {imp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Side-by-Side Prompt Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Prompt */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Original Prompt
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawPrompt);
                    setCopiedOriginal(true);
                    setTimeout(() => setCopiedOriginal(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono leading-relaxed min-h-[180px] whitespace-pre-wrap">
                {rawPrompt}
              </div>
            </div>

            {/* Right: Gemini Enhanced Prompt */}
            <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Gemini Enhanced Prompt
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.enhancedPrompt);
                    setCopiedEnhanced(true);
                    addToast('Enhanced prompt copied!', 'success');
                    setTimeout(() => setCopiedEnhanced(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  {copiedEnhanced ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnhanced ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs text-slate-200 font-mono leading-relaxed min-h-[180px] whitespace-pre-wrap border-l-2 border-l-cyan-400">
                {result.enhancedPrompt}
              </div>
            </div>
          </div>

          {/* Live Execution Test Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Test with Gemini
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Fill in the details below to test how your prompt performs with Gemini.
            </p>

            {/* Dynamic Variable Inputs */}
            {result.suggestedVariables.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {result.suggestedVariables.map((v) => {
                  const info = formatVariableInfo(v);
                  return (
                    <div key={v} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-purple-300 flex items-center justify-between">
                        <span>{info.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">[{v}]</span>
                      </label>
                      <input
                        type="text"
                        value={variableValues[v] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [v]: e.target.value })
                        }
                        placeholder={info.placeholder}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Run Test Button */}
            <button
              onClick={handleRunLiveTest}
              disabled={isTesting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Running Test...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Run Test</span>
                </>
              )}
            </button>

            {/* Output Display */}
            {testOutput && (
              <div className="pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini API Test Response</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(testOutput);
                      setCopiedTestOutput(true);
                      setTimeout(() => setCopiedTestOutput(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedTestOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-wrap">
                  {testOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
