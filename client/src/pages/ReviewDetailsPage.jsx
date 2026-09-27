import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MonacoCodeViewer } from '../components/MonacoCodeViewer';
import { MonacoDiffViewer } from '../components/MonacoDiffViewer';
import { CommentThread } from '../components/CommentThread';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge, CATEGORIES } from '../components/CategoryBadge';
import { SubmitRevisionModal } from '../components/SubmitRevisionModal';
import { ReviewVerdictModal } from '../components/ReviewVerdictModal';
import { RatingModal } from '../components/RatingModal';
import { ReviewerMatchPanel } from '../components/ReviewerMatchPanel';
import {
  GitCommit,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Check,
  Star,
  MessageSquare,
  History,
  Send,
  Sparkles,
  Shield,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export const ReviewDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [review, setReview] = useState(null);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [actions, setActions] = useState([]);
  const [unresolvedBlockers, setUnresolvedBlockers] = useState(0);
  const [loading, setLoading] = useState(true);

  // View state
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(1);
  const [showDiffMode, setShowDiffMode] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'summary' | 'timeline'
  const [filterOnlyBlockers, setFilterOnlyBlockers] = useState(false);

  // New Comment Draft state
  const [newCommentLine, setNewCommentLine] = useState('');
  const [newCommentCategory, setNewCommentCategory] = useState('suggestion');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentIsBlocking, setNewCommentIsBlocking] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const fetchReviewDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getReview(id);
      setReview(data.review);
      setVersions(data.versions || []);
      setComments(data.comments || []);
      setActions(data.actions || []);
      setUnresolvedBlockers(data.unresolvedBlockers || 0);

      // Default to highest version number
      if (data.versions && data.versions.length > 0) {
        const latestVer = Math.max(...data.versions.map((v) => v.versionNumber));
        setSelectedVersionNumber(latestVer);
      }
    } catch (err) {
      console.error('Failed to load review', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetails();
  }, [id]);

  const currentVersionDoc =
    versions.find((v) => v.versionNumber === selectedVersionNumber) ||
    versions[versions.length - 1] ||
    {};

  // Group comments: top-level vs replies
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const getRepliesForComment = (parentId) =>
    comments.filter((c) => c.parentCommentId?.toString() === parentId?.toString());

  // Filtered comments for display
  const displayedComments = topLevelComments.filter((c) => {
    if (filterOnlyBlockers) {
      return !c.isResolved && c.isBlocking;
    }
    return true;
  });

  const totalIssuesCount = topLevelComments.length;
  const resolvedIssuesCount = topLevelComments.filter((c) => c.isResolved).length;
  const resolutionPercentage =
    totalIssuesCount > 0 ? Math.round((resolvedIssuesCount / totalIssuesCount) * 100) : 100;

  const handleLineClick = (lineNumber) => {
    setSelectedLine(lineNumber);
    setNewCommentLine(lineNumber);
    setActiveTab('comments');
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in or register to post review comments.');
      return;
    }
    if (!newCommentContent.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const payload = {
        content: newCommentContent,
        category: newCommentCategory,
        versionNumber: selectedVersionNumber,
        lineNumber: newCommentLine ? Number(newCommentLine) : null,
        isBlocking: newCommentIsBlocking,
      };

      await api.addComment(id, payload);
      setNewCommentContent('');
      setNewCommentLine('');
      setSelectedLine(null);
      await fetchReviewDetails();
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleResolve = async (commentId) => {
    try {
      await api.toggleResolveComment(commentId);
      await fetchReviewDetails();
    } catch (err) {
      console.error('Failed to toggle resolve', err);
    }
  };

  const handleReplySubmit = async (parentCommentId, replyText) => {
    try {
      await api.addComment(id, {
        content: replyText,
        parentCommentId,
        versionNumber: selectedVersionNumber,
      });
      await fetchReviewDetails();
    } catch (err) {
      console.error('Failed to post reply', err);
    }
  };

  const handleRevisionSubmit = async ({ code, changelog }) => {
    await api.uploadVersion(id, { code, changelog });
    await fetchReviewDetails();
  };

  const handleVerdictSubmit = async ({ status, summaryFeedback, overrideBlockers }) => {
    await api.updateReviewStatus(id, { status, summaryFeedback, overrideBlockers });
    await fetchReviewDetails();
  };

  const handleRatingSubmit = async (ratingData) => {
    await api.rateReview(id, ratingData);
    await fetchReviewDetails();
  };

  if (loading || !review) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Loading review workspace...</p>
      </div>
    );
  }

  const isAuthor = user?._id === review.author?._id;
  const isReviewer = user?.role === 'reviewer' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reviews</span>
        </Link>

        {/* View Diff Mode Toggle */}
        {versions.length > 1 && (
          <button
            onClick={() => setShowDiffMode(!showDiffMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showDiffMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500/50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{showDiffMode ? 'Exit Diff View' : 'Compare Revisions Diff'}</span>
          </button>
        )}
      </div>

      {/* Review Header Banner */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {review.language}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize border border-slate-700">
                {review.difficulty}
              </span>
              <StatusBadge status={review.status} />
              <span className="text-xs text-slate-500 font-mono">#{review._id.slice(-6)}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {review.title}
            </h1>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {review.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <img
                  src={review.author?.avatar}
                  alt={review.author?.name}
                  className="w-5 h-5 rounded-full border border-slate-700 object-cover"
                />
                <span className="text-slate-200 font-medium">{review.author?.name}</span>
              </div>
              <span>•</span>
              <span>Submitted {new Date(review.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="font-mono text-indigo-400">
                Current Version: v{review.currentVersion}
              </span>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Version dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedVersionNumber}
                onChange={(e) => setSelectedVersionNumber(Number(e.target.value))}
                className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                {versions.map((v) => (
                  <option key={v.versionNumber} value={v.versionNumber} className="bg-slate-900">
                    v{v.versionNumber}{' '}
                    {v.versionNumber === review.currentVersion ? '(Latest)' : '(Archived)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Action: Submit Revision */}
            {isAuthor && review.status !== 'approved' && (
              <button
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Submit Revision v{(review.currentVersion || 1) + 1}</span>
              </button>
            )}

            {/* Reviewer Action: Submit Verdict */}
            {isReviewer && (
              <button
                onClick={() => setIsVerdictModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Verdict</span>
              </button>
            )}

            {/* Author Action: Rate Review Quality */}
            {isAuthor && review.status === 'approved' && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>
                  {review.qualityRating?.correctness ? 'Update Rating' : 'Rate Review'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Checklist Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resolution Checklist:</span>
          </div>
          <span className="text-slate-400">
            <strong className="text-white">{resolvedIssuesCount}</strong> of{' '}
            <strong className="text-white">{totalIssuesCount}</strong> comments resolved (
            {resolutionPercentage}%)
          </span>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${resolutionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {unresolvedBlockers > 0 ? (
            <div className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{unresolvedBlockers} Blocking Issues Unresolved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
              <span>All Blockers Cleared</span>
            </div>
          )}

          <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={filterOnlyBlockers}
              onChange={(e) => setFilterOnlyBlockers(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Filter Blockers</span>
          </label>
        </div>
      </div>

      {/* Main Review Workspace Layout: Code on Left, Discussion on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Code / Diff Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {showDiffMode ? (
            <MonacoDiffViewer
              versions={versions}
              language={review.language}
              initialOriginalVersion={1}
              initialModifiedVersion={review.currentVersion}
              height="600px"
            />
          ) : (
            <MonacoCodeViewer
              code={currentVersionDoc.code || ''}
              language={review.language}
              comments={comments.filter((c) => c.versionNumber === selectedVersionNumber)}
              selectedLine={selectedLine}
              onLineClick={handleLineClick}
              height="600px"
            />
          )}

          {/* Version changelog note */}
          {currentVersionDoc.changelog && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong className="text-indigo-400 font-mono">
                  v{selectedVersionNumber} Changelog:
                </strong>{' '}
                {currentVersionDoc.changelog}
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(currentVersionDoc.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Review Discussion & Comments Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tabs */}
          <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments ({displayedComments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Timeline ({actions.length})</span>
            </button>
          </div>

          {/* TAB 1: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Draft New Comment Form */}
              {!user ? (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 text-xs text-center space-y-2.5">
                  <p className="text-slate-200 font-medium">Sign in to leave line comments, suggest optimizations, and review code.</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Link to="/login" className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md">
                      Sign In
                    </Link>
                    <Link to="/register" className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
                      Register
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Add Structured Feedback</span>
                    </h3>
                    {selectedLine ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold">
                        Line {selectedLine}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">General or pick a line</span>
                    )}
                  </div>

                  <form onSubmit={handleCreateComment} className="space-y-3">
                    {/* Category Selector Pills */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                        Review Category
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {Object.keys(CATEGORIES).map((catKey) => {
                          const cat = CATEGORIES[catKey];
                          const isSelected = newCommentCategory === catKey;
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => {
                                setNewCommentCategory(catKey);
                                if (['bug', 'security', 'performance'].includes(catKey)) {
                                  setNewCommentIsBlocking(true);
                                } else {
                                  setNewCommentIsBlocking(false);
                                }
                              }}
                              className={`p-1.5 rounded-lg border text-left text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span className="truncate">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Line Number & Blocker toggle */}
                    <div className="flex items-center gap-3">
                      <div className="w-1/2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Line Number
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 14 (or blank for overall)"
                          value={newCommentLine}
                          onChange={(e) => {
                            setNewCommentLine(e.target.value);
                            setSelectedLine(e.target.value ? Number(e.target.value) : null);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="w-1/2 pt-4">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newCommentIsBlocking}
                            onChange={(e) => setNewCommentIsBlocking(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                          />
                          <span className="text-[11px] text-rose-400 font-medium">
                            Blocking Issue
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Comment Text Area */}
                    <div>
                      <textarea
                        rows={3}
                        placeholder={
                          newCommentLine
                            ? `Comment on line ${newCommentLine}... (e.g. "This loop has O(n²) complexity...")`
                            : 'Write your review feedback...'
                        }
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={!newCommentContent.trim() || submittingComment}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Comments Thread List */}
              <div className="space-y-4">
                {displayedComments.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-500">
                    No comments match your filter. Click on a line in the editor to submit one!
                  </div>
                ) : (
                  displayedComments.map((comment) => (
                    <CommentThread
                      key={comment._id}
                      comment={comment}
                      replies={getRepliesForComment(comment._id)}
                      onResolveToggle={handleToggleResolve}
                      onReplySubmit={handleReplySubmit}
                      currentVersionNumber={review.currentVersion}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW SUMMARY & RATINGS */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Review Summary & Verdict
                </h3>

                {review.summaryFeedback ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {review.summaryFeedback}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Reviewer has not submitted an overall verdict summary yet.
                  </p>
                )}

                {/* Quality Score Breakdown if rated */}
                {review.qualityRating?.correctness && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>Author Review Quality Score</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {(
                          (review.qualityRating.correctness +
                            review.qualityRating.clarity +
                            review.qualityRating.actionability) /
                          3
                        ).toFixed(1)}{' '}
                        / 5.0
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block">Correctness</span>
                        <span className="font-bold text-white">
                          {review.qualityRating.correctness} ⭐
                        </span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block">Clarity</span>
                        <span className="font-bold text-white">
                          {review.qualityRating.clarity} ⭐
                        </span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block">Actionability</span>
                        <span className="font-bold text-white">
                          {review.qualityRating.actionability} ⭐
                        </span>
                      </div>
                    </div>

                    {review.qualityRating.feedback && (
                      <p className="text-xs text-slate-300 italic pt-1">
                        "{review.qualityRating.feedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Reviewer Matching Panel */}
              <ReviewerMatchPanel
                language={review.language}
                tags={review.tags}
                reviewId={review._id}
                currentReviewers={review.assignedReviewers || []}
                onReviewerAssigned={() => fetchReviewDetails()}
              />
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Activity Audit Trail
              </h3>
              <div className="space-y-4 relative pl-4 border-l-2 border-slate-800">
                {actions.map((act) => (
                  <div key={act._id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900" />
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-200">
                        {act.actor?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{act.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SubmitRevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmit={handleRevisionSubmit}
        currentCode={currentVersionDoc.code || ''}
        language={review.language}
        nextVersion={(review.currentVersion || 1) + 1}
      />

      <ReviewVerdictModal
        isOpen={isVerdictModalOpen}
        onClose={() => setIsVerdictModalOpen(false)}
        onSubmit={handleVerdictSubmit}
        currentStatus={review.status}
        unresolvedBlockers={unresolvedBlockers}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        reviewerName={review.assignedReviewers[0]?.name || 'Reviewer'}
      />
    </div>
  );
};
