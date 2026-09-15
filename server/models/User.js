const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  // Personal Information
  personalInfo: {
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    height: {
      value: { type: Number, min: 50, max: 300 }, // in cm
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    },
    weight: {
      value: { type: Number, min: 20, max: 500 }, // in kg
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
      default: 'moderately-active'
    },
    medicalConditions: [{
      name: String,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      notes: String
    }],
    dietaryPreferences: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein']
    }],
    allergies: [String],
    fitnessGoals: [{
      type: String,
      enum: ['weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'general-fitness', 'athletic-performance']
    }],
    targetWeight: {
      value: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    targetDate: Date
  },
  // Gamification
  gamification: {
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: [{
      id: String,
      name: String,
      description: String,
      earnedAt: { type: Date, default: Date.now },
      icon: String
    }],
    achievements: [{
      id: String,
      name: String,
      description: String,
      earnedAt: { type: Date, default: Date.now },
      points: Number
    }],
    totalPoints: { type: Number, default: 0 }
  },
  // Social Features
  social: {
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    privacy: {
      profile: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
      workouts: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
      progress: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' }
    }
  },
  // Preferences
  preferences: {
    units: {
      weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      height: { type: String, enum: ['cm', 'ft'], default: 'cm' },
      distance: { type: String, enum: ['km', 'miles'], default: 'km' },
      temperature: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      workoutReminders: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true },
      socialUpdates: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' }
  },
  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  },
  // AI Personalization
  aiProfile: {
    personality: {
      motivationStyle: { type: String, enum: ['competitive', 'supportive', 'analytical', 'social'], default: 'supportive' },
      communicationStyle: { type: String, enum: ['direct', 'encouraging', 'detailed', 'brief'], default: 'encouraging' },
      challengeLevel: { type: String, enum: ['easy', 'moderate', 'hard', 'extreme'], default: 'moderate' }
    },
    preferences: {
      workoutTypes: [String],
      preferredTimeSlots: [String],
      restDayPreferences: [String]
    },
    learningData: {
      successfulWorkouts: [String],
      failedWorkouts: [String],
      preferredIntensity: String,
      recoveryTime: Number
    }
  },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate BMI
userSchema.methods.calculateBMI = function() {
  if (!this.personalInfo.height?.value || !this.personalInfo.weight?.value) return null;
  
  let heightInM = this.personalInfo.height.value;
  if (this.personalInfo.height.unit === 'ft') {
    heightInM = heightInM * 0.3048; // Convert feet to meters
  } else {
    heightInM = heightInM / 100; // Convert cm to meters
  }
  
  let weightInKg = this.personalInfo.weight.value;
  if (this.personalInfo.weight.unit === 'lbs') {
    weightInKg = weightInKg * 0.453592; // Convert lbs to kg
  }
  
  return (weightInKg / (heightInM * heightInM)).toFixed(1);
};

// Calculate BMR (Basal Metabolic Rate)
userSchema.methods.calculateBMR = function() {
  if (!this.personalInfo.age || !this.personalInfo.weight?.value || !this.personalInfo.height?.value) return null;
  
  let weightInKg = this.personalInfo.weight.value;
  if (this.personalInfo.weight.unit === 'lbs') {
    weightInKg = weightInKg * 0.453592;
  }
  
  let heightInCm = this.personalInfo.height.value;
  if (this.personalInfo.height.unit === 'ft') {
    heightInCm = heightInCm * 30.48;
  }
  
  const age = this.personalInfo.age;
  const gender = this.personalInfo.gender;
  
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age));
  }
};

module.exports = mongoose.model('User', userSchema);
