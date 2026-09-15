import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusIcon, MagnifyingGlassIcon, HeartIcon, ClockIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RecipesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    cuisine: 'all',
    difficulty: 'all',
    maxTime: 'all'
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const queryClient = useQueryClient();

  // Fetch recipes with filters
  const { data: recipesData, isLoading } = useQuery(
    ['recipes', searchQuery, filters],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.cuisine !== 'all') params.append('cuisine', filters.cuisine);
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
      if (filters.maxTime !== 'all') params.append('maxTime', filters.maxTime);
      
      const response = await api.get(`/api/recipes?${params}`);
      return response.data;
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'recipe-categories',
    async () => {
      const response = await api.get('/api/recipes/categories');
      return response.data;
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    async (recipeId) => {
      // This would be a real API call in production
      return new Promise((resolve) => {
        setTimeout(() => {
          const newFavorites = new Set(favorites);
          if (newFavorites.has(recipeId)) {
            newFavorites.delete(recipeId);
          } else {
            newFavorites.add(recipeId);
          }
          setFavorites(newFavorites);
          resolve({ success: true });
        }, 300);
      });
    },
    {
      onSuccess: (_, recipeId) => {
        const isFavorited = favorites.has(recipeId);
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
      }
    }
  );

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleToggleFavorite = (recipeId) => {
    toggleFavoriteMutation.mutate(recipeId);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'breakfast': return '🌅';
      case 'main': return '🍽️';
      case 'snack': return '🍎';
      case 'dessert': return '🍰';
      default: return '🍴';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recipes</h3>
          <button
            onClick={() => {/* Navigate to create recipe */}}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Recipe</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-1 bg-background border border-input rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            {categoriesData?.categories?.map(category => (
              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
          <select 
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            className="px-3 py-1 bg-background border border-input rounded-lg text-sm"
          >
            <option value="all">All Cuisines</option>
            {categoriesData?.cuisines?.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</option>
            ))}
          </select>
          <select 
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-3 py-1 bg-background border border-input rounded-lg text-sm"
          >
            <option value="all">All Difficulties</option>
            {categoriesData?.difficulties?.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>
            ))}
          </select>
          <select 
            value={filters.maxTime}
            onChange={(e) => handleFilterChange('maxTime', e.target.value)}
            className="px-3 py-1 bg-background border border-input rounded-lg text-sm"
          >
            <option value="all">Any Time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
          </select>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipesData?.recipes?.map((recipe) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center relative">
                <span className="text-4xl">{getCategoryIcon(recipe.category)}</span>
                <button
                  onClick={() => handleToggleFavorite(recipe._id)}
                  className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <HeartIcon className={`w-4 h-4 ${favorites.has(recipe._id) ? 'text-red-500 fill-current' : 'text-white'}`} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{recipe.name}</h4>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-muted-foreground">{recipe.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>
                
                {/* Recipe Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FireIcon className="w-4 h-4" />
                    <span>{recipe.nutrition.calories} cal</span>
                  </div>
                </div>

                {/* Difficulty and Tags */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                  </span>
                  <div className="flex space-x-1">
                    {recipe.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewRecipe(recipe)}
                    className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                  >
                    View Recipe
                  </button>
                  <button 
                    onClick={() => handleToggleFavorite(recipe._id)}
                    className={`px-3 py-1 border rounded text-sm transition-colors ${
                      favorites.has(recipe._id) 
                        ? 'border-red-500 text-red-500 hover:bg-red-50' 
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <HeartIcon className={`w-4 h-4 ${favorites.has(recipe._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Recipe Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="text-center p-6">
              <PlusIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Create New Recipe</p>
            </div>
          </motion.div>
        </div>

        {/* No Results */}
        {recipesData?.recipes?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground">No recipes found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">{selectedRecipe.name}</h3>
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipe Image */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">{getCategoryIcon(selectedRecipe.category)}</span>
                </div>

                {/* Recipe Info */}
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedRecipe.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FireIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedRecipe.nutrition.calories} cal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className={getDifficultyColor(selectedRecipe.difficulty)}>
                        {selectedRecipe.difficulty.charAt(0).toUpperCase() + selectedRecipe.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map(tag => (
                      <span key={tag} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mt-6">
                <h4 className="font-medium text-foreground mb-3">Ingredients</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6">
                <h4 className="font-medium text-foreground mb-3">Instructions</h4>
                <div className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex space-x-3 text-sm">
                      <span className="font-medium text-primary">{index + 1}.</span>
                      <span className="text-foreground">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Nutrition per serving</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Calories:</span>
                    <span className="ml-2 font-medium">{selectedRecipe.nutrition.calories}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Protein:</span>
                    <span className="ml-2 font-medium">{selectedRecipe.nutrition.protein}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbs:</span>
                    <span className="ml-2 font-medium">{selectedRecipe.nutrition.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fat:</span>
                    <span className="ml-2 font-medium">{selectedRecipe.nutrition.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesTab;
