const router = require('express').Router();
const Settings = require('../models/Settings');

// Get camera stream URL
router.get('/api/camera/stream-url', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      return res.json({ cameraType: 'webcam', streamUrl: null });
    }
    
    res.json({
      cameraType: settings.cameraType || 'webcam',
      streamUrl: settings.cameraType === 'ip' ? settings.ipCameraUrl : null,
      resolution: settings.resolution || '720p'
    });
  } catch (error) {
    console.error('Error fetching camera settings:', error);
    res.status(500).json({ error: 'Failed to fetch camera settings' });
  }
});

module.exports = router;
