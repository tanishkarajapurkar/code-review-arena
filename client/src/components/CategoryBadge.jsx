import React from 'react';

export const CATEGORIES = {
  bug: {
    id: 'bug',
    label: 'Bug',
    icon: '🐛',
    description: 'This can cause an incorrect result or runtime failure.',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    icon: '⚡',
    description: 'This algorithm or memory usage can be optimized.',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  security: {
    id: 'security',
    label: 'Security',
    icon: '🔐',
    description: 'Input validation, injection or authentication concern.',
    color: 'bg-red-500/15 text-red-400 border-red-500/40',
    dot: 'bg-red-400',
  },
  quality: {
    id: 'quality',
    label: 'Code Quality',
    icon: '🧹',
    description: 'Architecture, modularity, or single responsibility principle.',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
  readability: {
    id: 'readability',
    label: 'Readability',
    icon: '📖',
    description: 'Variable naming, documentation or code formatting clarity.',
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400',
  },
  suggestion: {
    id: 'suggestion',
    label: 'Suggestion',
    icon: '💡',
    description: 'Consider modern idioms, cleaner APIs or alternative approach.',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  general: {
    id: 'general',
    label: 'General Feedback',
    icon: '💬',
    description: 'Overall feedback or high-level architecture note.',
    color: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

export const CategoryBadge = ({ category = 'suggestion', size = 'md' }) => {
  const config = CATEGORIES[category] || CATEGORIES.suggestion;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono ${config.color} ${sizeClasses} shadow-sm`}
      title={config.description}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
