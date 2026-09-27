import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'under_review', 'changes_requested', 'approved', 'closed'],
      default: 'waiting',
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    assignedReviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    summaryFeedback: {
      type: String,
      default: '',
    },
    qualityRating: {
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      correctness: { type: Number, min: 1, max: 5 },
      clarity: { type: Number, min: 1, max: 5 },
      actionability: { type: Number, min: 1, max: 5 },
      feedback: { type: String, default: '' },
      ratedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for versions
reviewSchema.virtual('versions', {
  ref: 'CodeVersion',
  localField: '_id',
  foreignField: 'reviewId',
});

// Virtual for comments
reviewSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'reviewId',
});

export const Review = mongoose.model('Review', reviewSchema);
