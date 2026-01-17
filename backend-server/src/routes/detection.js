const express = require('express');
const router = express.Router();
const animalDetectionService = require('../services/simpleRealDetection');

// Start animal detection
router.post('/start', async (req, res) => {
  try {
    // Set camera URL if provided in request
    if (req.body.cameraUrl) {
      console.log('🔧 Setting camera URL from request:', req.body.cameraUrl);
      animalDetectionService.setCameraUrl(req.body.cameraUrl);
    }
    
    const result = await animalDetectionService.startDetection();
    res.json(result);
  } catch (error) {
    console.error('Error starting detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start animal detection',
      error: error.message
    });
  }
});

// Stop animal detection
router.post('/stop', (req, res) => {
  try {
    const result = animalDetectionService.stopDetection();
    res.json(result);
  } catch (error) {
    console.error('Error stopping detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop animal detection',
      error: error.message
    });
  }
});

// Get detection status
router.get('/status', (req, res) => {
  try {
    const status = animalDetectionService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting detection status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detection status',
      error: error.message
    });
  }
});

// Update detection settings
router.put('/settings', (req, res) => {
  try {
    const { cameraUrl, detectionInterval } = req.body;
    animalDetectionService.updateSettings({ cameraUrl, detectionInterval });
    res.json({
      success: true,
      message: 'Detection settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating detection settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update detection settings',
      error: error.message
    });
  }
});

module.exports = router;