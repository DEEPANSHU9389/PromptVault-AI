export type CategoryType = string;

export type AIModelType = string;

export type DifficultyType = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  background?: string;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt?: string;
  isAnonymous?: boolean;
  profileCompleted?: boolean;
  emailVerified?: boolean;
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: CategoryType;
  tags: string[];
  models: AIModelType[];
  compatibleApps?: string[]; // Compatible AI Apps / Tools (e.g. ChatGPT, Claude, Midjourney, Cursor)
  compatibleModels?: string[]; // Specific AI Model Versions tested (e.g. Claude 3.7 Sonnet, GPT-4o)
  modelVersions?: string[]; // Synonym for compatibleModels
  difficulty: DifficultyType;
  rating: number; // e.g. 4.9
  ratingCount: number;
  usageCount: number;
  isUserCreated?: boolean;
  isPersonal?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  authorId?: string;
  author: string;
  authorEmail?: string;
  createdAt: string;
  collectionId?: string;
  variables?: string[]; // e.g., ["Target Audience", "Product Name", "Goal"]
  status?: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string;
  imageUrl?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  promptCount?: number;
  color: string;
}

export type ViewMode =
  | 'dashboard'
  | 'library'
  | 'saved'
  | 'favorites'
  | 'my-prompts'
  | 'collections'
  | 'builder'
  | 'optimizer'
  | 'settings'
  | 'admin'
  | 'privacy'
  | 'terms';

export interface FilterState {
  searchQuery: string;
  category: string; // 'All' or CategoryType
  model: string; // 'All' or AIModelType
  difficulty: string; // 'All' or DifficultyType
  sortBy: 'popular' | 'rating' | 'newest' | 'title';
  collectionFilter?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
