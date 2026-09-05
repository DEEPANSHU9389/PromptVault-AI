/**
 * PromptVault AI - Modern AI Prompt Library & SaaS App
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { DashboardView } from './components/views/DashboardView';
import { LibraryView } from './components/views/LibraryView';
import { CollectionsView } from './components/views/CollectionsView';
import { SettingsView } from './components/views/SettingsView';
import { BuilderOptimizerView } from './components/views/BuilderOptimizerView';
import { AdminView } from './components/views/AdminView';
import { PrivacyPolicyView } from './components/views/PrivacyPolicyView';
import { TermsOfServiceView } from './components/views/TermsOfServiceView';
import { PromptDetailModal } from './components/PromptDetailModal';
import { CreatePromptModal } from './components/CreatePromptModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ToastContainer } from './components/Toast';

const MainContent: React.FC = () => {
  const { viewMode, isSidebarCollapsed, selectedPrompt, setSelectedPrompt, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Topbar Header */}
        <Topbar />

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {viewMode === 'dashboard' && <DashboardView />}
            {(viewMode === 'library' ||
              viewMode === 'saved' ||
              viewMode === 'favorites' ||
              viewMode === 'my-prompts') && <LibraryView />}
            {viewMode === 'collections' && <CollectionsView />}
            {viewMode === 'settings' && <SettingsView />}
            {viewMode === 'builder' && <BuilderOptimizerView type="builder" />}
            {viewMode === 'optimizer' && <BuilderOptimizerView type="optimizer" />}
            {viewMode === 'admin' && <AdminView />}
            {viewMode === 'privacy' && <PrivacyPolicyView />}
            {viewMode === 'terms' && <TermsOfServiceView />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals & Toasts */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <OnboardingModal />
      <PromptDetailModal
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
      <CreatePromptModal />
      <CommandPaletteModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
