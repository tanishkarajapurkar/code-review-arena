import React from 'react';

const STATUS_CONFIG = {
  waiting: {
    label: 'Waiting for Review',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    icon: '🟡',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400 animate-pulse',
    icon: '🔵',
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    dot: 'bg-orange-400',
    icon: '🟠',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    icon: '🟢',
  },
  closed: {
    label: 'Closed',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    icon: '⚫',
  },
};

export const StatusBadge = ({ status = 'waiting', size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.color} ${sizeClasses} shadow-sm backdrop-blur-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
