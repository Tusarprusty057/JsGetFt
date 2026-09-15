import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FireIcon,
  PlusIcon,
  PlayIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  StopIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import QuickWorkoutModal from '../../components/Workouts/QuickWorkoutModal';
import WorkoutTemplatesModal from '../../components/Workouts/WorkoutTemplatesModal';
import toast from 'react-hot-toast';

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('Overview');
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, workoutId: null, workoutName: '' });
  const queryClient = useQueryClient();

  const tabs = ['Overview', 'Templates', 'History'];

  // Fetch workouts with fallback
  const { data: workoutsData, isLoading, error } = useQuery(
    ['workouts', filterType, filterStatus],
    async () => {
      try {
        const params = new URLSearchParams();
        if (filterType !== 'all') params.append('type', filterType);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        
        console.log('Fetching workouts with params:', params.toString());
        const response = await api.get(`/api/workouts?${params}`);
        console.log('Workouts API response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Workouts fetch error:', err);
        // Return empty data for new users
        return {
          success: true,
          workouts: []
        };
      }
    },
    {
      refetchInterval: 30000,
      retry: false,
    }
  );

  // Start workout mutation
  const startWorkoutMutation = useMutation(
    async (workoutId) => {
      const response = await api.post(`/api/workouts/${workoutId}/start`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workouts');
        toast.success('Workout started!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to start workout');
      }
    }
  );

  // Stop workout mutation
  const stopWorkoutMutation = useMutation(
    async ({ workoutId, progressData }) => {
      const response = await api.post(`/api/workouts/${workoutId}/stop`, { progressData });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workouts');
        queryClient.invalidateQueries('progress'); // Also invalidate progress data
        queryClient.invalidateQueries('dashboard'); // And dashboard stats
        toast.success('Workout completed! Progress saved.');
      },
      onError: (error) => {
        console.error('Stop workout error:', error);
        toast.error(error.response?.data?.message || 'Failed to complete workout');
      }
    }
  );

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation(
    async (workoutId) => {
      const response = await api.delete(`/api/workouts/${workoutId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workouts');
        toast.success('Workout deleted!');
      },
      onError: (error) => {
        console.error('Delete workout error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete workout');
      }
    }
  );

  // Fetch progress data for weekly activity
  const { data: progressData } = useQuery(
    'workoutProgress',
    async () => {
      try {
        const response = await api.get('/api/workouts/progress/summary');
        return response.data;
      } catch (error) {
        console.error('Progress fetch error:', error);
        return { weeklyProgress: [] };
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      retry: false,
    }
  );

  // Generate weekly activity data from real progress data
  const weeklyActivityData = React.useMemo(() => {
    if (!progressData?.weeklyProgress || progressData.weeklyProgress.length === 0) {
      // Return empty data structure if no data available
      return [
        { day: 'Mon', activity: 0, workouts: 0, duration: 0 },
        { day: 'Tue', activity: 0, workouts: 0, duration: 0 },
        { day: 'Wed', activity: 0, workouts: 0, duration: 0 },
        { day: 'Thu', activity: 0, workouts: 0, duration: 0 },
        { day: 'Fri', activity: 0, workouts: 0, duration: 0 },
        { day: 'Sat', activity: 0, workouts: 0, duration: 0 },
        { day: 'Sun', activity: 0, workouts: 0, duration: 0 }
      ];
    }

    // Map the progress data to chart format
    return progressData.weeklyProgress.map(day => ({
      day: day.day,
      activity: day.workouts || 0,
      workouts: day.workouts || 0,
      duration: day.duration || 0,
      calories: day.calories || 0
    }));
  }, [progressData]);

  const recentWorkouts = workoutsData?.workouts || [];

  const workoutStats = workoutsData?.stats || {
    thisWeek: { value: 0, label: 'Workouts' },
    totalTime: { value: '0h', label: 'Total Time' },
    calories: { value: '0', label: 'Calories' },
    goalProgress: { value: '0%', label: 'Weekly Target' }
  };

  const workoutTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'planned', label: 'Planned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const filteredWorkouts = workoutsData?.workouts?.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  console.log('Workouts data:', workoutsData);
  console.log('Filtered workouts:', filteredWorkouts);
  console.log('Workouts count:', filteredWorkouts.length);
  
  // Debug individual workout structure
  if (filteredWorkouts.length > 0) {
    console.log('First workout structure:', filteredWorkouts[0]);
    console.log('First workout exercises:', filteredWorkouts[0].exercises);
  }

  const handleStartWorkout = (workoutId) => {
    startWorkoutMutation.mutate(workoutId);
  };

  const handleStopWorkout = (workoutId) => {
    // For now, we'll send basic progress data
    // In a real app, this would come from the workout detail page with actual progress
    const progressData = {
      completedSets: {}, // This would be populated with actual completed sets
      caloriesBurned: null, // This would be calculated or provided by user
      heartRate: null, // This would come from heart rate monitor
      notes: '', // This would be user input
      difficultyRating: null // This would be user rating
    };
    
    stopWorkoutMutation.mutate({ workoutId, progressData });
  };

  const handleDeleteWorkout = (workoutId, workoutName) => {
    setDeleteConfirm({ show: true, workoutId, workoutName });
  };

  const confirmDelete = () => {
    if (deleteConfirm.workoutId) {
      deleteWorkoutMutation.mutate(deleteConfirm.workoutId);
      setDeleteConfirm({ show: false, workoutId: null, workoutName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, workoutId: null, workoutName: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't show error state, use fallback data instead
  // if (error) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-destructive">Error loading workouts</p>
  //       <button 
  //         onClick={() => window.location.reload()} 
  //         className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💪</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workouts</h1>
            <p className="text-muted-foreground">Track your fitness journey and crush your goals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="p-2 border border-input rounded-lg hover:bg-accent transition-colors">
            <FunnelIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-accent/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <>
          {/* Workout Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(workoutStats).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <span className="text-lg">
                  {key === 'thisWeek' ? '🏃‍♂️' : key === 'totalTime' ? '⏰' : key === 'calories' ? '🔥' : '🎯'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{data.label}</p>
                <p className="text-xl font-bold text-foreground">{data.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
            <button className="text-primary hover:text-primary/80 transition-colors">
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-2xl font-bold text-foreground">
              {weeklyActivityData.reduce((total, day) => total + day.activity, 0)} Total Workouts
            </p>
            <p className="text-sm text-muted-foreground">
              {weeklyActivityData.reduce((total, day) => total + day.duration, 0)} minutes this week
            </p>
            <p className="text-sm text-green-500">
              {Math.round((weeklyActivityData.reduce((total, day) => total + day.activity, 0) / 7) * 100)}% Daily Goal Met
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => {
                  if (name === 'activity') {
                    return [
                      `${value} workout${value !== 1 ? 's' : ''}`,
                      'Workouts'
                    ];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `${label}day`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-foreground">{label}day</p>
                        <p className="text-sm text-foreground">
                          {data.workouts} workout{data.workouts !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.duration} minutes
                        </p>
                        {data.calories > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {data.calories} calories burned
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="activity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Workouts</h3>
            <button className="text-primary hover:text-primary/80 transition-colors text-sm">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg border border-border/50"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">💪</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{workout.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {workout.createdAt ? new Date(workout.createdAt).toLocaleDateString() : 'No date'} • 
                    {workout.duration || 0} min • 
                    {workout.exercises?.length || 0} exercises
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">{workout.caloriesBurned || 0} cal</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{workout.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/workouts/create')}
              className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create New Workout</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuickWorkout(true)}
              className="w-full bg-accent text-foreground p-3 rounded-lg hover:bg-accent/80 transition-colors flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Quick Workout</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTemplates(true)}
              className="w-full bg-accent text-foreground p-3 rounded-lg hover:bg-accent/80 transition-colors flex items-center space-x-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>View Templates</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Workouts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Your Workouts</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {workoutTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <FireIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No workouts found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first workout'}
            </p>
            <button
              onClick={() => navigate('/workouts/create')}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkouts.map((workout, index) => (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-accent/50 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all"
              >
                {/* Workout Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground mb-1">
                      {workout.name}
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {workout.type} • {workout.difficulty}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workout.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    workout.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {workout.status}
                  </span>
                </div>

                {/* Workout Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {workout.duration ? `${workout.duration} min` : 'No duration'}
                  </div>
                  <div className="flex items-center">
                    <ChartBarIcon className="w-3 h-3 mr-1" />
                    {workout.caloriesBurned || 0} cal
                  </div>
                  <div className="flex items-center">
                    <FireIcon className="w-3 h-3 mr-1" />
                    {workout.exercises?.length || 0} exercises
                  </div>
                  <div className="flex items-center">
                    <HeartIcon className="w-3 h-3 mr-1" />
                    {workout.performance?.averageIntensity || 0}% intensity
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/workouts/${workout._id}`)}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {workout.status === 'planned' && (
                      <button 
                        onClick={() => handleStartWorkout(workout._id)}
                        disabled={startWorkoutMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <PlayIcon className="w-3 h-3 mr-1" />
                        Start
                      </button>
                    )}
                    
                    {workout.status === 'in-progress' && (
                      <button 
                        onClick={() => handleStopWorkout(workout._id)}
                        disabled={stopWorkoutMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <StopIcon className="w-3 h-3 mr-1" />
                        Stop
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteWorkout(workout._id, workout.name)}
                      disabled={deleteWorkoutMutation.isLoading}
                      className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'Templates' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Workout Templates</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-muted-foreground">Browse workout templates</p>
              <p className="text-sm text-muted-foreground">Find pre-made workout routines for different goals</p>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Workout History</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-muted-foreground">View your workout history</p>
              <p className="text-sm text-muted-foreground">Track your progress and completed workouts</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickWorkoutModal 
        isOpen={showQuickWorkout} 
        onClose={() => setShowQuickWorkout(false)} 
      />
      
      <WorkoutTemplatesModal 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 border border-border max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Workout</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-foreground mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.workoutName}"</strong>? 
              This will permanently remove the workout and all its data.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteWorkoutMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteWorkoutMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkoutsPage;
