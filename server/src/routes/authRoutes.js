import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_code_review_arena_key_123_development', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password, role, languages, bio } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'author',
      languages: languages || ['JavaScript'],
      bio: bio || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      languages: user.languages,
      expertise: user.expertise,
      stats: user.stats,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail.toLowerCase() },
      ],
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        languages: user.languages,
        expertise: user.expertise,
        stats: user.stats,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username/email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    bio: req.user.bio,
    languages: req.user.languages,
    expertise: req.user.expertise,
    stats: req.user.stats,
    isAvailable: req.user.isAvailable,
  });
});

// @route   GET /api/auth/demo-users
// @desc    Quick access to seeded demo user accounts for instant role-switching
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/switch-demo
// @desc    Instantly authenticate as one of the demo users
router.post('/switch-demo', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Demo user not found' });
    }
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      languages: user.languages,
      expertise: user.expertise,
      stats: user.stats,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile/:username
// @desc    Get user profile with stats and reviewer expertise
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile photo, name, bio, languages, or role
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, avatar, languages, role, expertise } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (languages && Array.isArray(languages)) user.languages = languages;
    if (role && ['author', 'reviewer'].includes(role)) user.role = role;
    if (expertise) user.expertise = { ...user.expertise, ...expertise };

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      languages: user.languages,
      expertise: user.expertise,
      stats: user.stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/clear-demo-reviewers
// @desc    Delete placeholder demo reviewers when user wants to clean and use only real registered users
router.post('/clear-demo-reviewers', protect, async (req, res) => {
  try {
    const demoUsernames = ['sarah_code', 'alex_dev']; // keep current user or admin
    await User.deleteMany({ username: { $in: demoUsernames, $ne: req.user.username } });
    res.json({ message: 'Demo reviewers cleared successfully. Ready for real users!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

