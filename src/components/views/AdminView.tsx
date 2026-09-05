import React, { useState, useRef } from 'react';
import {
  Shield,
  Upload,
  Plus,
  Edit,
  Star,
  FileText,
  Sparkles,
  Layers,
  Database,
  Calendar,
  Clock,
  LayoutDashboard,
  Users,
  User,
  Activity,
  CheckCircle2,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem } from '../../types';
import { CreatorStudio } from '../admin/CreatorStudio';
import { DraftsManager } from '../admin/DraftsManager';
import { ManagePrompts } from '../admin/ManagePrompts';
import { BulkImporter } from '../admin/BulkImporter';
import { UserManagement } from '../admin/UserManagement';
import { AdminProfile } from '../admin/AdminProfile';

export const AdminView: React.FC = () => {
  const { currentUser, allPrompts, addToast } = useApp();

  const [mainTab, setMainTab] = useState<'overview' | 'cms' | 'users' | 'profile'>('overview');
  const [cmsTab, setCmsTab] = useState<'studio' | 'drafts' | 'manage' | 'bulk'>('studio');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const creatorStudioRef = useRef<HTMLDivElement>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Counts
  const draftPrompts = allPrompts.filter((p) => p.status === 'draft');
  const scheduledPrompts = allPrompts.filter((p) => p.status === 'scheduled');
  const featuredCount = allPrompts.filter((p) => p.isFeatured).length;
  const publishedCount = allPrompts.filter((p) => p.status === 'published' || p.isPublic).length;

  const handleOpenStudio = () => {
    setEditingDraftId(null);
    setMainTab('cms');
    setCmsTab('studio');
    setTimeout(() => {
      creatorStudioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleEditInStudio = (p: PromptItem) => {
    setEditingDraftId(p.id);
    setMainTab('cms');
    setCmsTab('studio');
    addToast('Loaded into Creator Studio for editing', 'info', p.title);
    setTimeout(() => {
      creatorStudioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Admin access is restricted to verified administrators configured via environment variables and Firestore authentication claims.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold uppercase rounded-full flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Operations Center</span>
            </span>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firestore Sync Active</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Admin Control Center & CMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage global prompt assets, user directories, system status, and administrative account profiles.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleOpenStudio}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Open Studio</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Bar (Overview, User Management, Profile, Publishing Studio & CMS) */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto">
        <button
          onClick={() => setMainTab('overview')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
            mainTab === 'overview'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setMainTab('cms')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
            mainTab === 'cms'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Publishing Studio & CMS</span>
        </button>

        <button
          onClick={() => setMainTab('users')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
            mainTab === 'users'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setMainTab('profile')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
            mainTab === 'profile'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {mainTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Total Library Prompts</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{allPrompts.length}</div>
              <p className="text-[11px] text-slate-500">Live & Draft Prompts in Firestore</p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Published Live</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-300">{publishedCount}</div>
              <p className="text-[11px] text-slate-500">Accessible to all users</p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Pending Drafts</span>
                <Edit className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-300">{draftPrompts.length}</div>
              <p className="text-[11px] text-slate-500">Unpublished internal drafts</p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Scheduled Releases</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-blue-300">{scheduledPrompts.length}</div>
              <p className="text-[11px] text-slate-500">Automated timed publication</p>
            </div>
          </div>

          {/* System Status & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span>Platform System Status & Connectivity</span>
                </h3>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All Systems Operational</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Firestore DB</span>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">ai-studio-promptvaultai</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Firebase Auth</span>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500">OAuth & Email Auth</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Firebase Storage</span>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Resumable Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Image Compression ~300KB</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Quick Admin Actions</h3>
                <p className="text-xs text-slate-400 mb-4">Jump directly to key administrative tools and workflows.</p>
                
                <div className="space-y-2.5">
                  <button
                    onClick={handleOpenStudio}
                    className="w-full p-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>Create New Prompt in Studio</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setMainTab('users')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>View User Directory</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setMainTab('profile')}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Edit Administrator Profile</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISHING STUDIO & CMS TAB */}
      {mainTab === 'cms' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-tabs */}
          <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
            <button
              onClick={() => setCmsTab('studio')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
                cmsTab === 'studio'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator Studio</span>
            </button>

            <button
              onClick={() => setCmsTab('drafts')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
                cmsTab === 'drafts'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Drafts & Scheduled ({draftPrompts.length + scheduledPrompts.length})</span>
            </button>

            <button
              onClick={() => setCmsTab('manage')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
                cmsTab === 'manage'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage All ({allPrompts.length})</span>
            </button>

            <button
              onClick={() => setCmsTab('bulk')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
                cmsTab === 'bulk'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Importer</span>
            </button>
          </div>

          {/* Sub-tab Panels */}
          {cmsTab === 'studio' && (
            <div ref={creatorStudioRef}>
              <CreatorStudio
                editingDraftId={editingDraftId}
                onClearEditing={() => setEditingDraftId(null)}
                onSaved={() => setCmsTab('manage')}
              />
            </div>
          )}

          {cmsTab === 'drafts' && (
            <DraftsManager onEditInStudio={handleEditInStudio} />
          )}

          {cmsTab === 'manage' && (
            <ManagePrompts onEditInStudio={handleEditInStudio} />
          )}

          {cmsTab === 'bulk' && (
            <BulkImporter onImportComplete={() => setCmsTab('manage')} />
          )}
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {mainTab === 'users' && <UserManagement />}

      {/* PROFILE TAB */}
      {mainTab === 'profile' && <AdminProfile />}
    </div>
  );
};
