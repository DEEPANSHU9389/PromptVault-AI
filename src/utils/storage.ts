import { PromptItem } from '../types';

const SAVED_KEY = 'promptvault_saved_ids';
const FAVORITES_KEY = 'promptvault_favorite_ids';
const MY_PROMPTS_KEY = 'promptvault_user_prompts';
const THEME_KEY = 'promptvault_theme';
const USAGE_COUNTS_KEY = 'promptvault_usage_counts';
const DELETED_KEY = 'promptvault_deleted_ids';

export function getStoredDeletedIds(): string[] {
  try {
    const data = localStorage.getItem(DELETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredDeletedIds(ids: string[]): void {
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save deleted prompt IDs to localStorage', e);
  }
}

export function getStoredSavedIds(): string[] {
  try {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredSavedIds(ids: string[]): void {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save saved prompt IDs to localStorage', e);
  }
}

export function getStoredFavoriteIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredFavoriteIds(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save favorite prompt IDs to localStorage', e);
  }
}

export function getStoredUserPrompts(): PromptItem[] {
  try {
    const data = localStorage.getItem(MY_PROMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredUserPrompts(prompts: PromptItem[]): void {
  try {
    localStorage.setItem(MY_PROMPTS_KEY, JSON.stringify(prompts));
  } catch (e) {
    console.error('Failed to save user prompts to localStorage', e);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const data = localStorage.getItem(THEME_KEY);
    return data === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
}

export function getStoredUsageCounts(): Record<string, number> {
  try {
    const data = localStorage.getItem(USAGE_COUNTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function incrementUsageCount(promptId: string): void {
  try {
    const current = getStoredUsageCounts();
    current[promptId] = (current[promptId] || 0) + 1;
    localStorage.setItem(USAGE_COUNTS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to increment usage count in localStorage', e);
  }
}

export function getStoredProfileCompleted(uid: string): boolean {
  try {
    const val = localStorage.getItem(`promptvault_profile_completed_${uid}`);
    return val === 'true';
  } catch {
    return false;
  }
}

export function setStoredProfileCompleted(uid: string, completed: boolean): void {
  try {
    localStorage.setItem(`promptvault_profile_completed_${uid}`, completed ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set profile completed in localStorage', e);
  }
}

export function getStoredUserProfile(uid: string): any | null {
  try {
    const data = localStorage.getItem(`promptvault_user_profile_${uid}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUserProfile(uid: string, profile: any): void {
  try {
    localStorage.setItem(`promptvault_user_profile_${uid}`, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to set user profile in localStorage', e);
  }
}

export function sanitizeTags(input: string | string[] | undefined | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .map((t) => (typeof t === 'string' ? t.replace(/^[:#,\s]+|[:#,\s]+$/g, '').trim() : ''))
          .filter((t) => t.length > 0)
      )
    );
  }
  if (typeof input !== 'string') return [];
  return Array.from(
    new Set(
      input
        .split(/[,;\n]+/)
        .map((t) => t.replace(/^[:#,\s]+|[:#,\s]+$/g, '').trim())
        .filter((t) => t.length > 0)
    )
  );
}
