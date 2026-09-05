import React from 'react';
import { CategoryType } from '../types';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Code,
  Sparkles,
  Search,
  Briefcase,
  BookOpen,
  Zap,
  Image,
  Video,
  Share2,
  Cpu,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

interface CategoryCardProps {
  category: CategoryType;
  count: number;
}

const getCategoryIcon = (category: CategoryType) => {
  switch (category) {
    case 'Marketing':
      return TrendingUp;
    case 'Coding':
      return Code;
    case 'Image Generation':
      return Image;
    case 'SEO':
      return Search;
    case 'Business':
      return Briefcase;
    case 'Research':
      return BookOpen;
    case 'Productivity':
      return Zap;
    case 'Education':
      return GraduationCap;
    case 'Video Generation':
      return Video;
    case 'Social Media':
      return Share2;
    case 'AI Automation':
      return Cpu;
    case 'Content Creation':
      return Sparkles;
    default:
      return Sparkles;
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, count }) => {
  const { setFilters, setViewMode } = useApp();
  const Icon = getCategoryIcon(category);

  const handleClick = () => {
    setFilters((prev) => ({
      ...prev,
      category,
      collectionFilter: undefined,
    }));
    setViewMode('library');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
            {category}
          </h4>
          <p className="text-xs text-slate-400">{count} prompts</p>
        </div>
      </div>

      <div className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
