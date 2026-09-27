import express from 'express';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { CodeVersion } from '../models/CodeVersion.js';

const router = express.Router();

// @route   GET /api/stats/overview
// @desc    Get aggregate platform stats for dashboard and admin view
router.get('/overview', async (req, res) => {
  try {
    const [
      totalReviews,
      totalUsers,
      totalComments,
      totalVersions,
      statusBreakdown,
      languageBreakdown,
    ] = await Promise.all([
      Review.countDocuments(),
      User.countDocuments(),
      Comment.countDocuments(),
      CodeVersion.countDocuments(),
      Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Review.aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    const approvedCount = statusBreakdown.find((s) => s._id === 'approved')?.count || 0;
    const approvalRate = totalReviews > 0 ? Math.round((approvedCount / totalReviews) * 100) : 0;

    res.json({
      totalReviews,
      totalUsers,
      totalComments,
      totalVersions,
      approvalRate,
      statusBreakdown,
      languageBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
