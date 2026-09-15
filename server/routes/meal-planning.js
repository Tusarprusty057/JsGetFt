const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock meal planning data
const mockMealPlans = [
  {
    _id: '1',
    userId: 'user123',
    weekStartDate: '2025-01-06',
    weekEndDate: '2025-01-12',
    days: {
      monday: {
        breakfast: { name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 45, fat: 8 },
        lunch: { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 20, fat: 25 },
        dinner: { name: 'Salmon with Quinoa', calories: 520, protein: 40, carbs: 35, fat: 22 },
        snacks: [
          { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 8, fat: 2 },
          { name: 'Apple', calories: 80, protein: 0.3, carbs: 21, fat: 0.2 }
        ]
      },
      tuesday: {
        breakfast: { name: 'Avocado Toast', calories: 280, protein: 8, carbs: 25, fat: 18 },
        lunch: { name: 'Turkey Wrap', calories: 380, protein: 25, carbs: 30, fat: 18 },
        dinner: { name: 'Vegetable Stir Fry', calories: 350, protein: 15, carbs: 40, fat: 12 },
        snacks: [
          { name: 'Mixed Nuts', calories: 160, protein: 6, carbs: 8, fat: 14 }
        ]
      },
      wednesday: {
        breakfast: { name: 'Green Smoothie Bowl', calories: 280, protein: 8, carbs: 52, fat: 6 },
        lunch: { name: 'Quinoa Buddha Bowl', calories: 420, protein: 18, carbs: 55, fat: 15 },
        dinner: { name: 'Baked Cod with Sweet Potato', calories: 380, protein: 30, carbs: 35, fat: 12 },
        snacks: [
          { name: 'Hummus with Veggies', calories: 120, protein: 4, carbs: 12, fat: 6 }
        ]
      },
      thursday: {
        breakfast: { name: 'Protein Pancakes', calories: 350, protein: 25, carbs: 30, fat: 12 },
        lunch: { name: 'Chicken Teriyaki Bowl', calories: 480, protein: 32, carbs: 45, fat: 18 },
        dinner: { name: 'Mediterranean Pasta', calories: 420, protein: 18, carbs: 55, fat: 12 },
        snacks: [
          { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }
        ]
      },
      friday: {
        breakfast: { name: 'Chia Pudding', calories: 250, protein: 8, carbs: 35, fat: 10 },
        lunch: { name: 'Tuna Salad Sandwich', calories: 400, protein: 28, carbs: 35, fat: 15 },
        dinner: { name: 'Grilled Steak with Vegetables', calories: 450, protein: 35, carbs: 20, fat: 25 },
        snacks: [
          { name: 'Dark Chocolate', calories: 150, protein: 2, carbs: 15, fat: 9 }
        ]
      },
      saturday: {
        breakfast: { name: 'French Toast', calories: 320, protein: 12, carbs: 35, fat: 12 },
        lunch: { name: 'Caesar Salad with Chicken', calories: 380, protein: 30, carbs: 15, fat: 22 },
        dinner: { name: 'Pizza Night', calories: 600, protein: 25, carbs: 65, fat: 25 },
        snacks: [
          { name: 'Ice Cream', calories: 200, protein: 3, carbs: 25, fat: 10 }
        ]
      },
      sunday: {
        breakfast: { name: 'Pancakes with Syrup', calories: 400, protein: 10, carbs: 60, fat: 12 },
        lunch: { name: 'BBQ Ribs', calories: 550, protein: 35, carbs: 20, fat: 35 },
        dinner: { name: 'Roast Chicken Dinner', calories: 480, protein: 40, carbs: 25, fat: 22 },
        snacks: [
          { name: 'Cheese and Crackers', calories: 180, protein: 8, carbs: 15, fat: 10 }
        ]
      }
    },
    shoppingList: [
      { name: 'Chicken Breast', quantity: '2 lbs', category: 'Protein', checked: false },
      { name: 'Salmon Fillet', quantity: '1.5 lbs', category: 'Protein', checked: false },
      { name: 'Quinoa', quantity: '2 cups', category: 'Grains', checked: false },
      { name: 'Mixed Vegetables', quantity: '3 bags', category: 'Vegetables', checked: false },
      { name: 'Greek Yogurt', quantity: '2 containers', category: 'Dairy', checked: false },
      { name: 'Avocados', quantity: '4 pieces', category: 'Fruits', checked: false },
      { name: 'Oats', quantity: '1 bag', category: 'Grains', checked: false },
      { name: 'Eggs', quantity: '1 dozen', category: 'Dairy', checked: false }
    ],
    totalCalories: 2450,
    totalProtein: 180,
    totalCarbs: 280,
    totalFat: 95,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  }
];

// @route   GET /api/meal-planning
// @desc    Get meal plans for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    
    // Filter by week if specified
    let mealPlans = mockMealPlans.filter(plan => plan.userId === req.user.id);
    
    if (weekStartDate) {
      mealPlans = mealPlans.filter(plan => plan.weekStartDate === weekStartDate);
    }
    
    res.json({
      success: true,
      mealPlans
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/meal-planning
// @desc    Create new meal plan
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, days, shoppingList } = req.body;
    
    const newMealPlan = {
      _id: Date.now().toString(),
      userId: req.user.id,
      weekStartDate,
      weekEndDate,
      days: days || {},
      shoppingList: shoppingList || [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Calculate totals
    Object.values(newMealPlan.days).forEach(day => {
      if (day.breakfast) {
        newMealPlan.totalCalories += day.breakfast.calories || 0;
        newMealPlan.totalProtein += day.breakfast.protein || 0;
        newMealPlan.totalCarbs += day.breakfast.carbs || 0;
        newMealPlan.totalFat += day.breakfast.fat || 0;
      }
      if (day.lunch) {
        newMealPlan.totalCalories += day.lunch.calories || 0;
        newMealPlan.totalProtein += day.lunch.protein || 0;
        newMealPlan.totalCarbs += day.lunch.carbs || 0;
        newMealPlan.totalFat += day.lunch.fat || 0;
      }
      if (day.dinner) {
        newMealPlan.totalCalories += day.dinner.calories || 0;
        newMealPlan.totalProtein += day.dinner.protein || 0;
        newMealPlan.totalCarbs += day.dinner.carbs || 0;
        newMealPlan.totalFat += day.dinner.fat || 0;
      }
      if (day.snacks) {
        day.snacks.forEach(snack => {
          newMealPlan.totalCalories += snack.calories || 0;
          newMealPlan.totalProtein += snack.protein || 0;
          newMealPlan.totalCarbs += snack.carbs || 0;
          newMealPlan.totalFat += snack.fat || 0;
        });
      }
    });
    
    mockMealPlans.push(newMealPlan);
    
    res.status(201).json({
      success: true,
      mealPlan: newMealPlan
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/meal-planning/:id
// @desc    Update meal plan
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { days, shoppingList } = req.body;
    
    const mealPlanIndex = mockMealPlans.findIndex(plan => plan._id === id && plan.userId === req.user.id);
    
    if (mealPlanIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }
    
    const mealPlan = mockMealPlans[mealPlanIndex];
    
    if (days) {
      mealPlan.days = { ...mealPlan.days, ...days };
    }
    
    if (shoppingList) {
      mealPlan.shoppingList = shoppingList;
    }
    
    // Recalculate totals
    mealPlan.totalCalories = 0;
    mealPlan.totalProtein = 0;
    mealPlan.totalCarbs = 0;
    mealPlan.totalFat = 0;
    
    Object.values(mealPlan.days).forEach(day => {
      if (day.breakfast) {
        mealPlan.totalCalories += day.breakfast.calories || 0;
        mealPlan.totalProtein += day.breakfast.protein || 0;
        mealPlan.totalCarbs += day.breakfast.carbs || 0;
        mealPlan.totalFat += day.breakfast.fat || 0;
      }
      if (day.lunch) {
        mealPlan.totalCalories += day.lunch.calories || 0;
        mealPlan.totalProtein += day.lunch.protein || 0;
        mealPlan.totalCarbs += day.lunch.carbs || 0;
        mealPlan.totalFat += day.lunch.fat || 0;
      }
      if (day.dinner) {
        mealPlan.totalCalories += day.dinner.calories || 0;
        mealPlan.totalProtein += day.dinner.protein || 0;
        mealPlan.totalCarbs += day.dinner.carbs || 0;
        mealPlan.totalFat += day.dinner.fat || 0;
      }
      if (day.snacks) {
        day.snacks.forEach(snack => {
          mealPlan.totalCalories += snack.calories || 0;
          mealPlan.totalProtein += snack.protein || 0;
          mealPlan.totalCarbs += snack.carbs || 0;
          mealPlan.totalFat += snack.fat || 0;
        });
      }
    });
    
    mealPlan.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      mealPlan
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/meal-planning/:id
// @desc    Delete meal plan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const mealPlanIndex = mockMealPlans.findIndex(plan => plan._id === id && plan.userId === req.user.id);
    
    if (mealPlanIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }
    
    mockMealPlans.splice(mealPlanIndex, 1);
    
    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/meal-planning/templates
// @desc    Get meal planning templates
// @access  Private
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = [
      {
        id: 'high-protein',
        name: 'High Protein',
        description: 'Focus on lean proteins and vegetables',
        calories: 2200,
        protein: 180,
        carbs: 150,
        fat: 80,
        meals: {
          breakfast: 'Protein Pancakes with Berries',
          lunch: 'Grilled Chicken with Quinoa',
          dinner: 'Salmon with Roasted Vegetables',
          snacks: ['Greek Yogurt', 'Hard Boiled Eggs']
        }
      },
      {
        id: 'mediterranean',
        name: 'Mediterranean',
        description: 'Olive oil, fish, and fresh vegetables',
        calories: 2000,
        protein: 120,
        carbs: 200,
        fat: 90,
        meals: {
          breakfast: 'Greek Yogurt with Honey',
          lunch: 'Mediterranean Quinoa Bowl',
          dinner: 'Grilled Fish with Vegetables',
          snacks: ['Olives', 'Nuts']
        }
      },
      {
        id: 'vegetarian',
        name: 'Vegetarian',
        description: 'Plant-based meals and legumes',
        calories: 1900,
        protein: 100,
        carbs: 250,
        fat: 70,
        meals: {
          breakfast: 'Oatmeal with Nuts',
          lunch: 'Lentil Curry with Rice',
          dinner: 'Vegetable Stir Fry',
          snacks: ['Hummus with Veggies', 'Fruit']
        }
      }
    ];
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
