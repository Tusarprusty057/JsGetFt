const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { FoodItem, Meal } = require('../models/Nutrition');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/ai/food-detection
// @desc    Detect food items from image (simplified version without external APIs)
// @access  Private
router.post('/food-detection', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Basic image analysis - look at image properties to make educated guesses
    const imageSize = req.file.size;
    const imageName = req.file.originalname.toLowerCase();
    const imageBuffer = req.file.buffer;
    
    // Analyze image characteristics
    const isLargeImage = imageSize > 500000; // > 500KB
    const isSmallImage = imageSize < 100000; // < 100KB
    const hasFoodKeywords = imageName.includes('bread') || imageName.includes('food') || 
                           imageName.includes('meal') || imageName.includes('breakfast') ||
                           imageName.includes('lunch') || imageName.includes('dinner');
    
    // Simple color analysis (basic approach)
    const buffer = imageBuffer;
    let redPixels = 0, greenPixels = 0, bluePixels = 0;
    let totalPixels = 0;
    
    // Sample every 100th pixel for performance
    for (let i = 0; i < buffer.length; i += 300) {
      if (i + 2 < buffer.length) {
        redPixels += buffer[i];
        greenPixels += buffer[i + 1];
        bluePixels += buffer[i + 2];
        totalPixels++;
      }
    }
    
    const avgRed = totalPixels > 0 ? redPixels / totalPixels : 0;
    const avgGreen = totalPixels > 0 ? greenPixels / totalPixels : 0;
    const avgBlue = totalPixels > 0 ? bluePixels / totalPixels : 0;
    
    // Determine food type based on image characteristics
    let selectedFoodIndex = 0;
    
    if (hasFoodKeywords && imageName.includes('bread')) {
      selectedFoodIndex = 10; // Whole Wheat Bread
    } else if (hasFoodKeywords && imageName.includes('banana')) {
      selectedFoodIndex = 11; // Banana
    } else if (avgGreen > avgRed && avgGreen > avgBlue) {
      selectedFoodIndex = 1; // Caesar Salad (green dominant)
    } else if (avgRed > avgGreen && avgRed > avgBlue) {
      selectedFoodIndex = 0; // Grilled Chicken Breast (brown/red dominant)
    } else if (isLargeImage && avgBlue > avgRed && avgBlue > avgGreen) {
      selectedFoodIndex = 9; // Green Smoothie (blue dominant)
    } else if (isSmallImage) {
      selectedFoodIndex = 5; // Greek Yogurt Bowl (smaller images often simple foods)
    } else if (avgRed > 150 && avgGreen > 150 && avgBlue < 100) {
      selectedFoodIndex = 2; // Pasta with Marinara (warm colors)
    } else if (avgRed > 200 && avgGreen > 200 && avgBlue > 200) {
      selectedFoodIndex = 3; // Grilled Salmon (balanced warm colors)
    } else if (avgRed > 100 && avgRed < 200 && avgGreen > 100 && avgGreen < 200 && avgBlue < 100) {
      selectedFoodIndex = 10; // Whole Wheat Bread (brownish colors)
    } else {
      // Fallback to a more random but still deterministic selection
      const hashInput = imageSize + imageName.length + Date.now();
      selectedFoodIndex = Math.floor(hashInput) % 12; // Now we have 12 options
    }
    
    const mockFoodOptions = [
      {
        name: 'Grilled Chicken Breast',
        quantity: '1 piece',
        confidence: 0.85,
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74
      },
      {
        name: 'Caesar Salad',
        quantity: '1 bowl',
        confidence: 0.88,
        calories: 200,
        protein: 8,
        carbs: 12,
        fat: 15,
        fiber: 3,
        sugar: 4,
        sodium: 450
      },
      {
        name: 'Pasta with Marinara',
        quantity: '1 plate',
        confidence: 0.82,
        calories: 320,
        protein: 12,
        carbs: 65,
        fat: 4,
        fiber: 6,
        sugar: 8,
        sodium: 600
      },
      {
        name: 'Grilled Salmon',
        quantity: '1 fillet',
        confidence: 0.90,
        calories: 280,
        protein: 35,
        carbs: 0,
        fat: 15,
        fiber: 0,
        sugar: 0,
        sodium: 120
      },
      {
        name: 'Mixed Berry Smoothie',
        quantity: '1 glass',
        confidence: 0.87,
        calories: 180,
        protein: 5,
        carbs: 35,
        fat: 2,
        fiber: 8,
        sugar: 25,
        sodium: 15
      },
      {
        name: 'Greek Yogurt Bowl',
        quantity: '1 bowl',
        confidence: 0.89,
        calories: 150,
        protein: 15,
        carbs: 20,
        fat: 2,
        fiber: 2,
        sugar: 18,
        sodium: 60
      },
      {
        name: 'Avocado Toast',
        quantity: '2 slices',
        confidence: 0.83,
        calories: 320,
        protein: 8,
        carbs: 30,
        fat: 20,
        fiber: 12,
        sugar: 2,
        sodium: 400
      },
      {
        name: 'Quinoa Buddha Bowl',
        quantity: '1 bowl',
        confidence: 0.91,
        calories: 450,
        protein: 18,
        carbs: 55,
        fat: 16,
        fiber: 8,
        sugar: 12,
        sodium: 280
      },
      {
        name: 'Turkey Sandwich',
        quantity: '1 sandwich',
        confidence: 0.86,
        calories: 380,
        protein: 25,
        carbs: 35,
        fat: 12,
        fiber: 3,
        sugar: 5,
        sodium: 800
      },
      {
        name: 'Green Smoothie',
        quantity: '1 glass',
        confidence: 0.84,
        calories: 120,
        protein: 3,
        carbs: 25,
        fat: 1,
        fiber: 4,
        sugar: 20,
        sodium: 25
      },
      {
        name: 'Whole Wheat Bread',
        quantity: '2 slices',
        confidence: 0.88,
        calories: 160,
        protein: 6,
        carbs: 30,
        fat: 2,
        fiber: 4,
        sugar: 2,
        sodium: 300
      },
      {
        name: 'Banana',
        quantity: '1 medium',
        confidence: 0.92,
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0.4,
        fiber: 3,
        sugar: 14,
        sodium: 1
      }
    ];
    
    const selectedFood = mockFoodOptions[selectedFoodIndex];
    const mockFoodItems = [selectedFood];
    
    // Log the analysis for debugging
    console.log('Image Analysis:', {
      filename: imageName,
      size: imageSize,
      avgRed: Math.round(avgRed),
      avgGreen: Math.round(avgGreen),
      avgBlue: Math.round(avgBlue),
      hasFoodKeywords,
      isLargeImage,
      isSmallImage,
      selectedFood: selectedFood.name,
      selectedIndex: selectedFoodIndex
    });

    // Create food item record
    const foodItem = new FoodItem({
      name: selectedFood.name,
      category: selectedFood.name.toLowerCase().includes('salad') ? 'vegetables' : 
                selectedFood.name.toLowerCase().includes('pasta') ? 'grains' :
                selectedFood.name.toLowerCase().includes('smoothie') ? 'beverages' :
                selectedFood.name.toLowerCase().includes('yogurt') ? 'dairy' :
                selectedFood.name.toLowerCase().includes('toast') ? 'grains' :
                selectedFood.name.toLowerCase().includes('quinoa') ? 'grains' :
                selectedFood.name.toLowerCase().includes('sandwich') ? 'grains' :
                selectedFood.name.toLowerCase().includes('bread') ? 'grains' :
                selectedFood.name.toLowerCase().includes('banana') ? 'fruits' : 'proteins',
      nutrition: {
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbohydrates: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        sugar: selectedFood.sugar,
        sodium: selectedFood.sodium
      },
      aiAnalysis: {
        healthScore: selectedFood.name.toLowerCase().includes('quinoa') ? 92 :
                    selectedFood.name.toLowerCase().includes('salad') ? 90 :
                    selectedFood.name.toLowerCase().includes('banana') ? 89 :
                    selectedFood.name.toLowerCase().includes('salmon') ? 88 :
                    selectedFood.name.toLowerCase().includes('yogurt') ? 87 :
                    selectedFood.name.toLowerCase().includes('chicken') ? 85 :
                    selectedFood.name.toLowerCase().includes('smoothie') ? 83 :
                    selectedFood.name.toLowerCase().includes('bread') ? 78 :
                    selectedFood.name.toLowerCase().includes('toast') ? 75 :
                    selectedFood.name.toLowerCase().includes('sandwich') ? 72 :
                    selectedFood.name.toLowerCase().includes('pasta') ? 70 : 80,
        recommendations: selectedFood.name.toLowerCase().includes('quinoa') ?
                        ['Superfood! High in protein and fiber', 'Complete amino acid profile'] :
                        selectedFood.name.toLowerCase().includes('banana') ?
                        ['Great source of potassium and energy', 'Perfect pre-workout snack'] :
                        selectedFood.name.toLowerCase().includes('salad') ? 
                        ['Excellent choice! High in fiber and nutrients', 'Great for weight management'] :
                        selectedFood.name.toLowerCase().includes('yogurt') ?
                        ['Great source of probiotics', 'High in protein and calcium'] :
                        selectedFood.name.toLowerCase().includes('salmon') ?
                        ['Rich in omega-3 fatty acids', 'Great source of protein'] :
                        selectedFood.name.toLowerCase().includes('chicken') ?
                        ['Lean protein source', 'Consider adding vegetables'] :
                        selectedFood.name.toLowerCase().includes('smoothie') ?
                        ['Great way to get fruits/vegetables', 'Consider adding protein powder'] :
                        selectedFood.name.toLowerCase().includes('bread') ?
                        ['Good source of fiber', 'Consider whole grain varieties'] :
                        selectedFood.name.toLowerCase().includes('toast') ?
                        ['Good healthy fats from avocado', 'Consider whole grain bread'] :
                        selectedFood.name.toLowerCase().includes('sandwich') ?
                        ['Balanced meal', 'Consider adding vegetables'] :
                        selectedFood.name.toLowerCase().includes('pasta') ?
                        ['Consider whole grain pasta', 'Add more vegetables'] :
                        ['Good choice', 'Consider portion size'],
        warnings: selectedFood.name.toLowerCase().includes('pasta') ? 
                 ['High in refined carbs', 'Consider portion control'] : [],
        alternatives: selectedFood.name.toLowerCase().includes('pasta') ?
                     [{ name: 'Zucchini Noodles', reason: 'Lower carb alternative' }] : [],
        tags: selectedFood.name.toLowerCase().includes('quinoa') ? ['superfood', 'high-protein', 'high-fiber'] :
              selectedFood.name.toLowerCase().includes('banana') ? ['fruits', 'potassium', 'energy'] :
              selectedFood.name.toLowerCase().includes('salad') ? ['healthy', 'low-calorie', 'high-fiber'] :
              selectedFood.name.toLowerCase().includes('yogurt') ? ['probiotic', 'high-protein', 'dairy'] :
              selectedFood.name.toLowerCase().includes('salmon') ? ['healthy', 'omega-3', 'protein-rich'] :
              selectedFood.name.toLowerCase().includes('chicken') ? ['healthy', 'protein-rich', 'low-carb'] :
              selectedFood.name.toLowerCase().includes('smoothie') ? ['healthy', 'fruits', 'beverage'] :
              selectedFood.name.toLowerCase().includes('bread') ? ['grains', 'fiber', 'carbs'] :
              selectedFood.name.toLowerCase().includes('toast') ? ['healthy-fats', 'breakfast', 'grains'] :
              selectedFood.name.toLowerCase().includes('sandwich') ? ['balanced', 'lunch', 'grains'] :
              selectedFood.name.toLowerCase().includes('pasta') ? ['comfort-food', 'carbs'] :
              ['healthy', 'nutritious']
      },
      imageRecognition: {
        confidence: selectedFood.confidence,
        detectedItems: [selectedFood.name.toLowerCase().split(' ')[0], 'food item'],
        processingNotes: 'Mock food detection - API keys not configured'
      },
      isVerified: false
    });

    await foodItem.save();

    res.json({
      success: true,
      message: 'Food detection completed (mock data)',
      foodItem,
      detectedFoods: mockFoodItems
    });
  } catch (error) {
    console.error('Food detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Food detection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/posture-analysis
// @desc    Analyze exercise posture from image/video
// @access  Private
router.post('/posture-analysis', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No media file provided'
      });
    }

    const { exerciseType, exerciseName } = req.body;

    if (!exerciseType || !exerciseName) {
      return res.status(400).json({
        success: false,
        message: 'Exercise type and name are required'
      });
    }

    // Upload media to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
          folder: 'fittribe/posture-analysis'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Use OpenAI Vision for posture analysis
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${exerciseType} exercise (${exerciseName}) and evaluate the form/posture. 
                     
                     Please provide:
                     1. Form score (0-100)
                     2. Specific areas that need improvement
                     3. Corrective feedback
                     4. Safety warnings
                     5. Tips for better form
                     6. Overall assessment
                     
                     Format as JSON with this structure:
                     {
                       "formScore": 75,
                       "intensityScore": 80,
                       "recommendations": ["Keep your back straight", "Lower the weight"],
                       "warnings": ["Risk of back injury if form continues"],
                       "improvements": ["Focus on controlled movement", "Engage core muscles"],
                       "correctiveFeedback": "Your back is slightly rounded. Focus on keeping a neutral spine throughout the movement.",
                       "safetyWarnings": ["Stop if you feel pain", "Use a spotter for heavy weights"],
                       "tips": ["Warm up properly", "Start with lighter weight"],
                       "overallAssessment": "Good form overall with minor adjustments needed"
                     }`
            },
            {
              type: 'image_url',
              image_url: { url: result.secure_url }
            }
          ]
        }],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiAnalysis = JSON.parse(openaiResponse.data.choices[0].message.content);

    res.json({
      success: true,
      message: 'Posture analysis completed',
      mediaUrl: result.secure_url,
      exerciseType,
      exerciseName,
      aiAnalysis
    });
  } catch (error) {
    console.error('Posture analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Posture analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/nutrition-analysis
// @desc    Analyze nutrition from text input (simplified version)
// @access  Private
router.post('/nutrition-analysis', auth, async (req, res) => {
  try {
    const { foodDescription, quantity, unit } = req.body;

    if (!foodDescription) {
      return res.status(400).json({
        success: false,
        message: 'Food description is required'
      });
    }

    // Generate dynamic mock analysis based on food description
    const description = foodDescription.toLowerCase();
    let mockAnalysis;
    
    if (description.includes('chicken') || description.includes('poultry')) {
      mockAnalysis = {
        name: foodDescription,
        category: 'proteins',
        nutrition: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          sodium: 74,
          cholesterol: 85,
          saturatedFat: 1,
          transFat: 0
        },
        healthScore: 85,
        recommendations: ['Excellent source of lean protein', 'Great for muscle building'],
        warnings: [],
        alternatives: [],
        tags: ['protein-rich', 'lean', 'healthy']
      };
    } else if (description.includes('salad') || description.includes('vegetables')) {
      mockAnalysis = {
        name: foodDescription,
        category: 'vegetables',
        nutrition: {
          calories: 50,
          protein: 3,
          carbohydrates: 10,
          fat: 0.5,
          fiber: 4,
          sugar: 6,
          sodium: 30,
          cholesterol: 0,
          saturatedFat: 0.1,
          transFat: 0
        },
        healthScore: 90,
        recommendations: ['Excellent choice! High in fiber and vitamins', 'Great for weight management'],
        warnings: [],
        alternatives: [],
        tags: ['low-calorie', 'high-fiber', 'nutrient-dense']
      };
    } else if (description.includes('pasta') || description.includes('noodles')) {
      mockAnalysis = {
        name: foodDescription,
        category: 'grains',
        nutrition: {
          calories: 220,
          protein: 8,
          carbohydrates: 44,
          fat: 1,
          fiber: 2,
          sugar: 2,
          sodium: 1,
          cholesterol: 0,
          saturatedFat: 0.2,
          transFat: 0
        },
        healthScore: 70,
        recommendations: ['Consider whole grain pasta for more fiber', 'Add vegetables for nutrients'],
        warnings: ['High in refined carbohydrates'],
        alternatives: [{ name: 'Zucchini Noodles', reason: 'Lower carb alternative' }],
        tags: ['carbs', 'comfort-food']
      };
    } else if (description.includes('fish') || description.includes('salmon') || description.includes('tuna')) {
      mockAnalysis = {
        name: foodDescription,
        category: 'proteins',
        nutrition: {
          calories: 280,
          protein: 35,
          carbohydrates: 0,
          fat: 15,
          fiber: 0,
          sugar: 0,
          sodium: 120,
          cholesterol: 60,
          saturatedFat: 3,
          transFat: 0
        },
        healthScore: 88,
        recommendations: ['Rich in omega-3 fatty acids', 'Excellent protein source'],
        warnings: [],
        alternatives: [],
        tags: ['omega-3', 'protein-rich', 'heart-healthy']
      };
    } else {
      // Default analysis for unknown foods
      mockAnalysis = {
        name: foodDescription,
        category: 'other',
        nutrition: {
          calories: 200,
          protein: 10,
          carbohydrates: 25,
          fat: 8,
          fiber: 3,
          sugar: 5,
          sodium: 150,
          cholesterol: 0,
          saturatedFat: 2,
          transFat: 0
        },
        healthScore: 75,
        recommendations: ['Good source of nutrients', 'Consider portion size'],
        warnings: [],
        alternatives: [],
        tags: ['analyzed', 'user-input']
      };
    }

    // Create food item record
    const foodItem = new FoodItem({
      name: mockAnalysis.name,
      category: mockAnalysis.category,
      nutrition: mockAnalysis.nutrition,
      aiAnalysis: {
        healthScore: mockAnalysis.healthScore,
        recommendations: mockAnalysis.recommendations,
        warnings: mockAnalysis.warnings,
        alternatives: mockAnalysis.alternatives,
        tags: mockAnalysis.tags
      },
      isVerified: false
    });

    await foodItem.save();

    res.json({
      success: true,
      message: 'Nutrition analysis completed (mock data)',
      foodItem,
      aiAnalysis: mockAnalysis
    });
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Nutrition analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/personalized-recommendations
// @desc    Get personalized recommendations
// @access  Private
router.post('/personalized-recommendations', auth, async (req, res) => {
  try {
    const { type, data } = req.body; // type: 'workout', 'nutrition', 'lifestyle'

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Recommendation type is required'
      });
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use OpenAI to generate personalized recommendations
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Generate personalized ${type} recommendations based on this user profile and data:
                     
                     User Profile:
                     - Age: ${user.personalInfo.age || 'Not specified'}
                     - Gender: ${user.personalInfo.gender || 'Not specified'}
                     - Weight: ${user.personalInfo.weight?.value || 'Not specified'} ${user.personalInfo.weight?.unit || ''}
                     - Height: ${user.personalInfo.height?.value || 'Not specified'} ${user.personalInfo.height?.unit || ''}
                     - Activity Level: ${user.personalInfo.activityLevel || 'Not specified'}
                     - Fitness Goals: ${user.personalInfo.fitnessGoals?.join(', ') || 'Not specified'}
                     - Medical Conditions: ${user.personalInfo.medicalConditions?.map(c => c.name).join(', ') || 'None'}
                     - Dietary Preferences: ${user.personalInfo.dietaryPreferences?.join(', ') || 'None'}
                     - Allergies: ${user.personalInfo.allergies?.join(', ') || 'None'}
                     
                     Additional Data: ${JSON.stringify(data || {})}
                     
                     Please provide:
                     1. Specific recommendations tailored to this user
                     2. Reasoning behind each recommendation
                     3. Potential challenges and solutions
                     4. Timeline for implementation
                     5. Success metrics to track
                     
                     Format as JSON with this structure:
                     {
                       "recommendations": [
                         {
                           "category": "workout|nutrition|lifestyle",
                           "title": "Recommendation Title",
                           "description": "Detailed description",
                           "reasoning": "Why this is recommended",
                           "implementation": "How to implement",
                           "timeline": "When to expect results",
                           "challenges": ["Potential challenges"],
                           "solutions": ["Solutions to challenges"],
                           "successMetrics": ["How to measure success"]
                         }
                       ],
                       "priority": "high|medium|low",
                       "overallAssessment": "Overall assessment of user's current state",
                       "nextSteps": ["Immediate next steps to take"]
                     }`
        }],
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const recommendations = JSON.parse(openaiResponse.data.choices[0].message.content);

    res.json({
      success: true,
      message: 'Personalized recommendations generated',
      type,
      recommendations
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/meal-planning
// @desc    Generate personalized meal plan
// @access  Private
router.post('/meal-planning', auth, async (req, res) => {
  try {
    const { days = 7, preferences = {} } = req.body;

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use OpenAI to generate meal plan
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Create a personalized ${days}-day meal plan based on this user profile:
                     
                     User Profile:
                     - Age: ${user.personalInfo.age || 'Not specified'}
                     - Gender: ${user.personalInfo.gender || 'Not specified'}
                     - Weight: ${user.personalInfo.weight?.value || 'Not specified'} ${user.personalInfo.weight?.unit || ''}
                     - Height: ${user.personalInfo.height?.value || 'Not specified'} ${user.personalInfo.height?.unit || ''}
                     - Activity Level: ${user.personalInfo.activityLevel || 'Not specified'}
                     - Fitness Goals: ${user.personalInfo.fitnessGoals?.join(', ') || 'Not specified'}
                     - Dietary Preferences: ${user.personalInfo.dietaryPreferences?.join(', ') || 'None'}
                     - Allergies: ${user.personalInfo.allergies?.join(', ') || 'None'}
                     - Medical Conditions: ${user.personalInfo.medicalConditions?.map(c => c.name).join(', ') || 'None'}
                     
                     Additional Preferences: ${JSON.stringify(preferences)}
                     
                     Please provide:
                     1. Daily meal plans with specific foods and portions
                     2. Nutritional breakdown for each meal
                     3. Shopping list
                     4. Preparation tips
                     5. Alternatives for each meal
                     
                     Format as JSON with this structure:
                     {
                       "mealPlan": [
                         {
                           "day": 1,
                           "meals": {
                             "breakfast": {
                               "name": "Meal Name",
                               "ingredients": [{"name": "ingredient", "amount": "1 cup", "calories": 100}],
                               "nutrition": {"calories": 400, "protein": 20, "carbs": 45, "fat": 15},
                               "instructions": "Preparation steps",
                               "prepTime": "10 minutes"
                             },
                             "lunch": {...},
                             "dinner": {...},
                             "snacks": [...]
                           }
                         }
                       ],
                       "shoppingList": [{"ingredient": "name", "amount": "1 lb", "category": "produce"}],
                       "nutritionalSummary": {
                         "dailyCalories": 2000,
                         "dailyProtein": 150,
                         "dailyCarbs": 200,
                         "dailyFat": 80
                       },
                       "tips": ["Preparation tips", "Storage tips"],
                       "alternatives": ["Alternative meal options"]
                     }`
        }],
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const mealPlan = JSON.parse(openaiResponse.data.choices[0].message.content);

    res.json({
      success: true,
      message: 'Meal plan generated successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Meal planning error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
