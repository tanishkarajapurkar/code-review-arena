import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Review } from './models/Review.js';
import { CodeVersion } from './models/CodeVersion.js';
import { Comment } from './models/Comment.js';
import { Notification } from './models/Notification.js';
import { ReviewAction } from './models/ReviewAction.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code_review_arena');
    console.log('[Clean] Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Review.deleteMany({}),
      CodeVersion.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ReviewAction.deleteMany({}),
    ]);

    console.log('[Clean] All collections emptied successfully. Database is completely blank and ready for real users!');
    process.exit(0);
  } catch (error) {
    console.error('[Clean] Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
