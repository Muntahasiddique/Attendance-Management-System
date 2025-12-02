const router = require('express').Router();
const Settings = require('../models/Settings');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let ffmpegProcess = null;
let streamClients = [];

// Find FFmpeg path
function getFFmpegPath() {
  let ffmpegPath = 'ffmpeg';
  
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
          }
        }
      }
    } catch (e) {
      // Use default
    }
  }
  
  return ffmpegPath;
}

// Get camera stream URL
router.get('/api/camera/stream-url', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      return res.json({ cameraType: 'webcam', streamUrl: null });
    }
    
    res.json({
      cameraType: settings.cameraType || 'webcam',
      streamUrl: settings.cameraType === 'ip' ? '/api/camera/stream' : null,
      rtspUrl: settings.ipCameraUrl || null,
      resolution: settings.resolution || '720p'
    });
  } catch (error) {
    console.error('Error fetching camera settings:', error);
    res.status(500).json({ error: 'Failed to fetch camera settings' });
  }
});

// Stream RTSP as MJPEG
router.get('/api/camera/stream', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: true });
    
    if (!settings || !settings.ipCameraUrl) {
      return res.status(400).send('IP camera not configured');
    }
    
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=--boundary',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive'
    });
    
    const ffmpegPath = getFFmpegPath();
    
    // Convert RTSP to MJPEG stream
    const ffmpeg = spawn(ffmpegPath, [
      '-rtsp_transport', 'tcp',
      '-i', settings.ipCameraUrl,
      '-f', 'mjpeg',
      '-q:v', '5',
      '-r', '15',
      '-s', '1280x720',
      '-'
    ]);
    
    let buffer = Buffer.alloc(0);
    
    ffmpeg.stdout.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      
      // Find JPEG markers (FFD8 = start, FFD9 = end)
      let start = 0;
      while (start < buffer.length - 1) {
        const jpegStart = buffer.indexOf(Buffer.from([0xFF, 0xD8]), start);
        if (jpegStart === -1) break;
        
        const jpegEnd = buffer.indexOf(Buffer.from([0xFF, 0xD9]), jpegStart + 2);
        if (jpegEnd === -1) break;
        
        // Extract complete JPEG frame
        const frame = buffer.slice(jpegStart, jpegEnd + 2);
        
        // Write as multipart frame
        res.write('--boundary\r\n');
        res.write('Content-Type: image/jpeg\r\n');
        res.write(`Content-Length: ${frame.length}\r\n\r\n`);
        res.write(frame);
        res.write('\r\n');
        
        start = jpegEnd + 2;
      }
      
      // Keep remaining incomplete data
      buffer = buffer.slice(start);
    });
    
    ffmpeg.stderr.on('data', () => {
      // Suppress FFmpeg logs
    });
    
    ffmpeg.on('error', (err) => {
      console.error('FFmpeg error:', err);
    });
    
    req.on('close', () => {
      ffmpeg.kill();
    });
    
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).send('Stream error');
  }
});

// Start RTSP stream (legacy endpoint for compatibility)
router.post('/api/camera/start-stream', async (req, res) => {
  res.json({ success: true });
});

// Stop RTSP stream (legacy endpoint for compatibility)
router.post('/api/camera/stop-stream', async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
