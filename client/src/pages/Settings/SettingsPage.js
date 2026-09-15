import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  CogIcon, 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  PaintBrushIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { theme, setLightTheme, setDarkTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Fetch user settings
  const { data: settingsData, isLoading, error } = useQuery(
    'userSettings',
    async () => {
      try {
        const response = await axios.get('/api/users/settings');
        return response.data;
      } catch (err) {
        console.error('Settings fetch error:', err);
        // Return fallback data
        return {
          settings: {
            notifications: true,
            privacy: 'public',
            theme: 'light',
            language: 'en'
          }
        };
      }
    },
    {
      retry: false,
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await axios.put('/api/users/profile', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userProfile');
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't show error state, use fallback data instead
  // if (error) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-red-600">Error loading settings</p>
  //       <button 
  //         onClick={() => window.location.reload()} 
  //         className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <nav className="space-y-2">
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                <UserIcon className="w-5 h-5 mr-3" />
                Profile
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <BellIcon className="w-5 h-5 mr-3" />
                Notifications
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 mr-3" />
                Privacy & Security
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <PaintBrushIcon className="w-5 h-5 mr-3" />
                Appearance
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>

          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={setLightTheme}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      theme === 'light' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <SunIcon className="w-5 h-5 mr-2" />
                    Light
                  </button>
                  <button
                    onClick={setDarkTheme}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <MoonIcon className="w-5 h-5 mr-2" />
                    Dark
                  </button>
                  <button
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      theme === 'auto' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Workout Reminders</p>
                  <p className="text-sm text-gray-500">Get reminded about scheduled workouts</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
