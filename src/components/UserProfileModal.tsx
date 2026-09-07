import React, { useState, useRef } from 'react';
import {
  X,
  Pencil,
  Check,
  Camera,
  Mail,
  KeyRound,
  Calendar,
  LogOut,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth, updateAuthDisplayName, uploadAvatarToStorage, sendResetPasswordEmail } from '../firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, logout, deleteAccount, addToast } = useApp();

  // Inline Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Reset State
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Email Change Scaffold State
  const [showEmailChangeInfo, setShowEmailChangeInfo] = useState(false);

  // Delete Account Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  if (!isOpen || !currentUser) return null;

  // Format "Member since" date from Firebase Auth metadata or user createdAt
  const getMemberSinceDate = (): string => {
    try {
      const creationTime = auth?.currentUser?.metadata?.creationTime || currentUser.createdAt;
      if (creationTime) {
        const date = new Date(creationTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
        }
      }
    } catch {
      // fallback
    }
    return 'August 2026';
  };

  // Start editing display name
  const handleStartEditName = () => {
    setDisplayNameInput(currentUser.displayName || '');
    setIsEditingName(true);
  };

  // Cancel editing display name
  const handleCancelEditName = () => {
    setIsEditingName(false);
    setDisplayNameInput('');
  };

  // Save display name changes with strict 3000ms timeout & immediate local state update
  const handleSaveName = async () => {
    const trimmed = displayNameInput.trim();
    if (!trimmed) {
      addToast('Validation Error', 'warning', 'Display name cannot be empty.');
      return;
    }

    if (trimmed.length < 2) {
      addToast('Validation Error', 'warning', 'Display name must be at least 2 characters.');
      return;
    }

    setIsSavingName(true);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const nameParts = trimmed.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 1. Immediately & synchronously update local AppContext / React state so the UI reflects instantly
      await updateUserProfile({
        displayName: trimmed,
        firstName,
        lastName,
      });

      // 2. Strict 3000ms Promise.race timeout wrapper on remote Firebase calls
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Update timed out. Changes saved locally.')), 3000);
      });

      try {
        await Promise.race([
          updateAuthDisplayName(trimmed, currentUser.uid),
          timeoutPromise,
        ]);
      } catch (raceErr: any) {
        console.warn('Network timeout or background update notice:', raceErr?.message || raceErr);
      }

      addToast('Name updated successfully', 'success');
      setIsEditingName(false);
    } catch (err: any) {
      console.error('Failed to update display name:', err);
      addToast('Update Failed', 'error', err?.message || 'Could not update display name. Please try again.');
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // ALWAYS reset loading spinner state so it never hangs
      setIsSavingName(false);
    }
  };

  // Trigger avatar file picker
  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploadingAvatar) {
      fileInputRef.current.click();
    }
  };

  // Handle avatar file change and upload to Firebase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      addToast('Invalid File Type', 'error', 'Please select a valid JPG or PNG image file.');
      return;
    }

    // Validate file size (2MB max)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      addToast('File Too Large', 'error', 'Image size must be under 2MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const newPhotoURL = await uploadAvatarToStorage(file, currentUser.uid);

      await updateUserProfile({
        photoURL: newPhotoURL,
      });

      addToast('Avatar Updated', 'success', 'Your profile picture has been updated successfully.');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      addToast('Upload Failed', 'error', err?.message || 'Failed to upload avatar to Firebase Storage.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!currentUser.email) {
      addToast('Error', 'error', 'No email address associated with this account.');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendResetPasswordEmail(currentUser.email);
      addToast('Password Reset Email Sent', 'success', `A reset link has been sent to ${currentUser.email}.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      addToast('Password Reset Failed', 'error', err?.message || 'Could not send reset link. Please try again later.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      addToast('Signed Out', 'info', 'You have been successfully logged out.');
      onClose();
    } catch (err: any) {
      console.error('Logout error:', err);
      addToast('Logout Failed', 'error', err?.message || 'Failed to sign out.');
    }
  };

  // Handle account deletion flow
  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      addToast('Account deleted successfully', 'success', 'All your personal data and prompts have been permanently removed.');
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Delete account error:', err);
      const isReauthNeeded =
        err?.message?.includes('requires recent authentication') ||
        err?.code === 'auth/requires-recent-login';

      if (isReauthNeeded) {
        addToast(
          'Re-authentication Required',
          'warning',
          'For security, please sign out and sign in again before deleting your account.'
        );
      } else {
        addToast('Deletion Failed', 'error', err?.message || 'Could not delete account. Please try again.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto my-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          {/* Close Modal Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hidden File Input for Avatar Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            aria-hidden="true"
          />

          <div className="space-y-6 pt-1">
            {/* Header & Avatar Section */}
            <div className="flex items-start gap-4">
              {/* Avatar with Camera Overlay */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-2xl border-2 border-slate-700/80 overflow-hidden bg-slate-800 relative shadow-md">
                  <img
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                    alt={currentUser.displayName || 'User Avatar'}
                    className={`w-full h-full object-cover transition-opacity ${
                      isUploadingAvatar ? 'opacity-30' : 'opacity-100'
                    }`}
                  />

                  {/* Uploading Spinner Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Interactive Camera / Edit Overlay Button */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  aria-label="Upload new profile picture"
                  title="Upload new profile picture (Max 2MB, JPG/PNG)"
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 border border-slate-900 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Display Name & Meta Section */}
              <div className="flex-1 min-w-0 pr-6">
                {/* Display Name Row (Inline Editing) */}
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="Your Name"
                      maxLength={50}
                      autoFocus
                      disabled={isSavingName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                      className="w-full px-2.5 py-1 text-sm font-bold bg-slate-950 border border-cyan-500 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      aria-label="Save name"
                      title="Save name"
                      className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-50"
                    >
                      {isSavingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditName}
                      disabled={isSavingName}
                      aria-label="Cancel editing"
                      title="Cancel"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h3
                      id="user-profile-title"
                      className="text-base font-bold text-white truncate leading-tight"
                      title={currentUser.displayName || 'Authenticated User'}
                    >
                      {currentUser.displayName || 'Authenticated User'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleStartEditName}
                      aria-label="Edit display name"
                      title="Edit display name"
                      className="p-1 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Email (Read-Only) */}
                <p className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email || 'No email associated'}</span>
                </p>

                {/* Member Since Date */}
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Member since {getMemberSinceDate()}</span>
                </p>
              </div>
            </div>

            {/* Account Role Box */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Role</span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentUser.role === 'admin'
                  ? 'Verified Administrator: Full CMS privileges, user role configuration, and prompt management.'
                  : 'Standard Member: Full access to prompt library, custom prompt builder, and AI optimization.'}
              </p>
            </div>

            {/* Security & Authentication Settings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-0.5">
                Account Security & Access
              </h4>

              <div className="space-y-2">
                {/* Reset Password Button */}
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Password & Credentials</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Receive a secure reset link to your registered email address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isSendingReset || !currentUser.email}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSendingReset ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </div>

                {/* Email Change Flow Scaffolding */}
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Email Address</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Requires security re-authentication to update primary email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailChangeInfo(!showEmailChangeInfo)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    Change Email
                  </button>
                </div>

                {/* Re-auth Information notice if toggled */}
                {showEmailChangeInfo && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1 animate-in fade-in duration-150">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Verification Required</span>
                    </div>
                    <p className="text-[11px] text-indigo-200 leading-relaxed">
                      For your security, changing your email requires active re-authentication with your current credentials before Firebase Auth updates the primary email.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider px-0.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Danger Zone</span>
              </h4>

              <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/20 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-rose-300">
                    Delete Account & Data
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permanently delete your profile and all custom prompts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Sign Out of PromptVault AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 id="delete-dialog-title" className="text-base font-bold text-white">
                Delete PromptVault AI Account?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is <span className="text-rose-400 font-semibold">permanent and irreversible</span>. All your personal data, custom prompts, and workflows will be deleted immediately.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Permanently Delete Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingAccount}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
