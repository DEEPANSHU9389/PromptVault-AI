export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'deepanshutechbyte@gmail.com').toLowerCase();

/**
 * Verifies if a user has admin privileges.
 * Strictly checks if the user's role in Firestore is 'admin' or if their verified email matches VITE_ADMIN_EMAIL.
 */
export const checkIsAdmin = (email?: string | null, role?: string | null): boolean => {
  if (role === 'admin') return true;
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL;
};

/**
 * Returns the appropriate role ('admin' | 'user') for a newly created or authenticated profile.
 */
export const getInitialUserRole = (email?: string | null): 'admin' | 'user' => {
  if (!email) return 'user';
  return email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';
};
