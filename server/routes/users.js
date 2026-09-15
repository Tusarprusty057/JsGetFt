const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar personalInfo gamification social.privacy')
      .populate('gamification.badges', 'name description icon')
      .populate('gamification.achievements', 'name description icon');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.social.privacy.profile === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        personalInfo: user.personalInfo,
        gamification: user.gamification
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name avatar personalInfo gamification social.privacy')
    .limit(parseInt(limit));

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        personalInfo: user.personalInfo,
        gamification: user.gamification,
        isPrivate: user.social.privacy.profile === 'private'
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    if (req.user.social.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { 'social.following': targetUserId }
    });

    // Add to target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { 'social.followers': req.user.id }
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Remove from following list
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { 'social.following': targetUserId }
    });

    // Remove from target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { 'social.followers': req.user.id }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/following
// @desc    Get following list
// @access  Private
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('social.following', 'name avatar personalInfo gamification')
      .select('social.following');

    res.json({
      success: true,
      following: user.social.following.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        personalInfo: user.personalInfo,
        gamification: user.gamification
      }))
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/followers
// @desc    Get followers list
// @access  Private
router.get('/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('social.followers', 'name avatar personalInfo gamification')
      .select('social.followers');

    res.json({
      success: true,
      followers: user.social.followers.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        personalInfo: user.personalInfo,
        gamification: user.gamification
      }))
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('gamification.badges', 'name description icon')
      .populate('gamification.achievements', 'name description icon');

    // Calculate additional stats
    const stats = {
      level: user.gamification.level,
      experience: user.gamification.experience,
      streak: user.gamification.streak,
      totalPoints: user.gamification.totalPoints,
      badges: user.gamification.badges.length,
      achievements: user.gamification.achievements.length,
      friends: user.social.friends.length,
      followers: user.social.followers.length,
      following: user.social.following.length,
      memberSince: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
