import express from 'express';
import { Comment } from '../models/Comment.js';
import { Review } from '../models/Review.js';
import { CodeVersion } from '../models/CodeVersion.js';
import { ReviewAction } from '../models/ReviewAction.js';
import { Notification } from '../models/Notification.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// @route   GET /api/reviews/:id/comments
// @desc    Get all comments for a specific review
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { versionNumber } = req.query;
    const query = { reviewId: req.params.id };

    if (versionNumber) {
      query.versionNumber = Number(versionNumber);
    }

    const comments = await Comment.find(query)
      .sort({ lineNumber: 1, createdAt: 1 })
      .populate('author', 'username name avatar role stats expertise')
      .populate('resolvedBy', 'username name avatar');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/comments
// @desc    Add line-level or general comment, or reply to existing comment
router.post('/', protect, async (req, res) => {
  try {
    const {
      content,
      category,
      lineNumber,
      lineRange,
      versionNumber,
      parentCommentId,
      isBlocking,
    } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Determine code version
    const targetVersionNumber = versionNumber || review.currentVersion || 1;
    const versionDoc = await CodeVersion.findOne({
      reviewId: review._id,
      versionNumber: targetVersionNumber,
    });

    if (!versionDoc) {
      return res.status(404).json({ message: `Version ${targetVersionNumber} not found for this review` });
    }

    const comment = await Comment.create({
      reviewId: review._id,
      versionId: versionDoc._id,
      versionNumber: targetVersionNumber,
      lineNumber: lineNumber !== undefined ? lineNumber : null,
      lineRange: lineRange || { start: lineNumber, end: lineNumber },
      author: req.user._id,
      parentCommentId: parentCommentId || null,
      category: category || (lineNumber ? 'suggestion' : 'general'),
      content,
      isBlocking: isBlocking !== undefined ? isBlocking : ['bug', 'security', 'performance'].includes(category),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'username name avatar role stats expertise'
    );

    // If author isn't the commenter, transition status to 'under_review' if it was 'waiting'
    if (review.status === 'waiting' && review.author.toString() !== req.user._id.toString()) {
      review.status = 'under_review';
      if (!review.assignedReviewers.includes(req.user._id)) {
        review.assignedReviewers.push(req.user._id);
      }
      await review.save();
    }

    // Audit trail
    const lineInfo = lineNumber ? `on Line ${lineNumber}` : 'overall';
    const isReply = !!parentCommentId;
    await ReviewAction.create({
      reviewId: review._id,
      actor: req.user._id,
      actionType: 'comment_added',
      details: isReply
        ? `Replied to comment thread`
        : `Added [${category.toUpperCase()}] comment ${lineInfo}`,
    });

    // Notify author and reviewers
    const recipientsToNotify = new Set();

    if (review.author.toString() !== req.user._id.toString()) {
      recipientsToNotify.add(review.author.toString());
    }

    if (review.assignedReviewers && review.assignedReviewers.length > 0) {
      review.assignedReviewers.forEach((revId) => {
        if (revId.toString() !== req.user._id.toString()) {
          recipientsToNotify.add(revId.toString());
        }
      });
    }

    // If it's a thread reply, also notify parent comment author
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        recipientsToNotify.add(parentComment.author.toString());
      }
    }

    for (const recipientId of recipientsToNotify) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        type: isReply ? 'reply_added' : 'comment_added',
        reviewId: review._id,
        commentId: comment._id,
        message: `${req.user.name} ${isReply ? 'replied' : `commented (${category})`} on "${review.title}" ${lineInfo}`,
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/comments/:id/resolve
// @desc    Toggle resolve/reopen status for a comment
router.patch('/:commentId/resolve', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const review = await Review.findById(comment.reviewId);
    const newResolvedState = !comment.isResolved;

    comment.isResolved = newResolvedState;
    comment.resolvedBy = newResolvedState ? req.user._id : null;
    comment.resolvedAt = newResolvedState ? new Date() : null;
    await comment.save();

    await ReviewAction.create({
      reviewId: comment.reviewId,
      actor: req.user._id,
      actionType: newResolvedState ? 'issue_resolved' : 'issue_reopened',
      details: `${newResolvedState ? 'Resolved' : 'Reopened'} comment on Line ${comment.lineNumber || 'General'}`,
    });

    if (review && review.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: review.author,
        sender: req.user._id,
        type: 'issue_resolved',
        reviewId: review._id,
        commentId: comment._id,
        message: `${req.user.name} marked issue on Line ${comment.lineNumber || 'General'} as ${newResolvedState ? 'Resolved' : 'Reopened'}`,
      });
    }

    const populated = await Comment.findById(comment._id)
      .populate('author', 'username name avatar role stats expertise')
      .populate('resolvedBy', 'username name avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment (author or admin only)
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.deleteMany({ parentCommentId: comment._id });
    await Comment.findByIdAndDelete(comment._id);

    res.json({ message: 'Comment and its replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
