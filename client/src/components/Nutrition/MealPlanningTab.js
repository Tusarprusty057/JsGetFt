import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusIcon, CalendarIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MealPlanningTab = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const queryClient = useQueryClient();

  // Get current week start date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Fetch meal plans
  const { data: mealPlansData, isLoading } = useQuery(
    ['meal-plans', weekStart.toISOString().split('T')[0]],
    async () => {
      const response = await api.get(`/api/meal-planning?weekStartDate=${weekStart.toISOString().split('T')[0]}`);
      return response.data;
    }
  );

  // Fetch templates
  const { data: templatesData } = useQuery(
    'meal-templates',
    async () => {
      const response = await api.get('/api/meal-planning/templates');
      return response.data;
    }
  );

  // Create meal plan mutation
  const createMealPlanMutation = useMutation(
    async (mealPlanData) => {
      const response = await api.post('/api/meal-planning', mealPlanData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('meal-plans');
        toast.success('Meal plan created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create meal plan');
      }
    }
  );

  // Update meal plan mutation
  const updateMealPlanMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/meal-planning/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('meal-plans');
        toast.success('Meal plan updated!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update meal plan');
      }
    }
  );

  // Toggle shopping list item
  const toggleShoppingItem = (itemIndex) => {
    if (!mealPlansData?.mealPlans?.[0]) return;
    
    const updatedShoppingList = [...mealPlansData.mealPlans[0].shoppingList];
    updatedShoppingList[itemIndex].checked = !updatedShoppingList[itemIndex].checked;
    
    updateMealPlanMutation.mutate({
      id: mealPlansData.mealPlans[0]._id,
      data: { shoppingList: updatedShoppingList }
    });
  };

  // Apply template
  const applyTemplate = (template) => {
    const days = {};
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    weekDays.forEach(day => {
      days[day] = {
        breakfast: { name: template.meals.breakfast, calories: template.calories * 0.25, protein: template.protein * 0.25, carbs: template.carbs * 0.25, fat: template.fat * 0.25 },
        lunch: { name: template.meals.lunch, calories: template.calories * 0.35, protein: template.protein * 0.35, carbs: template.carbs * 0.35, fat: template.fat * 0.35 },
        dinner: { name: template.meals.dinner, calories: template.calories * 0.3, protein: template.protein * 0.3, carbs: template.carbs * 0.3, fat: template.fat * 0.3 },
        snacks: template.meals.snacks.map(snack => ({ name: snack, calories: 100, protein: 5, carbs: 15, fat: 3 }))
      };
    });

    if (mealPlansData?.mealPlans?.[0]) {
      updateMealPlanMutation.mutate({
        id: mealPlansData.mealPlans[0]._id,
        data: { days }
      });
    } else {
      createMealPlanMutation.mutate({
        weekStartDate: weekStart.toISOString().split('T')[0],
        weekEndDate: weekEnd.toISOString().split('T')[0],
        days
      });
    }
    setShowTemplates(false);
  };

  // Generate shopping list
  const generateShoppingList = () => {
    if (!mealPlansData?.mealPlans?.[0]) return;
    
    const shoppingList = [
      { name: 'Chicken Breast', quantity: '2 lbs', category: 'Protein', checked: false },
      { name: 'Salmon Fillet', quantity: '1.5 lbs', category: 'Protein', checked: false },
      { name: 'Quinoa', quantity: '2 cups', category: 'Grains', checked: false },
      { name: 'Mixed Vegetables', quantity: '3 bags', category: 'Vegetables', checked: false },
      { name: 'Greek Yogurt', quantity: '2 containers', category: 'Dairy', checked: false },
      { name: 'Avocados', quantity: '4 pieces', category: 'Fruits', checked: false },
      { name: 'Oats', quantity: '1 bag', category: 'Grains', checked: false },
      { name: 'Eggs', quantity: '1 dozen', category: 'Dairy', checked: false }
    ];
    
    updateMealPlanMutation.mutate({
      id: mealPlansData.mealPlans[0]._id,
      data: { shoppingList }
    });
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentMealPlan = mealPlansData?.mealPlans?.[0];

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Meal Planning</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              ← Previous Week
            </button>
            <span className="text-sm text-muted-foreground">
              Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              Next Week →
            </button>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + index);
            const dayKey = day.toLowerCase();
            const dayData = currentMealPlan?.days?.[dayKey];
            
            return (
              <div 
                key={day} 
                className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDay === dayKey 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-background border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedDay(selectedDay === dayKey ? null : dayKey)}
              >
                <div className="text-sm font-medium text-muted-foreground mb-2">{day.slice(0, 3)}</div>
                <div className="text-lg font-semibold text-foreground mb-2">{dayDate.getDate()}</div>
                <div className="space-y-1">
                  {dayData?.breakfast && (
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {dayData.breakfast.name}
                    </div>
                  )}
                  {dayData?.lunch && (
                    <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {dayData.lunch.name}
                    </div>
                  )}
                  {dayData?.dinner && (
                    <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      {dayData.dinner.name}
                    </div>
                  )}
                  {!dayData && (
                    <div className="text-xs text-muted-foreground">No meals planned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details */}
        {selectedDay && currentMealPlan?.days?.[selectedDay] && (
          <div className="bg-background rounded-lg p-4 border border-border mb-6">
            <h4 className="font-medium text-foreground mb-3 capitalize">{selectedDay} Meals</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentMealPlan.days[selectedDay].breakfast && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Breakfast</h5>
                  <p className="text-sm text-foreground">{currentMealPlan.days[selectedDay].breakfast.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(currentMealPlan.days[selectedDay].breakfast.calories)} cal
                  </p>
                </div>
              )}
              {currentMealPlan.days[selectedDay].lunch && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Lunch</h5>
                  <p className="text-sm text-foreground">{currentMealPlan.days[selectedDay].lunch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(currentMealPlan.days[selectedDay].lunch.calories)} cal
                  </p>
                </div>
              )}
              {currentMealPlan.days[selectedDay].dinner && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Dinner</h5>
                  <p className="text-sm text-foreground">{currentMealPlan.days[selectedDay].dinner.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(currentMealPlan.days[selectedDay].dinner.calories)} cal
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Planning Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full text-left p-2 hover:bg-accent/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">Use Meal Template</span>
              </button>
              <button 
                onClick={generateShoppingList}
                className="w-full text-left p-2 hover:bg-accent/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                <span className="text-sm">Generate Shopping List</span>
              </button>
              <button className="w-full text-left p-2 hover:bg-accent/50 rounded-lg transition-colors">
                <span className="text-sm">🌅 Breakfast Ideas</span>
              </button>
              <button className="w-full text-left p-2 hover:bg-accent/50 rounded-lg transition-colors">
                <span className="text-sm">☀️ Lunch Ideas</span>
              </button>
              <button className="w-full text-left p-2 hover:bg-accent/50 rounded-lg transition-colors">
                <span className="text-sm">🌙 Dinner Ideas</span>
              </button>
            </div>
          </div>

          {/* Shopping List */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Shopping List</h4>
              <button 
                onClick={generateShoppingList}
                className="text-sm text-primary hover:text-primary/80"
              >
                Generate List
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentMealPlan?.shoppingList?.length > 0 ? (
                currentMealPlan.shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => toggleShoppingItem(index)}
                      className="rounded" 
                    />
                    <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.name} - {item.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No items in shopping list</p>
              )}
            </div>
          </div>
        </div>

        {/* Meal Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 border border-border max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Meal Templates</h3>
                <button 
                  onClick={() => setShowTemplates(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templatesData?.templates?.map((template) => (
                  <div key={template.id} className="bg-background rounded-lg p-4 border border-border">
                    <h5 className="font-medium text-foreground mb-2">{template.name}</h5>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="text-xs text-muted-foreground mb-3">
                      {template.calories} cal • {template.protein}g protein • {template.carbs}g carbs • {template.fat}g fat
                    </div>
                    <button 
                      onClick={() => applyTemplate(template)}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanningTab;
