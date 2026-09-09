import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import {
  PromptItem,
  ViewMode,
  FilterState,
  ToastMessage,
  UserProfile,
  CategoryType,
  AIModelType,
  DifficultyType,
} from '../types';
import { INITIAL_PROMPTS } from '../data/initialPrompts';
import {
  getStoredSavedIds,
  saveStoredSavedIds,
  getStoredFavoriteIds,
  saveStoredFavoriteIds,
  getStoredUserPrompts,
  saveStoredUserPrompts,
  getStoredTheme,
  saveStoredTheme,
  getStoredDeletedIds,
  saveStoredDeletedIds,
  incrementUsageCount,
  getStoredProfileCompleted,
  setStoredProfileCompleted,
  getStoredUserProfile,
  setStoredUserProfile,
  sanitizeTags,
} from '../utils/storage';
import { getInitialUserRole } from '../utils/admin';
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logoutUser,
  onAuthChange,
  getPromptsFromFirestore,
  addPromptToFirestore,
  updatePromptInFirestore,
  deletePromptFromFirestore,
  getUserLibraryFromFirestore,
  saveUserLibraryToFirestore,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  bulkImportPromptsToFirestore,
  deleteUserAccount,
  sendUserEmailVerification,
  addUserPromptToFirestore,
  getUserPromptsFromFirestore,
  updateUserPromptInFirestore,
  deleteUserPromptFromFirestore,
} from '../firebase';

interface AppContextType {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Auth & User State
  currentUser: UserProfile | null;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<UserProfile | null>;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
    phone: string,
    background: string
  ) => Promise<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  
  // Prompts & Collections State
  allPrompts: PromptItem[];
  savedIds: string[];
  favoriteIds: string[];
  userPrompts: PromptItem[];
  
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  toggleSavePrompt: (id: string) => void;
  toggleFavoritePrompt: (id: string) => void;
  createPrompt: (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'usageCount' | 'rating' | 'ratingCount' | 'isUserCreated'>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<PromptItem>) => Promise<void>;
  deleteUserPrompt: (id: string) => Promise<void>;
  bulkImportPrompts: (prompts: Omit<PromptItem, 'id'>[]) => Promise<number>;
  copyPromptToClipboard: (prompt: PromptItem, customText?: string) => Promise<boolean>;
  
  selectedPrompt: PromptItem | null;
  setSelectedPrompt: (prompt: PromptItem | null) => void;
  
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  
  toasts: ToastMessage[];
  addToast: (title: string, type?: 'success' | 'info' | 'warning' | 'error', description?: string) => void;
  removeToast: (id: string) => void;
  
  filteredPrompts: PromptItem[];
  stats: {
    totalPrompts: number;
    savedPromptsCount: number;
    favoritesCount: number;
    myPromptsCount: number;
  };
}

const defaultFilterState: FilterState = {
  searchQuery: '',
  category: 'All',
  model: 'All',
  difficulty: 'All',
  sortBy: 'popular',
  collectionFilter: undefined,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewModeState] = useState<ViewMode>('dashboard');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const lastSyncedUidRef = useRef<string | null>(null);
  const isSyncingProfileRef = useRef<boolean>(false);

  // Prompts State
  const [firestorePrompts, setFirestorePrompts] = useState<PromptItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [userPrompts, setUserPrompts] = useState<PromptItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toasts
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: ToastMessage = { id, title, description, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    const loadedTheme = getStoredTheme();
    setThemeState(loadedTheme);
    document.documentElement.classList.toggle('light', loadedTheme === 'light');
    
    setSavedIds(getStoredSavedIds());
    setFavoriteIds(getStoredFavoriteIds());
    setUserPrompts(getStoredUserPrompts());
    setDeletedIds(getStoredDeletedIds());

    // Listen to Firebase Auth state
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthChange(async (fbUser) => {
        if (!fbUser) {
          lastSyncedUidRef.current = null;
          isSyncingProfileRef.current = false;
          setCurrentUser(null);
          setIsAuthLoading(false);
          return;
        }

        const uid = fbUser.uid;

        // 1. OPTIMISTIC LOADING & LOCALSTORAGE CACHING
        // Immediately check localStorage for cached profile status and profile data
        const isCachedComplete = getStoredProfileCompleted(uid);
        const cachedProfile = getStoredUserProfile(uid);

        if (cachedProfile) {
          const profileWithComplete: UserProfile = {
            ...cachedProfile,
            emailVerified: fbUser.emailVerified,
            profileCompleted: isCachedComplete || Boolean(
              cachedProfile.profileCompleted ||
              (cachedProfile.phone && cachedProfile.phone.trim().length > 0 &&
               cachedProfile.background && cachedProfile.background.trim().length > 0)
            ),
          };
          setCurrentUser((prev) => (prev?.uid === uid ? { ...prev, ...profileWithComplete } : profileWithComplete));
          // Grant instant dashboard access without waiting for network Firestore read!
          setIsAuthLoading(false);
        } else if (isCachedComplete) {
          const nameParts = (fbUser.displayName || '').trim().split(' ');
          const optimisticProfile: UserProfile = {
            uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: '',
            background: '',
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
            role: getInitialUserRole(fbUser.email),
            createdAt: new Date().toISOString(),
            profileCompleted: true,
            emailVerified: fbUser.emailVerified,
          };
          setCurrentUser((prev) => (prev?.uid === uid ? { ...prev, ...optimisticProfile } : optimisticProfile));
          setIsAuthLoading(false);
        } else if (!currentUser || currentUser.uid !== uid) {
          // If not cached and not yet loaded in state, show loading
          setIsAuthLoading(true);
        }

        // Prevent redundant concurrent Firestore syncs or blank doc overwrite when handled by active auth flows
        if (isSyncingProfileRef.current && lastSyncedUidRef.current === uid) {
          setIsAuthLoading(false);
          return;
        }
        isSyncingProfileRef.current = true;
        lastSyncedUidRef.current = uid;

        // 2. BACKGROUND ASYNCHRONOUS FIRESTORE DOC FETCH (WITH 2.5s TIMEOUT)
        try {
          const profile = await getUserProfileFromFirestore(uid, 2500);
          if (profile) {
            const isComplete = Boolean(
              profile.profileCompleted === true ||
              (profile.phone && profile.phone.trim().length > 0 &&
               profile.background && profile.background.trim().length > 0)
            );
            const fullProfile: UserProfile = {
              ...profile,
              emailVerified: fbUser.emailVerified,
              profileCompleted: isComplete,
            };
            setCurrentUser(fullProfile);
            setStoredUserProfile(uid, fullProfile);
            setStoredProfileCompleted(uid, isComplete);
          } else {
            // Check if active state or cache already has user profile data to prevent overwriting
            const currentHasData = Boolean(
              cachedProfile || 
              isCachedComplete || 
              (currentUser && currentUser.uid === uid && (currentUser.profileCompleted || currentUser.phone || currentUser.background))
            );

            // ONLY create initial blank document if user is truly brand-new and has no active state or cached data
            if (!currentHasData) {
              const nameParts = (fbUser.displayName || '').trim().split(' ');
              const newProfile: UserProfile = {
                uid,
                email: fbUser.email,
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                phone: '',
                background: '',
                photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
                role: getInitialUserRole(fbUser.email),
                createdAt: new Date().toISOString(),
                profileCompleted: false,
              };
              await saveUserProfileToFirestore(newProfile);
              setCurrentUser(newProfile);
              setStoredUserProfile(uid, newProfile);
              setStoredProfileCompleted(uid, false);
            }
          }
        } catch (err) {
          console.error('Error syncing profile from Firestore:', err);
          // If timed out or error occurred and no profile exists in state, fallback to granting access
          setCurrentUser((prev) => {
            if (prev && prev.uid === uid) return prev;
            const nameParts = (fbUser.displayName || '').trim().split(' ');
            return {
              uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: '',
              background: '',
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
              role: getInitialUserRole(fbUser.email),
              createdAt: new Date().toISOString(),
              profileCompleted: true, // Default to granting access rather than hanging
            };
          });
        } finally {
          isSyncingProfileRef.current = false;
          setIsAuthLoading(false);
        }

        // Fetch user's Firestore library (Saved & Favorites) asynchronously in background
        getUserLibraryFromFirestore(uid)
          .then((library) => {
            if (library.savedPromptIds.length > 0) setSavedIds(library.savedPromptIds);
            if (library.favoritePromptIds.length > 0) setFavoriteIds(library.favoritePromptIds);
          })
          .catch((err) => {
            console.warn('Error fetching user library from Firestore:', err);
          });

        // Fetch user's private prompts from users/{uid}/myPrompts
        getUserPromptsFromFirestore(uid)
          .then((fsUserPrompts) => {
            if (fsUserPrompts && fsUserPrompts.length > 0) {
              setUserPrompts((prev) => {
                const mergedMap = new Map<string, PromptItem>();
                prev.forEach((p) => mergedMap.set(p.id, p));
                fsUserPrompts.forEach((p) => mergedMap.set(p.id, p));
                const merged = Array.from(mergedMap.values());
                saveStoredUserPrompts(merged);
                return merged;
              });
            }
          })
          .catch((err) => {
            console.warn('Error fetching personal prompts from Firestore:', err);
          });
      });

      // Fetch global prompts from Firestore (with 10s initial wait, background resolution, and error reporting)
      getPromptsFromFirestore(10000, (backgroundPrompts) => {
        if (backgroundPrompts && backgroundPrompts.length > 0) {
          setFirestorePrompts(backgroundPrompts);
        }
      })
        .then((prompts) => {
          if (prompts && prompts.length > 0) {
            setFirestorePrompts(prompts);
          }
        })
        .catch((err) => {
          console.error('[PromptVault] Error fetching prompts from Firestore:', err);
          addToast('Cloud Prompts Notice', 'warning', 'Could not sync cloud prompts. Using local prompt library.');
        });

      return () => unsubscribe();
    } else {
      setIsAuthLoading(false);
    }
  }, [addToast]);

  // 1b. Listen for reactive Firestore background sync events and errors
  useEffect(() => {
    const handlePromptsSynced = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompts: PromptItem[]; timedOut: boolean; count: number }>;
      if (customEvent.detail?.prompts && customEvent.detail.prompts.length > 0) {
        setFirestorePrompts(customEvent.detail.prompts);
        if (customEvent.detail.timedOut) {
          addToast('Cloud Prompts Synced', 'info', `Loaded ${customEvent.detail.count} prompts from Cloud Firestore.`);
        }
      }
    };

    const handleSyncFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{ error: string; timedOut: boolean }>;
      console.warn('[PromptVault] Firestore synchronization notice:', customEvent.detail?.error);
      addToast('Cloud Sync Notice', 'warning', 'Cloud database is currently unreachable. Operating with local data.');
    };

    window.addEventListener('promptvault:firestore-prompts-synced', handlePromptsSynced);
    window.addEventListener('promptvault:firestore-sync-failed', handleSyncFailed);

    return () => {
      window.removeEventListener('promptvault:firestore-prompts-synced', handlePromptsSynced);
      window.removeEventListener('promptvault:firestore-sync-failed', handleSyncFailed);
    };
  }, [addToast]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    saveStoredTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        lastSyncedUidRef.current = profile.uid;
        isSyncingProfileRef.current = true;
        const isComplete = Boolean(
          profile.profileCompleted ||
          (profile.phone && profile.background) ||
          getStoredProfileCompleted(profile.uid)
        );
        const resolvedProfile: UserProfile = {
          ...profile,
          profileCompleted: isComplete,
        };
        setCurrentUser(resolvedProfile);
        if (resolvedProfile.uid) {
          setStoredUserProfile(resolvedProfile.uid, resolvedProfile);
          setStoredProfileCompleted(resolvedProfile.uid, isComplete);
        }
        setIsAuthLoading(false);
      }
      return profile;
    } finally {
      setTimeout(() => {
        isSyncingProfileRef.current = false;
      }, 500);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const profile = await signInWithEmail(email, pass);
      if (profile) {
        lastSyncedUidRef.current = profile.uid;
        isSyncingProfileRef.current = true;
        const isComplete = Boolean(
          profile.profileCompleted ||
          (profile.phone && profile.background) ||
          getStoredProfileCompleted(profile.uid)
        );
        const resolvedProfile: UserProfile = {
          ...profile,
          profileCompleted: isComplete,
        };
        setCurrentUser(resolvedProfile);
        if (resolvedProfile.uid) {
          setStoredUserProfile(resolvedProfile.uid, resolvedProfile);
          setStoredProfileCompleted(resolvedProfile.uid, isComplete);
        }
        setIsAuthLoading(false);
      }
      return profile;
    } finally {
      setTimeout(() => {
        isSyncingProfileRef.current = false;
      }, 500);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
    phone: string,
    background: string
  ) => {
    try {
      const profile = await signUpWithEmail(email, pass, firstName, lastName, phone, background);
      if (profile) {
        lastSyncedUidRef.current = profile.uid;
        isSyncingProfileRef.current = true;
        const resolvedProfile: UserProfile = {
          ...profile,
          profileCompleted: true,
        };
        setCurrentUser(resolvedProfile);
        if (resolvedProfile.uid) {
          setStoredUserProfile(resolvedProfile.uid, resolvedProfile);
          setStoredProfileCompleted(resolvedProfile.uid, true);
        }
        setIsAuthLoading(false);
      }
      return profile;
    } finally {
      setTimeout(() => {
        isSyncingProfileRef.current = false;
      }, 500);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const isComplete = updates.profileCompleted !== undefined
      ? updates.profileCompleted
      : Boolean(
          currentUser.profileCompleted === true ||
          (updates.phone?.trim() && updates.background?.trim()) ||
          (currentUser.phone?.trim() && currentUser.background?.trim())
        );
    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      profileCompleted: isComplete,
    };
    
    // 1. Immediately reflect in memory and localStorage synchronously BEFORE triggering saveUserProfileToFirestore
    setCurrentUser(updated);
    if (updated.uid) {
      setStoredUserProfile(updated.uid, updated);
      setStoredProfileCompleted(updated.uid, isComplete);
      lastSyncedUidRef.current = updated.uid;
      isSyncingProfileRef.current = true;
    }

    try {
      // 2. Guarantee resolution within ~3s (saveUserProfileToFirestore has a 3000ms timeout guard)
      await saveUserProfileToFirestore(updated);
    } catch (err) {
      console.error('Failed to sync updated profile to Firestore:', err);
    } finally {
      setTimeout(() => {
        isSyncingProfileRef.current = false;
      }, 500);
    }
  };

  const logout = async () => {
    lastSyncedUidRef.current = null;
    isSyncingProfileRef.current = false;
    await logoutUser();
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    const targetUid = currentUser?.uid;
    lastSyncedUidRef.current = null;
    isSyncingProfileRef.current = false;
    try {
      await deleteUserAccount(targetUid);
    } finally {
      setCurrentUser(null);
      setViewModeState('dashboard');
    }
  };

  const resendEmailVerification = async () => {
    try {
      const res = await sendUserEmailVerification();
      addToast(res.message, 'success');
    } catch (err: any) {
      addToast('Verification Notice', 'warning', err.message || 'Failed to send verification email.');
      throw err;
    }
  };

  // Combined List of All Prompts (Firestore prompts + local user prompts + initial empty)
  const allPrompts = useMemo(() => {
    // Deduplicate by ID and exclude deleted items
    const map = new Map<string, PromptItem>();
    INITIAL_PROMPTS.forEach((p) => {
      if (!deletedIds.includes(p.id)) map.set(p.id, p);
    });
    firestorePrompts.forEach((p) => {
      if (!deletedIds.includes(p.id)) map.set(p.id, p);
    });
    userPrompts.forEach((p) => {
      if (!deletedIds.includes(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [firestorePrompts, userPrompts, deletedIds]);

  // Handle Save
  const toggleSavePrompt = (id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      saveStoredSavedIds(next);

      if (currentUser && isFirebaseConfigured) {
        saveUserLibraryToFirestore(currentUser.uid, next, favoriteIds);
      }

      const prompt = allPrompts.find((p) => p.id === id);
      if (prompt) {
        addToast(
          exists ? 'Removed from Saved' : 'Saved to Library!',
          exists ? 'info' : 'success',
          prompt.title
        );
      }
      return next;
    });
  };

  // Handle Favorite
  const toggleFavoritePrompt = (id: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      saveStoredFavoriteIds(next);

      if (currentUser && isFirebaseConfigured) {
        saveUserLibraryToFirestore(currentUser.uid, savedIds, next);
      }

      const prompt = allPrompts.find((p) => p.id === id);
      if (prompt) {
        addToast(
          exists ? 'Removed from Favorites' : 'Added to Favorites!',
          exists ? 'info' : 'success',
          prompt.title
        );
      }
      return next;
    });
  };

  // Create Prompt (Immediately populates library)
  const createPrompt = async (
    data: Omit<PromptItem, 'id' | 'createdAt' | 'usageCount' | 'rating' | 'ratingCount' | 'isUserCreated'>
  ): Promise<void> => {
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const cleanedTags = sanitizeTags(data.tags || []);
    const safeTags = cleanedTags.length > 0 ? cleanedTags : [data.category || 'Marketing', 'AI'];
    const isAdmin = currentUser?.role === 'admin';

    const newPrompt: PromptItem = {
      ...data,
      id: newId,
      title: (data.title || '').trim(),
      description: (data.description || '').trim() || 'Production prompt template.',
      prompt: (data.prompt || '').trim(),
      category: (data.category || 'Marketing').trim(),
      difficulty: data.difficulty || 'Intermediate',
      models: data.models && data.models.length > 0 ? data.models : (data.compatibleApps && data.compatibleApps.length > 0 ? data.compatibleApps : ['ChatGPT']),
      compatibleApps: data.compatibleApps && data.compatibleApps.length > 0 ? data.compatibleApps : (data.models && data.models.length > 0 ? data.models : ['ChatGPT']),
      compatibleModels: data.compatibleModels || data.modelVersions || [],
      modelVersions: data.modelVersions || data.compatibleModels || [],
      tags: safeTags,
      // Regular users are strictly restricted from publishing globally
      status: isAdmin ? (data.status || 'published') : 'draft',
      isPublic: isAdmin ? (data.isPublic !== undefined ? data.isPublic : data.status === 'published') : false,
      isFeatured: isAdmin ? Boolean(data.isFeatured) : false,
      scheduledAt: isAdmin ? data.scheduledAt || undefined : undefined,
      imageUrl: data.imageUrl || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 1,
      rating: 5.0,
      ratingCount: 1,
      isUserCreated: true,
      isPersonal: !isAdmin,
      author: data.author || currentUser?.displayName || 'You (Custom)',
      authorId: data.authorId || currentUser?.uid || 'user-local',
      authorEmail: data.authorEmail || currentUser?.email || undefined,
    };

    // 1. Synchronously update local user prompts and storage immediately
    const updatedUserPrompts = [newPrompt, ...userPrompts.filter((p) => p.id !== newId)];
    setUserPrompts(updatedUserPrompts);
    saveStoredUserPrompts(updatedUserPrompts);

    // If admin published publicly, also make sure it shows up in firestorePrompts state
    if (isAdmin && (newPrompt.isPublic || newPrompt.status === 'published')) {
      setFirestorePrompts((prev) => [newPrompt, ...prev.filter((p) => p.id !== newId)]);
    }

    // 2. Persist to Firestore with timeout guard (strictly RBAC enforced)
    if (isFirebaseConfigured) {
      try {
        if (isAdmin) {
          // Admin publishes to the root 'prompts' collection (Global Public Library)
          await addPromptToFirestore(newPrompt, 4000);
          getPromptsFromFirestore(4000)
            .then((updatedFS) => {
              if (updatedFS && updatedFS.length > 0) {
                setFirestorePrompts(updatedFS);
              }
            })
            .catch((e) => console.warn('Background Firestore prompts sync warning:', e));
        } else if (currentUser?.uid) {
          // Regular user strictly saves to their personal private subcollection: users/{uid}/myPrompts
          await addUserPromptToFirestore(currentUser.uid, newPrompt, 4000);
        }
      } catch (e) {
        console.error('Failed to save prompt to Firestore, fallback to LocalStorage:', e);
      }
    }

    setIsCreateModalOpen(false);
    setSelectedPrompt(newPrompt);
  };

  // Update Prompt
  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
    const cleanedUpdates = { ...updates };
    if (updates.tags) {
      cleanedUpdates.tags = sanitizeTags(updates.tags);
    }
    if (updates.title) cleanedUpdates.title = updates.title.trim();
    if (updates.description) cleanedUpdates.description = updates.description.trim();
    if (updates.prompt) cleanedUpdates.prompt = updates.prompt.trim();
    if (updates.category) cleanedUpdates.category = updates.category.trim();

    // Regular users cannot make prompts public
    if (currentUser?.role !== 'admin') {
      cleanedUpdates.isPublic = false;
    }

    // 1. Immediately reflect in memory and localStorage
    setUserPrompts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...cleanedUpdates } : p));
      saveStoredUserPrompts(next);
      return next;
    });

    setFirestorePrompts((prev) => {
      return prev.map((p) => (p.id === id ? { ...p, ...cleanedUpdates } : p));
    });

    if (selectedPrompt?.id === id) {
      setSelectedPrompt({ ...selectedPrompt, ...cleanedUpdates });
    }

    // 2. Sync to Firestore in background with timeout guard
    if (isFirebaseConfigured) {
      try {
        if (currentUser?.role === 'admin') {
          const isGlobal = firestorePrompts.some((p) => p.id === id);
          if (isGlobal) {
            await updatePromptInFirestore(id, cleanedUpdates, 4000);
          } else if (currentUser?.uid) {
            await updateUserPromptInFirestore(currentUser.uid, id, cleanedUpdates, 4000);
          }
        } else if (currentUser?.uid) {
          await updateUserPromptInFirestore(currentUser.uid, id, cleanedUpdates, 4000);
        }
      } catch (e) {
        console.error('Failed to update prompt in Firestore:', e);
      }
    }
  };

  // Delete User Prompt
  const deleteUserPrompt = async (id: string) => {
    // 1. Mark as deleted locally so it immediately disappears from UI
    setDeletedIds((prev) => {
      if (!prev.includes(id)) {
        const next = [...prev, id];
        saveStoredDeletedIds(next);
        return next;
      }
      return prev;
    });

    // 2. Delete from Firestore if configured
    if (isFirebaseConfigured) {
      try {
        if (currentUser?.role === 'admin') {
          const isGlobal = firestorePrompts.some((p) => p.id === id);
          if (isGlobal) {
            await deletePromptFromFirestore(id);
          } else if (currentUser?.uid) {
            await deleteUserPromptFromFirestore(currentUser.uid, id);
          }
        } else if (currentUser?.uid) {
          await deleteUserPromptFromFirestore(currentUser.uid, id);
        }
      } catch (err) {
        console.error('Error deleting prompt from Firestore:', err);
      }
      setFirestorePrompts((prev) => prev.filter((p) => p.id !== id));
    }

    // 3. Delete from local userPrompts
    const updated = userPrompts.filter((p) => p.id !== id);
    setUserPrompts(updated);
    saveStoredUserPrompts(updated);

    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null);
    }

    addToast('Prompt deleted successfully', 'info');
  };

  // Bulk Import Prompts
  const bulkImportPrompts = async (prompts: Omit<PromptItem, 'id'>[]): Promise<number> => {
    let count = 0;
    if (isFirebaseConfigured) {
      count = await bulkImportPromptsToFirestore(prompts);
      const updatedFS = await getPromptsFromFirestore();
      setFirestorePrompts(updatedFS);
    } else {
      const newItems: PromptItem[] = prompts.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split('T')[0],
        usageCount: 1,
        rating: 5.0,
        ratingCount: 1,
        isUserCreated: true,
      }));
      setUserPrompts((prev) => {
        const next = [...newItems, ...prev];
        saveStoredUserPrompts(next);
        return next;
      });
      count = newItems.length;
    }
    return count;
  };

  // Copy Prompt to Clipboard
  const copyPromptToClipboard = async (prompt: PromptItem, customText?: string): Promise<boolean> => {
    const textToCopy = customText || prompt.prompt;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      incrementUsageCount(prompt.id);
      if (isFirebaseConfigured) {
        updatePromptInFirestore(prompt.id, { usageCount: (prompt.usageCount || 0) + 1 });
      }

      addToast('Prompt copied!', 'success', 'Copied to clipboard');
      return true;
    } catch (err) {
      console.error('Failed to copy text', err);
      addToast('Failed to copy', 'error', 'Please select and copy manually');
      return false;
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilterState);
  };

  // View Mode Change Helper
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    setIsMobileSidebarOpen(false);
    if (mode !== 'library' && mode !== 'collections') {
      setFilters((f) => ({ ...f, collectionFilter: undefined }));
    }
  };

  // Filter Logic
  const filteredPrompts = useMemo(() => {
    return allPrompts.filter((item) => {
      // 0. Draft & Scheduled Exclusion for Public Library & Dashboard
      if ((viewMode === 'library' || viewMode === 'dashboard') && (item.status === 'draft' || item.status === 'scheduled')) {
        return false;
      }

      // 1. View Mode Specific Filter
      if (viewMode === 'saved' && !savedIds.includes(item.id)) {
        return false;
      }
      if (viewMode === 'favorites' && !favoriteIds.includes(item.id)) {
        return false;
      }
      if (viewMode === 'my-prompts' && !item.isUserCreated && item.authorId !== currentUser?.uid) {
        return false;
      }

      // 2. Collection Filter
      if (filters.collectionFilter) {
        if (filters.collectionFilter === 'c-marketing' && item.category !== 'Marketing' && item.category !== 'Social Media') return false;
        if (filters.collectionFilter === 'c-coding' && item.category !== 'Coding' && item.category !== 'AI Automation') return false;
        if (filters.collectionFilter === 'c-creative' && item.category !== 'Image Generation' && item.category !== 'Video Generation') return false;
        if (filters.collectionFilter === 'c-productivity' && item.category !== 'Productivity' && item.category !== 'Business' && item.category !== 'Education') return false;
      }

      // 3. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
        const matchPrompt = item.prompt.toLowerCase().includes(query);
        const matchModels = item.models.some((m) => m.toLowerCase().includes(query));

        if (!matchTitle && !matchDesc && !matchCat && !matchTags && !matchPrompt && !matchModels) {
          return false;
        }
      }

      // 4. Category Filter
      if (filters.category !== 'All' && item.category !== filters.category) {
        return false;
      }

      // 5. Model Filter
      if (filters.model !== 'All' && !item.models.includes(filters.model as AIModelType)) {
        return false;
      }

      // 6. Difficulty Filter
      if (filters.difficulty !== 'All' && item.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'popular') return (b.usageCount || 0) - (a.usageCount || 0);
      if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (filters.sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [allPrompts, viewMode, savedIds, favoriteIds, filters, currentUser]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalPrompts: allPrompts.length,
      savedPromptsCount: savedIds.length,
      favoritesCount: favoriteIds.length,
      myPromptsCount: allPrompts.filter((p) => p.isUserCreated || p.authorId === currentUser?.uid).length,
    };
  }, [allPrompts, savedIds, favoriteIds, currentUser]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        viewMode,
        setViewMode,
        currentUser,
        isAuthLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        updateUserProfile,
        logout,
        deleteAccount,
        resendEmailVerification,
        allPrompts,
        savedIds,
        favoriteIds,
        userPrompts,
        filters,
        setFilters,
        resetFilters,
        toggleSavePrompt,
        toggleFavoritePrompt,
        createPrompt,
        updatePrompt,
        deleteUserPrompt,
        bulkImportPrompts,
        copyPromptToClipboard,
        selectedPrompt,
        setSelectedPrompt,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toasts,
        addToast,
        removeToast,
        filteredPrompts,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
