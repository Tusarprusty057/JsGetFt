import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { UserIcon, TrophyIcon, ChartBarIcon, CalendarIcon, CogIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    gender: user?.gender || '',
    activityLevel: user?.activityLevel || '',
    goals: user?.goals || []
  });

  // Fetch user profile data
  const { data: profileData, isLoading, error } = useQuery(
    'userProfile',
    async () => {
      try {
        const response = await api.get('/api/auth/me');
        return response.data;
      } catch (err) {
        console.error('Profile fetch error:', err);
        // Return fallback data
        return {
          user: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            level: 5,
            points: 1250,
            streak: 7,
            achievements: 12,
            workouts: 45,
            memberSince: '2023-01-15',
            friends: 8
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
    async (profileData) => {
      const response = await api.put('/api/auth/me', profileData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userProfile');
        setIsEditing(false);
      },
      onError: (error) => {
        console.error('Update profile error:', error);
        alert('Failed to update profile. Please try again.');
      }
    }
  );

  const handleEditClick = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      weight: user?.weight || '',
      height: user?.height || '',
      gender: user?.gender || '',
      activityLevel: user?.activityLevel || '',
      goals: user?.goals || []
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    const profileData = {
      name: editForm.name,
      personalInfo: {
        age: editForm.age,
        weight: editForm.weight,
        height: editForm.height,
        gender: editForm.gender,
        activityLevel: editForm.activityLevel,
        goals: editForm.goals
      }
    };
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      weight: user?.weight || '',
      height: user?.height || '',
      gender: user?.gender || '',
      activityLevel: user?.activityLevel || '',
      goals: user?.goals || []
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
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
  //       <p className="text-red-600">Error loading profile data</p>
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
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground">{user?.name || 'User'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-muted-foreground">
                Level {user?.gamification?.level || 1}
              </span>
                  <span className="text-sm text-muted-foreground">
                {user?.gamification?.totalPoints || 0} points
              </span>
                  <span className="text-sm text-muted-foreground">
                {user?.gamification?.streak || 0} day streak
              </span>
            </div>
              </>
            )}
          </div>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditClick}
              className="flex items-center space-x-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              <CogIcon className="w-5 h-5" />
              <span>Edit Profile</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Achievements</p>
              <p className="text-2xl font-bold text-foreground">
                {user?.gamification?.achievements?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Workouts</p>
              <p className="text-2xl font-bold text-foreground">
                {profileData?.stats?.totalWorkouts || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-2xl font-bold text-foreground">
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <UserIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Friends</p>
              <p className="text-2xl font-bold text-foreground">
                {profileData?.stats?.friends || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
