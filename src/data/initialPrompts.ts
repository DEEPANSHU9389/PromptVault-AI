import { PromptItem, CollectionItem } from '../types';

// Empty default initial prompts array as required for Stage 2 Production Ready platform
export const INITIAL_PROMPTS: PromptItem[] = [];

export const FEATURED_COLLECTIONS: CollectionItem[] = [
  {
    id: 'c-marketing',
    name: 'Marketing & Growth Stack',
    description: 'High-converting copy, cold emails, ad scripts & positioning templates.',
    iconName: 'TrendingUp',
    promptCount: 0,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
  },
  {
    id: 'c-coding',
    name: 'Developer & Architecture Toolkit',
    description: 'Code reviews, refactoring, SQL optimization, and PRD specifications.',
    iconName: 'Code',
    promptCount: 0,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'c-creative',
    name: 'Visual & AI Art Prompting',
    description: 'Midjourney, Flux, Ideogram, and Runway camera movement prompts.',
    iconName: 'Sparkles',
    promptCount: 0,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
  },
  {
    id: 'c-productivity',
    name: 'Executive & Product Workflow',
    description: 'Time blocking, Socratic learning, Zapier automation, and QBR outlines.',
    iconName: 'Zap',
    promptCount: 0,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
];
