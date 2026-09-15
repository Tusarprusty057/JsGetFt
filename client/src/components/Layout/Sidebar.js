import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  UserGroupIcon,
  TrophyIcon,
  CogIcon,
  XMarkIcon,
  UserIcon,
  CameraIcon,
  ChartPieIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, emoji: '📊' },
  { name: 'Workouts', href: '/workouts', icon: FireIcon, emoji: '💪' },
  { name: 'Nutrition', href: '/nutrition', icon: HeartIcon, emoji: '🍎' },
  { name: 'Progress', href: '/progress', icon: ChartPieIcon, emoji: '📈' },
  { name: 'Social', href: '/social', icon: UserGroupIcon, emoji: '👥' },
];

const quickActions = [
  { name: 'AI Food Scanner', href: '/nutrition', icon: CameraIcon, emoji: '📸' },
  { name: 'Log Workout', href: '/workouts/create', icon: PlusIcon, emoji: '➕' },
];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: open ? 0 : -320,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border shadow-xl transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-full lg:h-full`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  FitTribe
                </h1>
                <p className="text-xs text-muted-foreground">Fitness Companion</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center ring-2 ring-primary/20">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Level {user?.gamification?.level || 1} • {user?.gamification?.totalPoints || 0} XP
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <span className="text-lg mr-3">{item.emoji}</span>
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-2 h-2 bg-primary-foreground rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-border">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate(action.href);
                      setOpen(false);
                    }}
                    className="group flex items-center w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200"
                  >
                    <span className="text-lg mr-3">{action.emoji}</span>
                    <span className="flex-1 text-left">{action.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">F</span>
                </div>
                <span className="text-xs text-muted-foreground">FitTribe v2.0</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
