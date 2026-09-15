const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['weight', 'strength', 'endurance', 'flexibility', 'body-composition', 'performance', 'habit', 'nutrition', 'sleep', 'other'],
    required: true 
  },
  type: { 
    type: String, 
    enum: ['target', 'milestone', 'habit', 'performance'],
    required: true 
  },
  // Target values
  target: {
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    operator: { 
      type: String, 
      enum: ['increase', 'decrease', 'maintain', 'achieve'],
      required: true 
    }
  },
  // Current progress
  current: {
    value: { type: Number, default: 0 },
    unit: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  },
  // Timeline
  startDate: { type: Date, required: true },
  targetDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  // Milestones
  milestones: [{
    title: String,
    targetValue: Number,
    achievedAt: Date,
    isAchieved: { type: Boolean, default: false }
  }],
  // AI Analysis
  aiAnalysis: {
    difficulty: { 
      type: String, 
      enum: ['very-easy', 'easy', 'moderate', 'hard', 'very-hard'] 
    },
    probability: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    warnings: [String],
    adjustments: [String]
  },
  // Social features
  social: {
    isPublic: { type: Boolean, default: false },
    supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    updates: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  // Gamification
  gamification: {
    points: { type: Number, default: 0 },
    badges: [String],
    streak: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isActive: { type: Boolean, default: true },
  notes: String
}, {
  timestamps: true
});

const progressEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  category: { 
    type: String, 
    enum: ['weight', 'strength', 'endurance', 'flexibility', 'body-composition', 'performance', 'habit', 'nutrition', 'sleep'],
    required: true 
  },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: Date, required: true },
  // Context
  context: {
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    sleep: { type: mongoose.Schema.Types.ObjectId, ref: 'Sleep' },
    notes: String
  },
  // AI Analysis
  aiAnalysis: {
    trend: { 
      type: String, 
      enum: ['improving', 'maintaining', 'declining', 'fluctuating'] 
    },
    insights: [String],
    recommendations: [String],
    warnings: [String]
  },
  isPrivate: { type: Boolean, default: false },
  photos: [String] // URLs to progress photos
}, {
  timestamps: true
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['individual', 'group', 'community', 'global'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['fitness', 'nutrition', 'sleep', 'steps', 'strength', 'endurance', 'flexibility', 'habit'],
    required: true 
  },
  // Challenge details
  rules: [String],
  requirements: {
    minParticipants: { type: Number, default: 1 },
    maxParticipants: { type: Number, default: 1000 },
    duration: { type: Number, required: true }, // in days
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'daily'
    }
  },
  // Rewards
  rewards: {
    points: { type: Number, default: 0 },
    badges: [String],
    achievements: [String],
    prizes: [String]
  },
  // Participants
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
  // Timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  // Leaderboard
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    rank: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }],
  // Social features
  social: {
    isPublic: { type: Boolean, default: true },
    allowInvites: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: true }
  },
  // AI Analysis
  aiAnalysis: {
    difficulty: { 
      type: String, 
      enum: ['very-easy', 'easy', 'moderate', 'hard', 'very-hard'] 
    },
    engagement: { type: Number, min: 0, max: 100 },
    recommendations: [String]
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String]
}, {
  timestamps: true
});

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['fitness', 'nutrition', 'sleep', 'social', 'achievement', 'streak', 'challenge'],
    required: true 
  },
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  requirements: {
    type: { 
      type: String, 
      enum: ['streak', 'total', 'single', 'combination'],
      required: true 
    },
    value: { type: Number, required: true },
    unit: String,
    conditions: [String]
  },
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['fitness', 'nutrition', 'sleep', 'social', 'personal', 'milestone'],
    required: true 
  },
  requirements: {
    type: { 
      type: String, 
      enum: ['streak', 'total', 'single', 'combination', 'time-based'],
      required: true 
    },
    value: { type: Number, required: true },
    unit: String,
    conditions: [String],
    timeLimit: Number // in days, for time-based achievements
  },
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Goal = mongoose.model('Goal', goalSchema);
const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);
const Challenge = mongoose.model('Challenge', challengeSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = { Goal, ProgressEntry, Challenge, Badge, Achievement };
