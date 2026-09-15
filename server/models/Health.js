const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  measurements: {
    weight: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    muscleMass: { type: Number, min: 0 },
    boneDensity: { type: Number, min: 0 },
    waterPercentage: { type: Number, min: 0, max: 100 },
    // Body circumferences
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    thigh: { type: Number, min: 0 },
    arm: { type: Number, min: 0 },
    neck: { type: Number, min: 0 },
    // Additional measurements
    bicep: { type: Number, min: 0 },
    forearm: { type: Number, min: 0 },
    calf: { type: Number, min: 0 }
  },
  units: {
    weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
    height: { type: String, enum: ['cm', 'ft'], default: 'cm' },
    circumference: { type: String, enum: ['cm', 'in'], default: 'cm' }
  },
  measuredAt: { type: Date, required: true },
  notes: String,
  photos: [String], // URLs to measurement photos
  isPrivate: { type: Boolean, default: true }
}, {
  timestamps: true
});

const sleepSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  bedtime: { type: Date, required: true },
  wakeTime: { type: Date, required: true },
  totalSleep: { type: Number, min: 0 }, // in minutes
  deepSleep: { type: Number, min: 0 }, // in minutes
  lightSleep: { type: Number, min: 0 }, // in minutes
  remSleep: { type: Number, min: 0 }, // in minutes
  awakeTime: { type: Number, min: 0 }, // in minutes
  sleepEfficiency: { type: Number, min: 0, max: 100 },
  sleepQuality: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'very-poor'] 
  },
  // Sleep environment
  environment: {
    roomTemperature: { type: Number, min: 0 },
    noiseLevel: { 
      type: String, 
      enum: ['silent', 'quiet', 'moderate', 'loud', 'very-loud'] 
    },
    lightLevel: { 
      type: String, 
      enum: ['pitch-dark', 'very-dark', 'dark', 'dim', 'bright'] 
    },
    airQuality: { 
      type: String, 
      enum: ['excellent', 'good', 'fair', 'poor', 'very-poor'] 
    }
  },
  // Sleep habits
  habits: {
    caffeineIntake: { type: Number, min: 0 }, // mg
    alcoholIntake: { type: Number, min: 0 }, // standard drinks
    exerciseBeforeBed: { type: Boolean, default: false },
    screenTimeBeforeBed: { type: Number, min: 0 }, // in minutes
    mealBeforeBed: { type: Boolean, default: false },
    stressLevel: { 
      type: String, 
      enum: ['very-low', 'low', 'moderate', 'high', 'very-high'] 
    }
  },
  // Sleep disturbances
  disturbances: [{
    type: { 
      type: String, 
      enum: ['wake-up', 'nightmare', 'snoring', 'restlessness', 'bathroom', 'noise', 'other'] 
    },
    time: Date,
    duration: { type: Number, min: 0 }, // in minutes
    description: String
  }],
  // AI Analysis
  aiAnalysis: {
    sleepScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    warnings: [String],
    insights: [String],
    trends: [String]
  },
  notes: String,
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'] 
  },
  energy: { 
    type: String, 
    enum: ['very-high', 'high', 'moderate', 'low', 'very-low'] 
  }
}, {
  timestamps: true
});

const heartRateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate: { type: Number, required: true, min: 30, max: 220 },
  type: { 
    type: String, 
    enum: ['resting', 'active', 'max', 'recovery', 'zone1', 'zone2', 'zone3', 'zone4', 'zone5'],
    required: true 
  },
  activity: { 
    type: String, 
    enum: ['sleep', 'rest', 'walking', 'running', 'cycling', 'swimming', 'strength-training', 'other'],
    default: 'rest'
  },
  measuredAt: { type: Date, required: true },
  duration: { type: Number, min: 0 }, // in minutes
  device: { type: String, default: 'manual' },
  notes: String
}, {
  timestamps: true
});

const stressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { 
    type: String, 
    enum: ['very-low', 'low', 'moderate', 'high', 'very-high'],
    required: true 
  },
  score: { type: Number, min: 1, max: 10 },
  factors: [{
    type: { 
      type: String, 
      enum: ['work', 'relationships', 'health', 'finances', 'family', 'social', 'other'] 
    },
    intensity: { type: Number, min: 1, max: 10 },
    description: String
  }],
  symptoms: [{
    type: { 
      type: String, 
      enum: ['headache', 'fatigue', 'anxiety', 'irritability', 'sleep-issues', 'appetite-changes', 'concentration-problems', 'other'] 
    },
    severity: { type: Number, min: 1, max: 10 },
    description: String
  }],
  copingStrategies: [{
    strategy: { 
      type: String, 
      enum: ['exercise', 'meditation', 'breathing', 'music', 'reading', 'socializing', 'sleep', 'other'] 
    },
    effectiveness: { type: Number, min: 1, max: 10 },
    duration: { type: Number, min: 0 } // in minutes
  }],
  measuredAt: { type: Date, required: true },
  notes: String,
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'] 
  }
}, {
  timestamps: true
});

const stepsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  steps: { type: Number, required: true, min: 0 },
  distance: { type: Number, min: 0 }, // in meters
  calories: { type: Number, min: 0 },
  activeMinutes: { type: Number, min: 0 },
  floors: { type: Number, min: 0 },
  // Activity breakdown
  activities: [{
    type: { 
      type: String, 
      enum: ['walking', 'running', 'cycling', 'swimming', 'other'] 
    },
    duration: { type: Number, min: 0 }, // in minutes
    distance: { type: Number, min: 0 }, // in meters
    calories: { type: Number, min: 0 },
    intensity: { 
      type: String, 
      enum: ['low', 'moderate', 'high', 'very-high'] 
    }
  }],
  // Goals
  dailyGoal: { type: Number, min: 0, default: 10000 },
  weeklyGoal: { type: Number, min: 0, default: 70000 },
  monthlyGoal: { type: Number, min: 0, default: 300000 },
  // AI Analysis
  aiAnalysis: {
    activityScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    insights: [String],
    trends: [String]
  },
  device: { type: String, default: 'manual' },
  notes: String
}, {
  timestamps: true
});

const BodyMeasurement = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
const Sleep = mongoose.model('Sleep', sleepSchema);
const HeartRate = mongoose.model('HeartRate', heartRateSchema);
const Stress = mongoose.model('Stress', stressSchema);
const Steps = mongoose.model('Steps', stepsSchema);

module.exports = { BodyMeasurement, Sleep, HeartRate, Stress, Steps };
