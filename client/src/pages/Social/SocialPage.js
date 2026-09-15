import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { 
  UserGroupIcon, 
  TrophyIcon, 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  ShareIcon, 
  BellIcon,
  PlusIcon,
  FireIcon,
  StarIcon,
  EyeIcon,
  UserPlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  ShareIcon as ShareSolid
} from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState('Feed');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const queryClient = useQueryClient();

  const tabs = ['Feed', 'Friends', 'Challenges', 'Leaderboard'];

  // Fetch social stats
  const { data: socialData, isLoading: statsLoading } = useQuery(
    'socialStats',
    async () => {
      const response = await api.get('/api/social/stats');
      return response.data;
    },
    {
      refetchInterval: 30000,
      retry: false,
    }
  );

  // Fetch friends
  const { data: friendsData, isLoading: friendsLoading } = useQuery(
    'socialFriends',
    async () => {
      const response = await api.get('/api/social/friends');
      return response.data;
    },
    {
      enabled: activeTab === 'Friends',
      retry: false,
    }
  );

  // Fetch challenges
  const { data: challengesData, isLoading: challengesLoading } = useQuery(
    'socialChallenges',
    async () => {
      const response = await api.get('/api/social/challenges');
      return response.data;
    },
    {
      enabled: activeTab === 'Challenges',
      retry: false,
    }
  );

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery(
    'socialLeaderboard',
    async () => {
      const response = await api.get('/api/social/leaderboard');
      return response.data;
    },
    {
      enabled: activeTab === 'Leaderboard',
      retry: false,
    }
  );

  // Fetch feed
  const { data: feedData, isLoading: feedLoading } = useQuery(
    'socialFeed',
    async () => {
      const response = await api.get('/api/social/feed');
      return response.data;
    },
    {
      enabled: activeTab === 'Feed',
      retry: false,
    }
  );

  // Mutations for social interactions
  const likeMutation = useMutation(
    async ({ postId, isLiked }) => {
      const endpoint = isLiked ? `/api/social/workouts/${postId}/unlike` : `/api/social/workouts/${postId}/like`;
      const response = await api.post(endpoint);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialFeed');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  const commentMutation = useMutation(
    async ({ postId, text }) => {
      const response = await api.post(`/api/social/workouts/${postId}/comment`, { text });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialFeed');
      }
    }
  );

  const shareMutation = useMutation(
    async ({ postId, message }) => {
      const response = await api.post(`/api/social/workouts/${postId}/share`, { message });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialFeed');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  const joinChallengeMutation = useMutation(
    async (challengeId) => {
      const response = await api.post(`/api/social/challenges/${challengeId}/join`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialChallenges');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  const leaveChallengeMutation = useMutation(
    async (challengeId) => {
      const response = await api.post(`/api/social/challenges/${challengeId}/leave`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialChallenges');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  const addFriendMutation = useMutation(
    async (userId) => {
      const response = await api.post('/api/social/friends/request', { userId });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialFriends');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  const removeFriendMutation = useMutation(
    async (userId) => {
      const response = await api.delete(`/api/social/friends/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('socialFriends');
        queryClient.invalidateQueries('socialStats');
      }
    }
  );

  // Use real data from API or fallback to demo data
  const socialFeed = feedData?.feed || [];
  const friends = friendsData?.friends || [];
  const challenges = challengesData?.challenges || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  const socialStats = {
    friends: socialData?.stats?.friends || 0,
    posts: socialData?.stats?.posts || 0,
    likes: socialData?.stats?.likes || 0,
    shares: socialData?.stats?.shares || 0,
    leaderboardPosition: socialData?.stats?.leaderboardPosition || 1,
    notifications: socialData?.stats?.notifications || 0
  };

  // Handler functions
  const handleLike = (postId) => {
    const isLiked = likedPosts.has(postId);
    likeMutation.mutate({ postId, isLiked });
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId, text) => {
    if (text.trim()) {
      commentMutation.mutate({ postId, text });
    }
  };

  const handleShare = (postId, message = '') => {
    shareMutation.mutate({ postId, message });
  };

  const handleJoinChallenge = (challengeId) => {
    joinChallengeMutation.mutate(challengeId);
  };

  const handleLeaveChallenge = (challengeId) => {
    leaveChallengeMutation.mutate(challengeId);
  };

  const handleAddFriend = (userId) => {
    addFriendMutation.mutate(userId);
  };

  const handleRemoveFriend = (userId) => {
    removeFriendMutation.mutate(userId);
  };

  // Demo data for when there's no real data
  const demoFeed = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        level: 15,
        xp: 2450
      },
      content: {
        type: 'workout',
        title: 'Just crushed a 45-minute HIIT session! 💪',
        description: 'Feel amazing after completing the full body circuit. My endurance is definitely improving!',
        stats: { duration: '45 min', calories: '420', exercises: 8 }
      },
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        level: 22,
        xp: 3850
      },
      content: {
        type: 'achievement',
        title: '🏆 New Achievement Unlocked!',
        description: 'Completed 30 days of consistent workouts. Never felt better!',
        achievement: { name: 'Iron Will', description: '30-day workout streak' }
      },
      timestamp: '4 hours ago',
      likes: 67,
      comments: 15,
      shares: 12,
      isLiked: true
    }
  ];

  const demoFriends = [
    { id: 1, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', level: 15, status: 'online', lastActivity: 'Active now' },
    { id: 2, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', level: 22, status: 'offline', lastActivity: '2 hours ago' },
    { id: 3, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', level: 18, status: 'online', lastActivity: 'Active now' }
  ];

  const demoChallenges = [
    { id: 1, name: '30-Day Workout Challenge', description: 'Complete a workout every day for 30 days', participants: 1247, progress: 75, endDate: '2025-02-08', type: 'workout', difficulty: 'hard' },
    { id: 2, name: '10K Steps Daily', description: 'Walk 10,000 steps every day this month', participants: 892, progress: 60, endDate: '2025-01-31', type: 'cardio', difficulty: 'medium' },
    { id: 3, name: 'Protein Power Week', description: 'Hit your protein goal 7 days in a row', participants: 543, progress: 85, endDate: '2025-01-16', type: 'nutrition', difficulty: 'easy' }
  ];

  const demoLeaderboard = [
    { rank: 1, name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', level: 25, xp: 4850, workouts: 156, isCurrentUser: false },
    { rank: 2, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', level: 22, xp: 3850, workouts: 142, isCurrentUser: false },
    { rank: 3, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', level: 18, xp: 3200, workouts: 128, isCurrentUser: false },
    { rank: 4, name: 'You', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', level: 16, xp: 2800, workouts: 98, isCurrentUser: true },
    { rank: 5, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', level: 15, xp: 2450, workouts: 87, isCurrentUser: false }
  ];

  // Use real data or fallback to demo data
  const displayFeed = socialFeed.length > 0 ? socialFeed : demoFeed;
  const displayFriends = friends.length > 0 ? friends : demoFriends;
  const displayChallenges = challenges.length > 0 ? challenges : demoChallenges;
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : demoLeaderboard;

  const isLoading = statsLoading || (activeTab === 'Feed' && feedLoading) || 
                   (activeTab === 'Friends' && friendsLoading) || 
                   (activeTab === 'Challenges' && challengesLoading) || 
                   (activeTab === 'Leaderboard' && leaderboardLoading);

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
  //       <p className="text-destructive">Error loading social data</p>
  //       <button 
  //         onClick={() => window.location.reload()} 
  //         className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">👥</span>
      <div>
            <h1 className="text-3xl font-bold text-foreground">Social</h1>
            <p className="text-muted-foreground">Connect with friends and share your fitness journey</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 border border-input rounded-lg hover:bg-accent transition-colors relative">
            <BellIcon className="w-4 h-4 text-muted-foreground" />
            {socialStats.notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-foreground">{socialStats.notifications}</span>
              </span>
            )}
          </button>
          <button className="p-2 border border-input rounded-lg hover:bg-accent transition-colors">
            <PlusIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-accent/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Social Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(socialStats).map(([key, value], index) => (
        <motion.div
            key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <span className="text-lg">
                  {key === 'friends' ? '👥' : 
                   key === 'posts' ? '📝' :
                   key === 'likes' ? '❤️' :
                   key === 'shares' ? '📤' :
                   key === 'leaderboardPosition' ? '🏆' : '🔔'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
          </div>

      {activeTab === 'Feed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {displayFeed.length > 0 ? (
            displayFeed.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">{post.user.level}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{post.user.name}</h4>
                  <p className="text-xs text-muted-foreground">Level {post.user.level} • {post.timestamp}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground mb-2">{post.content.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{post.content.description}</p>
                
                {post.content.type === 'workout' && (
                  <div className="bg-accent/50 rounded-lg p-3 border border-border/50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Exercises</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.exercises}</p>
                      </div>
                    </div>
                  </div>
                )}

                {post.content.type === 'achievement' && (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.content.achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{post.content.achievement.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {post.content.type === 'nutrition' && (
                  <div className="bg-accent/50 rounded-lg p-3 border border-border/50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.protein}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="text-sm font-medium text-foreground">{post.content.stats.carbs}</p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={likeMutation.isLoading}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    } disabled:opacity-50`}
                  >
                    {likedPosts.has(post.id) ? (
                      <HeartSolid className="w-4 h-4" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                    <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const text = prompt('Add a comment:');
                      if (text) handleComment(post.id, text);
                    }}
                    disabled={commentMutation.isLoading}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const message = prompt('Add a message (optional):');
                      handleShare(post.id, message);
                    }}
                    disabled={shareMutation.isLoading}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Start sharing your fitness journey to see posts here</p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Share Your First Post
              </button>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'Friends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Your Friends</h3>
            <button 
              onClick={() => {
                const userId = prompt('Enter user ID to add as friend:');
                if (userId) handleAddFriend(userId);
              }}
              disabled={addFriendMutation.isLoading}
              className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add Friend
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFriends.length > 0 ? (
              displayFriends.map((friend, index) => (
        <motion.div
                key={friend.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-accent/50 rounded-lg border border-border/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
                      friend.status === 'online' ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{friend.name}</h4>
                    <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                  </div>
            </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{friend.lastActivity}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        if (window.confirm(`Remove ${friend.name} from friends?`)) {
                          handleRemoveFriend(friend.id);
                        }
                      }}
                      disabled={removeFriendMutation.isLoading}
                      className="text-destructive hover:text-destructive/80 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                    <button className="text-primary hover:text-primary/80 text-xs font-medium transition-colors">
                      View Profile
                    </button>
                  </div>
          </div>
              </motion.div>
            ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-4">Add friends to see their fitness activities and compete together</p>
                <button 
                  onClick={() => {
                    const userId = prompt('Enter user ID to add as friend:');
                    if (userId) handleAddFriend(userId);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Your First Friend
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'Challenges' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {displayChallenges.length > 0 ? (
            displayChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{challenge.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      challenge.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                      challenge.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <UserGroupIcon className="w-3 h-3 mr-1" />
                      {challenge.participants} participants
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinChallenge(challenge.id)}
                  disabled={joinChallengeMutation.isLoading}
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {joinChallengeMutation.isLoading ? 'Joining...' : 'Join Challenge'}
                </button>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{challenge.progress}%</span>
            </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${challenge.progress}%` }}
                  />
          </div>
          </div>
            </motion.div>
          ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No challenges available</h3>
              <p className="text-muted-foreground mb-4">Check back later for new fitness challenges to join</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'Leaderboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Weekly Leaderboard</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Your rank: #{socialStats.leaderboardPosition}</span>
              <TrophyIcon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            {displayLeaderboard.length > 0 ? (
              displayLeaderboard.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                  user.isCurrentUser 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-accent/50 border border-border/50'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  <span className="text-sm font-bold text-foreground">#{user.rank}</span>
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">Level {user.level} • {user.workouts} workouts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{user.xp?.toLocaleString() || user.score?.toLocaleString() || '0'} XP</p>
                  {user.rank <= 3 && (
                    <div className="flex items-center">
                      {user.rank === 1 && <span className="text-yellow-500">🥇</span>}
                      {user.rank === 2 && <span className="text-gray-400">🥈</span>}
                      {user.rank === 3 && <span className="text-orange-500">🥉</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No leaderboard data</h3>
                <p className="text-muted-foreground mb-4">Complete some workouts to appear on the leaderboard</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SocialPage;

