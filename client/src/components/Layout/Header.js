import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };


  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-background border-b border-border sticky top-0 z-30 backdrop-blur-md bg-background/95 w-full"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">FitTribe</span>
            </div>
          </div>

          {/* Center - Quick Stats */}
          <div className="flex-1 flex justify-center items-center">
            {/* Quick Stats */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-accent/50 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-muted-foreground">Today's Goal:</span>
                <span className="text-sm font-medium text-foreground">75%</span>
                <div className="w-12 h-1.5 bg-muted rounded-full">
                  <div className="w-9 h-1.5 bg-primary rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-accent/50 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-muted-foreground">Streak:</span>
                <span className="text-sm font-medium text-foreground">12 days</span>
                <span className="text-base">🔥</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <SunIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Light</span>
                </>
              ) : (
                <>
                  <MoonIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Dark</span>
                </>
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center ring-2 ring-primary/20"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-5 h-5 text-primary-foreground" />
                  )}
                </motion.div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-popover rounded-lg shadow-lg ring-1 ring-border focus:outline-none">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-popover-foreground">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => navigate('/profile')}
                          className={`${
                            active ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                          } flex items-center w-full px-4 py-2 text-sm transition-colors`}
                        >
                          <UserCircleIcon className="mr-3 h-4 w-4" />
                          Your Profile
                        </motion.button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => navigate('/settings')}
                          className={`${
                            active ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                          } flex items-center w-full px-4 py-2 text-sm transition-colors`}
                        >
                          <Cog6ToothIcon className="mr-3 h-4 w-4" />
                          Settings
                        </motion.button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
                          } flex items-center w-full px-4 py-2 text-sm transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                          Sign out
                        </motion.button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

      </div>
    </motion.header>
  );
};

export default Header;
