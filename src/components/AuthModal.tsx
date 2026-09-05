import React, { useState, useMemo } from 'react';
import {
  Mail,
  Lock,
  User,
  LogIn,
  Sparkles,
  X,
  Chrome,
  AlertCircle,
  Phone,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfileModal } from './UserProfileModal';

/**
 * Common weak passwords blocklist (case-insensitive)
 */
export const COMMON_WEAK_PASSWORDS: string[] = [
  '12345678',
  '123456789',
  'password',
  'password123',
  'qwerty123',
  'admin123',
  'letmein123',
  'welcome123',
  'promptvault',
  'promptvault123',
  'iloveyou123',
  'abc12345',
];

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isNotBlocked: boolean;
  score: number;
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Evaluates password criteria and returns a strength score & classification
 */
export const evaluatePasswordStrength = (pwd: string): PasswordCriteria => {
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);
  const lower = pwd.toLowerCase().trim();
  const isNotBlocked = !COMMON_WEAK_PASSWORDS.includes(lower);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (!isNotBlocked || pwd.length < 8 || score <= 2) {
    strength = 'weak';
  } else if (score >= 3 && score < 5) {
    strength = 'medium';
  } else if (score === 5 && isNotBlocked) {
    strength = 'strong';
  }

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isNotBlocked,
    score,
    strength,
  };
};

/**
 * Validates a password according to security rules.
 * Returns an error message string or null if valid.
 */
export const validatePassword = (pwd: string): string | null => {
  if (!pwd) {
    return 'Password is required.';
  }
  if (pwd.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  const lower = pwd.toLowerCase().trim();
  if (COMMON_WEAK_PASSWORDS.includes(lower)) {
    return 'This password is too common and easily guessed. Please choose a stronger password.';
  }
  if (!/[A-Z]/.test(pwd)) {
    return 'Password must include at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(pwd)) {
    return 'Password must include at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(pwd)) {
    return 'Password must include at least one number (0-9).';
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    return 'Password must include at least one special character (!@#$%^&* etc.).';
  }
  return null;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    addToast,
    setViewMode,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Real-time password evaluation for register mode
  const passwordCriteria = useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  if (!isOpen) return null;

  // If user is already authenticated, show the rich UserProfileModal
  if (currentUser) {
    return <UserProfileModal isOpen={isOpen} onClose={onClose} />;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      addToast('Signed in with Google', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (mode === 'register') {
      if (passwordError) {
        // Clear or update specific error as user types
        const err = validatePassword(val);
        setPasswordError(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPasswordError(null);

    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    if (mode === 'register') {
      if (!firstName || !lastName) {
        setErrorMessage('Please enter your first and last name');
        return;
      }
      if (!phone) {
        setErrorMessage('Please enter your phone number');
        return;
      }
      if (!background) {
        setErrorMessage('Please enter your professional background / role');
        return;
      }

      // Strict Client-Side Password Strength Validation (Signup only)
      const pwdValidationError = validatePassword(password);
      if (pwdValidationError) {
        setPasswordError(pwdValidationError);
        setErrorMessage('Please fix the password requirements below.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        addToast('Welcome back!', 'success');
      } else {
        await registerWithEmail(email, password, firstName, lastName, phone, background);
        addToast('Account created successfully!', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || `Failed to ${mode === 'login' ? 'sign in' : 'register'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto my-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Authentication Form State */}
        <div>
          {/* Top Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5 mr-8">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setPasswordError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setPasswordError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Join PromptVault AI'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access your saved prompts & custom workflows.'
                : 'Create your account to start managing production AI prompts.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mb-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-3 shadow-sm hover:shadow"
          >
            <Chrome className="w-4 h-4 text-cyan-400" />
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500 uppercase tracking-wider font-semibold">
                Or with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
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
                        placeholder="Doe"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Professional Background / Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      placeholder="e.g. Senior AI Engineer, Product Manager"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {mode === 'register' && password.length > 0 && (
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      passwordCriteria.strength === 'strong'
                        ? 'text-emerald-400'
                        : passwordCriteria.strength === 'medium'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {passwordCriteria.strength}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-slate-950 border text-white rounded-xl text-sm focus:outline-none transition-colors ${
                    passwordError
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Specific Password Validation Error under input */}
              {mode === 'register' && passwordError && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </p>
              )}

              {/* Real-time Visual Strength Meter (Signup Only) */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {/* Visual 3-Bar Strength Indicator */}
                  <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.strength === 'weak'
                          ? 'bg-rose-500'
                          : passwordCriteria.strength === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.strength === 'medium'
                          ? 'bg-amber-400'
                          : passwordCriteria.strength === 'strong'
                          ? 'bg-emerald-400'
                          : 'bg-slate-800'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCriteria.strength === 'strong'
                          ? 'bg-emerald-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  </div>

                  {/* Password Rules Checklist */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-1 text-[10px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasMinLength ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passwordCriteria.hasMinLength ? 'opacity-100' : 'opacity-40'}`} />
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasUppercase && passwordCriteria.hasLowercase
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          passwordCriteria.hasUppercase && passwordCriteria.hasLowercase
                            ? 'opacity-100'
                            : 'opacity-40'
                        }`}
                      />
                      <span>Upper & Lowercase</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passwordCriteria.hasNumber ? 'opacity-100' : 'opacity-40'}`} />
                      <span>At least 1 number</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passwordCriteria.hasSpecialChar ? 'opacity-100' : 'opacity-40'}`} />
                      <span>Special char (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>

            {mode === 'register' && (
              <p className="text-[11px] text-slate-500 text-center mt-2.5">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('terms');
                    onClose();
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('privacy');
                    onClose();
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </p>
            )}
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage('');
                setPasswordError(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
