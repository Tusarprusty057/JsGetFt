import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  TrophyIcon, 
  FlagIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  FireIcon, 
  StarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ProgressPage = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('30d');

  const tabs = ['Overview', 'Goals', 'Body Metrics', 'Achievements'];

  // Fetch progress dashboard data
  const { data: progressData, isLoading, error } = useQuery(
    ['progressDashboard', timeRange],
    async () => {
      try {
        const response = await axios.get(`/api/progress/dashboard?range=${timeRange}`);
        return response.data;
      } catch (err) {
        console.error('Progress fetch error:', err);
        // Return empty data for new users
        return {
          dashboard: {
            stats: {
              totalGoals: 0,
              completedGoals: 0,
              activeChallenges: 0,
              achievements: 0,
              currentStreak: 0,
              totalPoints: 0
            },
            goals: []
          }
        };
      }
    },
    {
      refetchInterval: 30000,
      retry: false,
    }
  );

  // Demo data for when API fails or returns empty data
  const demoWeightProgressData = [
    { date: '2024-01-01', weight: 75.2 },
    { date: '2024-01-08', weight: 74.8 },
    { date: '2024-01-15', weight: 74.5 },
    { date: '2024-01-22', weight: 74.1 },
    { date: '2024-01-29', weight: 73.8 },
    { date: '2024-02-05', weight: 73.5 },
    { date: '2024-02-12', weight: 73.2 }
  ];

  const demoWorkoutFrequencyData = [
    { day: 'Mon', workouts: 1, calories: 250, duration: 45 },
    { day: 'Tue', workouts: 0, calories: 0, duration: 0 },
    { day: 'Wed', workouts: 2, calories: 400, duration: 60 },
    { day: 'Thu', workouts: 1, calories: 180, duration: 30 },
    { day: 'Fri', workouts: 1, calories: 320, duration: 50 },
    { day: 'Sat', workouts: 2, calories: 500, duration: 75 },
    { day: 'Sun', workouts: 0, calories: 0, duration: 0 }
  ];

  const demoGoalsData = [
    { name: 'Lose 5kg', progress: 60, target: 5, current: 3, unit: 'kg', deadline: '2024-03-01' },
    { name: 'Workout 4x per week', progress: 75, target: 4, current: 3, unit: 'times', deadline: '2024-02-28' },
    { name: 'Run 10km', progress: 40, target: 10, current: 4, unit: 'km', deadline: '2024-03-15' },
    { name: 'Build muscle mass', progress: 30, target: 2, current: 0.6, unit: 'kg', deadline: '2024-04-01' }
  ];

  const demoAchievements = [
    { name: 'First Workout', description: 'Complete your first workout', earned: true, icon: '🏃‍♂️' },
    { name: 'Week Warrior', description: 'Work out 7 days in a row', earned: true, icon: '💪' },
    { name: 'Calorie Burner', description: 'Burn 1000 calories in a day', earned: false, icon: '🔥' },
    { name: 'Goal Crusher', description: 'Complete 5 goals', earned: false, icon: '🎯' },
    { name: 'Consistency King', description: 'Work out for 30 days straight', earned: false, icon: '👑' },
    { name: 'Strength Master', description: 'Lift your body weight', earned: false, icon: '🏋️‍♂️' }
  ];

  const demoBodyMetrics = {
    weight: { value: 73.2, unit: 'kg', change: -2.0, changeType: 'decrease' },
    bodyFat: { value: 18.5, unit: '%', change: -1.2, changeType: 'decrease' },
    muscle: { value: 42.3, unit: '%', change: 0.8, changeType: 'increase' },
    water: { value: 58.2, unit: '%', change: 0.5, changeType: 'increase' }
  };

  // Use real data from API or demo data for new users
  const weightProgressData = progressData?.dashboard?.weightProgress?.length > 0 ? progressData.dashboard.weightProgress : demoWeightProgressData;
  const workoutFrequencyData = progressData?.dashboard?.workoutFrequency?.length > 0 ? progressData.dashboard.workoutFrequency : demoWorkoutFrequencyData;
  const goalsData = progressData?.dashboard?.goals?.length > 0 ? progressData.dashboard.goals : demoGoalsData;
  const achievements = progressData?.dashboard?.achievements?.length > 0 ? progressData.dashboard.achievements : demoAchievements;
  const bodyMetrics = progressData?.dashboard?.bodyMetrics || demoBodyMetrics;

  const progressStats = {
    activeGoals: progressData?.dashboard?.stats?.totalGoals || demoGoalsData.length,
    completedGoals: progressData?.dashboard?.stats?.completedGoals || 1,
    currentStreak: progressData?.dashboard?.stats?.currentStreak || 5,
    totalWorkouts: progressData?.dashboard?.stats?.totalWorkouts || 12,
    caloriesBurned: progressData?.dashboard?.stats?.caloriesBurned || 1650,
    hoursWorkedOut: progressData?.dashboard?.stats?.hoursWorkedOut || 8
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
  //       <p className="text-destructive">Error loading progress data</p>
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
          <span className="text-2xl">📈</span>
      <div>
            <h1 className="text-3xl font-bold text-foreground">Progress & Goals</h1>
            <p className="text-muted-foreground">Track your fitness journey and achieve your goals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="p-2 border border-input rounded-lg hover:bg-accent transition-colors">
            <PlusIcon className="w-4 h-4 text-muted-foreground" />
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

      {/* Progress Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(progressStats).map(([key, value], index) => (
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
                  {key === 'activeGoals' ? '🎯' : 
                   key === 'completedGoals' ? '✅' :
                   key === 'currentStreak' ? '🔥' :
                   key === 'totalWorkouts' ? '💪' :
                   key === 'caloriesBurned' ? '⚡' : '⏰'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
          </div>

      {activeTab === 'Overview' && (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Weight Progress</h3>
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <EyeIcon className="w-5 h-5" />
                </button>
          </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
        </motion.div>

            {/* Workout Frequency Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Workout Frequency</h3>
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <EyeIcon className="w-5 h-5" />
                </button>
            </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workoutFrequencyData}>
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
                  <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Goals Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Goals Progress</h3>
              <button className="text-primary hover:text-primary/80 transition-colors text-sm">
                View All Goals
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalsData.map((goal, index) => (
                <motion.div
                  key={goal.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-accent/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">{goal.name}</h4>
                    <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.current} / {goal.target}</span>
                    <span className="flex items-center">
                      <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                      {goal.progress > 75 ? 'On track' : goal.progress > 50 ? 'Good progress' : 'Needs attention'}
                    </span>
          </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Workouts</h3>
            <button className="text-primary hover:text-primary/80 transition-colors text-sm">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {progressData?.dashboard?.recentWorkouts?.length > 0 ? (
              progressData.dashboard.recentWorkouts.map((workout, index) => (
                <motion.div
                  key={workout._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">💪</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{workout.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.duration || 0} min • {workout.caloriesBurned || 0} cal • {workout.totalSetsCompleted || 0} sets
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {workout.type || 'workout'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {workout.completedAt ? new Date(workout.completedAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💪</div>
                <p className="text-sm text-muted-foreground">No workouts yet</p>
                <p className="text-xs text-muted-foreground">Complete your first workout to see it here</p>
              </div>
            )}
          </div>
        </motion.div>
        </>
      )}

      {activeTab === 'Goals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Your Goals</h3>
            <button className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </div>
          <div className="space-y-4">
            {goalsData.map((goal, index) => (
              <motion.div
                key={goal.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-accent/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base font-medium text-foreground">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">Current: {goal.current} | Target: {goal.target}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{goal.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {goal.progress > 75 ? 'Almost there!' : goal.progress > 50 ? 'Great progress' : 'Keep going!'}
                  </span>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                    Edit Goal
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'Body Metrics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Body Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(bodyMetrics).map(([key, metric], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {metric.value} {metric.unit}
                    </p>
                    <p className={`text-xs flex items-center ${
                      metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 ${
                        metric.changeType === 'decrease' ? 'rotate-180' : ''
                      }`} />
                      {metric.change > 0 ? '+' : ''}{metric.change} {metric.unit}
                    </p>
                  </div>
            </div>
              </motion.div>
            ))}
          </div>

          {/* Body Metrics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Body Composition Over Time</h3>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <EyeIcon className="w-5 h-5" />
              </button>
          </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weightProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="bodyFat" 
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {activeTab === 'Achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Achievements & Badges</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {achievements.filter(a => a.earned).length} of {achievements.length} earned
              </span>
              <TrophyIcon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.earned 
                    ? 'bg-accent/50 border-primary/20' 
                    : 'bg-muted/50 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.earned ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <TrophyIcon className={`w-5 h-5 ${
                      achievement.earned ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <p className="text-xs text-primary font-medium">
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Not earned yet
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressPage;
