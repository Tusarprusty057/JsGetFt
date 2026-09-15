const express = require('express');
const { Workout, Meal } = require('../models/Workout');
const { FoodItem, Meal: NutritionMeal } = require('../models/Nutrition');
const { Challenge, Badge, Achievement } = require('../models/Progress');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/social/feed
// @desc    Get social feed
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const user = await User.findById(req.user.id);
    
    // Get friends and following
    const friends = [...user.social.friends, ...user.social.following];
    
    let filter = {
      $or: [
        { user: { $in: friends } },
        { isPublic: true }
      ]
    };

    if (type === 'workouts') {
      filter = { ...filter, ...{ type: { $exists: true } } };
    } else if (type === 'meals') {
      filter = { ...filter, ...{ type: { $in: ['breakfast', 'lunch', 'dinner', 'snack'] } } };
    }

    // Get workouts and meals
    const [workouts, meals] = await Promise.all([
      Workout.find({ ...filter, user: { $in: friends } })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
      NutritionMeal.find({ ...filter, user: { $in: friends } })
        .populate('user', 'name avatar')
        .populate('items.foodItem')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
    ]);

    // Combine and sort by date
    const feed = [...workouts, ...meals]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({
      success: true,
      feed,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(feed.length / limit),
        total: feed.length
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/workouts/:id/like
// @desc    Like a workout
// @access  Private
router.post('/workouts/:id/like', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check if already liked
    if (workout.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already liked this workout'
      });
    }

    workout.likes.push(req.user.id);
    await workout.save();

    res.json({
      success: true,
      message: 'Workout liked successfully',
      likesCount: workout.likes.length
    });
  } catch (error) {
    console.error('Like workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/workouts/:id/unlike
// @desc    Unlike a workout
// @access  Private
router.post('/workouts/:id/unlike', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.likes = workout.likes.filter(id => id.toString() !== req.user.id);
    await workout.save();

    res.json({
      success: true,
      message: 'Workout unliked successfully',
      likesCount: workout.likes.length
    });
  } catch (error) {
    console.error('Unlike workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/workouts/:id/comment
// @desc    Comment on a workout
// @access  Private
router.post('/workouts/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const comment = {
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    };

    workout.comments.push(comment);
    await workout.save();

    // Populate user info for the comment
    const populatedComment = {
      ...comment,
      user: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      }
    };

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Comment workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/workouts/:id/share
// @desc    Share a workout
// @access  Private
router.post('/workouts/:id/share', auth, async (req, res) => {
  try {
    const { message } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check if already shared
    if (workout.shares.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already shared this workout'
      });
    }

    workout.shares.push(req.user.id);
    workout.social.isShared = true;
    if (message) {
      workout.social.shareMessage = message;
    }
    await workout.save();

    res.json({
      success: true,
      message: 'Workout shared successfully',
      sharesCount: workout.shares.length
    });
  } catch (error) {
    console.error('Share workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/social/challenges
// @desc    Get public challenges
// @access  Private
router.get('/challenges', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type } = req.query;
    const filter = { isActive: true, 'social.isPublic': true };

    if (category) filter.category = category;
    if (type) filter.type = type;

    const challenges = await Challenge.find(filter)
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Challenge.countDocuments(filter);

    res.json({
      success: true,
      challenges,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/social/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'points', period = 'weekly' } = req.query;
    
    let filter = {};
    let sortField = 'gamification.totalPoints';

    if (type === 'streak') {
      sortField = 'gamification.streak';
    } else if (type === 'level') {
      sortField = 'gamification.level';
    }

    // Add time filter for period
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filter.lastActive = { $gte: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filter.lastActive = { $gte: monthAgo };
    }

    const users = await User.find({
      ...filter,
      isActive: true,
      'social.privacy.profile': { $ne: 'private' }
    })
    .select('name avatar gamification personalInfo')
    .sort({ [sortField]: -1 })
    .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      score: user.gamification[type === 'streak' ? 'streak' : type === 'level' ? 'level' : 'totalPoints'],
      level: user.gamification.level,
      isCurrentUser: user._id.toString() === req.user.id
    }));

    res.json({
      success: true,
      leaderboard,
      type,
      period
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/social/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // This is a simplified notification system
    // In a real app, you'd have a dedicated notifications collection
    const notifications = [
      {
        id: '1',
        type: 'achievement',
        title: 'New Badge Earned!',
        message: 'You earned the "7-Day Streak" badge',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        type: 'social',
        title: 'New Follower',
        message: 'John Doe started following you',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: '3',
        type: 'challenge',
        title: 'Challenge Reminder',
        message: 'Don\'t forget to complete today\'s workout challenge',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    let filteredNotifications = notifications;
    if (unreadOnly === 'true') {
      filteredNotifications = notifications.filter(n => !n.isRead);
    }

    const paginatedNotifications = filteredNotifications
      .slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredNotifications.length / limit),
        total: filteredNotifications.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.post('/notifications/:id/read', auth, async (req, res) => {
  try {
    // In a real app, you'd update the notification in the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/social/friends
// @desc    Get user's friends
// @access  Private
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('social.friends', 'name avatar gamification personalInfo lastActive')
      .populate('social.following', 'name avatar gamification personalInfo lastActive');

    const friends = user.social.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      avatar: friend.avatar,
      level: friend.gamification.level,
      status: friend.lastActive && (new Date() - new Date(friend.lastActive)) < 5 * 60 * 1000 ? 'online' : 'offline',
      lastActivity: friend.lastActive ? 
        (new Date() - new Date(friend.lastActive)) < 60 * 1000 ? 'Active now' :
        (new Date() - new Date(friend.lastActive)) < 60 * 60 * 1000 ? `${Math.floor((new Date() - new Date(friend.lastActive)) / (60 * 1000))} minutes ago` :
        (new Date() - new Date(friend.lastActive)) < 24 * 60 * 60 * 1000 ? `${Math.floor((new Date() - new Date(friend.lastActive)) / (60 * 60 * 1000))} hours ago` :
        `${Math.floor((new Date() - new Date(friend.lastActive)) / (24 * 60 * 60 * 1000))} days ago` : 'Unknown'
    }));

    res.json({
      success: true,
      friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/friends/request
// @desc    Send friend request
// @access  Private
router.post('/friends/request', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user.id);

    // Check if already friends
    if (currentUser.social.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user'
      });
    }

    // Check if request already sent
    if (currentUser.social.sentRequests.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add to sent requests
    currentUser.social.sentRequests.push(userId);
    await currentUser.save();

    // Add to target user's received requests
    targetUser.social.receivedRequests.push(req.user.id);
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/friends/accept
// @desc    Accept friend request
// @access  Private
router.post('/friends/accept', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if request exists
    if (!currentUser.social.receivedRequests.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'No friend request found from this user'
      });
    }

    // Add to friends list for both users
    currentUser.social.friends.push(userId);
    currentUser.social.receivedRequests = currentUser.social.receivedRequests.filter(id => id.toString() !== userId);
    
    targetUser.social.friends.push(req.user.id);
    targetUser.social.sentRequests = targetUser.social.sentRequests.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/friends/decline
// @desc    Decline friend request
// @access  Private
router.post('/friends/decline', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from received requests
    currentUser.social.receivedRequests = currentUser.social.receivedRequests.filter(id => id.toString() !== userId);
    await currentUser.save();

    // Remove from target user's sent requests
    targetUser.social.sentRequests = targetUser.social.sentRequests.filter(id => id.toString() !== req.user.id);
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request declined successfully'
    });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/social/friends/:userId
// @desc    Remove friend
// @access  Private
router.delete('/friends/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from friends list for both users
    currentUser.social.friends = currentUser.social.friends.filter(id => id.toString() !== userId);
    targetUser.social.friends = targetUser.social.friends.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/challenges/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not active'
      });
    }

    // Check if already participating
    const alreadyParticipating = challenge.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (alreadyParticipating) {
      return res.status(400).json({
        success: false,
        message: 'Already participating in this challenge'
      });
    }

    // Add participant
    challenge.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      progress: 0,
      status: 'active'
    });

    await challenge.save();

    res.json({
      success: true,
      message: 'Successfully joined challenge'
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/challenges/:id/leave
// @desc    Leave a challenge
// @access  Private
router.post('/challenges/:id/leave', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Remove participant
    challenge.participants = challenge.participants.filter(
      participant => participant.user.toString() !== req.user.id
    );

    await challenge.save();

    res.json({
      success: true,
      message: 'Successfully left challenge'
    });
  } catch (error) {
    console.error('Leave challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/social/posts
// @desc    Create a social post
// @access  Private
router.post('/posts', auth, async (req, res) => {
  try {
    const { type, content, workoutId, mealId, visibility = 'friends' } = req.body;

    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type and content are required'
      });
    }

    let postData = {
      user: req.user.id,
      type,
      content,
      visibility,
      createdAt: new Date()
    };

    // Add related data based on type
    if (type === 'workout' && workoutId) {
      const workout = await Workout.findById(workoutId);
      if (workout && workout.user.toString() === req.user.id) {
        postData.workout = workoutId;
        postData.workoutData = {
          name: workout.name,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          type: workout.type
        };
      }
    } else if (type === 'meal' && mealId) {
      const meal = await NutritionMeal.findById(mealId);
      if (meal && meal.user.toString() === req.user.id) {
        postData.meal = mealId;
        postData.mealData = {
          name: meal.name,
          type: meal.type,
          calories: meal.totals.calories,
          protein: meal.totals.protein
        };
      }
    }

    // For now, we'll store posts in a simple way
    // In a real app, you'd have a dedicated Post model
    const post = {
      _id: new Date().getTime().toString(),
      ...postData,
      likes: [],
      comments: [],
      shares: []
    };

    res.json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/social/stats
// @desc    Get social stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const [workoutCount, mealCount, challengeCount] = await Promise.all([
      Workout.countDocuments({ user: req.user.id }),
      NutritionMeal.countDocuments({ user: req.user.id }),
      Challenge.countDocuments({ 'participants.user': req.user.id })
    ]);

    const stats = {
      followers: user.social.followers.length,
      following: user.social.following.length,
      friends: user.social.friends.length,
      workouts: workoutCount,
      meals: mealCount,
      challenges: challengeCount,
      level: user.gamification.level,
      points: user.gamification.totalPoints,
      streak: user.gamification.streak,
      badges: user.gamification.badges.length,
      achievements: user.gamification.achievements.length,
      posts: 0, // This would come from a posts collection
      likes: 0, // This would be calculated from all user's posts
      shares: 0, // This would be calculated from all user's posts
      leaderboardPosition: 1 // This would be calculated based on points/level
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get social stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
