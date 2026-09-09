import React from 'react';
import { useApp } from '../context/AppContext';
import { ViewMode } from '../types';
import {
  LayoutDashboard,
  Library,
  Wand2,
  Sparkles,
  Bookmark,
  Star,
  User,
  FolderKanban,
  Settings,
  Shield,
  ShieldAlert,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    stats,
    currentUser,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setIsCreateModalOpen,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const handleCreatePromptClick = () => {
    if (isAdmin) {
      setViewMode('admin');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library' as ViewMode, label: 'Prompt Library', icon: Library },
    { id: 'builder' as ViewMode, label: 'Prompt Builder', icon: Wand2, badge: 'New' },
    { id: 'optimizer' as ViewMode, label: 'AI Optimizer', icon: Sparkles, badge: 'AI' },
  ];

  const libraryItems = [
    { id: 'saved' as ViewMode, label: 'Saved Prompts', icon: Bookmark, count: stats.savedPromptsCount },
    { id: 'favorites' as ViewMode, label: 'Favorites', icon: Star, count: stats.favoritesCount },
    { id: 'my-prompts' as ViewMode, label: 'My Prompts', icon: User, count: stats.myPromptsCount },
    { id: 'collections' as ViewMode, label: 'Collections', icon: FolderKanban },
  ];

  const systemItems = [
    { id: 'admin' as ViewMode, label: 'Admin CMS', icon: Shield, badge: currentUser?.role === 'admin' ? 'Active' : undefined },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
    { id: 'privacy' as ViewMode, label: 'Privacy Policy', icon: Lock },
    { id: 'terms' as ViewMode, label: 'Terms of Service', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div>
          {/* Header & Brand Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
            <div
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                </div>
              </div>

              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <div>
                  <h1 className="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                    PromptVault <span className="text-cyan-400 font-extrabold">AI</span>
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-500 -mt-0.5">SaaS Platform</p>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Prompt Button */}
          {(!isSidebarCollapsed || isMobileSidebarOpen) ? (
            <div className="p-3">
              <button
                onClick={handleCreatePromptClick}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02] ${
                  isAdmin
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAdmin ? '+ Publish Studio' : '+ Create Prompt'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 flex justify-center">
              <button
                onClick={handleCreatePromptClick}
                title={isAdmin ? 'Admin Publishing Studio' : 'Create Personal Prompt'}
                className={`p-2.5 rounded-xl shadow-md transition-all ${
                  isAdmin
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] no-scrollbar">
            {/* Main Section */}
            <div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Navigation
                </p>
              )}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = viewMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      title={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      } ${isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                          <span>{item.label}</span>
                        )}
                      </div>
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Library Section */}
            <div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  My Workspace
                </p>
              )}
              <div className="space-y-1">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = viewMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      title={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      } ${isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                          <span>{item.label}</span>
                        )}
                      </div>
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && item.count !== undefined && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Section */}
            <div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  System
                </p>
              )}
              <div className="space-y-1">
                {systemItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = viewMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      title={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      } ${isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                          <span>{item.label}</span>
                        )}
                      </div>
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Desktop Collapse Toggle */}
        <div className="p-3 border-t border-slate-800/80 hidden md:block">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
