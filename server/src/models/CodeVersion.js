import mongoose from 'mongoose';

const codeVersionSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    changelog: {
      type: String,
      default: 'Initial code submission',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure versionNumber is unique per review
codeVersionSchema.index({ reviewId: 1, versionNumber: 1 }, { unique: true });

export const CodeVersion = mongoose.model('CodeVersion', codeVersionSchema);
