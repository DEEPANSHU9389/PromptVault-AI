import React from 'react';
import { Shield, Lock, Eye, Server, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicyView: React.FC = () => {
  const { setViewMode } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          id="privacy-back-btn"
          onClick={() => setViewMode('dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Effective Date: January 1, 2025 • Last Updated: August 2026
            </p>
          </div>
        </div>
      </div>

      {/* Compliance / Template Notice */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 flex items-start gap-3 text-cyan-200 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-cyan-300">Notice:</strong> This Privacy Policy
          describes how PromptVault AI collects, uses, and safeguards user information across our prompt
          management and optimization platform.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        {/* 1. Information We Collect */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Eye className="w-4 h-4 text-cyan-400" />
            <h3>1. Information We Collect</h3>
          </div>
          <p className="text-slate-300">
            We collect information you directly provide when registering an account, interacting with our prompt
            engineering tools, or saving prompts to your personal library:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs">
            <li>
              <strong className="text-slate-200">Account Data:</strong> Display name, email address, profile photo URL, and optional professional background.
            </li>
            <li>
              <strong className="text-slate-200">User-Authored Content:</strong> Custom prompts, variable declarations, prompt tags, and categorized collections you create.
            </li>
            <li>
              <strong className="text-slate-200">Authentication Credentials:</strong> Passwords are cryptographically salted and hashed by Firebase Authentication; plain-text passwords are never stored or accessible by our servers.
            </li>
            <li>
              <strong className="text-slate-200">Usage Analytics:</strong> Anonymized interaction telemetry, prompt optimization queries, and error diagnostics to improve system performance.
            </li>
          </ul>
        </div>

        {/* 2. Third-Party Integrations */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3>2. Third-Party Service Providers</h3>
          </div>
          <p className="text-slate-300">
            To provide enterprise-grade reliability, we work with industry-standard third-party sub-processors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="font-semibold text-slate-100 block mb-1">Google Firebase</span>
              <p className="text-slate-400">
                Provides identity authentication, Firestore real-time database synchronization, and encrypted cloud storage for user assets.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="font-semibold text-slate-100 block mb-1">Google Gemini API</span>
              <p className="text-slate-400">
                Powers AI prompt optimization and deep architectural audits. Prompts are transmitted server-side and never used for model re-training without consent.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Data Protection & Security */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3>3. Data Protection & Security Measures</h3>
          </div>
          <p className="text-slate-300">
            We employ modern security practices, including TLS/HTTPS encryption in transit, strict Firestore security rules governing user data access, rate-limiting on sensitive AI endpoints, and secure server-side proxying for private credentials.
          </p>
        </div>

        {/* 4. Your Rights & Account Deletion */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <h3>4. Your Rights & Permanent Account Deletion</h3>
          </div>
          <p className="text-slate-300">
            Under GDPR, CCPA, and global privacy frameworks, you retain full rights over your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs">
            <li>You can export your complete custom prompt data at any time via Settings.</li>
            <li>You can edit your profile information inline in your User Profile modal.</li>
            <li>
              You can permanently delete your entire account and all associated Firestore records via the Danger Zone in your Profile modal. Deletion is instantaneous and permanent.
            </li>
          </ul>
        </div>

        {/* 5. Contact Information */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-2">
          <h3 className="text-white font-bold text-base">5. Contact & Privacy Inquiries</h3>
          <p className="text-slate-400 text-xs">
            If you have questions regarding this Privacy Policy or wish to make a data privacy request, please contact our support team at <span className="text-cyan-400 font-mono">support@promptvault.ai</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
