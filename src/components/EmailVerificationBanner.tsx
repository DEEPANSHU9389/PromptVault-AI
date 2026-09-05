import React, { useState } from 'react';
import { Mail, RefreshCw, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmailVerificationBanner: React.FC = () => {
  const { currentUser, resendEmailVerification } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Only show if user is logged in, has an email, is not anonymous, and email is not verified
  if (
    !currentUser ||
    !currentUser.email ||
    currentUser.isAnonymous ||
    currentUser.emailVerified === true ||
    isDismissed
  ) {
    return null;
  }

  const handleResend = async () => {
    try {
      setIsSending(true);
      setStatusMessage(null);
      await resendEmailVerification();
      setStatusMessage('Verification email sent! Check your inbox.');
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to send verification email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="email-verification-banner"
      className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-amber-200 text-sm flex items-center justify-between gap-4 transition-all duration-300"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <p className="truncate text-xs md:text-sm text-slate-200">
          Please verify your email address (
          <span className="font-semibold text-amber-300">{currentUser.email}</span>) to secure
          your account and ensure uninterrupted prompt backups.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {statusMessage ? (
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {statusMessage}
          </span>
        ) : (
          <button
            id="resend-verification-btn"
            onClick={handleResend}
            disabled={isSending}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </button>
        )}

        <button
          id="dismiss-verification-banner-btn"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
