const express = require('express');
const { FoodItem, Meal, NutritionGoal, Hydration } = require('../models/Nutrition');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/nutrition/meals
// @desc    Get user meals
// @access  Private
router.get('/meals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, date, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const meals = await Meal.find(filter)
      .populate('items.foodItem')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meal.countDocuments(filter);

    res.json({
      success: true,
      meals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/nutrition/meals
// @desc    Create new meal
// @access  Private
router.post('/meals', auth, async (req, res) => {
  try {
    const { name, type, foods, date } = req.body;
    
    // Create a simplified meal document for now
    const mealData = {
      user: req.user.id,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Meal`,
      type: type || 'breakfast',
      date: date ? new Date(date) : new Date(),
      // Store foods directly for now (simplified approach)
      foods: foods || [],
      // Calculate totals from foods
      totals: {
        calories: foods ? foods.reduce((sum, food) => sum + (food.calories || 0), 0) : 0,
        protein: foods ? foods.reduce((sum, food) => sum + (food.protein || 0), 0) : 0,
        carbohydrates: foods ? foods.reduce((sum, food) => sum + (food.carbs || 0), 0) : 0,
        fat: foods ? foods.reduce((sum, food) => sum + (food.fat || 0), 0) : 0,
        fiber: foods ? foods.reduce((sum, food) => sum + (food.fiber || 0), 0) : 0,
        sugar: foods ? foods.reduce((sum, food) => sum + (food.sugar || 0), 0) : 0,
        sodium: foods ? foods.reduce((sum, food) => sum + (food.sodium || 0), 0) : 0
      }
    };

    const meal = new Meal(mealData);
    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      meal: meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/nutrition/meals/:id
// @desc    Update meal
// @access  Private
router.put('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    Object.assign(meal, req.body);
    
    // Recalculate totals
    meal.totals = meal.calculateTotals();
    
    await meal.save();

    const populatedMeal = await Meal.findById(meal._id)
      .populate('items.foodItem');

    res.json({
      success: true,
      message: 'Meal updated successfully',
      meal: populatedMeal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/nutrition/meals/:id
// @desc    Delete meal
// @access  Private
router.delete('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await Meal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/nutrition/foods
// @desc    Search food items
// @access  Private
router.get('/foods', auth, async (req, res) => {
  try {
    const { search, category, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    const foods = await FoodItem.find(filter)
      .sort({ name: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      foods
    });
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/nutrition/foods/search
// @desc    Search food items (alternative endpoint)
// @access  Private
router.get('/foods/search', auth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    // Mock food database for search
    const mockFoods = [
      { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
      { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
      { name: 'Salmon', calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 44 },
      { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
      { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
      { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, sugar: 0.5, sodium: 4 },
      { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },
      { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4, sodium: 1 },
      { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 4 },
      { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },
      { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
      { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
      { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6, sugar: 4.2, sodium: 681 }
    ];

    let filteredFoods = mockFoods;
    
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredFoods = mockFoods.filter(food => 
        food.name.toLowerCase().includes(searchTerm)
      );
    }

    // Limit results
    filteredFoods = filteredFoods.slice(0, parseInt(limit));

    res.json({
      success: true,
      foods: filteredFoods
    });
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/nutrition/foods
// @desc    Create custom food item
// @access  Private
router.post('/foods', auth, async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      isCustom: true,
      createdBy: req.user.id
    };

    const food = new FoodItem(foodData);
    await food.save();

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      food
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/nutrition/goals
// @desc    Get nutrition goals
// @access  Private
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await NutritionGoal.find({
      user: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      goals
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/nutrition/goals
// @desc    Create nutrition goal
// @access  Private
router.post('/goals', auth, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      user: req.user.id
    };

    const goal = new NutritionGoal(goalData);
    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Nutrition goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/nutrition/goals/:id
// @desc    Update nutrition goal
// @access  Private
router.put('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await NutritionGoal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    Object.assign(goal, req.body);
    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/nutrition/goals/:id
// @desc    Delete nutrition goal
// @access  Private
router.delete('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await NutritionGoal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await NutritionGoal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/nutrition/hydration
// @desc    Get hydration records
// @access  Private
router.get('/hydration', auth, async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.consumedAt = { $gte: startOfDay, $lte: endOfDay };
    }
    if (startDate && endDate) {
      filter.consumedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const hydration = await Hydration.find(filter)
      .sort({ consumedAt: -1 });

    res.json({
      success: true,
      hydration
    });
  } catch (error) {
    console.error('Get hydration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/nutrition/hydration
// @desc    Add hydration record
// @access  Private
router.post('/hydration', auth, async (req, res) => {
  try {
    const hydrationData = {
      ...req.body,
      user: req.user.id
    };

    const hydration = new Hydration(hydrationData);
    await hydration.save();

    res.status(201).json({
      success: true,
      message: 'Hydration record added successfully',
      hydration
    });
  } catch (error) {
    console.error('Add hydration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/nutrition/summary
// @desc    Get nutrition summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let filter = { user: req.user.id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      // Default to today
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const meals = await Meal.find(filter).populate('items.foodItem');
    const hydration = await Hydration.find(filter);

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    meals.forEach(meal => {
      totals.calories += meal.totals.calories || 0;
      totals.protein += meal.totals.protein || 0;
      totals.carbohydrates += meal.totals.carbohydrates || 0;
      totals.fat += meal.totals.fat || 0;
      totals.fiber += meal.totals.fiber || 0;
      totals.sugar += meal.totals.sugar || 0;
      totals.sodium += meal.totals.sodium || 0;
    });

    // Calculate hydration total
    const hydrationTotal = hydration.reduce((sum, record) => {
      let amount = record.amount;
      if (record.unit === 'l') amount *= 1000;
      else if (record.unit === 'oz') amount *= 29.5735;
      else if (record.unit === 'cup') amount *= 240;
      return sum + amount;
    }, 0);

    res.json({
      success: true,
      summary: {
        meals: meals.length,
        totals,
        hydration: {
          total: Math.round(hydrationTotal),
          unit: 'ml',
          records: hydration.length
        },
        goals: await NutritionGoal.find({ user: req.user.id, isActive: true })
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
