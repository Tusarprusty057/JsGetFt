import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FoodScanner = ({ onClose, onFoodDetected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [error, setError] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setUploadedImage(null);
    setDetectedFoods([]);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/ai/food-detection', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadedImage(URL.createObjectURL(file));
        
        // Transform API response to match component expectations
        const detectedFoods = [{
          name: response.data.foodItem.name,
          confidence: response.data.foodItem.imageRecognition.confidence,
          calories: response.data.foodItem.nutrition.calories,
          protein: response.data.foodItem.nutrition.protein,
          carbs: response.data.foodItem.nutrition.carbohydrates,
          fat: response.data.foodItem.nutrition.fat,
          fiber: response.data.foodItem.nutrition.fiber,
          sugar: response.data.foodItem.nutrition.sugar,
          sodium: response.data.foodItem.nutrition.sodium,
          serving: '1 serving',
          healthScore: response.data.foodItem.aiAnalysis.healthScore,
          recommendations: response.data.foodItem.aiAnalysis.recommendations,
          warnings: response.data.foodItem.aiAnalysis.warnings,
          alternatives: response.data.foodItem.aiAnalysis.alternatives,
          tags: response.data.foodItem.aiAnalysis.tags
        }];
        
        setDetectedFoods(detectedFoods);
        if (onFoodDetected) {
          onFoodDetected(detectedFoods);
        }
      } else {
        setError(response.data.message || 'Failed to detect food items');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraCapture = () => {
    // For demo purposes, we'll use file input
    // In a real app, you'd implement camera capture here
    document.getElementById('food-scanner-input').click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CameraIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Food Scanner</h2>
              <p className="text-sm text-muted-foreground">Upload an image to detect food items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        {!uploadedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <PhotoIcon className="w-12 h-12 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Upload Food Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image of your meal to get AI-powered nutrition analysis
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCameraCapture}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Take Photo</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('food-scanner-input').click()}
                  className="flex items-center space-x-2 px-6 py-3 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span>Upload Image</span>
                </motion.button>
              </div>

              <input
                id="food-scanner-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Image...</h3>
            <p className="text-sm text-muted-foreground">AI is detecting food items and calculating nutrition</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {uploadedImage && detectedFoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Uploaded Image */}
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Scanned food"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                AI Analyzed
              </div>
            </div>

            {/* Detected Foods */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Detected Food Items</h3>
              <div className="space-y-3">
                {detectedFoods.map((food, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-accent/50 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{food.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {Math.round(food.confidence * 100)}%
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Calories: {food.calories}</span>
                          <span>Protein: {food.protein}g</span>
                          <span>Carbs: {food.carbs}g</span>
                          <span>Fat: {food.fat}g</span>
                        </div>
                        {food.healthScore && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Health Score</span>
                              <span className={`font-medium ${food.healthScore >= 70 ? 'text-green-500' : food.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {food.healthScore}/100
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1 mt-1">
                              <div 
                                className={`h-1 rounded-full ${food.healthScore >= 70 ? 'bg-green-500' : food.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${food.healthScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // Navigate to nutrition log page with pre-filled data
                          const nutritionData = {
                            name: food.name,
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                            fiber: food.fiber,
                            sugar: food.sugar,
                            sodium: food.sodium,
                            serving: food.serving,
                            quantity: 1
                          };
                          
                          // Store in localStorage for the log page to use
                          localStorage.setItem('aiDetectedFood', JSON.stringify(nutritionData));
                          
                          // Close scanner and navigate
                          onClose();
                          window.location.href = '/nutrition/log';
                        }}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                      >
                        Add to Log
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Total Nutrition */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Total Nutrition</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Calories</p>
                  <p className="text-lg font-bold text-foreground">
                    {detectedFoods.reduce((sum, food) => sum + food.calories, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protein</p>
                  <p className="text-lg font-bold text-foreground">
                    {detectedFoods.reduce((sum, food) => sum + food.protein, 0).toFixed(1)}g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="text-lg font-bold text-foreground">
                    {detectedFoods.reduce((sum, food) => sum + food.carbs, 0).toFixed(1)}g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fat</p>
                  <p className="text-lg font-bold text-foreground">
                    {detectedFoods.reduce((sum, food) => sum + food.fat, 0).toFixed(1)}g
                  </p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {detectedFoods[0]?.recommendations && detectedFoods[0].recommendations.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">AI Recommendations</h4>
                <ul className="space-y-1">
                  {detectedFoods[0].recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start space-x-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {detectedFoods[0]?.warnings && detectedFoods[0].warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">⚠️ Warnings</h4>
                <ul className="space-y-1">
                  {detectedFoods[0].warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start space-x-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Healthier Alternatives */}
            {detectedFoods[0]?.alternatives && detectedFoods[0].alternatives.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">💡 Healthier Alternatives</h4>
                <div className="space-y-2">
                  {detectedFoods[0].alternatives.map((alt, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-foreground">{alt.name}</span>
                      <p className="text-muted-foreground">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        {uploadedImage && (
          <div className="flex justify-end space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setUploadedImage(null);
                setDetectedFoods([]);
                setError(null);
              }}
              className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              Scan Another
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Done
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FoodScanner;
