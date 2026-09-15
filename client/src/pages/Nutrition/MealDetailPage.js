import React from 'react';
import { useParams } from 'react-router-dom';
import { HeartIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const MealDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Details</h1>
        <p className="text-gray-600">View detailed information about your meal</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meal Information</h2>
        <p className="text-gray-500">Meal details will be displayed here for meal ID: {id}</p>
      </div>
    </div>
  );
};

export default MealDetailPage;
