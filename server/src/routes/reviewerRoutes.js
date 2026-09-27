import express from 'express';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviewers/match
// @desc    Smart Reviewer Matching based on language, tags, availability, and load
router.get('/match', optionalProtect, async (req, res) => {
  try {
    const { language, tags, reviewId } = req.query;

    const query = {
      role: { $in: ['reviewer', 'admin'] },
      isAvailable: true,
    };

    // Exclude author if reviewId provided
    if (reviewId) {
      const review = await Review.findById(reviewId);
      if (review) {
        query._id = { $ne: review.author };
      }
    }

    const reviewers = await User.find(query).select('-password');
    const tagList = tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [];

    // Calculate match score
    const scoredReviewers = reviewers.map((rev) => {
      let score = 0;
      const reasons = [];

      // 1. Language match (+40 pts)
      if (language && rev.languages.some((l) => l.toLowerCase() === language.toLowerCase())) {
        score += 40;
        reasons.push(`Expert in ${language}`);
      }

      // 2. Tag / Category expertise match (e.g. security, performance, algorithms)
      if (tagList.length > 0) {
        tagList.forEach((tag) => {
          const cleanTag = tag.trim().toLowerCase().replace('#', '');
          if (rev.expertise && rev.expertise[cleanTag]) {
            const expVal = rev.expertise[cleanTag];
            score += Math.round(expVal / 4); // up to 25 pts
            reasons.push(`High expertise in #${cleanTag} (${expVal}%)`);
          }
        });
      }

      // 3. Workload balancing: fewer pending reviews gives slight boost (+15 pts)
      const pending = rev.stats.pendingReviewsCount || 0;
      if (pending === 0) {
        score += 15;
        reasons.push('High availability (0 pending reviews)');
      } else if (pending < 3) {
        score += 8;
      }

      // 4. Reputation / Quality score bonus
      const rating = rev.stats.averageRating || 4.5;
      score += Math.round(rating * 3); // ~15 pts

      return {
        ...rev.toObject(),
        matchScore: Math.min(score, 100),
        matchReasons: reasons.slice(0, 3),
      };
    });

    // Sort by matchScore descending
    scoredReviewers.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredReviewers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviewers/leaderboard
// @desc    Get top reviewers leaderboard with stats
router.get('/leaderboard', async (req, res) => {
  try {
    const reviewers = await User.find({ role: { $in: ['reviewer', 'admin'] } })
      .select('-password')
      .sort({ 'stats.reviewsCompleted': -1, 'stats.helpfulReviews': -1 })
      .limit(10);

    res.json(reviewers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
