import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, UserPlus, Check, Sparkles, Star, ShieldCheck } from 'lucide-react';

export const ReviewerMatchPanel = ({
  language,
  tags = [],
  reviewId,
  currentReviewers = [],
  onReviewerAssigned = () => {},
}) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedMap, setAssignedMap] = useState({});

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await api.getMatchedReviewers({
          language,
          tags: tags.join(','),
          reviewId,
        });
        setMatches(data || []);
      } catch (err) {
        console.error('Failed to fetch matched reviewers', err);
      } finally {
        setLoading(false);
      }
    };
    if (language) {
      fetchMatches();
    }
  }, [language, tags, reviewId]);

  const handleAssign = async (reviewerId) => {
    try {
      await api.assignReviewer(reviewId, reviewerId);
      setAssignedMap((prev) => ({ ...prev, [reviewerId]: true }));
      onReviewerAssigned(reviewerId);
    } catch (err) {
      console.error('Failed to assign reviewer', err);
    }
  };

  const isAssigned = (reviewerId) => {
    return (
      assignedMap[reviewerId] ||
      currentReviewers.some((r) => (r._id || r) === reviewerId)
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Recommended Reviewers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Smart Match
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Matched by <span className="text-slate-200 capitalize">{language}</span> & expertise tags
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
          Finding optimal reviewers...
        </div>
      ) : matches.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">
          No matching reviewers found for this stack yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {matches.slice(0, 3).map((rev) => {
            const assigned = isAssigned(rev._id);
            return (
              <div
                key={rev._id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-8 h-8 rounded-full border border-slate-700 shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {rev.name}
                      </span>
                      <div className="flex items-center text-[10px] text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{rev.stats?.averageRating || 4.9}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-emerald-400 font-medium">
                        {rev.matchScore}% Match
                      </span>
                      <span>•</span>
                      <span>{rev.stats?.reviewsCompleted || 0} reviews</span>
                    </div>

                    {rev.matchReasons && rev.matchReasons.length > 0 && (
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {rev.matchReasons[0]}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAssign(rev._id)}
                  disabled={assigned}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
                    assigned
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {assigned ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Assigned</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Request</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
