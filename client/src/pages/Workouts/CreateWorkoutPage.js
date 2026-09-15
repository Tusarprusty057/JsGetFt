import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import api from '../../utils/api';
import {
  PlusIcon,
  XMarkIcon,
  PlayIcon,
  ClockIcon,
  FireIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const CreateWorkoutPage = () => {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [exercises, setExercises] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch available exercises
  const { data: availableExercises } = useQuery(
    'exercises',
    async () => {
      const response = await api.get('/api/workouts/exercises');
      return response.data.exercises || [];
    }
  );

  // Create workout mutation
  const createWorkoutMutation = useMutation(
    async (workoutData) => {
      console.log('Sending workout data to API:', workoutData);
      const response = await api.post('/api/workouts', workoutData);
      console.log('API response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Workout created successfully:', data);
        console.log('Workout ID:', data.workout._id);
        console.log('Navigating to:', `/workouts/${data.workout._id}`);
        navigate(`/workouts/${data.workout._id}`);
      },
      onError: (error) => {
        console.error('Failed to create workout:', error);
        console.error('Error response:', error.response?.data);
        alert(`Failed to create workout: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const addExercise = () => {
    const newExercise = {
      id: Date.now(),
      name: '',
      sets: 1,
      reps: 10,
      weight: 0,
      duration: 0,
      restTime: 60
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const calculateEstimatedDuration = () => {
    let totalSeconds = 0;
    
    exercises.forEach(exercise => {
      const numSets = parseInt(exercise.sets) || 0;
      const reps = parseInt(exercise.reps) || 0;
      const restTime = parseInt(exercise.restTime) || 60;
      
      if (numSets === 0) return;
      
      // Calculate time for each set
      for (let i = 0; i < numSets; i++) {
        // Time for performing the set (reps * 3 seconds per rep)
        if (reps > 0) {
          totalSeconds += reps * 3; // 3 seconds per rep
        }
        
        // Add rest time between sets (except for the last set)
        if (i < numSets - 1) {
          totalSeconds += restTime;
        }
      }
      
      // Add rest time between exercises (2 minutes)
      totalSeconds += 120;
    });
    
    // Remove the last 2 minutes (no rest after last exercise)
    totalSeconds = Math.max(0, totalSeconds - 120);
    
    return Math.round(totalSeconds / 60); // Convert to minutes
  };

  const handleCreateWorkout = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    setIsCreating(true);
    
    try {
      const estimatedDuration = calculateEstimatedDuration();
      
      const workoutData = {
        name: workoutName,
        type: workoutType,
        duration: estimatedDuration,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: Array(parseInt(ex.sets) || 1).fill().map((_, index) => ({
            reps: parseInt(ex.reps) || 1,
            weight: parseFloat(ex.weight) || 0,
            duration: parseInt(ex.duration) || 0,
            restTime: parseInt(ex.restTime) || 60,
            completed: false
          })),
          order: exercises.indexOf(ex)
        }))
      };

      console.log('Creating workout with data:', workoutData);
      
      await createWorkoutMutation.mutateAsync(workoutData);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert(`Failed to create workout: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const workoutTypes = [
    { value: 'strength', label: 'Strength Training', icon: '💪' },
    { value: 'cardio', label: 'Cardio', icon: '❤️' },
    { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'other', label: 'Other', icon: '🏃' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-foreground">Create Workout</h1>
          <p className="text-muted-foreground">Design your custom workout routine</p>
      </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/workouts')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Details */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
        {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Workout Details</h2>
            
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                Workout Name
              </label>
              <input
                type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Upper Body Strength"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Workout Type
              </label>
                <div className="grid grid-cols-2 gap-2">
                  {workoutTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setWorkoutType(type.value)}
                      className={`p-3 rounded-lg border transition-colors ${
                        workoutType === type.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:bg-accent'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Workout Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Exercises</span>
                <span className="text-sm font-medium text-foreground">{exercises.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Duration</span>
                <span className="text-sm font-medium text-foreground">
                  {calculateEstimatedDuration()} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sets</span>
                <span className="text-sm font-medium text-foreground">
                  {exercises.reduce((total, ex) => total + parseInt(ex.sets), 0)}
                </span>
            </div>
            </div>
          </div>
        </motion.div>

        {/* Exercises List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={addExercise}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Exercise</span>
              </motion.button>
          </div>

            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No exercises added yet</h3>
                <p className="text-muted-foreground mb-4">Add your first exercise to start building your workout</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addExercise}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add First Exercise</span>
                </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/50 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <input
                        type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="text-lg font-medium text-foreground bg-transparent border-none outline-none placeholder-muted-foreground"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeExercise(exercise.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Sets</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Reps</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Rest (sec)</label>
                      <input
                          type="number"
                          min="0"
                          value={exercise.restTime}
                          onChange={(e) => updateExercise(exercise.id, 'restTime', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                  </motion.div>
              ))}
            </div>
          )}
          </div>
        </motion.div>
        </div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex justify-end space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/workouts')}
          className="px-6 py-3 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
          >
            Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateWorkout}
          disabled={isCreating || !workoutName.trim() || exercises.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Create Workout</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CreateWorkoutPage;