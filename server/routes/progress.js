const express = require('express');
const { Goal, ProgressEntry, Challenge, Badge, Achievement } = require('../models/Progress');
const { Workout } = require('../models/Workout');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Goals Routes
// @route   GET /api/progress/goals
// @desc    Get user goals
// @access  Private
router.get('/goals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive, isCompleted } = req.query;
    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(filter);

    res.json({
      success: true,
      goals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/goals
// @desc    Create new goal
// @access  Private
router.post('/goals', auth, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      user: req.user.id
    };

    const goal = new Goal(goalData);
    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/progress/goals/:id
// @desc    Update goal
// @access  Private
router.put('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    Object.assign(goal, req.body);
    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/progress/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Progress Entries Routes
// @route   GET /api/progress/entries
// @desc    Get progress entries
// @access  Private
router.get('/entries', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const entries = await ProgressEntry.find(filter)
      .populate('goal', 'title category target')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProgressEntry.countDocuments(filter);

    res.json({
      success: true,
      entries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/entries
// @desc    Add progress entry
// @access  Private
router.post('/entries', auth, async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      user: req.user.id
    };

    const entry = new ProgressEntry(entryData);
    await entry.save();

    // Update goal progress if goal is specified
    if (entry.goal) {
      const goal = await Goal.findById(entry.goal);
      if (goal) {
        goal.current.value = entry.value;
        goal.current.unit = entry.unit;
        goal.current.lastUpdated = entry.date;

        // Check if goal is completed
        const isCompleted = checkGoalCompletion(goal, entry.value);
        if (isCompleted && !goal.isCompleted) {
          goal.isCompleted = true;
          goal.completedAt = new Date();
        }

        await goal.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Progress entry added successfully',
      entry
    });
  } catch (error) {
    console.error('Add entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Challenges Routes
// @route   GET /api/progress/challenges
// @desc    Get challenges
// @access  Private
router.get('/challenges', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

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

// @route   POST /api/progress/challenges
// @desc    Create challenge
// @access  Private
router.post('/challenges', auth, async (req, res) => {
  try {
    const challengeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const challenge = new Challenge(challengeData);
    await challenge.save();

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/challenges/:id/join
// @desc    Join challenge
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
    const existingParticipant = challenge.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Already participating in this challenge'
      });
    }

    // Check participant limit
    if (challenge.participants.length >= challenge.requirements.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Challenge is full'
      });
    }

    challenge.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      progress: 0,
      isActive: true
    });

    await challenge.save();

    res.json({
      success: true,
      message: 'Joined challenge successfully',
      challenge
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

// @route   POST /api/progress/challenges/:id/leave
// @desc    Leave challenge
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

    challenge.participants = challenge.participants.filter(
      p => p.user.toString() !== req.user.id
    );

    await challenge.save();

    res.json({
      success: true,
      message: 'Left challenge successfully'
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

// Badges and Achievements Routes
// @route   GET /api/progress/badges
// @desc    Get available badges
// @access  Private
router.get('/badges', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true })
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/progress/achievements
// @desc    Get available achievements
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true })
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/progress/dashboard
// @desc    Get progress dashboard
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [goals, entries, challenges, badges, achievements, workouts] = await Promise.all([
      Goal.find({ user: req.user.id, isActive: true }).limit(5),
      ProgressEntry.find(filter).sort({ date: -1 }).limit(10),
      Challenge.find({
        'participants.user': req.user.id,
        isActive: true
      }).populate('participants.user', 'name avatar'),
      Badge.find({ isActive: true }).limit(10),
      Achievement.find({ isActive: true }).limit(10),
      Workout.find({ user: req.user.id, status: 'completed' }).sort({ completedAt: -1 }).limit(10)
    ]);

    // Calculate goal progress
    const goalsWithProgress = goals.map(goal => {
      const progress = goal.current.value / goal.target.value * 100;
      return {
        ...goal.toObject(),
        progressPercentage: Math.min(100, Math.max(0, progress))
      };
    });

    // Calculate workout statistics
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
    const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const totalSets = workouts.reduce((sum, workout) => sum + (workout.totalSetsCompleted || 0), 0);

    // Generate workout frequency data for the last 30 days
    const workoutFrequencyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.completedAt);
        return workoutDate.toDateString() === date.toDateString();
      });
      
      workoutFrequencyData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
      });
    }

    res.json({
      success: true,
      dashboard: {
        goals: goalsWithProgress,
        recentEntries: entries,
        activeChallenges: challenges,
        availableBadges: badges,
        availableAchievements: achievements,
        recentWorkouts: workouts.slice(0, 5).map(workout => ({
          _id: workout._id,
          name: workout.name,
          type: workout.type,
          completedAt: workout.completedAt,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          totalSetsCompleted: workout.totalSetsCompleted
        })),
        workoutFrequency: workoutFrequencyData,
        stats: {
          totalGoals: goals.length,
          completedGoals: goals.filter(g => g.isCompleted).length,
          activeChallenges: challenges.length,
          totalEntries: entries.length,
          totalWorkouts: totalWorkouts,
          caloriesBurned: totalCalories,
          hoursWorkedOut: Math.round(totalDuration / 60),
          totalSets: totalSets
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to check goal completion
function checkGoalCompletion(goal, currentValue) {
  const target = goal.target.value;
  const operator = goal.target.operator;

  switch (operator) {
    case 'increase':
      return currentValue >= target;
    case 'decrease':
      return currentValue <= target;
    case 'maintain':
      return Math.abs(currentValue - target) <= (target * 0.05); // 5% tolerance
    case 'achieve':
      return currentValue >= target;
    default:
      return false;
  }
}

module.exports = router;
