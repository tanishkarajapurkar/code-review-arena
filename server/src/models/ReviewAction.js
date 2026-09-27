import mongoose from 'mongoose';

const reviewActionSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        'created',
        'version_uploaded',
        'status_changed',
        'comment_added',
        'issue_resolved',
        'issue_reopened',
        'approved',
        'changes_requested',
        'rated',
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ReviewAction = mongoose.model('ReviewAction', reviewActionSchema);
