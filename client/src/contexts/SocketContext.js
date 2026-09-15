import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [workoutUpdates, setWorkoutUpdates] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id
        }
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to server');
        setConnected(true);
        
        // Join user's personal room
        newSocket.emit('join-user-room', user.id);
        newSocket.emit('join-social-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        setConnected(false);
      });

      // Workout updates
      newSocket.on('workout-update', (data) => {
        setWorkoutUpdates(prev => [...prev, data]);
        
        if (data.type === 'started') {
          toast.success('🏋️ Workout started!');
        } else if (data.type === 'completed') {
          toast.success('🎉 Workout completed!');
        }
      });

      // Progress updates
      newSocket.on('progress-changed', (data) => {
        setProgressUpdates(prev => [...prev, data]);
        toast.success(`📈 Progress updated: ${data.type}`);
      });

      // Social notifications
      newSocket.on('friend-request-received', (data) => {
        toast.success(`👋 Friend request from ${data.from.name}`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Socket event emitters
  const emitWorkoutStarted = (workout) => {
    if (socket && connected) {
      socket.emit('workout-started', {
        userId: user.id,
        workout
      });
    }
  };

  const emitWorkoutCompleted = (workout) => {
    if (socket && connected) {
      socket.emit('workout-completed', {
        userId: user.id,
        workout
      });
    }
  };

  const emitProgressUpdate = (type, value) => {
    if (socket && connected) {
      socket.emit('progress-update', {
        userId: user.id,
        type,
        value
      });
    }
  };

  const sendFriendRequest = (targetUserId, fromUser) => {
    if (socket && connected) {
      socket.emit('friend-request', {
        targetUserId,
        fromUser
      });
    }
  };

  const clearWorkoutUpdates = () => {
    setWorkoutUpdates([]);
  };

  const clearProgressUpdates = () => {
    setProgressUpdates([]);
  };

  const value = {
    socket,
    connected,
    workoutUpdates,
    progressUpdates,
    emitWorkoutStarted,
    emitWorkoutCompleted,
    emitProgressUpdate,
    sendFriendRequest,
    clearWorkoutUpdates,
    clearProgressUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
