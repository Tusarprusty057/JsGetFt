const express = require('express');
const { Workout, Exercise } = require('../models/Workout');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get user workouts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, isTemplate } = req.query;
    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (isTemplate !== undefined) filter.isTemplate = isTemplate === 'true';

    const workouts = await Workout.find(filter)
      .populate('exercises.exercise')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Workout.countDocuments(filter);

    console.log('Returning workouts:', workouts.length, 'total:', total);
    res.json({
      success: true,
      workouts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching workout:', req.params.id, 'for user:', req.user.id);
    
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('exercises.exercise');

    console.log('Found workout:', workout ? 'Yes' : 'No');

    if (!workout) {
      console.log('Workout not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    console.log('Returning workout:', workout.name);
    res.json({
      success: true,
      workout
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received workout creation request:', req.body);
    const { name, type, exercises, description, duration, difficulty } = req.body;

    // Validate required fields
    if (!name || !type) {
      console.log('Validation failed: missing name or type');
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }

    // Create workout data
    const workoutData = {
      user: req.user.id,
      name,
      type,
      description: description || '',
      duration: duration || 0,
      difficulty: difficulty || 'beginner',
      exercises: [],
      status: 'planned'
    };

    // Process exercises if provided
    if (exercises && Array.isArray(exercises)) {
      workoutData.exercises = exercises.map((exercise, index) => ({
        exercise: null, // We'll handle this differently for now
        name: exercise.name,
        sets: exercise.sets || [],
        notes: exercise.notes || '',
        order: exercise.order || index
      }));
    }

    // Create workout
    console.log('Creating workout with data:', workoutData);
    const workout = new Workout(workoutData);
    await workout.save();
    console.log('Workout saved successfully:', workout._id);
    
    // Verify workout was saved
    const savedWorkout = await Workout.findById(workout._id);
    console.log('Verified saved workout:', savedWorkout ? 'Found' : 'Not found');

    // Calculate totals and estimated duration
    workout.performance = {
      totalVolume: workout.calculateTotalVolume(),
      averageIntensity: workout.calculateAverageIntensity()
    };
    
    // Update duration with calculated estimate if not provided
    if (!workout.duration || workout.duration === 0) {
      workout.duration = workout.calculateEstimatedDuration();
    }
    
    await workout.save();
    console.log('Workout performance calculated and saved');

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      workout: {
        _id: workout._id,
        name: workout.name,
        type: workout.type,
        description: workout.description,
        duration: workout.duration,
        difficulty: workout.difficulty,
        exercises: workout.exercises,
        performance: workout.performance,
        status: workout.status,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt
      }
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    Object.assign(workout, req.body);
    
    // Recalculate totals
    workout.totalVolume = workout.calculateTotalVolume();
    workout.performance.averageIntensity = workout.calculateAverageIntensity();
    
    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('exercises.exercise');

    res.json({
      success: true,
      message: 'Workout updated successfully',
      workout: populatedWorkout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/workouts/:id/stop
// @desc    Stop workout and save progress
// @access  Private
router.post('/:id/stop', auth, async (req, res) => {
  try {
    const { progressData } = req.body; // Receive progress data from frontend
    
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update workout status to completed
    workout.status = 'completed';
    workout.completedAt = new Date();
    
    // Calculate actual duration
    const startTime = new Date(workout.startedAt);
    const endTime = new Date();
    workout.duration = Math.round((endTime - startTime) / 60000); // in minutes

    // Store progress data if provided
    if (progressData) {
      // Update completed sets and reps
      if (progressData.completedSets) {
        workout.exercises.forEach((exercise, exerciseIndex) => {
          if (progressData.completedSets[exerciseIndex]) {
            exercise.sets.forEach((set, setIndex) => {
              if (progressData.completedSets[exerciseIndex][setIndex]) {
                set.completed = true;
                set.completedAt = new Date();
                // Store actual reps and weight if different from planned
                if (progressData.completedSets[exerciseIndex][setIndex].actualReps) {
                  set.actualReps = progressData.completedSets[exerciseIndex][setIndex].actualReps;
                }
                if (progressData.completedSets[exerciseIndex][setIndex].actualWeight) {
                  set.actualWeight = progressData.completedSets[exerciseIndex][setIndex].actualWeight;
                }
              }
            });
          }
        });
      }

      // Store calories burned if provided
      if (progressData.caloriesBurned) {
        workout.caloriesBurned = progressData.caloriesBurned;
      }

      // Store heart rate data if provided
      if (progressData.heartRate) {
        workout.performance.avgHeartRate = progressData.heartRate.average;
        workout.performance.maxHeartRate = progressData.heartRate.maximum;
      }

      // Store notes if provided
      if (progressData.notes) {
        workout.notes = progressData.notes;
      }

      // Store difficulty rating if provided
      if (progressData.difficultyRating) {
        workout.actualDifficulty = progressData.difficultyRating;
      }
    }

    // Calculate and store total progress metrics
    let totalSetsCompleted = 0;
    let totalRepsCompleted = 0;
    let totalWeightLifted = 0;

    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          totalSetsCompleted++;
          const actualReps = set.actualReps || set.reps;
          const actualWeight = set.actualWeight || set.weight || 0;
          totalRepsCompleted += actualReps;
          totalWeightLifted += (actualReps * actualWeight);
        }
      });
    });

    workout.totalSetsCompleted = totalSetsCompleted;
    workout.totalRepsCompleted = totalRepsCompleted;
    workout.totalWeightLifted = totalWeightLifted;

    // Recalculate performance metrics
    workout.performance.totalVolume = workout.calculateTotalVolume();
    workout.performance.averageIntensity = workout.calculateAverageIntensity();
    
    // Calculate calories burned if not provided (basic estimation)
    if (!workout.caloriesBurned) {
      // Basic calorie estimation: 5-10 calories per minute based on intensity
      const baseCalories = workout.duration * 7; // 7 calories per minute average
      const intensityMultiplier = workout.performance.averageIntensity / 100;
      workout.caloriesBurned = Math.round(baseCalories * (0.5 + intensityMultiplier));
    }

    await workout.save();

    console.log('Workout completed with progress data:', {
      workoutId: workout._id,
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned,
      totalVolume: workout.performance.totalVolume,
      averageIntensity: workout.performance.averageIntensity
    });

    res.json({
      success: true,
      message: 'Workout completed successfully',
      workout: workout
    });
  } catch (error) {
    console.error('Stop workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/workouts/progress/summary
// @desc    Get workout progress summary
// @access  Private
router.get('/progress/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get completed workouts for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedWorkouts = await Workout.find({
      user: userId,
      status: 'completed',
      completedAt: { $gte: thirtyDaysAgo }
    }).sort({ completedAt: -1 });

    // Calculate summary statistics
    const totalWorkouts = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
    const totalCalories = completedWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
    const totalSets = completedWorkouts.reduce((sum, workout) => sum + (workout.totalSetsCompleted || 0), 0);
    const totalReps = completedWorkouts.reduce((sum, workout) => sum + (workout.totalRepsCompleted || 0), 0);
    const totalWeight = completedWorkouts.reduce((sum, workout) => sum + (workout.totalWeightLifted || 0), 0);

    // Calculate weekly progress
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayWorkouts = completedWorkouts.filter(workout => 
        workout.completedAt >= date && workout.completedAt < nextDate
      );
      
      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: dayWorkouts.length,
        duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        calories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        sets: dayWorkouts.reduce((sum, w) => sum + (w.totalSetsCompleted || 0), 0),
        steps: 0 // Placeholder for steps data
      });
    }

    // Calculate monthly progress
    const monthlyProgress = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      const monthWorkouts = completedWorkouts.filter(workout => 
        workout.completedAt >= date && workout.completedAt < nextDate
      );
      
      monthlyProgress.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        workouts: monthWorkouts.length,
        duration: monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        calories: monthWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        sets: monthWorkouts.reduce((sum, w) => sum + (w.totalSetsCompleted || 0), 0)
      });
    }

    // Generate calories timeline for today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayWorkouts = completedWorkouts.filter(workout => 
      workout.completedAt >= startOfDay && workout.completedAt <= endOfDay
    );
    
    // Create hourly timeline for today
    const caloriesTimeline = [];
    for (let hour = 6; hour <= 21; hour += 3) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(hour + 3, 0, 0, 0);
      
      const hourWorkouts = todayWorkouts.filter(workout => 
        workout.completedAt >= hourStart && workout.completedAt < hourEnd
      );
      
      const burned = hourWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
      
      caloriesTimeline.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        consumed: 0, // This would come from nutrition data
        burned: burned
      });
    }

    // Generate workout types data
    const workoutTypes = {};
    completedWorkouts.forEach(workout => {
      workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
    });
    
    const workoutTypesData = Object.entries(workoutTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: type === 'strength' ? '#3B82F6' : 
             type === 'cardio' ? '#1E40AF' : 
             type === 'hiit' ? '#60A5FA' : '#93C5FD'
    }));

    res.json({
      success: true,
      summary: {
        totalWorkouts,
        totalDuration,
        totalCalories,
        totalSets,
        totalReps,
        totalWeight,
        averageWorkoutDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
        averageCaloriesPerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0
      },
      weeklyProgress,
      monthlyProgress,
      caloriesTimeline,
      workoutTypes: workoutTypesData,
      recentWorkouts: completedWorkouts.slice(0, 5).map(workout => ({
        _id: workout._id,
        name: workout.name,
        type: workout.type,
        completedAt: workout.completedAt,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        totalSetsCompleted: workout.totalSetsCompleted,
        performance: workout.performance
      }))
    });
  } catch (error) {
    console.error('Progress summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/workouts/:id/start
// @desc    Start workout
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.status = 'in-progress';
    workout.startedAt = new Date();
    await workout.save();

    res.json({
      success: true,
      message: 'Workout started',
      workout
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/workouts/:id/complete
// @desc    Complete workout
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.status = 'completed';
    workout.completedAt = new Date();
    
    // Calculate duration
    if (workout.startedAt) {
      workout.duration = Math.round((workout.completedAt - workout.startedAt) / 60000); // in minutes
    }

    // Recalculate totals
    workout.totalVolume = workout.calculateTotalVolume();
    workout.performance.averageIntensity = workout.calculateAverageIntensity();

    await workout.save();

    res.json({
      success: true,
      message: 'Workout completed',
      workout
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/workouts/exercises
// @desc    Get exercises
// @access  Private
router.get('/exercises', auth, async (req, res) => {
  try {
    const { category, difficulty, equipment, search } = req.query;
    
    // Mock exercises database
    const mockExercises = [
      // Strength exercises
      { name: 'Push-ups', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull-ups', category: 'strength', difficulty: 'intermediate', equipment: 'pull-up bar', muscleGroups: ['back', 'biceps'] },
      { name: 'Squats', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['quadriceps', 'glutes'] },
      { name: 'Deadlifts', category: 'strength', difficulty: 'advanced', equipment: 'barbell', muscleGroups: ['hamstrings', 'glutes', 'back'] },
      { name: 'Bench Press', category: 'strength', difficulty: 'intermediate', equipment: 'barbell', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Overhead Press', category: 'strength', difficulty: 'intermediate', equipment: 'barbell', muscleGroups: ['shoulders', 'triceps'] },
      { name: 'Lunges', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['quadriceps', 'glutes'] },
      { name: 'Plank', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['core'] },
      { name: 'Dips', category: 'strength', difficulty: 'intermediate', equipment: 'dip bars', muscleGroups: ['chest', 'triceps'] },
      { name: 'Bicep Curls', category: 'strength', difficulty: 'beginner', equipment: 'dumbbells', muscleGroups: ['biceps'] },
      
      // Cardio exercises
      { name: 'Running', category: 'cardio', difficulty: 'beginner', equipment: 'none', muscleGroups: ['legs', 'core'] },
      { name: 'Cycling', category: 'cardio', difficulty: 'beginner', equipment: 'bike', muscleGroups: ['legs'] },
      { name: 'Jumping Jacks', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['full body'] },
      { name: 'Burpees', category: 'cardio', difficulty: 'intermediate', equipment: 'bodyweight', muscleGroups: ['full body'] },
      { name: 'Mountain Climbers', category: 'cardio', difficulty: 'intermediate', equipment: 'bodyweight', muscleGroups: ['core', 'legs'] },
      { name: 'High Knees', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', muscleGroups: ['legs', 'core'] },
      
      // Flexibility exercises
      { name: 'Yoga Flow', category: 'flexibility', difficulty: 'beginner', equipment: 'yoga mat', muscleGroups: ['full body'] },
      { name: 'Stretching', category: 'flexibility', difficulty: 'beginner', equipment: 'none', muscleGroups: ['full body'] },
      { name: 'Pilates', category: 'flexibility', difficulty: 'intermediate', equipment: 'mat', muscleGroups: ['core', 'full body'] },
      
      // Sports
      { name: 'Basketball', category: 'sports', difficulty: 'intermediate', equipment: 'basketball', muscleGroups: ['full body'] },
      { name: 'Tennis', category: 'sports', difficulty: 'intermediate', equipment: 'tennis racket', muscleGroups: ['arms', 'legs'] },
      { name: 'Swimming', category: 'sports', difficulty: 'beginner', equipment: 'pool', muscleGroups: ['full body'] }
    ];

    let filteredExercises = mockExercises;

    if (category) {
      filteredExercises = filteredExercises.filter(ex => ex.category === category);
    }
    if (difficulty) {
      filteredExercises = filteredExercises.filter(ex => ex.difficulty === difficulty);
    }
    if (equipment) {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === equipment);
    }
    if (search) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      exercises: filteredExercises
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/workouts/exercises
// @desc    Create custom exercise
// @access  Private
router.post('/exercises', auth, async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      isCustom: true,
      createdBy: req.user.id
    };

    const exercise = new Exercise(exerciseData);
    await exercise.save();

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/workouts/templates
// @desc    Get workout templates
// @access  Private
router.get('/templates', auth, async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    // Mock workout templates
    const mockTemplates = [
      {
        id: 'beginner-full-body',
        name: 'Beginner Full Body',
        description: 'Perfect for beginners - covers all major muscle groups',
        type: 'strength',
        difficulty: 'beginner',
        duration: 45,
        calories: 250,
        exercises: [
          { name: 'Bodyweight Squats', sets: 3, reps: 12, weight: 0 },
          { name: 'Push-ups', sets: 3, reps: 8, weight: 0 },
          { name: 'Lunges', sets: 3, reps: 10, weight: 0 },
          { name: 'Plank', sets: 3, reps: 1, duration: 30 },
          { name: 'Glute Bridges', sets: 3, reps: 15, weight: 0 }
        ],
        rating: 4.5,
        users: 1250,
        tags: ['beginner', 'full-body', 'no-equipment']
      },
      {
        id: 'hiit-cardio',
        name: 'HIIT Cardio Blast',
        description: 'High-intensity interval training for maximum calorie burn',
        type: 'hiit',
        difficulty: 'intermediate',
        duration: 20,
        calories: 300,
        exercises: [
          { name: 'Burpees', sets: 4, reps: 8, duration: 30 },
          { name: 'Mountain Climbers', sets: 4, reps: 1, duration: 30 },
          { name: 'Jump Squats', sets: 4, reps: 12, duration: 30 },
          { name: 'High Knees', sets: 4, reps: 1, duration: 30 },
          { name: 'Jumping Jacks', sets: 4, reps: 1, duration: 30 }
        ],
        rating: 4.7,
        users: 2100,
        tags: ['hiit', 'cardio', 'fat-burn']
      },
      {
        id: 'upper-body-strength',
        name: 'Upper Body Strength',
        description: 'Build upper body strength with compound movements',
        type: 'strength',
        difficulty: 'intermediate',
        duration: 60,
        calories: 400,
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
          { name: 'Pull-ups', sets: 4, reps: 6, weight: 0 },
          { name: 'Overhead Press', sets: 3, reps: 10, weight: 40 },
          { name: 'Bent-over Rows', sets: 3, reps: 10, weight: 50 },
          { name: 'Dips', sets: 3, reps: 12, weight: 0 }
        ],
        rating: 4.6,
        users: 1800,
        tags: ['strength', 'upper-body', 'gym']
      },
      {
        id: 'yoga-flow',
        name: 'Morning Yoga Flow',
        description: 'Gentle yoga sequence to start your day',
        type: 'yoga',
        difficulty: 'beginner',
        duration: 30,
        calories: 120,
        exercises: [
          { name: 'Sun Salutation A', sets: 3, reps: 1, duration: 300 },
          { name: 'Warrior Poses', sets: 2, reps: 1, duration: 180 },
          { name: 'Tree Pose', sets: 2, reps: 1, duration: 120 },
          { name: 'Child\'s Pose', sets: 1, reps: 1, duration: 180 },
          { name: 'Savasana', sets: 1, reps: 1, duration: 300 }
        ],
        rating: 4.8,
        users: 3200,
        tags: ['yoga', 'flexibility', 'morning']
      },
      {
        id: 'core-blast',
        name: 'Core Blast',
        description: 'Intense core workout for strong abs',
        type: 'strength',
        difficulty: 'intermediate',
        duration: 25,
        calories: 200,
        exercises: [
          { name: 'Crunches', sets: 3, reps: 20, weight: 0 },
          { name: 'Russian Twists', sets: 3, reps: 20, weight: 0 },
          { name: 'Plank', sets: 3, reps: 1, duration: 60 },
          { name: 'Mountain Climbers', sets: 3, reps: 1, duration: 45 },
          { name: 'Bicycle Crunches', sets: 3, reps: 20, weight: 0 }
        ],
        rating: 4.4,
        users: 1500,
        tags: ['core', 'abs', 'strength']
      },
      {
        id: 'leg-day',
        name: 'Leg Day Destroyer',
        description: 'Complete leg workout for maximum muscle growth',
        type: 'strength',
        difficulty: 'advanced',
        duration: 75,
        calories: 500,
        exercises: [
          { name: 'Squats', sets: 4, reps: 12, weight: 80 },
          { name: 'Deadlifts', sets: 4, reps: 8, weight: 100 },
          { name: 'Lunges', sets: 3, reps: 12, weight: 40 },
          { name: 'Leg Press', sets: 3, reps: 15, weight: 120 },
          { name: 'Calf Raises', sets: 4, reps: 20, weight: 60 }
        ],
        rating: 4.9,
        users: 950,
        tags: ['legs', 'strength', 'advanced']
      }
    ];

    let filteredTemplates = mockTemplates;

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.type === category);
    }
    
    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(template => template.difficulty === difficulty);
    }
    
    if (search) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      templates: filteredTemplates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
