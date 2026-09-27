import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Trophy, Star, Award, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export const LeaderboardPage = () => {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((data) => {
        setReviewers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leaderboard', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Community Honor Roll</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Top Reviewers Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
            Recognizing reviewers providing high correctness, exceptional clarity, and actionable line-by-line feedback.
          </p>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
          <div className="divide-y divide-slate-800">
            {reviewers.map((rev, index) => {
              const rank = index + 1;
              const badgeColor =
                rank === 1
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                  : rank === 2
                  ? 'text-slate-300 bg-slate-400/10 border-slate-400/30'
                  : rank === 3
                  ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                  : 'text-slate-500 bg-slate-800/40 border-slate-700/30';

              return (
                <div
                  key={rev._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-bold text-sm shrink-0 ${badgeColor}`}
                    >
                      #{rank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 rounded-2xl border border-slate-700 object-cover shadow-md"
                    />

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${rev.username}`}
                          className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                        >
                          {rev.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-mono">@{rev.username}</span>
                      </div>

                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{rev.bio}</p>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {rev.languages?.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/50"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Action */}
                  <div className="flex items-center gap-6 sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-center sm:text-right">
                      <span className="text-base font-bold font-mono text-white block">
                        {rev.stats?.reviewsCompleted || 0}
                      </span>
                      <span className="text-[11px] text-slate-400">Reviews</span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-base font-bold font-mono text-emerald-400 block">
                        {rev.stats?.helpfulReviews || 0}
                      </span>
                      <span className="text-[11px] text-slate-400">Helpful</span>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-1 text-amber-400 font-bold font-mono text-base">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{rev.stats?.averageRating || 4.9}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Quality Score</span>
                    </div>

                    <Link
                      to={`/profile/${rev.username}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
