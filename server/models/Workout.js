const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'sports', 'functional'],
    required: true 
  },
  muscleGroups: [String],
  equipment: [String],
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: [String],
  tips: [String],
  videoUrl: String,
  imageUrl: String,
  isCustom: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const setSchema = new mongoose.Schema({
  reps: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  duration: { type: Number, min: 0 }, // in seconds
  distance: { type: Number, min: 0 }, // in meters
  restTime: { type: Number, min: 0 }, // in seconds
  notes: String,
  rpe: { type: Number, min: 1, max: 10 }, // Rate of Perceived Exertion
  heartRate: { type: Number, min: 0 },
  calories: { type: Number, min: 0 },
  // Progress tracking fields
  completed: { type: Boolean, default: false },
  completedAt: Date,
  actualReps: { type: Number, min: 0 },
  actualWeight: { type: Number, min: 0 },
  actualDuration: { type: Number, min: 0 },
  actualDistance: { type: Number, min: 0 }
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: false },
  name: { type: String, required: false }, // For simple exercise names
  sets: [setSchema],
  notes: String,
  order: { type: Number, default: 0 }
});

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'sports', 'custom'],
    required: true 
  },
  exercises: [workoutExerciseSchema],
  duration: { type: Number, min: 0 }, // in minutes
  caloriesBurned: { type: Number, min: 0 },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [String],
  isTemplate: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // AI Analysis
  aiAnalysis: {
    formScore: { type: Number, min: 0, max: 100 },
    intensityScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    warnings: [String],
    improvements: [String]
  },
  // Performance Metrics
  performance: {
    totalVolume: { type: Number, min: 0 }, // weight * reps for all sets
    averageIntensity: { type: Number, min: 0, max: 100 },
    maxHeartRate: { type: Number, min: 0 },
    avgHeartRate: { type: Number, min: 0 },
    powerOutput: { type: Number, min: 0 },
    efficiency: { type: Number, min: 0, max: 100 }
  },
  // Social Features
  social: {
    isShared: { type: Boolean, default: false },
    shareMessage: String,
    visibility: { 
      type: String, 
      enum: ['public', 'friends', 'private'], 
      default: 'private' 
    }
  },
  // Gamification
  gamification: {
    points: { type: Number, default: 0 },
    badges: [String],
    achievements: [String],
    streak: { type: Number, default: 0 }
  },
  startedAt: Date,
  completedAt: Date,
  status: { 
    type: String, 
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  // Progress tracking fields
  notes: String,
  actualDifficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced']
  },
  totalSetsCompleted: { type: Number, default: 0 },
  totalRepsCompleted: { type: Number, default: 0 },
  totalWeightLifted: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Calculate total volume
workoutSchema.methods.calculateTotalVolume = function() {
  let totalVolume = 0;
  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.weight && set.reps) {
        totalVolume += set.weight * set.reps;
      }
    });
  });
  return totalVolume;
};

// Calculate average intensity
workoutSchema.methods.calculateAverageIntensity = function() {
  if (this.exercises.length === 0) return 0;
  
  let totalIntensity = 0;
  let setCount = 0;
  
  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.rpe) {
        totalIntensity += set.rpe;
        setCount++;
      }
    });
  });
  
  return setCount > 0 ? Math.round((totalIntensity / setCount) * 10) : 0;
};

// Calculate estimated workout duration in minutes
workoutSchema.methods.calculateEstimatedDuration = function() {
  let totalSeconds = 0;
  
  this.exercises.forEach(exercise => {
    const numSets = exercise.sets.length;
    if (numSets === 0) return;
    
    // Calculate time for each set
    exercise.sets.forEach((set, index) => {
      // Time for performing the set (reps * 3 seconds per rep for strength, duration for cardio)
      if (set.reps && set.reps > 0) {
        totalSeconds += set.reps * 3; // 3 seconds per rep
      } else if (set.duration && set.duration > 0) {
        totalSeconds += set.duration; // Use duration directly for cardio
      }
      
      // Add rest time between sets (except for the last set)
      if (index < numSets - 1 && set.restTime) {
        totalSeconds += set.restTime;
      }
    });
    
    // Add rest time between exercises (2 minutes)
    totalSeconds += 120;
  });
  
  // Remove the last 2 minutes (no rest after last exercise)
  totalSeconds = Math.max(0, totalSeconds - 120);
  
  return Math.round(totalSeconds / 60); // Convert to minutes
};

// Calculate actual workout duration
workoutSchema.methods.calculateActualDuration = function() {
  if (!this.startedAt || !this.completedAt) return 0;
  
  const startTime = new Date(this.startedAt);
  const endTime = new Date(this.completedAt);
  const durationMs = endTime - startTime;
  
  return Math.round(durationMs / 60000); // Convert to minutes
};

const Workout = mongoose.model('Workout', workoutSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = { Workout, Exercise };
