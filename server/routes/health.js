const express = require('express');
const { BodyMeasurement, Sleep, HeartRate, Stress, Steps } = require('../models/Health');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Body Measurements Routes
// @route   GET /api/health/measurements
// @desc    Get body measurements
// @access  Private
router.get('/measurements', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (startDate && endDate) {
      filter.measuredAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const measurements = await BodyMeasurement.find(filter)
      .sort({ measuredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BodyMeasurement.countDocuments(filter);

    res.json({
      success: true,
      measurements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/health/measurements
// @desc    Add body measurement
// @access  Private
router.post('/measurements', auth, async (req, res) => {
  try {
    const measurementData = {
      ...req.body,
      user: req.user.id
    };

    const measurement = new BodyMeasurement(measurementData);
    await measurement.save();

    res.status(201).json({
      success: true,
      message: 'Measurement recorded successfully',
      measurement
    });
  } catch (error) {
    console.error('Add measurement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Sleep Routes
// @route   GET /api/health/sleep
// @desc    Get sleep records
// @access  Private
router.get('/sleep', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const sleep = await Sleep.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sleep.countDocuments(filter);

    res.json({
      success: true,
      sleep,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get sleep error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/health/sleep
// @desc    Add sleep record
// @access  Private
router.post('/sleep', auth, async (req, res) => {
  try {
    const sleepData = {
      ...req.body,
      user: req.user.id
    };

    // Calculate sleep efficiency
    if (sleepData.bedtime && sleepData.wakeTime) {
      const bedtime = new Date(sleepData.bedtime);
      const wakeTime = new Date(sleepData.wakeTime);
      const totalTimeInBed = (wakeTime - bedtime) / (1000 * 60); // in minutes
      const totalSleep = sleepData.totalSleep || 0;
      
      if (totalTimeInBed > 0) {
        sleepData.sleepEfficiency = Math.round((totalSleep / totalTimeInBed) * 100);
      }
    }

    const sleep = new Sleep(sleepData);
    await sleep.save();

    res.status(201).json({
      success: true,
      message: 'Sleep record added successfully',
      sleep
    });
  } catch (error) {
    console.error('Add sleep error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Heart Rate Routes
// @route   GET /api/health/heartrate
// @desc    Get heart rate records
// @access  Private
router.get('/heartrate', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.measuredAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const heartRate = await HeartRate.find(filter)
      .sort({ measuredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HeartRate.countDocuments(filter);

    res.json({
      success: true,
      heartRate,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get heart rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/health/heartrate
// @desc    Add heart rate record
// @access  Private
router.post('/heartrate', auth, async (req, res) => {
  try {
    const heartRateData = {
      ...req.body,
      user: req.user.id
    };

    const heartRate = new HeartRate(heartRateData);
    await heartRate.save();

    res.status(201).json({
      success: true,
      message: 'Heart rate recorded successfully',
      heartRate
    });
  } catch (error) {
    console.error('Add heart rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Stress Routes
// @route   GET /api/health/stress
// @desc    Get stress records
// @access  Private
router.get('/stress', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (startDate && endDate) {
      filter.measuredAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stress = await Stress.find(filter)
      .sort({ measuredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Stress.countDocuments(filter);

    res.json({
      success: true,
      stress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get stress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/health/stress
// @desc    Add stress record
// @access  Private
router.post('/stress', auth, async (req, res) => {
  try {
    const stressData = {
      ...req.body,
      user: req.user.id
    };

    const stress = new Stress(stressData);
    await stress.save();

    res.status(201).json({
      success: true,
      message: 'Stress level recorded successfully',
      stress
    });
  } catch (error) {
    console.error('Add stress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Steps Routes
// @route   GET /api/health/steps
// @desc    Get steps records
// @access  Private
router.get('/steps', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = { user: req.user.id };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const steps = await Steps.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Steps.countDocuments(filter);

    res.json({
      success: true,
      steps,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/health/steps
// @desc    Add steps record
// @access  Private
router.post('/steps', auth, async (req, res) => {
  try {
    const stepsData = {
      ...req.body,
      user: req.user.id
    };

    const steps = new Steps(stepsData);
    await steps.save();

    res.status(201).json({
      success: true,
      message: 'Steps recorded successfully',
      steps
    });
  } catch (error) {
    console.error('Add steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/health/dashboard
// @desc    Get health dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Get start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's data
    const [sleep, steps, heartRate, stress, measurements] = await Promise.all([
      Sleep.findOne({ user: req.user.id, date: targetDate }),
      Steps.findOne({ user: req.user.id, date: targetDate }),
      HeartRate.find({ 
        user: req.user.id, 
        measuredAt: { $gte: startOfDay, $lte: endOfDay } 
      }).sort({ measuredAt: -1 }),
      Stress.find({ 
        user: req.user.id, 
        measuredAt: { $gte: startOfDay, $lte: endOfDay } 
      }).sort({ measuredAt: -1 }),
      BodyMeasurement.find({ user: req.user.id })
        .sort({ measuredAt: -1 })
        .limit(1)
    ]);

    // Calculate averages
    const avgHeartRate = heartRate.length > 0 
      ? Math.round(heartRate.reduce((sum, hr) => sum + hr.heartRate, 0) / heartRate.length)
      : null;

    const avgStress = stress.length > 0 
      ? Math.round(stress.reduce((sum, s) => sum + s.score, 0) / stress.length)
      : null;

    // Get recent trends (last 7 days)
    const weekAgo = new Date(targetDate);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [recentSleep, recentSteps, recentMeasurements] = await Promise.all([
      Sleep.find({ 
        user: req.user.id, 
        date: { $gte: weekAgo, $lte: targetDate } 
      }).sort({ date: -1 }),
      Steps.find({ 
        user: req.user.id, 
        date: { $gte: weekAgo, $lte: targetDate } 
      }).sort({ date: -1 }),
      BodyMeasurement.find({ 
        user: req.user.id, 
        measuredAt: { $gte: weekAgo, $lte: endOfDay } 
      }).sort({ measuredAt: -1 })
    ]);

    res.json({
      success: true,
      dashboard: {
        today: {
          sleep,
          steps,
          heartRate: avgHeartRate,
          stress: avgStress,
          measurements: measurements[0] || null
        },
        trends: {
          sleep: recentSleep,
          steps: recentSteps,
          measurements: recentMeasurements
        },
        insights: {
          sleepQuality: sleep?.sleepQuality || 'unknown',
          activityLevel: steps?.steps > 10000 ? 'high' : steps?.steps > 5000 ? 'moderate' : 'low',
          stressLevel: avgStress > 7 ? 'high' : avgStress > 4 ? 'moderate' : 'low'
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
