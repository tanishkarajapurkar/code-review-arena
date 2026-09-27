import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { X, GitCommit, Upload, AlertCircle } from 'lucide-react';

export const SubmitRevisionModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentCode = '',
  language = 'javascript',
  nextVersion = 2,
}) => {
  const [code, setCode] = useState(currentCode);
  const [changelog, setChangelog] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Code cannot be empty');
      return;
    }
    if (!changelog.trim()) {
      setError('Please provide a changelog summary describing what you fixed or updated');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ code, changelog });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit revision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submit Revised Code Version</h2>
              <p className="text-xs text-slate-400">
                Create immutable snapshot <span className="font-mono text-indigo-400 font-semibold">v{nextVersion}</span> with your fixes and enhancements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-hidden">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Changelog / Revision Notes <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Replaced nested loop with Map index to fix O(n^2) latency (addressed Line 6)"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex-1 min-h-[300px] mb-4 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Source Code (Version {nextVersion})
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {language.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="320px"
                language={language === 'react' ? 'javascript' : language}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{submitting ? 'Uploading Snapshot...' : `Publish Version ${nextVersion}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
