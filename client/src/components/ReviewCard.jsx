import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { MessageSquare, Eye, AlertTriangle, GitCommit, Star } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  const languageColorMap = {
    javascript: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    python: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    java: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    react: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    typescript: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    cpp: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    go: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  };

  const langClass =
    languageColorMap[review.language?.toLowerCase()] ||
    'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Link
      to={`/reviews/${review._id}`}
      className="group block rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/20"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Language badge */}
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase border ${langClass}`}
            >
              {review.language}
            </span>

            {/* Difficulty */}
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize border border-slate-700/50">
              {review.difficulty}
            </span>

            {/* Version indicator */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <GitCommit className="w-3 h-3 text-indigo-400" />
              v{review.currentVersion || 1}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {review.title}
          </h3>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <StatusBadge status={review.status} size="sm" />
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {review.description}
      </p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {review.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40"
            >
              #{tag}
            </span>
          ))}
          {review.tags.length > 4 && (
            <span className="text-[10px] text-slate-500">+{review.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Card footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <img
            src={
              review.author?.avatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
            alt={review.author?.name}
            className="w-5 h-5 rounded-full border border-slate-700 object-cover"
          />
          <span className="text-slate-300 font-medium text-xs truncate max-w-[100px]">
            {review.author?.name || 'Author'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-500">{timeAgo(review.createdAt)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quality rating snippet if rated */}
          {review.qualityRating?.correctness && (
            <div
              className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold"
              title="Review Quality Score"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {(
                  (review.qualityRating.correctness +
                    review.qualityRating.clarity +
                    review.qualityRating.actionability) /
                  3
                ).toFixed(1)}
              </span>
            </div>
          )}

          {/* Unresolved count */}
          {review.unresolvedCount > 0 && (
            <div
              className="flex items-center gap-1 text-[11px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20"
              title={`${review.unresolvedCount} unresolved blocking issues`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{review.unresolvedCount}</span>
            </div>
          )}

          {/* Views */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Eye className="w-3 h-3" />
            <span>{review.views || 0}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MessageSquare className="w-3 h-3 text-indigo-400" />
            <span>{review.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
