import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Review } from './models/Review.js';
import { CodeVersion } from './models/CodeVersion.js';
import { Comment } from './models/Comment.js';
import { Notification } from './models/Notification.js';
import { ReviewAction } from './models/ReviewAction.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/code_review_arena');
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Review.deleteMany({}),
      CodeVersion.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ReviewAction.deleteMany({}),
    ]);
    console.log('[Seed] Cleared old collections');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Users
    const tanishka = await User.create({
      username: 'tanishka',
      name: 'Tanishka',
      email: 'tanishka@reviewarena.dev',
      password: defaultPassword,
      role: 'reviewer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Staff Reviewer • Specializing in Web Security, React internals & High-Throughput systems.',
      languages: ['JavaScript', 'Java', 'Python', 'React', 'TypeScript'],
      expertise: {
        security: 94,
        performance: 88,
        code_quality: 92,
        readability: 90,
        algorithms: 82,
        react: 96,
      },
      stats: {
        reviewsCompleted: 47,
        helpfulReviews: 39,
        pendingReviewsCount: 1,
        averageRating: 4.9,
        ratingsCount: 41,
      },
      isAvailable: true,
    });

    const sarah = await User.create({
      username: 'sarah_code',
      name: 'Sarah Chen',
      email: 'sarah@reviewarena.dev',
      password: defaultPassword,
      role: 'reviewer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Principal Engineer • Concurrency, Java Performance & Distributed Databases.',
      languages: ['Java', 'C++', 'Go', 'Python'],
      expertise: {
        security: 89,
        performance: 96,
        code_quality: 90,
        readability: 85,
        algorithms: 95,
        react: 60,
      },
      stats: {
        reviewsCompleted: 35,
        helpfulReviews: 31,
        pendingReviewsCount: 0,
        averageRating: 4.85,
        ratingsCount: 30,
      },
      isAvailable: true,
    });

    const alex = await User.create({
      username: 'alex_dev',
      name: 'Alex Rivera',
      email: 'alex@reviewarena.dev',
      password: defaultPassword,
      role: 'author',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Junior Fullstack Developer enthusiastic about clean code and algorithms.',
      languages: ['JavaScript', 'Python', 'React'],
      expertise: {
        security: 55,
        performance: 60,
        code_quality: 70,
        readability: 75,
        algorithms: 65,
        react: 75,
      },
      stats: {
        reviewsCompleted: 4,
        helpfulReviews: 3,
        pendingReviewsCount: 0,
        averageRating: 4.6,
        ratingsCount: 4,
      },
      isAvailable: true,
    });

    const admin = await User.create({
      username: 'admin',
      name: 'Platform Admin',
      email: 'admin@reviewarena.dev',
      password: defaultPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      bio: 'Code Review Arena Platform Administrator & Curriculum Maintainer.',
      languages: ['JavaScript', 'Java', 'Python', 'Go', 'Rust', 'React'],
      expertise: {
        security: 98,
        performance: 95,
        code_quality: 95,
        readability: 95,
        algorithms: 95,
        react: 95,
      },
      stats: {
        reviewsCompleted: 60,
        helpfulReviews: 55,
        pendingReviewsCount: 0,
        averageRating: 5.0,
        ratingsCount: 50,
      },
      isAvailable: true,
    });

    console.log('[Seed] Users created successfully');

    // ==========================================
    // REVIEW 1: Shopping Cart Calculation (Prompt example)
    // ==========================================
    const r1 = await Review.create({
      title: 'Improve shopping cart calculation',
      description: 'I built this function for calculating the shopping cart total on an e-commerce checkout page. I want feedback on the quality, edge cases, and idiomatic JavaScript practices.',
      language: 'javascript',
      difficulty: 'beginner',
      tags: ['javascript', 'arrays', 'beginner', 'ecommerce'],
      author: alex._id,
      assignedReviewers: [tanishka._id],
      status: 'approved',
      currentVersion: 2,
      views: 48,
      summaryFeedback: 'Great refactor! The switch to Array.prototype.reduce and handling missing prices makes this robust and clean.',
      qualityRating: {
        ratedBy: alex._id,
        correctness: 5,
        clarity: 5,
        actionability: 5,
        feedback: 'Extremely clear feedback with great explanations about both performance and safety!',
        ratedAt: new Date(Date.now() - 3600000 * 2),
      },
    });

    const r1_v1 = await CodeVersion.create({
      reviewId: r1._id,
      versionNumber: 1,
      language: 'javascript',
      changelog: 'Initial code submission with basic for loop',
      uploadedBy: alex._id,
      code: `function calculateTotal(items) {
    let total = 0;

    for(let i = 0; i < items.length; i++) {
        total += items[i].price;
    }

    return total;
}`,
    });

    const r1_v2 = await CodeVersion.create({
      reviewId: r1._id,
      versionNumber: 2,
      language: 'javascript',
      changelog: 'Refactored to items.reduce(), added Array guard and fallback for invalid item prices',
      uploadedBy: alex._id,
      code: `function calculateTotal(items) {
    if (!Array.isArray(items)) {
        return 0;
    }

    return items.reduce((total, item) => {
        const itemPrice = typeof item?.price === 'number' ? item.price : 0;
        return total + itemPrice;
    }, 0);
}`,
    });

    // Comments for Review 1
    const r1_c1 = await Comment.create({
      reviewId: r1._id,
      versionId: r1_v1._id,
      versionNumber: 1,
      lineNumber: 4,
      lineRange: { start: 4, end: 6 },
      author: tanishka._id,
      category: 'suggestion',
      content: 'You could use `reduce()` here to make this more concise and avoid manual counter index manipulation.',
      isResolved: true,
      resolvedBy: tanishka._id,
      resolvedAt: new Date(Date.now() - 3600000 * 4),
      isBlocking: false,
      isOutdated: true,
    });

    await Comment.create({
      reviewId: r1._id,
      versionId: r1_v1._id,
      versionNumber: 1,
      parentCommentId: r1_c1._id,
      author: alex._id,
      category: 'suggestion',
      content: "I used the loop intentionally because I'm still learning, but I'll rewrite it with reduce() in v2!",
      isResolved: true,
    });

    const r1_c2 = await Comment.create({
      reviewId: r1._id,
      versionId: r1_v1._id,
      versionNumber: 1,
      lineNumber: 5,
      lineRange: { start: 5, end: 5 },
      author: tanishka._id,
      category: 'bug',
      content: 'What happens if `items` is null, or an item has an undefined price? `total` will evaluate to `NaN` or crash on property access.',
      isResolved: true,
      resolvedBy: tanishka._id,
      resolvedAt: new Date(Date.now() - 3600000 * 3),
      isBlocking: true,
      isOutdated: true,
    });

    await Comment.create({
      reviewId: r1._id,
      versionId: r1_v2._id,
      versionNumber: 2,
      lineNumber: 6,
      lineRange: { start: 6, end: 9 },
      author: tanishka._id,
      category: 'quality',
      content: 'Nicely done! Guard clause and optional chaining safely prevent edge-case runtime errors.',
      isResolved: true,
      resolvedBy: tanishka._id,
      isBlocking: false,
    });

    // Review Actions for Review 1
    await ReviewAction.create([
      { reviewId: r1._id, actor: alex._id, actionType: 'created', details: 'Created review request and submitted v1' },
      { reviewId: r1._id, actor: tanishka._id, actionType: 'comment_added', details: 'Added [SUGGESTION] comment on Line 4' },
      { reviewId: r1._id, actor: tanishka._id, actionType: 'comment_added', details: 'Added [BUG] comment on Line 5' },
      { reviewId: r1._id, actor: alex._id, actionType: 'version_uploaded', details: 'Uploaded revision v2 with reduce() implementation' },
      { reviewId: r1._id, actor: tanishka._id, actionType: 'issue_resolved', details: 'Resolved bug on Line 5 after v2 verification' },
      { reviewId: r1._id, actor: tanishka._id, actionType: 'approved', details: 'Approved review with 5-star rating' },
      { reviewId: r1._id, actor: alex._id, actionType: 'rated', details: 'Author rated review quality: 5.0/5.0' },
    ]);

    // ==========================================
    // REVIEW 2: O(n^2) Nested Loop in Orders (Prompt example)
    // ==========================================
    const r2 = await Review.create({
      title: 'Optimize user order matching query',
      description: 'Looking to optimize our matching logic between users and pending orders in memory. Currently taking several seconds with 5,000 items in production.',
      language: 'javascript',
      difficulty: 'intermediate',
      tags: ['javascript', 'performance', 'algorithms', 'backend'],
      author: alex._id,
      assignedReviewers: [tanishka._id],
      status: 'changes_requested',
      currentVersion: 1,
      views: 73,
      summaryFeedback: 'The quadratic nested search is causing severe latency. Please convert to a Hash Map or grouped Map index before this can be approved.',
    });

    const r2_v1 = await CodeVersion.create({
      reviewId: r2._id,
      versionNumber: 1,
      language: 'javascript',
      changelog: 'Initial submission of matching algorithm',
      uploadedBy: alex._id,
      code: `function matchUserOrders(users, orders) {
    const matched = [];

    // Line 4: Loop through all active users
    for (let i = 0; i < users.length; i++) {
        // Line 6: Nested search across orders
        for (let j = 0; j < orders.length; j++) {
            if (orders[j].userId === users[i].id) {
                matched.push({
                    userName: users[i].name,
                    orderId: orders[j].id,
                    amount: orders[j].amount
                });
            }
        }
    }

    return matched;
}`,
    });

    await Comment.create({
      reviewId: r2._id,
      versionId: r2_v1._id,
      versionNumber: 1,
      lineNumber: 6,
      lineRange: { start: 6, end: 15 },
      author: tanishka._id,
      category: 'performance',
      content: '⚠️ This loop has O(n × m) complexity because you are searching the orders array repeatedly inside the users loop. With 5,000 users and 10,000 orders, this executes 50 million iterations! Group orders by userId into a `Map` first for linear O(n + m) execution.',
      isResolved: false,
      isBlocking: true,
    });

    await ReviewAction.create([
      { reviewId: r2._id, actor: alex._id, actionType: 'created', details: 'Created review request and submitted v1' },
      { reviewId: r2._id, actor: tanishka._id, actionType: 'comment_added', details: 'Added [PERFORMANCE] blocker on Line 6' },
      { reviewId: r2._id, actor: tanishka._id, actionType: 'changes_requested', details: 'Requested changes: O(n^2) nested loop needs Map indexing' },
    ]);

    // ==========================================
    // REVIEW 3: Java Concurrency & Deadlock Prevention
    // ==========================================
    const r3 = await Review.create({
      title: 'Thread-Safe Bank Account Transfer',
      description: 'Implemented multi-threaded transfer method between two account objects. Need review on synchronization primitives and race condition prevention.',
      language: 'java',
      difficulty: 'advanced',
      tags: ['java', 'concurrency', 'security', 'algorithms'],
      author: alex._id,
      assignedReviewers: [sarah._id],
      status: 'under_review',
      currentVersion: 1,
      views: 92,
    });

    const r3_v1 = await CodeVersion.create({
      reviewId: r3._id,
      versionNumber: 1,
      language: 'java',
      changelog: 'Initial Java synchronization implementation',
      uploadedBy: alex._id,
      code: `package com.bank.service;

public class TransferService {

    public boolean transferFunds(Account from, Account to, double amount) {
        if (amount <= 0) return false;

        synchronized (from) {
            synchronized (to) {
                if (from.getBalance() >= amount) {
                    from.debit(amount);
                    to.credit(amount);
                    return true;
                }
                return false;
            }
        }
    }
}`,
    });

    await Comment.create({
      reviewId: r3._id,
      versionId: r3_v1._id,
      versionNumber: 1,
      lineNumber: 8,
      lineRange: { start: 8, end: 17 },
      author: sarah._id,
      category: 'security',
      content: '🚨 Severe Deadlock Vulnerability! If Thread 1 executes transfer(A, B) while Thread 2 simultaneously executes transfer(B, A), Thread 1 acquires lock on A and waits for B, while Thread 2 acquires lock on B and waits for A. Deadlock guaranteed. You must enforce a deterministic lock ordering (e.g. `Account firstLock = from.getId() < to.getId() ? from : to;`).',
      isResolved: false,
      isBlocking: true,
    });

    await Comment.create({
      reviewId: r3._id,
      versionId: r3_v1._id,
      versionNumber: 1,
      lineNumber: 5,
      lineRange: { start: 5, end: 5 },
      author: sarah._id,
      category: 'bug',
      content: 'Floating point precision issue: using `double` for currency transactions causes IEEE 754 rounding drift. Switch to `BigDecimal` or integer cents.',
      isResolved: false,
      isBlocking: true,
    });

    await ReviewAction.create([
      { reviewId: r3._id, actor: alex._id, actionType: 'created', details: 'Created review request and submitted v1' },
      { reviewId: r3._id, actor: sarah._id, actionType: 'comment_added', details: 'Added [SECURITY] blocker on Line 8' },
      { reviewId: r3._id, actor: sarah._id, actionType: 'comment_added', details: 'Added [BUG] blocker on Line 5' },
    ]);

    // ==========================================
    // REVIEW 4: React Custom Hook with cleanup
    // ==========================================
    const r4 = await Review.create({
      title: 'useDebouncedSearch hook with abort controller',
      description: 'Creating a generic debounced search hook with query cancellation to prevent stale responses.',
      language: 'react',
      difficulty: 'intermediate',
      tags: ['react', 'hooks', 'frontend', 'performance'],
      author: alex._id,
      status: 'waiting',
      currentVersion: 1,
      views: 31,
    });

    await CodeVersion.create({
      reviewId: r4._id,
      versionNumber: 1,
      language: 'react',
      changelog: 'Initial hook implementation',
      uploadedBy: alex._id,
      code: `import { useState, useEffect } from 'react';

export function useDebouncedSearch(query, delay = 300) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const handler = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, {
                    signal: controller.signal
                });
                const data = await res.json();
                setResults(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [query, delay]);

    return { results, loading };
}`,
    });

    // Sample Notifications for Alex & Tanishka
    await Notification.create([
      {
        recipient: alex._id,
        sender: tanishka._id,
        type: 'comment_added',
        reviewId: r2._id,
        message: 'Tanishka commented on Line 6 of "Optimize user order matching query": Performance bottleneck detected.',
      },
      {
        recipient: alex._id,
        sender: tanishka._id,
        type: 'review_approved',
        reviewId: r1._id,
        message: 'Tanishka approved your review request: "Improve shopping cart calculation" ✅',
      },
      {
        recipient: tanishka._id,
        sender: alex._id,
        type: 'review_rated',
        reviewId: r1._id,
        message: 'Alex rated your review with 5.0 ⭐ (Correctness: 5, Clarity: 5, Actionability: 5)',
      },
    ]);

    console.log('[Seed] Database successfully seeded with reviews, versions, comments, and notifications!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
