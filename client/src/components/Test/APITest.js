import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const APITest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState({});

  const testEndpoint = async (name, endpoint, method = 'GET', data = null) => {
    setIsLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await axios({
        method,
        url: endpoint,
        data,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'success',
          data: response.data,
          statusCode: response.status
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error.response?.data || error.message,
          statusCode: error.response?.status
        }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const endpoints = [
    { name: 'Dashboard Data', endpoint: '/api/dashboard', method: 'GET' },
    { name: 'Nutrition Summary', endpoint: '/api/nutrition/summary', method: 'GET' },
    { name: 'Workouts List', endpoint: '/api/workouts', method: 'GET' },
    { name: 'Progress Dashboard', endpoint: '/api/progress/dashboard', method: 'GET' },
    { name: 'Food Search', endpoint: '/api/nutrition/foods/search?q=apple', method: 'GET' },
    { name: 'Exercises List', endpoint: '/api/workouts/exercises', method: 'GET' }
  ];

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h2 className="text-xl font-bold text-foreground mb-4">API Integration Test</h2>
      <p className="text-muted-foreground mb-6">
        Test all API endpoints to verify backend connectivity and data flow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {endpoints.map((endpoint) => (
          <motion.div
            key={endpoint.name}
            className="bg-accent/50 rounded-lg p-4 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{endpoint.name}</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => testEndpoint(endpoint.name, endpoint.endpoint, endpoint.method)}
                disabled={isLoading[endpoint.name]}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
              >
                {isLoading[endpoint.name] ? 'Testing...' : 'Test'}
              </motion.button>
            </div>
            
            <div className="text-xs text-muted-foreground mb-2">
              {endpoint.method} {endpoint.endpoint}
            </div>

            {testResults[endpoint.name] && (
              <div className="mt-3">
                <div className={`text-sm font-medium mb-2 ${
                  testResults[endpoint.name].status === 'success' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {testResults[endpoint.name].status === 'success' ? '✅ Success' : '❌ Error'}
                  {testResults[endpoint.name].statusCode && (
                    <span className="ml-2 text-xs">
                      ({testResults[endpoint.name].statusCode})
                    </span>
                  )}
                </div>
                
                {testResults[endpoint.name].status === 'success' ? (
                  <div className="text-xs text-muted-foreground">
                    <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(testResults[endpoint.name].data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-xs text-red-500">
                    <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(testResults[endpoint.name].error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Test Summary</h3>
        <div className="text-sm text-muted-foreground">
          <p>• Test each endpoint to verify API connectivity</p>
          <p>• Check for proper authentication and data structure</p>
          <p>• Verify error handling and response formats</p>
          <p>• All endpoints should return proper JSON responses</p>
        </div>
      </div>
    </div>
  );
};

export default APITest;

