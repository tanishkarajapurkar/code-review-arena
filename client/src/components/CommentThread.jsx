import React, { useState } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { CheckCircle2, Circle, CornerDownRight, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CommentThread = ({
  comment,
  replies = [],
  onResolveToggle = () => {},
  onReplySubmit = () => {},
  currentVersionNumber = 1,
}) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await onReplySubmit(comment._id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const isOutdated = comment.versionNumber < currentVersionNumber;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        comment.isResolved
          ? 'bg-slate-900/50 border-slate-800/80 opacity-80'
          : comment.isBlocking
          ? 'bg-slate-900 border-rose-500/30 shadow-lg shadow-rose-950/10'
          : 'bg-slate-900 border-slate-800 shadow-md'
      }`}
    >
      {/* Comment Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src={
              comment.author?.avatar ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            }
            alt={comment.author?.name}
            className="w-7 h-7 rounded-full border border-slate-700 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-200">
                {comment.author?.name || 'Reviewer'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                {comment.author?.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              {new Date(comment.createdAt).toLocaleDateString()} at{' '}
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {comment.lineNumber && (
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-400 text-[11px] font-mono font-medium">
              Line {comment.lineNumber}
            </span>
          )}

          <CategoryBadge category={comment.category} size="sm" />

          {isOutdated && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              v{comment.versionNumber} (Outdated)
            </span>
          )}

          {comment.isBlocking && !comment.isResolved && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-medium"
              title="Must be resolved before review approval"
            >
              <AlertTriangle className="w-3 h-3" />
              Blocker
            </span>
          )}
        </div>
      </div>

      {/* Main Comment Content */}
      <div className="p-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
        {comment.content}
      </div>

      {/* Action Footer: Resolution toggle & Reply trigger */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
        {/* Resolve toggle checkbox */}
        <button
          onClick={() => onResolveToggle(comment._id)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
            comment.isResolved
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {comment.isResolved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Resolved {comment.resolvedBy ? `by ${comment.resolvedBy.name}` : ''}</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 text-slate-500" />
              <span>Mark as resolved</span>
            </>
          )}
        </button>

        {/* Reply button */}
        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reply {replies.length > 0 && `(${replies.length})`}</span>
        </button>
      </div>

      {/* Thread replies */}
      {replies.length > 0 && (
        <div className="p-3 pl-6 bg-slate-950/60 border-t border-slate-800/50 space-y-3">
          {replies.map((reply) => (
            <div key={reply._id} className="flex items-start gap-2.5 text-xs">
              <CornerDownRight className="w-3.5 h-3.5 text-slate-500 mt-1 shrink-0" />
              <img
                src={
                  reply.author?.avatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt={reply.author?.name}
                className="w-5 h-5 rounded-full border border-slate-700 shrink-0"
              />
              <div className="flex-1 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-200 text-[11px]">
                    {reply.author?.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(reply.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input field */}
      {showReplyBox && (
        <form
          onSubmit={handleSendReply}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Reply to ${comment.author?.name || 'this thread'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!replyText.trim() || submittingReply}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
};
