import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SearchBar } from './SearchBar';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Plus,
  Shield,
  LogIn,
  Command,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    filters,
    setFilters,
    theme,
    toggleTheme,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setIsMobileSidebarOpen,
    setIsCommandPaletteOpen,
    setIsCreateModalOpen,
    setViewMode,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Firebase Production Database Connected',
      time: 'Just now',
      desc: 'Firestore rules and authentication active for PromptVault AI.',
    },
    {
      id: 'n2',
      title: 'Daily Prompt Engine Ready',
      time: '1h ago',
      desc: 'Use + Create Prompt or Admin Bulk Importer to publish tested prompts.',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white md:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-full">
          <SearchBar
            value={filters.searchQuery}
            onChange={(val) => {
              setFilters((f) => ({ ...f, searchQuery: val }));
            }}
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2.5 ml-3">
        {/* Command Palette Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
          title="Open Command Palette (⌘K)"
        >
          <Command className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[11px] text-slate-400">⌘K</span>
        </button>

        {/* Admin Quick Button */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setViewMode('admin')}
            className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center space-x-1.5 text-xs font-bold"
            title="Admin CMS Panel"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Admin CMS</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  System Alerts
                </h4>
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Firebase Active
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 my-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Create Prompt Action */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Create Prompt</span>
        </button>

        {/* User Auth / Profile Menu */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-colors"
            >
              <img
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                alt={currentUser.displayName || 'User'}
                className="w-7 h-7 rounded-lg object-cover bg-slate-800 border border-cyan-500/30"
              />
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.displayName || 'User'}
                </span>
                <span className={`text-[9px] font-bold uppercase mt-0.5 ${
                  currentUser.role === 'admin' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all text-xs font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {showProfileMenu && currentUser && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl p-3 z-50 animate-slide-up">
              <div className="pb-3 mb-2 border-b border-slate-800 px-2">
                <p className="text-xs font-bold text-white">{currentUser.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email || 'Firebase Auth User'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    Role: {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setViewMode('admin');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center space-x-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin CMS Panel</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setViewMode('my-prompts');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  My Prompts
                </button>
                <button
                  onClick={() => {
                    setViewMode('saved');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Saved Prompts
                </button>
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-cyan-400 hover:bg-slate-800 transition-colors border-t border-slate-800 mt-1 pt-2 flex items-center justify-between"
                >
                  <span>Edit Profile & Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
