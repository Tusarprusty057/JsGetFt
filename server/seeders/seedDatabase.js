const mongoose = require('mongoose');
const { Exercise } = require('../models/Workout');
const { Badge, Achievement } = require('../models/Progress');
require('dotenv').config();

// Sample exercises data
const sampleExercises = [
  {
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep core tight and body straight'
    ],
    tips: [
      'Keep your core engaged throughout the movement',
      'Don\'t let your hips sag or pike up',
      'Breathe out on the way up, in on the way down'
    ],
    isCustom: false
  },
  {
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Return to standing position'
    ],
    tips: [
      'Keep your weight on your heels',
      'Don\'t let your knees cave inward',
      'Go as low as comfortable'
    ],
    isCustom: false
  },
  {
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a push-up position',
      'Lower to your forearms',
      'Keep your body in a straight line',
      'Hold the position'
    ],
    tips: [
      'Keep your core tight',
      'Don\'t let your hips sag',
      'Breathe normally'
    ],
    isCustom: false
  },
  {
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full-body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing',
      'Drop into a squat and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up',
      'Jump feet back to squat',
      'Jump up with arms overhead'
    ],
    tips: [
      'Keep your core engaged',
      'Land softly on your feet',
      'Maintain good form over speed'
    ],
    isCustom: false
  },
  {
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['core', 'shoulders', 'legs'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start in plank position',
      'Bring right knee to chest',
      'Quickly switch legs',
      'Continue alternating legs rapidly'
    ],
    tips: [
      'Keep your core tight',
      'Maintain plank position',
      'Breathe steadily'
    ],
    isCustom: false
  }
];

// Sample badges data
const sampleBadges = [
  {
    name: 'First Workout',
    description: 'Completed your first workout',
    icon: '🏋️',
    category: 'fitness',
    rarity: 'common',
    requirements: {
      type: 'single',
      value: 1,
      unit: 'workout'
    },
    points: 10
  },
  {
    name: '7-Day Streak',
    description: 'Worked out for 7 consecutive days',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    requirements: {
      type: 'streak',
      value: 7,
      unit: 'days'
    },
    points: 50
  },
  {
    name: 'Nutrition Master',
    description: 'Logged 30 meals',
    icon: '🥗',
    category: 'nutrition',
    rarity: 'rare',
    requirements: {
      type: 'total',
      value: 30,
      unit: 'meals'
    },
    points: 100
  },
  {
    name: 'Social Butterfly',
    description: 'Connected with 10 friends',
    icon: '👥',
    category: 'social',
    rarity: 'uncommon',
    requirements: {
      type: 'total',
      value: 10,
      unit: 'friends'
    },
    points: 75
  }
];

// Sample achievements data
const sampleAchievements = [
  {
    name: 'Goal Crusher',
    description: 'Completed 5 fitness goals',
    icon: '🎯',
    category: 'milestone',
    requirements: {
      type: 'total',
      value: 5,
      unit: 'goals'
    },
    points: 200
  },
  {
    name: 'Consistency King',
    description: 'Worked out for 30 days in a month',
    icon: '👑',
    category: 'personal',
    requirements: {
      type: 'time-based',
      value: 30,
      unit: 'days',
      timeLimit: 30
    },
    points: 500
  },
  {
    name: 'AI Explorer',
    description: 'Used AI features 50 times',
    icon: '🤖',
    category: 'personal',
    requirements: {
      type: 'total',
      value: 50,
      unit: 'ai_uses'
    },
    points: 300
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Exercise.deleteMany({});
    await Badge.deleteMany({});
    await Achievement.deleteMany({});

    // Insert sample data
    await Exercise.insertMany(sampleExercises);
    console.log('✅ Sample exercises inserted');

    await Badge.insertMany(sampleBadges);
    console.log('✅ Sample badges inserted');

    await Achievement.insertMany(sampleAchievements);
    console.log('✅ Sample achievements inserted');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
