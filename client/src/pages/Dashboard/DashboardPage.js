import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import {
  FireIcon,
  HeartIcon,
  ChartBarIcon,
  TrophyIcon,
  CameraIcon,
  VideoCameraIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      try {
        const [nutritionSummary, workouts, progressData] = await Promise.all([
          api.get('/api/nutrition/summary').catch(() => ({ data: { summary: null } })),
          api.get('/api/workouts?limit=5').catch(() => ({ data: { workouts: [] } })),
          api.get('/api/workouts/progress/summary').catch(() => ({ data: { summary: null, weeklyProgress: [], recentWorkouts: [] } }))
        ]);
        
        const hasData = nutritionSummary.data.summary || 
                       (workouts.data.workouts && workouts.data.workouts.length > 0) || 
                       (progressData.data.summary && progressData.data.summary.totalWorkouts > 0);
        
        return {
          nutrition: nutritionSummary.data.summary,
          workouts: workouts.data.workouts || [],
          progress: progressData.data,
          isNewUser: !hasData
        };
      } catch (error) {
        // Return default empty state for new users
        return {
          nutrition: null,
          workouts: [],
          progress: null,
          isNewUser: true
        };
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Generate real data from dashboard data
  const weeklyStepsData = dashboardData?.progress?.weeklyProgress?.map(day => ({
    day: day.day,
    steps: day.steps || 0,
    goal: 10000
  })) || [
    { day: 'Mon', steps: 0, goal: 10000 },
    { day: 'Tue', steps: 0, goal: 10000 },
    { day: 'Wed', steps: 0, goal: 10000 },
    { day: 'Thu', steps: 0, goal: 10000 },
    { day: 'Fri', steps: 0, goal: 10000 },
    { day: 'Sat', steps: 0, goal: 10000 },
    { day: 'Sun', steps: 0, goal: 10000 }
  ];

  // Generate weekly calories data
  const weeklyCaloriesData = dashboardData?.progress?.weeklyProgress?.map(day => ({
    day: day.day,
    calories: day.calories || 0,
    goal: 500
  })) || [
    { day: 'Mon', calories: 0, goal: 500 },
    { day: 'Tue', calories: 0, goal: 500 },
    { day: 'Wed', calories: 0, goal: 500 },
    { day: 'Thu', calories: 0, goal: 500 },
    { day: 'Fri', calories: 0, goal: 500 },
    { day: 'Sat', calories: 0, goal: 500 },
    { day: 'Sun', calories: 0, goal: 500 }
  ];

  const caloriesData = dashboardData?.progress?.caloriesTimeline || [
    { time: '06:00', consumed: 0, burned: 0 },
    { time: '09:00', consumed: 0, burned: 0 },
    { time: '12:00', consumed: 0, burned: 0 },
    { time: '15:00', consumed: 0, burned: 0 },
    { time: '18:00', consumed: 0, burned: 0 },
    { time: '21:00', consumed: 0, burned: 0 }
  ];

  const workoutTypesData = dashboardData?.progress?.workoutTypes || [
    { name: 'Cardio', value: 0, color: '#3B82F6' },
    { name: 'Strength', value: 0, color: '#1E40AF' },
    { name: 'Flexibility', value: 0, color: '#60A5FA' },
    { name: 'Sports', value: 0, color: '#93C5FD' }
  ];

  const todaySchedule = dashboardData?.progress?.todaySchedule || [];

  const achievements = dashboardData?.progress?.achievements || [];

  const recentWorkouts = dashboardData?.progress?.recentWorkouts || dashboardData?.workouts || [];

  const stats = [
    {
      name: 'Steps',
      value: dashboardData?.isNewUser ? '0' : (dashboardData?.progress?.dailySteps?.current?.toLocaleString() || '0'),
      goal: '10,000',
      icon: '👟',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Calories Burned',
      value: dashboardData?.isNewUser ? '0' : (dashboardData?.progress?.summary?.totalCalories?.toLocaleString() || '0'),
      goal: '500',
      icon: '🔥',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      name: 'Calories Consumed',
      value: dashboardData?.isNewUser ? '0' : (dashboardData?.nutrition?.totals?.calories?.toLocaleString() || '0'),
      goal: '2,200',
      icon: '🍎',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      name: 'Water',
      value: dashboardData?.isNewUser ? '0L' : (`${dashboardData?.nutrition?.totals?.water || 0}L`),
      goal: '2.5L',
      icon: '💧',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      name: 'Sleep',
      value: dashboardData?.isNewUser ? '0h' : (`${dashboardData?.progress?.sleep?.hours || 0}h`),
      goal: '8h',
      icon: '😴',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      name: 'Workouts',
      value: dashboardData?.isNewUser ? '0' : (dashboardData?.progress?.summary?.totalWorkouts || '0'),
      goal: '5',
      icon: '💪',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      name: 'Streak',
      value: dashboardData?.isNewUser ? '0d' : (`${user?.gamification?.streak || 0}d`),
      goal: '-',
      icon: '⚡',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {dashboardData?.isNewUser ? (
                <>Welcome to FitTribe, {user?.name || 'Champion'}! 🚀</>
              ) : (
                <>Welcome back, {user?.name || 'Alex'}! 💪</>
              )}
            </h1>
            <p className="text-muted-foreground">
              {dashboardData?.isNewUser ? (
                <>Let's start your fitness journey! Track your first workout or meal to begin.</>
              ) : (
                <>Ready to crush your fitness goals today?</>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  showFilters ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
                }`}
              >
                Filter
              </motion.button>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 text-sm bg-accent rounded-lg hover:bg-accent/80 transition-colors border-none outline-none cursor-pointer"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="This Year">This Year</option>
              </select>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Export functionality
                  const dataStr = JSON.stringify(dashboardData, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `fittracker-data-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="px-3 py-1 text-sm bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                Export Data
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/workouts/create')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Log Workout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Activity Type:</label>
              <select className="px-2 py-1 text-sm bg-background border border-input rounded-md">
                <option>All Activities</option>
                <option>Workouts</option>
                <option>Cardio</option>
                <option>Strength</option>
                <option>Flexibility</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Goal Status:</label>
              <select className="px-2 py-1 text-sm bg-background border border-input rounded-md">
                <option>All Goals</option>
                <option>Achieved</option>
                <option>In Progress</option>
                <option>Not Started</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Date Range:</label>
              <input 
                type="date" 
                className="px-2 py-1 text-sm bg-background border border-input rounded-md"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input 
                type="date" 
                className="px-2 py-1 text-sm bg-background border border-input rounded-md"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(false)}
              className="ml-auto px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Getting Started Section for New Users */}
      {dashboardData?.isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-green-500/20"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">🚀 Get Started with FitTribe</h2>
            <p className="text-muted-foreground mb-6">
              Complete these quick steps to set up your fitness journey and start tracking your progress!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-card/50 rounded-lg p-4 border border-border/50 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <div className="text-2xl mb-2">👤</div>
                <h3 className="font-semibold text-foreground mb-1">Setup Profile</h3>
                <p className="text-sm text-muted-foreground">Add your goals, preferences, and personal info</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-card/50 rounded-lg p-4 border border-border/50 cursor-pointer"
                onClick={() => navigate('/nutrition')}
              >
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-foreground mb-1">Log First Meal</h3>
                <p className="text-sm text-muted-foreground">Start tracking your nutrition and meals</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-card/50 rounded-lg p-4 border border-border/50 cursor-pointer"
                onClick={() => navigate('/workouts/create')}
              >
                <div className="text-2xl mb-2">💪</div>
                <h3 className="font-semibold text-foreground mb-1">Start Workout</h3>
                <p className="text-sm text-muted-foreground">Create your first workout and track your progress</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-xl p-4 border border-border hover:border-primary/20 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">{stat.name}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">Goal: {stat.goal}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Steps Progress */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weekly Steps Progress</h3>
            <button className="text-primary hover:text-primary/80 transition-colors">
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-2xl font-bold text-foreground">
              {weeklyStepsData.reduce((total, day) => total + day.steps, 0).toLocaleString()} Total Steps
            </p>
            <p className="text-sm text-green-500">
              {Math.round((weeklyStepsData.reduce((total, day) => total + day.steps, 0) / 70000) * 100)}% Goal Met
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyStepsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>



        {/* Calories Today */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Calories Today</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-foreground">
              {dashboardData?.nutrition?.totals?.calories || 0}
            </p>
            <p className="text-sm text-red-500">
              {((dashboardData?.nutrition?.totals?.calories || 0) - 2200) < 0 ? 
                `-${Math.abs((dashboardData?.nutrition?.totals?.calories || 0) - 2200)}` : 
                `+${(dashboardData?.nutrition?.totals?.calories || 0) - 2200}`
              }
            </p>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consumed</span>
              <span className="text-foreground">{dashboardData?.nutrition?.totals?.calories || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Burned</span>
              <span className="text-foreground">{dashboardData?.progress?.summary?.totalCalories || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net</span>
              <span className="text-foreground">
                {(dashboardData?.nutrition?.totals?.calories || 0) - (dashboardData?.progress?.summary?.totalCalories || 0)}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="consumed" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="burned" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Calories */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Weekly Calories Burned</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-2xl font-bold text-foreground">
              {weeklyCaloriesData.reduce((total, day) => total + day.calories, 0)} Total Calories
            </p>
            <p className="text-sm text-red-500">
              {Math.round((weeklyCaloriesData.reduce((total, day) => total + day.calories, 0) / 3500) * 100)}% Goal Met
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyCaloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="calories" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Workouts</h3>
            <button className="text-primary hover:text-primary/80 transition-colors text-sm">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">💪</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{workout.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.duration || 0} min • {workout.caloriesBurned || 0} cal
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {workout.type || 'workout'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {workout.createdAt ? new Date(workout.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💪</div>
                <p className="text-sm text-muted-foreground">No workouts yet</p>
                <p className="text-xs text-muted-foreground">Start your first workout to see it here</p>
              </div>
            )}
          </div>
      </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
            <button className="text-primary hover:text-primary/80 transition-colors text-sm">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {achievements.length > 0 ? (
              achievements.map((achievement, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-accent/50 rounded-lg">
                  <span className="text-2xl mb-2">{achievement.icon || '🏆'}</span>
                  <span className="text-sm font-medium text-foreground text-center">{achievement.name}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm text-muted-foreground">No achievements yet</p>
                <p className="text-xs text-muted-foreground">Complete workouts to earn achievements</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Workout Types */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Workout Types</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={workoutTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workoutTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {workoutTypesData.map((type, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-foreground">{type.name}</span>
                <span className="text-sm text-muted-foreground">({type.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

    </div>
    </motion.div>
  );
};

export default DashboardPage;
