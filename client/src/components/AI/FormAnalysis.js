import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { VideoCameraIcon, PlayIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const FormAnalysis = ({ onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setUploadedVideo(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post('/api/ai/form-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadedVideo(URL.createObjectURL(file));
        setAnalysisResult(response.data.analysis);
      } else {
        setError(response.data.message || 'Failed to analyze form');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <VideoCameraIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Form Analysis</h2>
              <p className="text-sm text-muted-foreground">Upload a workout video for AI-powered form analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        {!uploadedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <VideoCameraIcon className="w-12 h-12 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Upload Workout Video</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video of your exercise to get AI-powered form analysis and technique feedback
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('form-analysis-input').click()}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <VideoCameraIcon className="w-5 h-5" />
                <span>Upload Video</span>
              </motion.button>

              <input
                id="form-analysis-input"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Form...</h3>
            <p className="text-sm text-muted-foreground">AI is analyzing your exercise technique and form</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {uploadedVideo && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Video Player */}
            <div className="relative">
              <video
                src={uploadedVideo}
                controls
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                AI Analyzed
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Overall Form Score</h3>
                <div className="text-3xl font-bold text-primary">{analysisResult.overallScore}/100</div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${analysisResult.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{analysisResult.feedback}</p>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correct Form Points */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-foreground">Good Points</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.goodPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-foreground flex items-start space-x-2"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold text-foreground">Areas to Improve</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-foreground flex items-start space-x-2"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exercise Breakdown */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">Exercise Breakdown</h4>
              <div className="space-y-3">
                {analysisResult.exerciseBreakdown.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                  >
                    <div>
                      <h5 className="font-medium text-foreground">{exercise.name}</h5>
                      <p className="text-sm text-muted-foreground">{exercise.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{exercise.score}/100</div>
                      <div className="w-16 bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${exercise.score}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-sm text-foreground flex items-start space-x-2"
                  >
                    <PlayIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {uploadedVideo && (
          <div className="flex justify-end space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setUploadedVideo(null);
                setAnalysisResult(null);
                setError(null);
              }}
              className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              Analyze Another
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Done
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FormAnalysis;
