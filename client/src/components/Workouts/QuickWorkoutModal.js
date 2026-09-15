import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from 'react-query';
import { 
  XMarkIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  CheckIcon,
  ClockIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QuickWorkoutModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  // Quick workout templates
  const quickWorkouts = [
    {
      id: 'morning-stretch',
      name: 'Morning Stretch',
      duration: 5,
      calories: 25,
      exercises: [
        { name: 'Neck Rolls', duration: 30, description: 'Slow neck rolls clockwise and counterclockwise' },
        { name: 'Shoulder Shrugs', duration: 30, description: 'Lift shoulders up and down' },
        { name: 'Arm Circles', duration: 30, description: 'Forward and backward arm circles' },
        { name: 'Hip Circles', duration: 30, description: 'Gentle hip circles' },
        { name: 'Leg Swings', duration: 30, description: 'Forward and side leg swings' }
      ]
    },
    {
      id: 'desk-break',
      name: 'Desk Break',
      duration: 3,
      calories: 15,
      exercises: [
        { name: 'Seated Spinal Twist', duration: 30, description: 'Twist torso left and right' },
        { name: 'Wrist Stretches', duration: 30, description: 'Stretch wrists up and down' },
        { name: 'Shoulder Rolls', duration: 30, description: 'Roll shoulders forward and back' },
        { name: 'Ankle Circles', duration: 30, description: 'Circle ankles clockwise and counterclockwise' }
      ]
    },
    {
      id: 'energy-boost',
      name: 'Energy Boost',
      duration: 7,
      calories: 40,
      exercises: [
        { name: 'Jumping Jacks', duration: 60, description: 'Classic jumping jacks' },
        { name: 'High Knees', duration: 60, description: 'Run in place with high knees' },
        { name: 'Arm Circles', duration: 30, description: 'Large arm circles' },
        { name: 'Squats', duration: 60, description: 'Bodyweight squats' },
        { name: 'Mountain Climbers', duration: 60, description: 'Alternating leg pulls' }
      ]
    },
    {
      id: 'stress-relief',
      name: 'Stress Relief',
      duration: 10,
      calories: 30,
      exercises: [
        { name: 'Deep Breathing', duration: 60, description: 'Inhale for 4, hold for 4, exhale for 6' },
        { name: 'Neck Stretches', duration: 60, description: 'Gentle neck stretches' },
        { name: 'Shoulder Shrugs', duration: 30, description: 'Lift and release shoulders' },
        { name: 'Wrist Stretches', duration: 30, description: 'Stretch wrists gently' },
        { name: 'Ankle Rolls', duration: 30, description: 'Roll ankles in circles' }
      ]
    },
    {
      id: 'bedtime-wind-down',
      name: 'Bedtime Wind Down',
      duration: 8,
      calories: 20,
      exercises: [
        { name: 'Gentle Stretching', duration: 120, description: 'Full body gentle stretches' },
        { name: 'Deep Breathing', duration: 60, description: 'Slow, deep breathing' },
        { name: 'Progressive Relaxation', duration: 120, description: 'Tense and relax each muscle group' }
      ]
    }
  ];

  // State
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [workoutStartTime, setWorkoutStartTime] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            nextExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Start workout
  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setTimeRemaining(workout.exercises[0].duration);
    setIsActive(true);
    setWorkoutStartTime(Date.now());
    setCompletedExercises(new Set());
  };

  // Next exercise
  const nextExercise = () => {
    if (!selectedWorkout) return;
    
    setCompletedExercises(prev => new Set([...prev, currentExerciseIndex]));
    
    if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimeRemaining(selectedWorkout.exercises[currentExerciseIndex + 1].duration);
    } else {
      completeWorkout();
    }
  };

  // Complete workout
  const completeWorkout = async () => {
    setIsActive(false);
    setTimeRemaining(0);
    
    try {
      // Save quick workout to database
      const workoutData = {
        name: selectedWorkout.name,
        type: 'quick',
        description: `Quick ${selectedWorkout.name.toLowerCase()} workout`,
        duration: selectedWorkout.duration,
        caloriesBurned: selectedWorkout.calories,
        exercises: selectedWorkout.exercises.map((exercise, index) => ({
          name: exercise.name,
          sets: [{
            reps: 1,
            duration: exercise.duration,
            notes: exercise.description
          }],
          notes: exercise.description
        })),
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      await api.post('/api/workouts', workoutData);
      queryClient.invalidateQueries('workouts');
      
      toast.success('Quick workout completed!');
      onClose();
    } catch (error) {
      console.error('Error saving quick workout:', error);
      toast.error('Failed to save workout');
    }
  };

  // Pause workout
  const pauseWorkout = () => {
    setIsActive(false);
  };

  // Resume workout
  const resumeWorkout = () => {
    setIsActive(true);
  };

  // Stop workout
  const stopWorkout = () => {
    setIsActive(false);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setTimeRemaining(0);
    setCompletedExercises(new Set());
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress
  const getProgress = () => {
    if (!selectedWorkout) return 0;
    return ((completedExercises.size + (isActive ? 1 : 0)) / selectedWorkout.exercises.length) * 100;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Quick Workouts</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!selectedWorkout ? (
              /* Workout Selection */
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Choose a quick workout for your daily activities
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickWorkouts.map((workout) => (
                    <motion.div
                      key={workout.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startWorkout(workout)}
                      className="bg-background rounded-lg p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{workout.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <ClockIcon className="w-4 h-4" />
                          <span>{workout.duration} min</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {workout.exercises.length} exercises • {workout.calories} calories
                      </p>
                      <div className="flex items-center space-x-2">
                        <PlayIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary">Start Workout</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Workout */
              <div className="space-y-6">
                {/* Workout Header */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{selectedWorkout.name}</h3>
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FireIcon className="w-4 h-4" />
                      <span>{selectedWorkout.calories} cal</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{Math.round(getProgress())}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>

                {/* Current Exercise */}
                {selectedWorkout.exercises[currentExerciseIndex] && (
                  <div className="bg-background rounded-lg p-6 border border-border text-center">
                    <h4 className="text-xl font-semibold text-foreground mb-2">
                      {selectedWorkout.exercises[currentExerciseIndex].name}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      {selectedWorkout.exercises[currentExerciseIndex].description}
                    </p>
                    <div className="text-4xl font-bold text-primary mb-4">
                      {formatTime(timeRemaining)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Exercise {currentExerciseIndex + 1} of {selectedWorkout.exercises.length}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  {!isActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resumeWorkout}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <PlayIcon className="w-5 h-5" />
                      <span>Resume</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={pauseWorkout}
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <PauseIcon className="w-5 h-5" />
                      <span>Pause</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextExercise}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                    <span>Next Exercise</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopWorkout}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <StopIcon className="w-5 h-5" />
                    <span>Stop</span>
                  </motion.button>
                </div>

                {/* Exercise List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Exercises</h4>
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        index === currentExerciseIndex
                          ? 'border-primary bg-primary/10'
                          : completedExercises.has(index)
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {completedExercises.has(index) ? (
                          <CheckIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                        )}
                        <span className="text-foreground">{exercise.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {exercise.duration}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickWorkoutModal;
