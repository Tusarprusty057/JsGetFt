import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  XMarkIcon, 
  PlayIcon, 
  ClockIcon, 
  FireIcon, 
  UserGroupIcon,
  StarIcon,
  HeartIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const WorkoutTemplatesModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Create workout from template
  const createWorkoutMutation = useMutation(
    async (templateId) => {
      console.log('Mutation: Creating workout from template ID:', templateId);
      // Use mock templates directly since we're not using the API data
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) {
        console.error('Template not found for ID:', templateId);
        throw new Error('Template not found');
      }

      const workoutData = {
        name: `My ${template.name}`,
        type: template.type,
        description: template.description,
        duration: template.duration,
        difficulty: template.difficulty,
        exercises: template.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets || 3,
          reps: exercise.reps || 10,
          weight: exercise.weight || 0,
          duration: exercise.duration || 0,
          restTime: 60
        })),
        status: 'planned'
      };

      console.log('Sending workout data:', workoutData);
      const response = await api.post('/api/workouts', workoutData);
      console.log('API response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('workouts');
        toast.success('Workout created from template!');
        onClose();
      },
      onError: (error) => {
        console.error('Template creation error:', error);
        toast.error(`Failed to create workout: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'strength', name: 'Strength' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'hiit', name: 'HIIT' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'flexibility', name: 'Flexibility' }
  ];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.type === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateWorkout = (templateId) => {
    console.log('Creating workout from template:', templateId);
    const template = mockTemplates.find(t => t.id === templateId);
    console.log('Found template:', template);
    createWorkoutMutation.mutate(templateId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Workout Templates</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground border border-input hover:bg-accent'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-background rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {/* Template Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-muted-foreground">{template.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    
                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{template.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FireIcon className="w-4 h-4" />
                        <span>{template.calories} cal</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{template.users.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        template.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{template.type}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCreateWorkout(template.id)}
                        disabled={createWorkoutMutation.isLoading}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Create Workout</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 border border-input rounded-lg hover:bg-accent transition-colors"
                      >
                        <HeartIcon className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Exercise Preview */}
                  <div className="px-4 pb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Exercises ({template.exercises.length})</h4>
                    <div className="space-y-1">
                      {template.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` × ${exercise.weight}kg`}
                          </span>
                        </div>
                      ))}
                      {template.exercises.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{template.exercises.length - 3} more exercises
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkoutTemplatesModal;
