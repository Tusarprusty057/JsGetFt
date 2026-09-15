import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  HeartIcon,
  CameraIcon,
  PlusIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import MealPlanningTab from '../../components/Nutrition/MealPlanningTab';
import RecipesTab from '../../components/Nutrition/RecipesTab';

const NutritionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Food Diary', 'Meal Planning', 'Recipes'];

  // Fetch nutrition summary with fallback
  const { data: nutritionData, isLoading, error } = useQuery(
    'nutritionSummary',
    async () => {
      try {
        const response = await api.get('/api/nutrition/summary');
        return response.data;
      } catch (err) {
        console.error('Nutrition fetch error:', err);
        // Return empty data for new users
        return {
          summary: {
            totals: {
              calories: 0,
              protein: 0,
              carbohydrates: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              water: 0
            }
          }
        };
      }
    },
    {
      refetchInterval: 30000,
      retry: false,
    }
  );

  // Fetch today's meals
  const { data: todayMealsData, isLoading: mealsLoading } = useQuery(
    'todayMeals',
    async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get(`/api/nutrition/meals?date=${today}`);
        return response.data.meals || [];
      } catch (err) {
        console.error('Today meals fetch error:', err);
        return [];
      }
    },
    {
      retry: false,
    }
  );

  // Fetch weekly nutrition data
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery(
    'weeklyNutrition',
    async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        
        const response = await api.get(`/api/nutrition/summary?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
        return response.data.summary || { totals: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 } };
      } catch (err) {
        console.error('Weekly nutrition fetch error:', err);
        return { totals: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 } };
      }
    },
    {
      retry: false,
    }
  );

  // Delete meal mutation
  const deleteMealMutation = useMutation(
    async (mealId) => {
      const response = await api.delete(`/api/nutrition/meals/${mealId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch all nutrition-related queries
        queryClient.invalidateQueries('nutritionSummary');
        queryClient.invalidateQueries('todayMeals');
        queryClient.invalidateQueries('weeklyNutrition');
      },
      onError: (error) => {
        console.error('Failed to delete meal:', error);
        alert(`Failed to delete meal: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      await deleteMealMutation.mutateAsync(mealId);
    }
  };

  // Calculate macro distribution from real data
  const macroDistributionData = [
    { 
      name: 'Protein', 
      value: Math.round(nutritionData?.summary?.totals?.protein || 0), 
      color: '#1E40AF' 
    },
    { 
      name: 'Carbs', 
      value: Math.round(nutritionData?.summary?.totals?.carbohydrates || 0), 
      color: '#3B82F6' 
    },
    { 
      name: 'Fat', 
      value: Math.round(nutritionData?.summary?.totals?.fat || 0), 
      color: '#60A5FA' 
    }
  ];

  // Generate weekly calorie data from real data - only show days with actual data
  const generateWeeklyCalorieData = () => {
    const today = new Date();
    const weeklyData = [];
    
    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0];
      
      // Check if we have data for this day
      let dayCalories = 0;
      if (i === 0) {
        // Today - use current nutrition data
        dayCalories = Math.round(nutritionData?.summary?.totals?.calories || 0);
      } else {
        // For other days, we would need to fetch data for each day
        // For now, we'll only show today's data and leave other days at 0
        dayCalories = 0;
      }
      
      weeklyData.push({
        day: dayName,
        calories: dayCalories,
        goal: 2200,
        date: dateString,
        hasData: dayCalories > 0
      });
    }
    
    return weeklyData;
  };

  const weeklyCalorieData = generateWeeklyCalorieData();
  
  // Count days with data
  const daysWithData = weeklyCalorieData.filter(day => day.calories > 0).length;

  // Use real meals data
  const todayMeals = todayMealsData || [];

  const nutritionGoals = {
    calories: { current: nutritionData?.summary?.totals?.calories || 0, goal: 2200 },
    protein: { current: Math.round(nutritionData?.summary?.totals?.protein || 0), goal: 150 },
    carbs: { current: Math.round(nutritionData?.summary?.totals?.carbohydrates || 0), goal: 275 },
    fat: { current: Math.round(nutritionData?.summary?.totals?.fat || 0), goal: 73 }
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
  //       <p className="text-destructive">Error loading nutrition data</p>
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
          <span className="text-2xl">🍎</span>
      <div>
            <h1 className="text-3xl font-bold text-foreground">Nutrition</h1>
            <p className="text-muted-foreground">Track your meals and achieve your goals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search foods..."
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
      {/* Nutrition Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(nutritionGoals).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                key === 'calories' ? 'bg-red-500/10 text-red-500' :
                key === 'protein' ? 'bg-blue-500/10 text-blue-500' :
                key === 'carbs' ? 'bg-green-500/10 text-green-500' :
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                {key === 'calories' ? '🔥' : key === 'protein' ? '⚡' : key === 'carbs' ? '🍃' : '⚖️'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground uppercase">{key}</p>
                <p className="text-xl font-bold text-foreground">{data.current}</p>
                <p className="text-xs text-muted-foreground">
                  Goal: {data.goal} ({Math.round((data.current / data.goal) * 100)}%)
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Macro Distribution</h3>
          {macroDistributionData.some(item => item.value > 0) ? (
            <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {macroDistributionData.map((entry, index) => (
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
          <div className="space-y-2 mt-4">
            {macroDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                      {item.value}g
                </span>
            </div>
            ))}
          </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-muted-foreground">No nutrition data yet</p>
              <p className="text-sm text-muted-foreground">Log some meals to see your macro distribution</p>
            </div>
          )}
        </motion.div>

        {/* Weekly Calorie Intake */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Calorie Intake</h3>
          {weeklyCalorieData.some(day => day.calories > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyCalorieData}>
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
                  if (name === 'calories') {
                    return [`${value} cal`, 'Calories'];
                  }
                  return [`${value} cal`, 'Goal'];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${label} (${data.date})`;
                  }
                  return label;
                }} 
              />
              <Bar dataKey="goal" fill="hsl(var(--muted))" opacity={0.3} />
              <Bar 
                dataKey="calories" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-muted-foreground">No calorie data yet</p>
              <p className="text-sm text-muted-foreground">Log meals to see your weekly progress</p>
            </div>
          )}
          
          {/* Show info when there's limited data */}
          {daysWithData > 0 && daysWithData < 3 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 Showing data for {daysWithData} day{daysWithData > 1 ? 's' : ''}. Log meals on more days to see your complete weekly progress!
              </p>
            </div>
          )}
        </motion.div>

        {/* Today's Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Today's Meals</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/nutrition/log')}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Meal</span>
            </motion.button>
          </div>
          <div className="space-y-3">
            {mealsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : todayMeals.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-muted-foreground">No meals logged today</p>
                <p className="text-sm text-muted-foreground">Start by logging your first meal!</p>
              </div>
            ) : (
              todayMeals.map((meal, index) => (
              <motion.div
                  key={meal._id || index}
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-accent/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🍴</span>
                      <span className="font-medium text-foreground">{meal.type || 'Meal'}</span>
                  </div>
                    <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-accent rounded transition-colors">
                    <PencilIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                      <button 
                        onClick={() => handleDeleteMeal(meal._id)}
                        disabled={deleteMealMutation.isLoading}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                    {new Date(meal.date || meal.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {meal.totals && ` • ${Math.round(meal.totals.protein || 0)}g protein`}
                </p>
                <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">
                      {Math.round(meal.totals?.calories || 0)} cal
                    </span>
                    <span className="text-muted-foreground">
                      C: {Math.round(meal.totals?.carbohydrates || 0)}g • F: {Math.round(meal.totals?.fat || 0)}g
                    </span>
            </div>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/nutrition/log')}
          className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-all text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <HeartIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Log Meal</h3>
          </div>
          <p className="text-muted-foreground text-sm">Record your meals and track nutritional intake</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-all text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CameraIcon className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">AI Food Scan</h3>
          </div>
          <p className="text-muted-foreground text-sm">Take a photo to get instant nutritional analysis</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-all text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Nutrition Analytics</h3>
          </div>
          <p className="text-muted-foreground text-sm">View detailed nutrition insights and trends</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-all text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <PlusIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Meal Planning</h3>
          </div>
          <p className="text-muted-foreground text-sm">Plan your meals for the week ahead</p>
        </motion.button>
      </motion.div>
        </>
      )}

      {/* Food Diary Tab */}
      {activeTab === 'Food Diary' && (
        <div className="space-y-6">
          {/* Date Selector */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Food Diary</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => navigate('/nutrition/log')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Meal</span>
                </button>
              </div>
            </div>
            
            {/* Daily Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-lg font-semibold">{nutritionData?.summary?.totals?.calories || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-lg font-semibold">{Math.round(nutritionData?.summary?.totals?.protein || 0)}g</p>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🍃</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-lg font-semibold">{Math.round(nutritionData?.summary?.totals?.carbohydrates || 0)}g</p>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-lg font-semibold">{Math.round(nutritionData?.summary?.totals?.fat || 0)}g</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Today's Meals</h4>
              {todayMeals.length > 0 ? (
                <div className="space-y-3">
                  {todayMeals.map((meal, index) => (
                    <div key={meal._id || index} className="bg-background rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {meal.type === 'breakfast' ? '🌅' : 
                             meal.type === 'lunch' ? '☀️' : 
                             meal.type === 'dinner' ? '🌙' : '🍽️'}
                          </span>
                          <div>
                            <h5 className="font-medium text-foreground capitalize">{meal.name || meal.type}</h5>
                            <p className="text-sm text-muted-foreground">
                              {new Date(meal.date || meal.consumedAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {Math.round(meal.totals?.calories || 0)} cal
                          </span>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Food Items */}
                      {meal.foods && meal.foods.length > 0 && (
                        <div className="ml-8 space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {food.quantity} {food.unit} {food.name}
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(food.calories || 0)} cal
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-background rounded-lg border border-border">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-muted-foreground">No meals logged today</p>
                  <p className="text-sm text-muted-foreground">Start by logging your first meal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meal Planning Tab */}
      {activeTab === 'Meal Planning' && (
        <MealPlanningTab />
      )}

      {/* Recipes Tab */}
      {activeTab === 'Recipes' && (
        <RecipesTab />
      )}
    </motion.div>
  );
};

export default NutritionPage;
