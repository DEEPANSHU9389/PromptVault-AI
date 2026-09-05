import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Briefcase, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { currentUser, isAuthLoading, updateUserProfile, addToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if profile is complete based on profileCompleted flag OR phone & background presence OR localStorage cache
  const isProfileComplete = Boolean(
    currentUser?.profileCompleted === true ||
    (currentUser?.phone &&
      typeof currentUser.phone === 'string' &&
      currentUser.phone.trim().length > 0 &&
      currentUser?.background &&
      typeof currentUser.background === 'string' &&
      currentUser.background.trim().length > 0) ||
    (currentUser?.uid && typeof localStorage !== 'undefined' && localStorage.getItem(`promptvault_profile_completed_${currentUser.uid}`) === 'true')
  );

  // Only display onboarding modal for authenticated users after auth resolution when profile is incomplete
  const needsOnboarding = Boolean(!isAuthLoading && currentUser && !isProfileComplete);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.firstName) setFirstName(currentUser.firstName);
      if (currentUser.lastName) setLastName(currentUser.lastName);
      if (!currentUser.firstName && currentUser.displayName) {
        const parts = currentUser.displayName.trim().split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.background) setBackground(currentUser.background);
    }
  }, [currentUser]);

  if (!needsOnboarding || !currentUser || isAuthLoading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    if (!background.trim()) {
      setErrorMsg('Please specify your professional background or role.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const fn = firstName.trim() || currentUser.firstName || (currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'User');
      const ln = lastName.trim() || currentUser.lastName || '';
      const displayName = ln ? `${fn} ${ln}` : fn;
      const phoneVal = phone.trim();
      const backgroundVal = background.trim();

      // Immediately set localStorage cached profile completion flag
      try {
        localStorage.setItem(`promptvault_profile_completed_${currentUser.uid}`, 'true');
      } catch {
        // ignore localStorage errors
      }

      // Update user profile (persists to memory, localStorage, and Firestore asynchronously via context)
      await updateUserProfile({
        firstName: fn,
        lastName: ln,
        displayName,
        phone: phoneVal,
        background: backgroundVal,
        profileCompleted: true,
      });

      addToast('Profile setup complete! Welcome to PromptVault AI.', 'success');
    } catch (err: any) {
      console.error('Error saving onboarding profile:', err);
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-2xl border border-purple-500/40 bg-slate-900 p-6 md:p-8 shadow-2xl shadow-purple-500/30">
        <div className="flex items-center space-x-2 text-purple-400 mb-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-widest bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            Account Setup Required
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 mb-6">
          To provide tailored AI prompt recommendations and ensure workspace security, please complete your account details before continuing to the dashboard.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Professional Background / Role <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="e.g. Lead AI Engineer, Marketing Strategist, Content Creator"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Setup & Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured via PromptVault AI Firestore User Schema</span>
        </div>
      </div>
    </div>
  );
};
