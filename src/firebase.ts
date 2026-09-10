import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
  writeBatch,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';
import { PromptItem, UserProfile } from './types';
import { getInitialUserRole } from './utils/admin';

// Determine config strictly from environment variables
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
};

// Sanitize database ID to strictly avoid '(default)' errors if misconfigured
const rawDatabaseId = (import.meta.env.VITE_FIREBASE_DATABASE_ID || '').trim();
const hasCustomDatabaseId = Boolean(
  rawDatabaseId &&
  rawDatabaseId !== '' &&
  rawDatabaseId !== '(default)' &&
  rawDatabaseId !== 'default'
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage | null = null;
let isConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);

    // Initialize Firestore with experimentalForceLongPolling to prevent client from locking offline
    try {
      if (hasCustomDatabaseId) {
        db = initializeFirestore(
          app,
          { experimentalForceLongPolling: true },
          rawDatabaseId
        );
      } else {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        });
      }
    } catch (firestoreInitError) {
      // If Firestore was already initialized for this app instance, gracefully fall back to getFirestore
      console.warn('[Firestore] Using existing instance / fallback to getFirestore:', firestoreInitError);
      db = hasCustomDatabaseId ? getFirestore(app, rawDatabaseId) : getFirestore(app);
    }

    try {
      storage = getStorage(app);
    } catch (stErr) {
      console.warn('[Firebase Storage] Init notice:', stErr);
    }
    isConfigured = true;
    console.log('Firebase successfully initialized for PromptVault AI with Long-Polling enabled');
  } else {
    if (import.meta.env.PROD) {
      console.error(
        '[PromptVault Security Alert] Firebase production environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.) are missing. Please configure them in your hosting environment settings.'
      );
    } else {
      console.warn('Firebase configuration missing required keys. Operating in offline/localStorage demo mode.');
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  isConfigured = false;
}

export { app, auth, db, storage, isConfigured as isFirebaseConfigured };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// --- Auth Helper Functions ---

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  if (!isConfigured || !auth) {
    return {
      uid: 'demo-google-user',
      email: 'user@example.com',
      displayName: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      phone: '',
      background: '',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google-user',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user already exists in Firestore
    const existingProfile = await getUserProfileFromFirestore(user.uid);
    if (existingProfile) {
      const isComplete = Boolean(
        existingProfile.profileCompleted === true ||
        (existingProfile.phone && typeof existingProfile.phone === 'string' && existingProfile.phone.trim().length > 0 &&
         existingProfile.background && typeof existingProfile.background === 'string' && existingProfile.background.trim().length > 0)
      );
      if (isComplete) {
        try {
          localStorage.setItem(`promptvault_profile_completed_${user.uid}`, 'true');
          localStorage.setItem(`promptvault_user_profile_${user.uid}`, JSON.stringify({ ...existingProfile, profileCompleted: true }));
        } catch {
          // ignore localStorage error
        }
        return {
          ...existingProfile,
          profileCompleted: true,
        };
      }
      return existingProfile;
    }

    const isCachedComplete = typeof localStorage !== 'undefined' && localStorage.getItem(`promptvault_profile_completed_${user.uid}`) === 'true';

    const nameParts = (user.displayName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      firstName,
      lastName,
      phone: '',
      background: '',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      role: getInitialUserRole(user.email),
      createdAt: new Date().toISOString(),
      profileCompleted: isCachedComplete,
    };

    await saveUserProfileToFirestore(userProfile);
    return userProfile;
  } catch (error: any) {
    console.warn('Firebase Auth signInWithGoogle error:', error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
      return {
        uid: 'demo-google-user',
        email: 'user@example.com',
        displayName: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        phone: '',
        background: '',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google-user',
        role: 'user',
        createdAt: new Date().toISOString(),
        profileCompleted: true,
      };
    }
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  pass: string,
  firstName: string,
  lastName: string,
  phone: string,
  background: string
): Promise<UserProfile> => {
  const displayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
  if (!isConfigured || !auth) {
    const localUid = `local-${Date.now()}`;
    const localProfile: UserProfile = {
      uid: localUid,
      email,
      displayName,
      firstName,
      lastName,
      phone,
      background,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      role: getInitialUserRole(email),
      createdAt: new Date().toISOString(),
      profileCompleted: true,
    };
    try {
      localStorage.setItem(`promptvault_profile_completed_${localUid}`, 'true');
      localStorage.setItem(`promptvault_user_profile_${localUid}`, JSON.stringify(localProfile));
    } catch {
      // ignore localStorage errors
    }
    return localProfile;
  }
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const user = res.user;

    // Send email verification to newly registered user
    try {
      await sendEmailVerification(user);
    } catch (verErr) {
      console.warn('Could not automatically send verification email:', verErr);
    }

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName,
      firstName,
      lastName,
      phone,
      background,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      role: getInitialUserRole(user.email),
      createdAt: new Date().toISOString(),
      profileCompleted: true,
    };

    try {
      localStorage.setItem(`promptvault_profile_completed_${user.uid}`, 'true');
      localStorage.setItem(`promptvault_user_profile_${user.uid}`, JSON.stringify(userProfile));
    } catch {
      // ignore localStorage errors
    }

    await saveUserProfileToFirestore(userProfile);
    return userProfile;
  } catch (error: any) {
    console.warn('Firebase Auth signUpWithEmail error:', error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
      const localUid = `local-${Date.now()}`;
      const localProfile: UserProfile = {
        uid: localUid,
        email,
        displayName,
        firstName,
        lastName,
        phone,
        background,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        role: getInitialUserRole(email),
        createdAt: new Date().toISOString(),
        profileCompleted: true,
      };
      try {
        localStorage.setItem(`promptvault_profile_completed_${localUid}`, 'true');
        localStorage.setItem(`promptvault_user_profile_${localUid}`, JSON.stringify(localProfile));
      } catch {
        // ignore localStorage errors
      }
      return localProfile;
    }
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
  if (!isConfigured || !auth) {
    const localUid = `local-${Date.now()}`;
    const localProfile: UserProfile = {
      uid: localUid,
      email,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      role: getInitialUserRole(email),
      createdAt: new Date().toISOString(),
      profileCompleted: true,
    };
    try {
      localStorage.setItem(`promptvault_profile_completed_${localUid}`, 'true');
      localStorage.setItem(`promptvault_user_profile_${localUid}`, JSON.stringify(localProfile));
    } catch {
      // ignore localStorage errors
    }
    return localProfile;
  }
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const user = res.user;

    const existingProfile = await getUserProfileFromFirestore(user.uid);
    if (existingProfile) {
      const isComplete = Boolean(
        existingProfile.profileCompleted === true ||
        (existingProfile.phone && typeof existingProfile.phone === 'string' && existingProfile.phone.trim().length > 0 &&
         existingProfile.background && typeof existingProfile.background === 'string' && existingProfile.background.trim().length > 0)
      );
      if (isComplete) {
        try {
          localStorage.setItem(`promptvault_profile_completed_${user.uid}`, 'true');
          localStorage.setItem(`promptvault_user_profile_${user.uid}`, JSON.stringify({ ...existingProfile, profileCompleted: true }));
        } catch {
          // ignore localStorage error
        }
        return {
          ...existingProfile,
          profileCompleted: true,
        };
      }
      return existingProfile;
    }

    const isCachedComplete = typeof localStorage !== 'undefined' && localStorage.getItem(`promptvault_profile_completed_${user.uid}`) === 'true';
    let cachedProfile: any = null;
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(`promptvault_user_profile_${user.uid}`) : null;
      if (raw) cachedProfile = JSON.parse(raw);
    } catch {
      // ignore JSON parse error
    }

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      firstName: cachedProfile?.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''),
      lastName: cachedProfile?.lastName || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''),
      phone: cachedProfile?.phone || '',
      background: cachedProfile?.background || '',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      role: getInitialUserRole(user.email),
      createdAt: new Date().toISOString(),
      profileCompleted: isCachedComplete || Boolean(cachedProfile?.profileCompleted),
    };

    await saveUserProfileToFirestore(userProfile);
    return userProfile;
  } catch (error: any) {
    console.warn('Firebase Auth signInWithEmail error:', error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
      const localUid = `local-${Date.now()}`;
      const localProfile: UserProfile = {
        uid: localUid,
        email,
        displayName: email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        role: getInitialUserRole(email),
        createdAt: new Date().toISOString(),
        profileCompleted: true,
      };
      try {
        localStorage.setItem(`promptvault_profile_completed_${localUid}`, 'true');
        localStorage.setItem(`promptvault_user_profile_${localUid}`, JSON.stringify(localProfile));
      } catch {
        // ignore localStorage errors
      }
      return localProfile;
    }
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
};

/**
 * Updates the user's display name across Firebase Auth and Firestore with a 3000ms timeout guard
 */
export const updateAuthDisplayName = async (newName: string, uid?: string): Promise<{ firstName: string; lastName: string; displayName: string }> => {
  const trimmedName = newName.trim();
  const nameParts = trimmedName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Profile update timed out. Changes saved locally.')), 3000)
  );

  // 1. Update Firebase Auth currentUser if active
  if (isConfigured && auth?.currentUser) {
    try {
      await Promise.race([
        updateProfile(auth.currentUser, {
          displayName: trimmedName,
        }),
        timeoutPromise,
      ]);
    } catch (authErr: any) {
      console.warn('Firebase Auth updateProfile displayName warning:', authErr?.message || authErr);
    }
  }

  // 2. Update Firestore user document
  const targetUid = uid || auth?.currentUser?.uid;
  if (targetUid && isConfigured && db) {
    try {
      await Promise.race([
        updateDoc(doc(db, 'users', targetUid), {
          displayName: trimmedName,
          firstName,
          lastName,
        }),
        timeoutPromise,
      ]);
    } catch (dbErr: any) {
      console.warn('Firestore update displayName warning:', dbErr?.message || dbErr);
    }
  }

  return { firstName, lastName, displayName: trimmedName };
};

/**
 * Uploads user avatar to Firebase Storage under avatars/{uid}/profile.jpg
 * and updates photoURL in Firebase Auth and Firestore.
 */
export const uploadAvatarToStorage = async (file: File, uid: string): Promise<string> => {
  // 1. Client-side MIME type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid JPG or PNG image file.');
  }

  // 2. Client-side file size check (Max 2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 2MB limit. Please choose a smaller image.');
  }

  let photoURL = '';

  // 3. Attempt Firebase Storage upload
  if (isConfigured && storage) {
    try {
      const storagePath = `avatars/${uid}/profile.jpg`;
      const storageRef = ref(storage, storagePath);
      
      // Upload file with metadata
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: uid,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get public / authenticated download URL
      photoURL = await getDownloadURL(storageRef);
    } catch (storageErr: any) {
      console.warn('Firebase Storage upload notice, falling back to local object reader:', storageErr);
    }
  }

  // If storage upload failed or not configured, fallback to client-side data URL
  if (!photoURL) {
    photoURL = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  // 4. Update Firebase Auth currentUser photoURL
  if (isConfigured && auth?.currentUser) {
    try {
      await updateProfile(auth.currentUser, { photoURL });
    } catch (authErr: any) {
      console.warn('Firebase Auth updateProfile photoURL warning:', authErr);
    }
  }

  // 5. Update Firestore user doc
  if (isConfigured && db && uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { photoURL });
    } catch (dbErr: any) {
      console.warn('Firestore update photoURL warning:', dbErr);
    }
  }

  return photoURL;
};

/**
 * Triggers a password reset email via Firebase Auth
 */
export const sendResetPasswordEmail = async (email: string): Promise<void> => {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email address provided.');
  }
  if (!isConfigured || !auth) {
    // Offline simulation delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      throw new Error('No registered account found with this email address.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('Please provide a valid email address format.');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please try again later.');
    }
    throw new Error(err.message || 'Failed to send password reset email.');
  }
};

// Cooldown tracker for resending email verification (60 seconds)
let lastVerificationEmailSentAt = 0;

/**
 * Resends verification email to the current authenticated user with a 60s cooldown
 */
export const sendUserEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
  if (!isConfigured || !auth || !auth.currentUser) {
    return { success: true, message: 'Verification link generated (Demo mode).' };
  }

  const now = Date.now();
  if (now - lastVerificationEmailSentAt < 60000) {
    const remainingSeconds = Math.ceil((60000 - (now - lastVerificationEmailSentAt)) / 1000);
    throw new Error(`Please wait ${remainingSeconds}s before requesting another verification email.`);
  }

  try {
    await sendEmailVerification(auth.currentUser);
    lastVerificationEmailSentAt = Date.now();
    return { success: true, message: 'Verification email sent! Please check your inbox and spam folder.' };
  } catch (err: any) {
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please wait a few minutes before trying again.');
    }
    throw new Error(err.message || 'Failed to send verification email.');
  }
};

/**
 * Permanently deletes the user account:
 * 1. Deletes Firestore document `users/{uid}`
 * 2. Calls `deleteUser(auth.currentUser)` from Firebase Auth
 * 3. Cleans up local profile storage flags
 */
export const deleteUserAccount = async (uid?: string): Promise<void> => {
  const targetUid = uid || auth?.currentUser?.uid;

  // 1. Delete Firestore user document
  if (targetUid && isConfigured && db) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore user deletion timed out')), 3000)
      );
      await Promise.race([
        deleteDoc(doc(db, 'users', targetUid)),
        timeoutPromise,
      ]);
    } catch (dbErr: any) {
      console.warn('Firestore delete user doc warning:', dbErr?.message || dbErr);
    }
  }

  // 2. Delete Firebase Auth user
  if (isConfigured && auth?.currentUser) {
    try {
      await deleteUser(auth.currentUser);
    } catch (authErr: any) {
      console.error('Firebase Auth deleteUser error:', authErr);
      if (authErr?.code === 'auth/requires-recent-login') {
        throw new Error('This operation is sensitive and requires recent authentication. Please sign out and sign in again before deleting your account.');
      }
      throw new Error(authErr?.message || 'Failed to delete account. Please try logging in again.');
    }
  }

  // 3. Clean up localStorage
  if (targetUid && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(`promptvault_profile_completed_${targetUid}`);
      localStorage.removeItem(`promptvault_user_profile_${targetUid}`);
      localStorage.removeItem('promptvault_local_user');
    } catch {
      // ignore localStorage cleanup errors
    }
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (isConfigured && auth) {
    try {
      return onAuthStateChanged(
        auth,
        callback,
        (error) => {
          console.warn('Firebase Auth state listener notice:', error.message);
          callback(null);
        }
      );
    } catch (err) {
      console.warn('Failed to set up onAuthStateChanged listener:', err);
      return () => {};
    }
  }
  return () => {};
};

// --- Firestore Helpers ---

export const saveUserProfileToFirestore = async (userProfile: UserProfile, timeoutMs: number = 3000): Promise<void> => {
  if (userProfile.uid) {
    try {
      const isComplete = Boolean(
        userProfile.profileCompleted === true ||
        (userProfile.phone && typeof userProfile.phone === 'string' && userProfile.phone.trim().length > 0 &&
         userProfile.background && typeof userProfile.background === 'string' && userProfile.background.trim().length > 0)
      );
      localStorage.setItem(`promptvault_profile_completed_${userProfile.uid}`, isComplete ? 'true' : 'false');
      localStorage.setItem(`promptvault_user_profile_${userProfile.uid}`, JSON.stringify(userProfile));
    } catch {
      // ignore localStorage errors
    }
  }
  if (!isConfigured || !db) return;
  try {
    const writePromise = (async () => {
      const userRef = doc(db, 'users', userProfile.uid);
      const cleanData = removeUndefinedProps(userProfile);
      await setDoc(userRef, cleanData, { merge: true });
    })();

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore saveUserProfile timed out after ${timeoutMs}ms for uid: ${userProfile.uid}`);
        resolve();
      }, timeoutMs);
    });

    await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
};

export const getUserProfileFromFirestore = async (uid: string, timeoutMs: number = 2500): Promise<UserProfile | null> => {
  if (!isConfigured || !db) return null;
  try {
    const fetchPromise = (async () => {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const isComplete = Boolean(
          data.profileCompleted === true ||
          (data.phone && typeof data.phone === 'string' && data.phone.trim().length > 0 &&
           data.background && typeof data.background === 'string' && data.background.trim().length > 0)
        );
        const profile: UserProfile = {
          uid: snap.id,
          ...data,
          profileCompleted: isComplete,
        } as UserProfile;

        // Cache profile and completion flag in localStorage
        try {
          localStorage.setItem(`promptvault_profile_completed_${uid}`, isComplete ? 'true' : 'false');
          localStorage.setItem(`promptvault_user_profile_${uid}`, JSON.stringify(profile));
        } catch {
          // ignore localStorage errors
        }

        return profile;
      }
      return null;
    })();

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore getUserProfile timed out after ${timeoutMs}ms for uid: ${uid}`);
        resolve(null);
      }, timeoutMs);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error getting user profile from Firestore:', error);
    return null;
  }
};

export const getAllUsersFromFirestore = async (): Promise<UserProfile[]> => {
  if (!isConfigured || !db) {
    console.warn('[PromptVault] Firebase is not configured or Firestore db is unavailable.');
    return [];
  }
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      users.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
    });
    return users;
  } catch (error) {
    console.error("Failed fetching users directory:", error);
    throw error;
  }
};

export const updateUserRoleInFirestore = async (uid: string, role: 'user' | 'admin'): Promise<void> => {
  if (!isConfigured || !db) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  } catch (error) {
    console.error('Error updating user role in Firestore:', error);
  }
};

export const getPromptsFromFirestore = async (
  timeoutMs: number = 10000,
  onBackgroundResolve?: (prompts: PromptItem[]) => void
): Promise<PromptItem[]> => {
  if (!isConfigured || !db) return [];

  let hasTimedOut = false;

  const fetchPromise = (async () => {
    try {
      const promptsCol = collection(db, 'prompts');
      const q = query(promptsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const prompts: PromptItem[] = [];
      snapshot.forEach((docSnap) => {
        prompts.push({ id: docSnap.id, ...docSnap.data() } as PromptItem);
      });

      // Dispatch global synchronization event so any consumer component can update reactively
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('promptvault:firestore-prompts-synced', {
            detail: {
              prompts,
              timedOut: hasTimedOut,
              count: prompts.length,
            },
          })
        );
      }

      // If initial race timed out early, notify background resolve callback when data finally arrives
      if (hasTimedOut) {
        console.log(`[Firestore] Background prompt sync completed with ${prompts.length} items after initial timeout.`);
        if (onBackgroundResolve) {
          onBackgroundResolve(prompts);
        }
      }

      return prompts;
    } catch (fetchErr: any) {
      console.error('[Firestore] Error fetching prompts from Firestore:', fetchErr);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('promptvault:firestore-sync-failed', {
            detail: {
              error: fetchErr?.message || String(fetchErr),
              timedOut: hasTimedOut,
            },
          })
        );
      }
      throw fetchErr;
    }
  })();

  const timeoutPromise = new Promise<PromptItem[]>((resolve) => {
    setTimeout(() => {
      hasTimedOut = true;
      console.warn(`[Firestore] getPrompts initial wait reached (${timeoutMs}ms). Continuing fetch in background...`);
      resolve([]);
    }, timeoutMs);
  });

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('Error in getPromptsFromFirestore:', error);
    return [];
  }
};

// Helper to sanitize objects sent to Firestore (removes undefined fields which cause Firestore errors)
const removeUndefinedProps = <T extends Record<string, any>>(obj: T): T => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        clean[key] = removeUndefinedProps(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
  });
  return clean as T;
};

export const addPromptToFirestore = async (
  promptData: Omit<PromptItem, 'id'> & { id?: string },
  timeoutMs: number = 4000
): Promise<string> => {
  const fallbackId =
    promptData.id ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  if (!isConfigured || !db) {
    return fallbackId;
  }

  const cleanData = removeUndefinedProps({
    ...promptData,
    id: fallbackId,
    title: (promptData.title || '').slice(0, 200),
    description: (promptData.description || '').slice(0, 1000),
    prompt: (promptData.prompt || '').slice(0, 10000),
    category: (promptData.category || 'Marketing').trim().slice(0, 100),
    difficulty: promptData.difficulty || 'Intermediate',
    models: promptData.models && promptData.models.length > 0 ? promptData.models : ['ChatGPT'],
    compatibleApps: Array.isArray(promptData.compatibleApps) ? promptData.compatibleApps : promptData.models || ['ChatGPT'],
    compatibleModels: Array.isArray(promptData.compatibleModels) ? promptData.compatibleModels : [],
    modelVersions: Array.isArray(promptData.modelVersions) ? promptData.modelVersions : (Array.isArray(promptData.compatibleModels) ? promptData.compatibleModels : []),
    tags: Array.isArray(promptData.tags) ? promptData.tags.slice(0, 20).map(t => String(t).slice(0, 30)) : [],
    status: promptData.status || 'published',
    isPublic: promptData.isPublic !== undefined ? promptData.isPublic : true,
    isFeatured: Boolean(promptData.isFeatured),
    author: (promptData.author || 'Admin').slice(0, 100),
    authorId: (promptData.authorId || 'admin').slice(0, 100),
    createdAt: promptData.createdAt || new Date().toISOString().split('T')[0],
  });

  try {
    const writePromise = (async () => {
      const docRef = doc(db, 'prompts', fallbackId);
      await setDoc(docRef, cleanData, { merge: true });
      return fallbackId;
    })();

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore addPrompt timed out after ${timeoutMs}ms for prompt ID: ${fallbackId}`);
        resolve(fallbackId);
      }, timeoutMs);
    });

    return await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error adding prompt to Firestore:', error);
    return fallbackId;
  }
};

export const updatePromptInFirestore = async (
  id: string,
  updates: Partial<PromptItem>,
  timeoutMs: number = 4000
): Promise<void> => {
  if (!isConfigured || !db) return;
  const cleanUpdates = removeUndefinedProps(updates);
  try {
    const writePromise = (async () => {
      const promptRef = doc(db, 'prompts', id);
      await setDoc(promptRef, cleanUpdates, { merge: true });
    })();

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore updatePrompt timed out after ${timeoutMs}ms for ID: ${id}`);
        resolve();
      }, timeoutMs);
    });

    await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error updating prompt in Firestore:', error);
  }
};

export const deletePromptFromFirestore = async (id: string): Promise<void> => {
  if (!isConfigured || !db) return;
  try {
    const promptRef = doc(db, 'prompts', id);
    await deleteDoc(promptRef);
  } catch (error) {
    console.error('Error deleting prompt from Firestore:', error);
  }
};

export const getUserLibraryFromFirestore = async (uid: string): Promise<{ savedPromptIds: string[]; favoritePromptIds: string[] }> => {
  if (!isConfigured || !db) return { savedPromptIds: [], favoritePromptIds: [] };
  try {
    const libRef = doc(db, 'userLibraries', uid);
    const snap = await getDoc(libRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        savedPromptIds: data.savedPromptIds || [],
        favoritePromptIds: data.favoritePromptIds || [],
      };
    }
  } catch (error) {
    console.error('Error fetching user library:', error);
  }
  return { savedPromptIds: [], favoritePromptIds: [] };
};

export const saveUserLibraryToFirestore = async (uid: string, savedPromptIds: string[], favoritePromptIds: string[]) => {
  if (!isConfigured || !db) return;
  try {
    const libRef = doc(db, 'userLibraries', uid);
    await setDoc(libRef, { uid, savedPromptIds, favoritePromptIds }, { merge: true });
  } catch (error) {
    console.error('Error saving user library to Firestore:', error);
  }
};

export const bulkImportPromptsToFirestore = async (prompts: Omit<PromptItem, 'id'>[]): Promise<number> => {
  if (!isConfigured || !db) return 0;
  try {
    const batch = writeBatch(db);
    let count = 0;
    prompts.forEach((p) => {
      const newRef = doc(collection(db, 'prompts'));
      batch.set(newRef, { ...p, id: newRef.id });
      count++;
    });
    await batch.commit();
    return count;
  } catch (error) {
    console.error('Error bulk importing prompts:', error);
    throw error;
  }
};

/**
 * Personal Prompts Sub-Collection (`users/{userId}/myPrompts/{promptId}`)
 * Strictly accessible by the owning user for private prompt generation and storage.
 */
export const addUserPromptToFirestore = async (
  uid: string,
  promptData: Omit<PromptItem, 'id'> & { id?: string },
  timeoutMs: number = 4000
): Promise<string> => {
  const fallbackId =
    promptData.id ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `user-prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  if (!isConfigured || !db || !uid) {
    return fallbackId;
  }

  const cleanData = removeUndefinedProps({
    ...promptData,
    id: fallbackId,
    title: (promptData.title || '').slice(0, 200),
    description: (promptData.description || '').slice(0, 1000),
    prompt: (promptData.prompt || '').slice(0, 10000),
    category: (promptData.category || 'General').trim().slice(0, 100),
    difficulty: promptData.difficulty || 'Intermediate',
    models: promptData.models && promptData.models.length > 0 ? promptData.models : ['ChatGPT'],
    compatibleApps: Array.isArray(promptData.compatibleApps) ? promptData.compatibleApps : promptData.models || ['ChatGPT'],
    compatibleModels: Array.isArray(promptData.compatibleModels) ? promptData.compatibleModels : [],
    modelVersions: Array.isArray(promptData.modelVersions) ? promptData.modelVersions : (Array.isArray(promptData.compatibleModels) ? promptData.compatibleModels : []),
    tags: Array.isArray(promptData.tags) ? promptData.tags.slice(0, 20).map((t) => String(t).slice(0, 30)) : [],
    status: 'draft',
    isPublic: false,
    isPersonal: true,
    isUserCreated: true,
    author: (promptData.author || 'You').slice(0, 100),
    authorId: uid,
    createdAt: promptData.createdAt || new Date().toISOString().split('T')[0],
  });

  try {
    const writePromise = (async () => {
      const docRef = doc(db, 'users', uid, 'myPrompts', fallbackId);
      await setDoc(docRef, cleanData, { merge: true });
      return fallbackId;
    })();

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore addUserPrompt timed out after ${timeoutMs}ms for ID: ${fallbackId}`);
        resolve(fallbackId);
      }, timeoutMs);
    });

    return await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error adding user prompt to Firestore:', error);
    return fallbackId;
  }
};

export const getUserPromptsFromFirestore = async (
  uid: string,
  timeoutMs: number = 5000
): Promise<PromptItem[]> => {
  if (!isConfigured || !db || !uid) return [];
  try {
    const fetchPromise = (async () => {
      const myPromptsCol = collection(db, 'users', uid, 'myPrompts');
      const snapshot = await getDocs(myPromptsCol);
      const list: PromptItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          ...data,
          isUserCreated: true,
          isPersonal: true,
          isPublic: false,
        } as unknown as PromptItem);
      });
      return list;
    })();

    const timeoutPromise = new Promise<PromptItem[]>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore getUserPrompts timed out after ${timeoutMs}ms for uid: ${uid}`);
        resolve([]);
      }, timeoutMs);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error fetching user prompts from Firestore:', error);
    return [];
  }
};

export const updateUserPromptInFirestore = async (
  uid: string,
  promptId: string,
  updates: Partial<PromptItem>,
  timeoutMs: number = 4000
): Promise<void> => {
  if (!isConfigured || !db || !uid) return;
  const cleanUpdates = removeUndefinedProps({
    ...updates,
    isPublic: false,
  });
  try {
    const writePromise = (async () => {
      const promptRef = doc(db, 'users', uid, 'myPrompts', promptId);
      await setDoc(promptRef, cleanUpdates, { merge: true });
    })();

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(`Firestore updateUserPrompt timed out after ${timeoutMs}ms for ID: ${promptId}`);
        resolve();
      }, timeoutMs);
    });

    await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error updating user prompt in Firestore:', error);
  }
};

export const deleteUserPromptFromFirestore = async (uid: string, promptId: string): Promise<void> => {
  if (!isConfigured || !db || !uid) return;
  try {
    const promptRef = doc(db, 'users', uid, 'myPrompts', promptId);
    await deleteDoc(promptRef);
  } catch (error) {
    console.error('Error deleting user prompt from Firestore:', error);
  }
};
