import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    versionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeVersion',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    lineNumber: {
      type: Number,
      default: null, // null means general review comment, number means line-level comment
    },
    lineRange: {
      start: { type: Number, default: null },
      end: { type: Number, default: null },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null, // null for top-level comments, populated for replies
    },
    category: {
      type: String,
      enum: ['bug', 'performance', 'security', 'quality', 'readability', 'suggestion', 'general'],
      default: 'suggestion',
    },
    content: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isBlocking: {
      type: Boolean,
      default: function () {
        return ['bug', 'security', 'performance'].includes(this.category);
      },
    },
    isOutdated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
});

export const Comment = mongoose.model('Comment', commentSchema);
