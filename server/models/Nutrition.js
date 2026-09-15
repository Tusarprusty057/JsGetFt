const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  barcode: String,
  category: { 
    type: String, 
    enum: ['fruits', 'vegetables', 'grains', 'proteins', 'dairy', 'snacks', 'beverages', 'condiments', 'other'],
    required: true 
  },
  // Nutritional Information per 100g
  nutrition: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbohydrates: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 },
    sugar: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 },
    cholesterol: { type: Number, min: 0 },
    saturatedFat: { type: Number, min: 0 },
    transFat: { type: Number, min: 0 },
    // Micronutrients
    vitamins: {
      vitaminA: { type: Number, min: 0 },
      vitaminC: { type: Number, min: 0 },
      vitaminD: { type: Number, min: 0 },
      vitaminE: { type: Number, min: 0 },
      vitaminK: { type: Number, min: 0 },
      thiamine: { type: Number, min: 0 },
      riboflavin: { type: Number, min: 0 },
      niacin: { type: Number, min: 0 },
      vitaminB6: { type: Number, min: 0 },
      folate: { type: Number, min: 0 },
      vitaminB12: { type: Number, min: 0 }
    },
    minerals: {
      calcium: { type: Number, min: 0 },
      iron: { type: Number, min: 0 },
      magnesium: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 },
      potassium: { type: Number, min: 0 },
      zinc: { type: Number, min: 0 },
      copper: { type: Number, min: 0 },
      manganese: { type: Number, min: 0 },
      selenium: { type: Number, min: 0 }
    }
  },
  // AI Analysis
  aiAnalysis: {
    healthScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    warnings: [String],
    alternatives: [{
      name: String,
      healthScore: Number,
      reason: String
    }],
    tags: [String]
  },
  // Image Recognition
  imageRecognition: {
    confidence: { type: Number, min: 0, max: 1 },
    detectedItems: [String],
    processingNotes: String
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isCustom: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'],
    required: true 
  },
  date: { type: Date, default: Date.now },
  // Simplified foods array for direct storage
  foods: [{
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    serving: { type: String, default: '100g' },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'serving' }
  }],
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unit: { 
      type: String, 
      enum: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'],
      required: true 
    },
    notes: String
  }],
  // Calculated totals
  totals: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbohydrates: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 },
    sugar: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 }
  },
  // AI Analysis
  aiAnalysis: {
    healthScore: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    warnings: [String],
    improvements: [String],
    macroBalance: {
      protein: { type: Number, min: 0, max: 100 },
      carbs: { type: Number, min: 0, max: 100 },
      fat: { type: Number, min: 0, max: 100 }
    }
  },
  // Image Recognition
  imageRecognition: {
    imageUrl: String,
    detectedItems: [{
      name: String,
      confidence: { type: Number, min: 0, max: 1 },
      quantity: Number,
      unit: String
    }],
    processingStatus: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    }
  },
  consumedAt: { type: Date },
  notes: String,
  isTemplate: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  tags: [String]
}, {
  timestamps: true
});

const nutritionGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'water'],
    required: true 
  },
  target: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  period: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const hydrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  unit: { 
    type: String, 
    enum: ['ml', 'l', 'oz', 'cup'],
    default: 'ml'
  },
  type: { 
    type: String, 
    enum: ['water', 'tea', 'coffee', 'juice', 'sports-drink', 'other'],
    default: 'water'
  },
  consumedAt: { type: Date, required: true },
  notes: String
}, {
  timestamps: true
});

// Calculate meal totals
mealSchema.methods.calculateTotals = function() {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  this.items.forEach(item => {
    const foodItem = item.foodItem;
    const quantity = item.quantity;
    
    // Convert quantity to grams for calculation
    let quantityInGrams = quantity;
    if (item.unit === 'kg') quantityInGrams = quantity * 1000;
    else if (item.unit === 'ml' || item.unit === 'l') quantityInGrams = quantity; // Assume 1ml = 1g for liquids
    else if (item.unit === 'cup') quantityInGrams = quantity * 240; // Approximate
    else if (item.unit === 'tbsp') quantityInGrams = quantity * 15;
    else if (item.unit === 'tsp') quantityInGrams = quantity * 5;
    
    const multiplier = quantityInGrams / 100; // Nutrition is per 100g
    
    totals.calories += (foodItem.nutrition.calories || 0) * multiplier;
    totals.protein += (foodItem.nutrition.protein || 0) * multiplier;
    totals.carbohydrates += (foodItem.nutrition.carbohydrates || 0) * multiplier;
    totals.fat += (foodItem.nutrition.fat || 0) * multiplier;
    totals.fiber += (foodItem.nutrition.fiber || 0) * multiplier;
    totals.sugar += (foodItem.nutrition.sugar || 0) * multiplier;
    totals.sodium += (foodItem.nutrition.sodium || 0) * multiplier;
  });

  return totals;
};

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const Meal = mongoose.model('Meal', mealSchema);
const NutritionGoal = mongoose.model('NutritionGoal', nutritionGoalSchema);
const Hydration = mongoose.model('Hydration', hydrationSchema);

module.exports = { FoodItem, Meal, NutritionGoal, Hydration };
