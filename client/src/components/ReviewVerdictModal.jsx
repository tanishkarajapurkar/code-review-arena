import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';

export const ReviewVerdictModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  unresolvedBlockers = 0,
}) => {
  const [selectedVerdict, setSelectedVerdict] = useState('approved');
  const [summaryFeedback, setSummaryFeedback] = useState('');
  const [overrideBlockers, setOverrideBlockers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedVerdict === 'approved' && unresolvedBlockers > 0 && !overrideBlockers) {
      setError(`Cannot approve: ${unresolvedBlockers} blocking issue(s) are still unresolved. Resolve them first or check the override authorization.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        status: selectedVerdict,
        summaryFeedback,
        overrideBlockers,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review verdict');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Submit Review Verdict</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verdict Choices */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedVerdict('approved')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedVerdict === 'approved'
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🟢</span>
                  <span className="text-xs font-bold text-slate-200">Approve</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ready to merge. All quality & safety criteria met.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVerdict('changes_requested')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedVerdict === 'changes_requested'
                    ? 'border-orange-500/60 bg-orange-500/10 text-orange-300 ring-2 ring-orange-500/20'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🟠</span>
                  <span className="text-xs font-bold text-slate-200">Request Changes</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Needs revisions before approval. Author must submit v+1.
                </p>
              </button>
            </div>
          </div>

          {/* Checklist & Blocker Warning if approving with unresolved blockers */}
          {selectedVerdict === 'approved' && unresolvedBlockers > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <div className="flex items-start gap-2.5 text-rose-300 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Unresolved Blocking Issues</span>
                  <p className="text-[11px] text-rose-300/80">
                    There are {unresolvedBlockers} unresolved blocker comments on this code.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-300 pt-2 border-t border-rose-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideBlockers}
                  onChange={(e) => setOverrideBlockers(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>I explicitly authorize approval despite open blockers</span>
              </label>
            </div>
          )}

          {/* Summary Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Review Summary & Recommendations
            </label>
            <textarea
              rows={4}
              placeholder="Provide overall summary, highlights, architecture assessment, and advice for the author..."
              value={summaryFeedback}
              onChange={(e) => setSummaryFeedback(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review Verdict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
