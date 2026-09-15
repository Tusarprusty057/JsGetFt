import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { 
  FireIcon, 
  ClockIcon, 
  ChartBarIcon, 
  HeartIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const WorkoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Workout state
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  console.log('WorkoutDetailPage - ID from params:', id);

  const { data: workout, isLoading, error } = useQuery(
    ['workout', id],
    async () => {
      console.log('Fetching workout with ID:', id);
      const response = await api.get(`/api/workouts/${id}`);
      console.log('Workout fetch response:', response.data);
      return response.data.workout;
    },
    {
      enabled: !!id,
      retry: 1
    }
  );

  // Complete workout mutation
  const completeWorkoutMutation = useMutation(
    async (progressData) => {
      console.log('Completing workout with data:', progressData);
      const response = await api.post(`/api/workouts/${id}/stop`, { progressData });
      console.log('Workout completion response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Workout completed successfully:', data);
        queryClient.invalidateQueries(['workout', id]);
        queryClient.invalidateQueries('workouts');
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('progress');
        queryClient.invalidateQueries('nutrition');
        // Show success message
        alert('Workout completed successfully! Your progress has been saved.');
      },
      onError: (error) => {
        console.error('Failed to complete workout:', error);
        alert(`Failed to complete workout: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && workoutStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, workoutStartTime]);

  // Start workout mutation
  const startWorkoutMutation = useMutation(
    async () => {
      const response = await api.post(`/api/workouts/${id}/start`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Workout started successfully:', data);
        queryClient.invalidateQueries(['workout', id]);
      },
      onError: (error) => {
        console.error('Failed to start workout:', error);
        alert(`Failed to start workout: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Start workout
  const startWorkout = () => {
    setIsActive(true);
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    startWorkoutMutation.mutate();
  };

  // Pause workout
  const pauseWorkout = () => {
    setIsActive(false);
  };


  // Complete set
  const completeSet = (exerciseIndex, setIndex) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Next set
  const nextSet = () => {
    if (!workout?.exercises) return;
    
    const currentExercise = workout.exercises[currentExerciseIndex];
    if (currentSetIndex < currentExercise.sets.length - 1) {
      setCurrentSetIndex(prev => prev + 1);
    } else if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else {
      // Workout complete
      completeWorkout();
    }
  };

  // Stop workout (manual stop)
  const stopWorkout = () => {
    completeWorkout();
  };

  // Complete workout
  const completeWorkout = () => {
    setIsActive(false);
    setWorkoutStartTime(null);
    
    // Calculate calories burned (basic estimation)
    const estimatedCalories = Math.round(elapsedTime * 0.1); // 6 calories per minute average
    setCaloriesBurned(estimatedCalories);
    
    // Prepare progress data
    const progressData = {
      completedSets: completedSets,
      caloriesBurned: estimatedCalories,
      notes: workoutNotes,
      difficultyRating: 'intermediate', // Could be made dynamic
      heartRate: {
        average: Math.round(120 + (elapsedTime / 60) * 2), // Simulated heart rate
        maximum: Math.round(140 + (elapsedTime / 60) * 3)
      }
    };
    
    // Send completion data to backend
    completeWorkoutMutation.mutate(progressData);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const getProgress = () => {
    if (!workout?.exercises) return 0;
    const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completed = Object.values(completedSets).filter(Boolean).length;
    return totalSets > 0 ? (completed / totalSets) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Workout Not Found</h2>
        <p className="text-muted-foreground">The workout you're looking for doesn't exist.</p>
        {error && (
          <p className="text-sm text-muted-foreground mt-2">
            Error: {error.response?.data?.message || error.message}
          </p>
        )}
        <button
          onClick={() => navigate('/workouts')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  const currentExercise = workout.exercises?.[currentExerciseIndex];
  const currentSet = currentExercise?.sets?.[currentSetIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{workout.name}</h1>
              <p className="text-muted-foreground capitalize">{workout.type} • {workout.difficulty}</p>
              {workout.description && (
                <p className="text-muted-foreground mt-2">{workout.description}</p>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            workout.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            workout.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            {workout.status}
          </span>
        </div>

        {/* Workout Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Duration</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isActive ? formatTime(elapsedTime) : '00:00'}
            </p>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Progress</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{Math.round(getProgress())}%</p>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-2 mb-2">
              <FireIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Calories</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {caloriesBurned || Math.round(elapsedTime * 0.1)}
            </p>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-2 mb-2">
              <HeartIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Sets</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Object.values(completedSets).filter(Boolean).length} / {workout.exercises?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Workout Controls */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startWorkout}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start Workout</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseWorkout}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <PauseIcon className="w-5 h-5" />
                <span>Pause</span>
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
            </>
          )}
        </div>

        {/* Current Exercise */}
        {isActive && currentExercise && (
          <div className="bg-background rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {currentExercise.name || `Exercise ${currentExerciseIndex + 1}`}
            </h3>
            
            {currentSet && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Set {currentSetIndex + 1} of {currentExercise.sets.length}</p>
                  <div className="text-3xl font-bold text-foreground mt-2">
                    {currentSet.reps} reps
                    {currentSet.weight > 0 && ` × ${currentSet.weight}kg`}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => completeSet(currentExerciseIndex, currentSetIndex)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      completedSets[`${currentExerciseIndex}-${currentSetIndex}`]
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Complete Set</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSet}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <span>Next Set</span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Exercises</h3>
        <div className="space-y-4">
          {workout.exercises?.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">
                  {exercise.name || `Exercise ${exerciseIndex + 1}`}
                </h4>
                {isActive && currentExerciseIndex === exerciseIndex && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    Current
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {exercise.sets?.map((set, setIndex) => {
                  const isCompleted = completedSets[`${exerciseIndex}-${setIndex}`];
                  const isCurrent = isActive && currentExerciseIndex === exerciseIndex && currentSetIndex === setIndex;
                  
                  return (
                    <div
                      key={setIndex}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        isCurrent
                          ? 'border-primary bg-primary/10'
                          : isCompleted
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-border bg-background'
                      }`}
                    >
                      <p className="text-sm text-muted-foreground">Set {setIndex + 1}</p>
                      <p className="font-medium text-foreground">
                        {set.reps} reps
                        {set.weight > 0 && ` × ${set.weight}kg`}
                      </p>
                      {isCompleted && (
                        <CheckIcon className="w-4 h-4 text-green-500 mx-auto mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Notes */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Workout Notes</h3>
        <textarea
          value={workoutNotes}
          onChange={(e) => setWorkoutNotes(e.target.value)}
          placeholder="Add notes about your workout..."
          className="w-full h-24 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
        />
      </div>
    </motion.div>
  );
};

export default WorkoutDetailPage;