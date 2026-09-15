import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import api from '../../utils/api';
import {
  PlusIcon,
  XMarkIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import FoodScanner from '../../components/AI/FoodScanner';

const LogMealPage = () => {
  const navigate = useNavigate();
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodItems, setFoodItems] = useState([]);
  const [showFoodScanner, setShowFoodScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Check for AI-detected food on component mount
  useEffect(() => {
    const aiDetectedFood = localStorage.getItem('aiDetectedFood');
    if (aiDetectedFood) {
      try {
        const foodData = JSON.parse(aiDetectedFood);
        addFoodItem(foodData);
        localStorage.removeItem('aiDetectedFood'); // Clear after adding
      } catch (error) {
        console.error('Error parsing AI detected food:', error);
      }
    }
  }, []);

  // Search for food items
  const { data: searchResults, isLoading: isSearching } = useQuery(
    ['food-search', searchQuery],
    async () => {
      if (!searchQuery.trim()) return [];
      const response = await api.get(`/api/nutrition/foods/search?q=${searchQuery}`);
      return response.data.foods || [];
    },
    {
      enabled: searchQuery.trim().length > 2,
      staleTime: 30000
    }
  );

  // Log meal mutation
  const logMealMutation = useMutation(
    async (mealData) => {
      console.log('Making API call to /api/nutrition/meals with data:', mealData);
      const response = await api.post('/api/nutrition/meals', mealData);
      console.log('API response:', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Meal logged successfully:', data);
        navigate('/nutrition');
      },
      onError: (error) => {
        console.error('Failed to log meal:', error);
        console.error('Error details:', error.response?.data);
        alert(`Failed to log meal: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const addFoodItem = (food) => {
    const newItem = {
      id: Date.now(),
      name: food.name,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      serving: food.serving || '100g',
      quantity: food.quantity || 1,
      unit: 'serving' // Default unit
    };
    setFoodItems([...foodItems, newItem]);
    setSearchQuery('');
  };

  const updateFoodItem = (id, field, value) => {
    setFoodItems(foodItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeFoodItem = (id) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };

  const handleLogMeal = async () => {
    if (foodItems.length === 0) {
      alert('Please add at least one food item');
      return;
    }

    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    setIsCreating(true);
    
    const mealData = {
      name: mealName,
      type: mealType,
      foods: foodItems.map(item => ({
        name: item.name,
        calories: item.calories * item.quantity,
        protein: item.protein * item.quantity,
        carbs: item.carbs * item.quantity,
        fat: item.fat * item.quantity,
        fiber: item.fiber * item.quantity,
        sugar: item.sugar * item.quantity,
        sodium: item.sodium * item.quantity,
        serving: item.serving,
        quantity: item.quantity,
        unit: item.unit
      })),
      date: new Date(mealDate).toISOString()
    };

    console.log('Sending meal data:', JSON.stringify(mealData, null, 2));
    
    try {
      await logMealMutation.mutateAsync(mealData);
    } catch (error) {
      console.error('Error logging meal:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFoodDetected = (detectedFoods) => {
    detectedFoods.forEach(food => {
      addFoodItem(food);
    });
    setShowFoodScanner(false);
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅', time: 'Morning' },
    { value: 'lunch', label: 'Lunch', icon: '☀️', time: 'Afternoon' },
    { value: 'dinner', label: 'Dinner', icon: '🌙', time: 'Evening' },
    { value: 'snack', label: 'Snack', icon: '🍎', time: 'Anytime' }
  ];

  const totalNutrition = foodItems.reduce((totals, item) => ({
    calories: totals.calories + (item.calories * item.quantity),
    protein: totals.protein + (item.protein * item.quantity),
    carbs: totals.carbs + (item.carbs * item.quantity),
    fat: totals.fat + (item.fat * item.quantity),
    fiber: totals.fiber + (item.fiber * item.quantity),
    sugar: totals.sugar + (item.sugar * item.quantity)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });

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
          <h1 className="text-3xl font-bold text-foreground">Log Meal</h1>
          <p className="text-muted-foreground">Track your nutrition and calories</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/nutrition')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Selection & Search */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          {/* Meal Name */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Meal Name</h2>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter meal name (e.g., Morning Oatmeal)"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
            />
          </div>

          {/* Meal Date */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Date</h2>
            <input
              type="date"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Select the date for this meal (cannot be in the future)
            </p>
          </div>

          {/* Meal Type */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Meal Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMealType(type.value)}
                  className={`p-4 rounded-lg border transition-colors text-center ${
                    mealType === type.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs opacity-75">{type.time}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Food Search */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Food</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food..."
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFoodScanner(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
                <span>AI Food Scanner</span>
              </motion.button>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((food) => (
                    <motion.button
                      key={food._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => addFoodItem(food)}
                      className="w-full p-3 text-left bg-accent/50 rounded-lg hover:bg-accent/80 transition-colors border border-border/50"
                    >
                      <div className="font-medium text-foreground">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.calories} cal • {food.protein}g protein • {food.serving}
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No foods found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nutrition Summary */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Total Nutrition</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Calories</span>
                <span className="text-sm font-medium text-foreground">{totalNutrition.calories.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Protein</span>
                <span className="text-sm font-medium text-foreground">{totalNutrition.protein.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Carbs</span>
                <span className="text-sm font-medium text-foreground">{totalNutrition.carbs.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fat</span>
                <span className="text-sm font-medium text-foreground">{totalNutrition.fat.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fiber</span>
                <span className="text-sm font-medium text-foreground">{totalNutrition.fiber.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Food Items List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Food Items</h2>
              <span className="text-sm text-muted-foreground">{foodItems.length} items</span>
            </div>

            {foodItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No food items added yet</h3>
                <p className="text-muted-foreground mb-4">Search for foods or use AI scanner to add items to your meal</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFoodScanner(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Scan Food with AI</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {foodItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/50 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.serving}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFoodItem(item.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => updateFoodItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Calories</label>
                        <div className="px-2 py-1 text-sm bg-muted rounded">
                          {(item.calories * item.quantity).toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Protein</label>
                        <div className="px-2 py-1 text-sm bg-muted rounded">
                          {(item.protein * item.quantity).toFixed(1)}g
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Carbs</label>
                        <div className="px-2 py-1 text-sm bg-muted rounded">
                          {(item.carbs * item.quantity).toFixed(1)}g
                        </div>
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
          onClick={() => navigate('/nutrition')}
          className="px-6 py-3 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogMeal}
          disabled={isCreating || foodItems.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>Logging Meal...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Log Meal</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* AI Food Scanner Modal */}
      {showFoodScanner && (
        <FoodScanner 
          onClose={() => setShowFoodScanner(false)}
          onFoodDetected={handleFoodDetected}
        />
      )}
    </motion.div>
  );
};

export default LogMealPage;
