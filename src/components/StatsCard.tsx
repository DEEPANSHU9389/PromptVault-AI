import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
  gradient: string;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  badge,
  gradient,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative group overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/90 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      {/* Background glow accent */}
      <div
        className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-300 ${gradient}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-1">{description}</p>
          )}
        </div>

        <div className={`p-3 rounded-xl border border-slate-800 bg-slate-800/50 text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
