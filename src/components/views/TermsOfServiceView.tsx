import React from 'react';
import { FileText, CheckSquare, AlertTriangle, ShieldCheck, Scale, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsOfServiceView: React.FC = () => {
  const { setViewMode } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          id="terms-back-btn"
          onClick={() => setViewMode('dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Effective Date: January 1, 2025 • Last Updated: August 2026
            </p>
          </div>
        </div>
      </div>

      {/* Compliance / Template Notice */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex items-start gap-3 text-indigo-200 text-xs leading-relaxed">
        <Scale className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-indigo-300">Terms Agreement:</strong> By accessing
          or using PromptVault AI, you agree to be bound by these Terms of Service. If you disagree
          with any part of these terms, please discontinue use of the platform.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        {/* 1. Use of Services */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <h3>1. Acceptable Use & License</h3>
          </div>
          <p className="text-slate-300">
            PromptVault AI grants you a personal, non-exclusive, non-transferable license to access our prompt library, prompt optimizer, and development tools. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs">
            <li>Engage in unauthorized scraping, reverse-engineering, or automated bulk exfiltration of system prompt databases.</li>
            <li>Submit malicious prompt injections designed to induce harm, bypass safety filters, or violate third-party model policies.</li>
            <li>Attempt to circumvent API rate-limiting or security controls implemented on the server.</li>
          </ul>
        </div>

        {/* 2. Intellectual Property & User Prompts */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3>2. Intellectual Property & Prompt Ownership</h3>
          </div>
          <p className="text-slate-300">
            <strong className="text-white">Your Content:</strong> You retain all intellectual property rights in the custom prompts, variables, and workflows you create. PromptVault AI claims no ownership over user-generated prompts.
          </p>
          <p className="text-slate-400 text-xs">
            <strong className="text-slate-200">Public Prompts:</strong> When you elect to share or publish a prompt to the community library, you grant PromptVault AI a license to display and syndicate that prompt to other registered users within the application interface.
          </p>
        </div>

        {/* 3. AI Generated Content Disclaimer */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3>3. AI Outputs & Optimization Disclaimer</h3>
          </div>
          <p className="text-slate-300">
            Prompts and AI optimization recommendations generated through our platform are provided "as-is". Due to the probabilistic nature of Large Language Models, PromptVault AI does not warrant that AI model responses will be error-free, factual, or suited for specific regulatory purposes.
          </p>
        </div>

        {/* 4. Termination & Modifications */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Scale className="w-4 h-4 text-indigo-400" />
            <h3>4. Account Termination & Service Changes</h3>
          </div>
          <p className="text-slate-300">
            We reserve the right to suspend or terminate accounts that violate our security policies or terms of service. You may terminate your agreement at any time by deleting your account through the user settings panel.
          </p>
        </div>

        {/* 5. Contact */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-2">
          <h3 className="text-white font-bold text-base">5. Contact Information</h3>
          <p className="text-slate-400 text-xs">
            For questions concerning these Terms, contact our legal team at <span className="text-indigo-400 font-mono">legal@promptvault.ai</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
