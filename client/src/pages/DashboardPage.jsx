import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReviewCard } from '../components/ReviewCard';
import {
  Search,
  Filter,
  Code2,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Trophy,
  Flame,
} from 'lucide-react';

export const DashboardPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const languages = ['all', 'javascript', 'java', 'python', 'react', 'typescript', 'cpp', 'go'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const popularTags = ['all', 'security', 'performance', 'algorithms', 'arrays', 'concurrency', 'hooks'];

  const statusTabs = [
    { id: 'all', label: 'All Reviews' },
    { id: 'waiting', label: '🟡 Waiting', color: 'text-amber-400' },
    { id: 'under_review', label: '🔵 Under Review', color: 'text-blue-400' },
    { id: 'changes_requested', label: '🟠 Changes Requested', color: 'text-orange-400' },
    { id: 'approved', label: '🟢 Approved', color: 'text-emerald-400' },
  ];

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLanguage !== 'all') params.language = selectedLanguage;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (search) params.search = search;
      if (sortBy) params.sort = sortBy;

      const data = await api.getReviews(params);
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedLanguage, selectedStatus, selectedDifficulty, selectedTag, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Load platform stats and leaderboard
    api.getStatsOverview().then(setStats).catch(() => {});
    api.getLeaderboard().then(setLeaderboard).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Platform Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Peer Code Review Arena</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Level up code quality through{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              line-level peer reviews.
            </span>
          </h1>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Submit code snippets, receive categorized line-level feedback (bugs, security, performance), iterate through immutable revisions, and compare diffs until approval.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <Link
              to="/create-review"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Code2 className="w-4 h-4" />
              <span>Submit Code for Review</span>
            </Link>
            <Link
              to="/match"
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Explore Reviewers</span>
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">
              {stats?.totalReviews || reviews.length}
            </span>
            <p className="text-xs text-slate-400">Total Submissions</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">
              {stats?.approvalRate || 75}%
            </span>
            <p className="text-xs text-slate-400">Approval Rate</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">
              {stats?.totalUsers || 4}
            </span>
            <p className="text-xs text-slate-400">Active Engineers</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">2.4h</span>
            <p className="text-xs text-slate-400">Avg Review Time</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters & Review Stream (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Latest Submissions</option>
                <option value="popular">Most Viewed</option>
                <option value="updated">Recently Updated</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Language Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Language:</span>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Popular Tag Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Category:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  selectedTag === tag
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tag === 'all' ? 'All Tags' : `#${tag}`}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-36 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
              <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No review requests match this filter</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or submit a new code snippet.
              </p>
              <button
                onClick={() => {
                  setSelectedLanguage('all');
                  setSelectedStatus('all');
                  setSelectedTag('all');
                  setSearch('');
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Leaderboard & Workflow Explainer (1 col) */}
        <div className="space-y-6">
          {/* Top Reviewers Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Top Reviewers
                </h3>
              </div>
              <Link to="/leaderboard" className="text-[11px] text-indigo-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 4).map((rev, index) => (
                <Link
                  key={rev._id}
                  to={`/profile/${rev.username}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-500 w-4">
                      #{index + 1}
                    </span>
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {rev.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rev.stats?.reviewsCompleted || 0} reviews • {rev.stats?.averageRating || 4.9}⭐
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-xs">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <span>Code Review Lifecycle</span>
            </h3>
            <div className="space-y-3 text-slate-400 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  1
                </span>
                <span>Author submits code request with initial version snapshot (v1).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  2
                </span>
                <span>Reviewer analyzes code and leaves structured line-level comments.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  3
                </span>
                <span>Author publishes revision (v2) & marks resolved blockers.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  4
                </span>
                <span>Reviewer verifies diff changes & grants Final Approval ✅.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
