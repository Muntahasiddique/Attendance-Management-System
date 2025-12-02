const router = require('express').Router();
const Settings = require('../models/Settings');
const Stream = require('node-rtsp-stream');
const WebSocket = require('ws');

let activeStream = null;
let wsServer = null;

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
      resolution: settings.resolution || '720p',
      wsPort: 9999 // WebSocket port for RTSP stream
    });
  } catch (error) {
    console.error('Error fetching camera settings:', error);
    res.status(500).json({ error: 'Failed to fetch camera settings' });
  }
});

// Start RTSP stream
router.post('/api/camera/start-stream', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: true });
    
    if (!settings || settings.cameraType !== 'ip' || !settings.ipCameraUrl) {
      return res.status(400).json({ error: 'IP camera not configured' });
    }
    
    // Stop existing stream if any
    if (activeStream) {
      try {
        activeStream.stop();
      } catch (e) {
        console.log('Error stopping previous stream:', e.message);
      }
      activeStream = null;
    }
    
    // Start new RTSP stream
    try {
      // Find FFmpeg path
      const path = require('path');
      const fs = require('fs');
      const os = require('os');
      
      let ffmpegPath = 'ffmpeg'; // Default
      
      // Try to find FFmpeg in common WinGet location
      if (os.platform() === 'win32') {
        const username = os.userInfo().username;
        const wingetPath = `C:\\Users\\${username}\\AppData\\Local\\Microsoft\\WinGet\\Packages`;
        
        try {
          if (fs.existsSync(wingetPath)) {
            const items = fs.readdirSync(wingetPath);
            const ffmpegDir = items.find(item => item.startsWith('Gyan.FFmpeg'));
            
            if (ffmpegDir) {
              const possiblePath = path.join(wingetPath, ffmpegDir, 'ffmpeg-8.0.1-full_build', 'bin', 'ffmpeg.exe');
              if (fs.existsSync(possiblePath)) {
                ffmpegPath = possiblePath;
                console.log('Using FFmpeg from:', ffmpegPath);
              }
            }
          }
        } catch (e) {
          console.log('Could not auto-detect FFmpeg path, using default');
        }
      }
      
      activeStream = new Stream({
        name: 'ip-camera-stream',
        streamUrl: settings.ipCameraUrl,
        wsPort: 9999,
        ffmpegPath: ffmpegPath,
        ffmpegOptions: {
          '-stats': '',
          '-r': 30, // 30 fps
          '-s': '1280x720', // Resolution
          '-quality': 'realtime',
          '-b:v': '1000k' // Bitrate
        }
      });
      
      console.log('RTSP stream started on WebSocket port 9999');
      console.log('Streaming from:', settings.ipCameraUrl);
      res.json({ success: true, wsPort: 9999 });
    } catch (streamError) {
      console.error('Stream creation error:', streamError);
      res.status(500).json({ 
        error: 'Failed to start stream', 
        message: streamError.message,
        hint: 'Make sure FFmpeg is installed and the RTSP URL is correct'
      });
    }
  } catch (error) {
    console.error('Error starting RTSP stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

// Stop RTSP stream
router.post('/api/camera/stop-stream', async (req, res) => {
  try {
    if (activeStream) {
      activeStream.stop();
      activeStream = null;
      console.log('RTSP stream stopped');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error stopping RTSP stream:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
});

module.exports = router;
