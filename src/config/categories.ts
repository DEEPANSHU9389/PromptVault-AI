import { CategoryType, AIModelType, DifficultyType } from '../types';

export const CATEGORIES: CategoryType[] = [
  'Marketing',
  'Content Creation',
  'SEO',
  'Business',
  'Research',
  'Coding',
  'Productivity',
  'Education',
  'Image Generation',
  'Video Generation',
  'Social Media',
  'AI Automation'
];

export const MODELS: AIModelType[] = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'Midjourney',
  'Ideogram',
  'Flux',
  'Runway'
];

export const DIFFICULTIES: DifficultyType[] = ['Beginner', 'Intermediate', 'Advanced'];

export const DEFAULT_TAGS_BY_CATEGORY: Record<CategoryType, string[]> = {
  Marketing: ['SaaS', 'Copywriting', 'Growth', 'Conversion', 'PAS Framework'],
  'Content Creation': ['Blogging', 'Storytelling', 'Copywriting', 'Creative'],
  SEO: ['Keyword Clustering', 'Backlinks', 'Search Intent', 'Technical SEO'],
  Business: ['Strategy', 'Sales', 'Business Plan', 'Pitch Deck'],
  Research: ['Data Analysis', 'Academic', 'Literature Review', 'Synthesis'],
  Coding: ['Full-Stack', 'Refactoring', 'API Design', 'Debugging', 'TypeScript'],
  Productivity: ['Workflow', 'Time Management', 'Automation', 'Organization'],
  Education: ['Lesson Plan', 'Tutoring', 'Explanation', 'Quiz Generator'],
  'Image Generation': ['Photorealistic', 'Prompt Design', 'Styling', 'Aspect Ratio'],
  'Video Generation': ['Storyboard', 'Scriptwriting', 'Animation', 'Directing'],
  'Social Media': ['LinkedIn', 'Instagram', 'X / Twitter', 'Viral Post', 'Hooks'],
  'AI Automation': ['Zapier', 'Make.com', 'Agents', 'Workflows']
};
