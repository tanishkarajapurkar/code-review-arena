import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Users, Sparkles, Star, Award, CheckCircle, Search } from 'lucide-react';

export const ReviewerMatchPage = () => {
  const [language, setLanguage] = useState('javascript');
  const [selectedTag, setSelectedTag] = useState('security');
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);

  const languages = ['javascript', 'java', 'python', 'react', 'typescript', 'cpp', 'go'];
  const tags = ['security', 'performance', 'code_quality', 'algorithms', 'readability'];

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await api.getMatchedReviewers({
        language,
        tags: selectedTag,
      });
      setReviewers(data || []);
    } catch (err) {
      console.error('Failed to match reviewers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [language, selectedTag]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Reviewer Matching Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Find the right expert for your stack
          </h1>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Matches reviewers by their verified language proficiencies, category expertise scores, current review load, and author satisfaction ratings.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Target Language
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-colors ${
                    language === l
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Primary Specialty
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedTag === t
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : reviewers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-xs text-slate-400">
          No available reviewers matched this specific criteria. Try another language or specialty tag.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviewers.map((rev) => (
            <div
              key={rev._id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 rounded-2xl border border-slate-700 object-cover shadow-md"
                    />
                    <div>
                      <Link
                        to={`/profile/${rev.username}`}
                        className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                      >
                        {rev.name}
                      </Link>
                      <span className="text-[11px] text-slate-400 block">@{rev.username}</span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.stats?.averageRating || 4.9} rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Match score pill */}
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold text-center">
                    {rev.matchScore}% Match
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {rev.bio}
                </p>

                {/* Match Reasons */}
                {rev.matchReasons && rev.matchReasons.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 mb-4">
                    {rev.matchReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  <strong className="text-white">{rev.stats?.reviewsCompleted || 0}</strong> reviews completed
                </span>
                <Link
                  to={`/profile/${rev.username}`}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-xs font-semibold transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
