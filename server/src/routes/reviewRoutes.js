import express from 'express';
import { Review } from '../models/Review.js';
import { CodeVersion } from '../models/CodeVersion.js';
import { Comment } from '../models/Comment.js';
import { ReviewAction } from '../models/ReviewAction.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    List all reviews with filtering, search, and metadata counts
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { language, tag, difficulty, status, search, author, reviewer, sort } = req.query;

    const query = {};

    if (language && language !== 'all') {
      query.language = language.toLowerCase();
    }

    if (tag && tag !== 'all') {
      query.tags = { $in: [tag.toLowerCase().replace('#', '')] };
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty.toLowerCase();
    }

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (author) {
      query.author = author;
    }

    if (reviewer) {
      query.assignedReviewers = reviewer;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { language: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const reviews = await Review.find(query)
      .populate('author', 'username name avatar role stats')
      .populate('assignedReviewers', 'username name avatar stats')
      .sort(sortOption)
      .lean();

    // Attach comments & versions summary counts
    const reviewIds = reviews.map((r) => r._id);

    const [commentCounts, versionCounts] = await Promise.all([
      Comment.aggregate([
        { $match: { reviewId: { $in: reviewIds } } },
        {
          $group: {
            _id: '$reviewId',
            total: { $sum: 1 },
            unresolved: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isResolved', false] }, { $eq: ['$isBlocking', true] }] }, 1, 0],
              },
            },
          },
        },
      ]),
      CodeVersion.aggregate([
        { $match: { reviewId: { $in: reviewIds } } },
        { $group: { _id: '$reviewId', totalVersions: { $sum: 1 } } },
      ]),
    ]);

    const commentMap = {};
    commentCounts.forEach((c) => {
      commentMap[c._id.toString()] = { total: c.total, unresolved: c.unresolved };
    });

    const versionMap = {};
    versionCounts.forEach((v) => {
      versionMap[v._id.toString()] = v.totalVersions;
    });

    const enrichedReviews = reviews.map((r) => {
      const cData = commentMap[r._id.toString()] || { total: 0, unresolved: 0 };
      const vTotal = versionMap[r._id.toString()] || 1;
      return {
        ...r,
        commentsCount: cData.total,
        unresolvedCount: cData.unresolved,
        versionsCount: vTotal,
      };
    });

    res.json(enrichedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get complete review details including versions, comments, actions, and matching reviewers
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('author', 'username name avatar role stats bio languages expertise')
      .populate('assignedReviewers', 'username name avatar role stats bio expertise');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Increment views
    review.views += 1;
    await review.save();

    // Fetch all code versions
    const versions = await CodeVersion.find({ reviewId: review._id })
      .sort({ versionNumber: 1 })
      .populate('uploadedBy', 'username name avatar');

    // Fetch all comments and thread replies
    const comments = await Comment.find({ reviewId: review._id })
      .sort({ createdAt: 1 })
      .populate('author', 'username name avatar role stats expertise')
      .populate('resolvedBy', 'username name avatar');

    // Fetch timeline actions
    const actions = await ReviewAction.find({ reviewId: review._id })
      .sort({ createdAt: -1 })
      .populate('actor', 'username name avatar role')
      .limit(30);

    // Compute unresolved blockers count
    const unresolvedBlockers = comments.filter((c) => !c.isResolved && c.isBlocking).length;

    res.json({
      review,
      versions,
      comments,
      actions,
      unresolvedBlockers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create new review request and Version 1
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, language, difficulty, tags, code } = req.body;

    if (!title || !description || !language || !code) {
      return res.status(400).json({ message: 'Title, description, language, and initial code are required' });
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase().replace('#', ''))
      : tags
      ? tags.split(',').map((t) => t.trim().toLowerCase().replace('#', ''))
      : [];

    const review = await Review.create({
      title,
      description,
      language: language.toLowerCase(),
      difficulty: difficulty || 'intermediate',
      tags: cleanTags,
      author: req.user._id,
      currentVersion: 1,
      status: 'waiting',
    });

    const version1 = await CodeVersion.create({
      reviewId: review._id,
      versionNumber: 1,
      code,
      language: language.toLowerCase(),
      changelog: 'Initial code submission for review',
      uploadedBy: req.user._id,
    });

    await ReviewAction.create({
      reviewId: review._id,
      actor: req.user._id,
      actionType: 'created',
      details: `Created review request: "${title}" (v1 submitted)`,
    });

    // Notify reviewers and admins about the new review request
    const reviewersToNotify = await User.find({
      _id: { $ne: req.user._id },
      role: { $in: ['reviewer', 'admin'] },
    }).limit(10);

    for (const rev of reviewersToNotify) {
      await Notification.create({
        recipient: rev._id,
        sender: req.user._id,
        type: 'review_assigned',
        reviewId: review._id,
        message: `📢 New review request: "${title}" in ${language.toUpperCase()} by ${req.user.name}. Check it out!`,
      });
    }

    res.status(201).json({ review, version: version1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/versions
// @desc    Upload revised code version (creates immutable snapshot)
router.post('/:id/versions', protect, async (req, res) => {
  try {
    const { code, changelog } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the author can upload new revisions' });
    }

    const nextVersionNumber = (review.currentVersion || 1) + 1;

    const newVersion = await CodeVersion.create({
      reviewId: review._id,
      versionNumber: nextVersionNumber,
      code,
      language: review.language,
      changelog: changelog || `Version ${nextVersionNumber} revision`,
      uploadedBy: req.user._id,
    });

    // Mark previous version comments as outdated if requested
    await Comment.updateMany(
      { reviewId: review._id, versionNumber: { $lt: nextVersionNumber }, isResolved: false },
      { $set: { isOutdated: true } }
    );

    // Update review status to under_review or waiting
    review.currentVersion = nextVersionNumber;
    if (review.status === 'changes_requested') {
      review.status = 'under_review';
    }
    await review.save();

    await ReviewAction.create({
      reviewId: review._id,
      actor: req.user._id,
      actionType: 'version_uploaded',
      details: `Uploaded revision v${nextVersionNumber}: "${changelog || 'Code update'}"`,
    });

    // Notify assigned reviewers
    for (const reviewerId of review.assignedReviewers) {
      await Notification.create({
        recipient: reviewerId,
        sender: req.user._id,
        type: 'version_uploaded',
        reviewId: review._id,
        message: `${req.user.name} submitted Version ${nextVersionNumber} for review: "${review.title}"`,
      });
    }

    res.status(201).json({ review, version: newVersion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/reviews/:id/status
// @desc    Update review status (waiting, under_review, changes_requested, approved, closed)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, summaryFeedback, overrideBlockers } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const isAuthor = review.author.toString() === req.user._id.toString();
    const isReviewer = review.assignedReviewers.some((id) => id.toString() === req.user._id.toString()) || req.user.role === 'reviewer';
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isReviewer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to change review status' });
    }

    // CHECKLIST & RESOLUTION ENFORCEMENT:
    // When attempting to Approve, check for unresolved blocking comments!
    if (status === 'approved') {
      const unresolvedBlockers = await Comment.countDocuments({
        reviewId: review._id,
        isResolved: false,
        isBlocking: true,
      });

      if (unresolvedBlockers > 0 && !overrideBlockers) {
        return res.status(400).json({
          message: `Cannot approve review: there are ${unresolvedBlockers} unresolved blocking issues. Resolve them first or provide override authorization.`,
          unresolvedBlockers,
        });
      }
    }

    const previousStatus = review.status;
    review.status = status;
    if (summaryFeedback) {
      review.summaryFeedback = summaryFeedback;
    }

    // Automatically add current user to assignedReviewers if they are reviewing
    if (isReviewer && !review.assignedReviewers.includes(req.user._id)) {
      review.assignedReviewers.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.reviewsCompleted': status === 'approved' ? 1 : 0 } });
    }

    await review.save();

    await ReviewAction.create({
      reviewId: review._id,
      actor: req.user._id,
      actionType: status === 'approved' ? 'approved' : status === 'changes_requested' ? 'changes_requested' : 'status_changed',
      details: `Changed review status from ${previousStatus} to ${status}${summaryFeedback ? ` with verdict: "${summaryFeedback}"` : ''}`,
    });

    // Notify author if reviewer changed status
    if (!isAuthor) {
      const notifType = status === 'approved' ? 'review_approved' : status === 'changes_requested' ? 'changes_requested' : 'status_changed';
      await Notification.create({
        recipient: review.author,
        sender: req.user._id,
        type: notifType,
        reviewId: review._id,
        message: `${req.user.name} marked "${review.title}" as ${status.replace('_', ' ').toUpperCase()}`,
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/rate
// @desc    Author rates the review quality (Correctness, Clarity, Actionability)
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { correctness, clarity, actionability, feedback } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the author can rate this review' });
    }

    review.qualityRating = {
      ratedBy: req.user._id,
      correctness: Number(correctness),
      clarity: Number(clarity),
      actionability: Number(actionability),
      feedback: feedback || '',
      ratedAt: new Date(),
    };

    await review.save();

    const avgScore = ((Number(correctness) + Number(clarity) + Number(actionability)) / 3).toFixed(1);

    // Update stats for all assigned reviewers
    for (const reviewerId of review.assignedReviewers) {
      const revUser = await User.findById(reviewerId);
      if (revUser) {
        const currentCount = revUser.stats.ratingsCount || 0;
        const currentAvg = revUser.stats.averageRating || 4.8;
        const newAvg = ((currentAvg * currentCount + parseFloat(avgScore)) / (currentCount + 1)).toFixed(2);

        revUser.stats.averageRating = Number(newAvg);
        revUser.stats.ratingsCount = currentCount + 1;
        if (parseFloat(avgScore) >= 4.0) {
          revUser.stats.helpfulReviews = (revUser.stats.helpfulReviews || 0) + 1;
        }
        await revUser.save();

        await Notification.create({
          recipient: reviewerId,
          sender: req.user._id,
          type: 'review_rated',
          reviewId: review._id,
          message: `${req.user.name} rated your review for "${review.title}" with ${avgScore} ⭐ stars!`,
        });
      }
    }

    await ReviewAction.create({
      reviewId: review._id,
      actor: req.user._id,
      actionType: 'rated',
      details: `Author rated review quality: ${avgScore}/5.0 (Correctness: ${correctness}, Clarity: ${clarity}, Actionability: ${actionability})`,
    });

    res.json({ message: 'Review rated successfully', qualityRating: review.qualityRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/assign
// @desc    Assign reviewer or join as reviewer
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { reviewerId } = req.body;
    const targetUserId = reviewerId || req.user._id;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (!review.assignedReviewers.includes(targetUserId)) {
      review.assignedReviewers.push(targetUserId);
      if (review.status === 'waiting') {
        review.status = 'under_review';
      }
      await review.save();

      await ReviewAction.create({
        reviewId: review._id,
        actor: req.user._id,
        actionType: 'status_changed',
        details: `Assigned reviewer to code review`,
      });

      if (targetUserId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: targetUserId,
          sender: req.user._id,
          type: 'review_assigned',
          reviewId: review._id,
          message: `You were assigned as reviewer for "${review.title}"`,
        });
      }
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
