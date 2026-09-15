const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock recipe database
const mockRecipes = [
  {
    _id: '1',
    name: 'Mediterranean Quinoa Bowl',
    description: 'A healthy and colorful quinoa bowl with fresh vegetables and herbs',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'easy',
    category: 'main',
    cuisine: 'mediterranean',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ingredients: [
      { name: 'Quinoa', amount: 1, unit: 'cup' },
      { name: 'Cherry Tomatoes', amount: 1, unit: 'cup', halved: true },
      { name: 'Cucumber', amount: 1, unit: 'medium', diced: true },
      { name: 'Red Onion', amount: 0.5, unit: 'medium', sliced: true },
      { name: 'Feta Cheese', amount: 0.5, unit: 'cup', crumbled: true },
      { name: 'Olive Oil', amount: 2, unit: 'tbsp' },
      { name: 'Lemon Juice', amount: 1, unit: 'tbsp' },
      { name: 'Fresh Basil', amount: 0.25, unit: 'cup', chopped: true }
    ],
    instructions: [
      'Cook quinoa according to package instructions and let cool',
      'In a large bowl, combine cooked quinoa, tomatoes, cucumber, and red onion',
      'In a small bowl, whisk together olive oil and lemon juice',
      'Pour dressing over quinoa mixture and toss to combine',
      'Top with feta cheese and fresh basil',
      'Serve immediately or refrigerate for up to 3 days'
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 420
    },
    tags: ['healthy', 'vegetarian', 'gluten-free', 'meal-prep'],
    rating: 4.5,
    reviews: 23,
    createdBy: 'system',
    isPublic: true
  },
  {
    _id: '2',
    name: 'Grilled Salmon with Asparagus',
    description: 'Perfectly grilled salmon fillet with roasted asparagus and lemon herb butter',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: 'medium',
    category: 'main',
    cuisine: 'american',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    ingredients: [
      { name: 'Salmon Fillet', amount: 2, unit: 'pieces', '6oz each': true },
      { name: 'Asparagus', amount: 1, unit: 'bunch', trimmed: true },
      { name: 'Olive Oil', amount: 3, unit: 'tbsp' },
      { name: 'Lemon', amount: 1, unit: 'medium', juiced: true },
      { name: 'Garlic', amount: 2, unit: 'cloves', minced: true },
      { name: 'Fresh Dill', amount: 2, unit: 'tbsp', chopped: true },
      { name: 'Salt', amount: 0.5, unit: 'tsp' },
      { name: 'Black Pepper', amount: 0.25, unit: 'tsp' }
    ],
    instructions: [
      'Preheat grill to medium-high heat',
      'Season salmon with salt and pepper',
      'Toss asparagus with 1 tbsp olive oil, salt, and pepper',
      'Grill salmon for 4-5 minutes per side',
      'Grill asparagus for 3-4 minutes, turning occasionally',
      'In a small bowl, mix remaining olive oil, lemon juice, garlic, and dill',
      'Serve salmon over asparagus and drizzle with herb butter'
    ],
    nutrition: {
      calories: 285,
      protein: 35,
      carbs: 8,
      fat: 14,
      fiber: 3,
      sugar: 4,
      sodium: 380
    },
    tags: ['healthy', 'high-protein', 'low-carb', 'grilled'],
    rating: 4.8,
    reviews: 31,
    createdBy: 'system',
    isPublic: true
  },
  {
    _id: '3',
    name: 'Green Smoothie Bowl',
    description: 'Nutritious green smoothie bowl topped with fresh fruits and granola',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    category: 'breakfast',
    cuisine: 'healthy',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
    ingredients: [
      { name: 'Frozen Banana', amount: 1, unit: 'medium' },
      { name: 'Frozen Mango', amount: 0.5, unit: 'cup' },
      { name: 'Fresh Spinach', amount: 1, unit: 'cup' },
      { name: 'Almond Milk', amount: 0.5, unit: 'cup' },
      { name: 'Chia Seeds', amount: 1, unit: 'tbsp' },
      { name: 'Honey', amount: 1, unit: 'tbsp' },
      { name: 'Fresh Berries', amount: 0.5, unit: 'cup' },
      { name: 'Granola', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Add frozen banana, mango, spinach, almond milk, chia seeds, and honey to blender',
      'Blend until smooth and creamy',
      'Pour into a bowl',
      'Top with fresh berries and granola',
      'Serve immediately'
    ],
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 52,
      fat: 6,
      fiber: 12,
      sugar: 35,
      sodium: 120
    },
    tags: ['healthy', 'vegan', 'gluten-free', 'breakfast', 'smoothie'],
    rating: 4.3,
    reviews: 18,
    createdBy: 'system',
    isPublic: true
  },
  {
    _id: '4',
    name: 'Chicken Teriyaki Stir Fry',
    description: 'Quick and easy chicken teriyaki stir fry with vegetables and rice',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'easy',
    category: 'main',
    cuisine: 'asian',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    ingredients: [
      { name: 'Chicken Breast', amount: 1.5, unit: 'lbs', 'cut into strips': true },
      { name: 'Broccoli', amount: 2, unit: 'cups', 'cut into florets': true },
      { name: 'Bell Peppers', amount: 2, unit: 'medium', 'sliced': true },
      { name: 'Carrots', amount: 2, unit: 'medium', 'julienned': true },
      { name: 'Soy Sauce', amount: 0.25, unit: 'cup' },
      { name: 'Honey', amount: 2, unit: 'tbsp' },
      { name: 'Garlic', amount: 3, unit: 'cloves', minced: true },
      { name: 'Ginger', amount: 1, unit: 'tbsp', grated: true },
      { name: 'Sesame Oil', amount: 1, unit: 'tbsp' },
      { name: 'Brown Rice', amount: 2, unit: 'cups', cooked: true }
    ],
    instructions: [
      'Cook brown rice according to package instructions',
      'In a small bowl, whisk together soy sauce, honey, garlic, and ginger',
      'Heat sesame oil in a large wok or skillet over high heat',
      'Add chicken and cook for 5-6 minutes until golden',
      'Add vegetables and stir fry for 3-4 minutes',
      'Pour teriyaki sauce over everything and cook for 2 minutes',
      'Serve over brown rice'
    ],
    nutrition: {
      calories: 385,
      protein: 32,
      carbs: 45,
      fat: 8,
      fiber: 6,
      sugar: 18,
      sodium: 890
    },
    tags: ['healthy', 'high-protein', 'stir-fry', 'asian'],
    rating: 4.6,
    reviews: 27,
    createdBy: 'system',
    isPublic: true
  },
  {
    _id: '5',
    name: 'Avocado Toast with Poached Egg',
    description: 'Classic avocado toast topped with perfectly poached egg and seasonings',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    difficulty: 'medium',
    category: 'breakfast',
    cuisine: 'american',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    ingredients: [
      { name: 'Whole Grain Bread', amount: 2, unit: 'slices' },
      { name: 'Avocado', amount: 1, unit: 'large', ripe: true },
      { name: 'Eggs', amount: 2, unit: 'large' },
      { name: 'Lemon Juice', amount: 1, unit: 'tbsp' },
      { name: 'Red Pepper Flakes', amount: 0.25, unit: 'tsp' },
      { name: 'Salt', amount: 0.25, unit: 'tsp' },
      { name: 'Black Pepper', amount: 0.125, unit: 'tsp' },
      { name: 'Fresh Cilantro', amount: 1, unit: 'tbsp', chopped: true }
    ],
    instructions: [
      'Bring a pot of water to a gentle boil',
      'Toast bread slices until golden',
      'Mash avocado with lemon juice, salt, and pepper',
      'Poach eggs in simmering water for 3-4 minutes',
      'Spread mashed avocado on toast',
      'Top with poached egg and red pepper flakes',
      'Garnish with fresh cilantro'
    ],
    nutrition: {
      calories: 245,
      protein: 12,
      carbs: 18,
      fat: 16,
      fiber: 8,
      sugar: 3,
      sodium: 420
    },
    tags: ['healthy', 'breakfast', 'vegetarian', 'high-fiber'],
    rating: 4.4,
    reviews: 21,
    createdBy: 'system',
    isPublic: true
  }
];

// @route   GET /api/recipes
// @desc    Get all recipes with filtering and search
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      search, 
      category, 
      cuisine, 
      difficulty, 
      maxTime, 
      tags,
      page = 1, 
      limit = 12 
    } = req.query;

    let filteredRecipes = [...mockRecipes];

    // Search by name or description
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === category);
    }

    // Filter by cuisine
    if (cuisine && cuisine !== 'all') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisine);
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }

    // Filter by max time
    if (maxTime) {
      const maxTimeNum = parseInt(maxTime);
      filteredRecipes = filteredRecipes.filter(recipe => 
        (recipe.prepTime + recipe.cookTime) <= maxTimeNum
      );
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      filteredRecipes = filteredRecipes.filter(recipe => 
        tagArray.some(tag => recipe.tags.includes(tag))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

    res.json({
      success: true,
      recipes: paginatedRecipes,
      total: filteredRecipes.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredRecipes.length / limit)
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = mockRecipes.find(r => r._id === req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/recipes
// @desc    Create new recipe
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      cuisine,
      ingredients,
      instructions,
      nutrition,
      tags
    } = req.body;

    const newRecipe = {
      _id: Date.now().toString(),
      name,
      description,
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      servings: parseInt(servings),
      difficulty,
      category,
      cuisine,
      ingredients,
      instructions,
      nutrition,
      tags: tags || [],
      rating: 0,
      reviews: 0,
      createdBy: req.user.id,
      isPublic: true,
      createdAt: new Date().toISOString()
    };

    // Add to mock database
    mockRecipes.push(newRecipe);

    res.status(201).json({
      success: true,
      recipe: newRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/recipes/categories
// @desc    Get recipe categories and filters
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = [...new Set(mockRecipes.map(r => r.category))];
    const cuisines = [...new Set(mockRecipes.map(r => r.cuisine))];
    const difficulties = [...new Set(mockRecipes.map(r => r.difficulty))];
    const allTags = [...new Set(mockRecipes.flatMap(r => r.tags))];

    res.json({
      success: true,
      categories,
      cuisines,
      difficulties,
      tags: allTags
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
