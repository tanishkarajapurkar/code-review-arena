import React, { useState } from 'react';
import { X, Star, Award, Send } from 'lucide-react';

export const RatingModal = ({ isOpen, onClose, onSubmit, reviewerName = 'Reviewer' }) => {
  const [correctness, setCorrectness] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [actionability, setActionability] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        correctness,
        clarity,
        actionability,
        feedback,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange, label, description }) => (
    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-200">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-125 transition-transform"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-mono font-bold text-amber-400 ml-1.5">{value}.0</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">{description}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Rate Review Quality</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Rate the quality of the review provided by <strong className="text-white">{reviewerName}</strong>. Your feedback powers the reviewer reputation system.
          </p>

          <StarSelector
            label="Correctness"
            description="Were the bug reports, security warnings, or optimization suggestions technically sound?"
            value={correctness}
            onChange={setCorrectness}
          />

          <StarSelector
            label="Clarity"
            description="Were explanations easy to understand with well-explained rationales?"
            value={clarity}
            onChange={setClarity}
          />

          <StarSelector
            label="Actionability"
            description="Did the reviewer provide clear next steps or code examples on how to resolve issues?"
            value={actionability}
            onChange={setActionability}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Constructive Comments (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What made this review particularly helpful or what could be improved?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
