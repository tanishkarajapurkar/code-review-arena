import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['author', 'reviewer', 'admin'],
      default: 'author',
    },
    bio: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['JavaScript'],
    },
    expertise: {
      security: { type: Number, default: 70 },
      performance: { type: Number, default: 65 },
      code_quality: { type: Number, default: 80 },
      readability: { type: Number, default: 75 },
      algorithms: { type: Number, default: 60 },
      react: { type: Number, default: 85 },
    },
    stats: {
      reviewsCompleted: { type: Number, default: 0 },
      helpfulReviews: { type: Number, default: 0 },
      pendingReviewsCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 4.8 },
      ratingsCount: { type: Number, default: 0 },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password === enteredPassword) {
    return true;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    return false;
  }
};

export const User = mongoose.model('User', userSchema);
