const router = require('express').Router();
const Settings = require('../models/Settings');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const multer = require('multer');

let ffmpegProcess = null;
let streamClients = [];

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${req.session.userId}-${uniqueSuffix}${ext}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    const allowedExtensions = /\.(mp4|avi|mov|mkv|webm)$/i;
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload MP4, AVI, MOV, MKV, or WebM'), false);
    }
  }
});

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

// Get camera stream URL for current user
router.get('/api/camera/stream-url', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.json({ cameraType: 'webcam', streamUrl: null });
    }

    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    let settings = await Settings.findOne({ 
      userId: req.session.userId,
      userModel: userModel
    });
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        userId: req.session.userId,
        userModel: userModel
      });
    }
    
    res.json({
      cameraType: settings.cameraType || 'webcam',
      streamUrl: settings.cameraType === 'ip' ? '/api/camera/stream' : null,
      rtspUrl: settings.ipCameraUrl || null,
      videoFilePath: settings.videoFilePath || null
    });
  } catch (error) {
    console.error('Error fetching camera settings:', error);
    res.status(500).json({ error: 'Failed to fetch camera settings' });
  }
});

// Stream RTSP as MJPEG for current user
router.get('/api/camera/stream', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).send('Not authenticated');
    }

    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    const settings = await Settings.findOne({ 
      userId: req.session.userId,
      userModel: userModel
    });
    
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
    
    // Convert RTSP to MJPEG stream with low-latency settings
    const ffmpeg = spawn(ffmpegPath, [
      '-rtsp_transport', 'tcp',
      '-fflags', 'nobuffer',          // Minimize buffering
      '-flags', 'low_delay',          // Low latency mode
      '-strict', 'experimental',
      '-i', settings.ipCameraUrl,
      '-f', 'mjpeg',
      '-q:v', '3',                    // High quality
      '-r', '15',                     // 15 fps - balanced
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

// Test camera connection
router.post('/api/camera/test', async (req, res) => {
  try {
    const { cameraType, ipCameraUrl } = req.body;
    
    if (cameraType === 'webcam' || cameraType === 'usb') {
      return res.json({ 
        success: true, 
        message: 'Webcam/USB camera will be tested when you start recognition' 
      });
    }
    
    if (cameraType === 'ip') {
      if (!ipCameraUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter an IP camera URL' 
        });
      }
      
      // Test RTSP connection with ffmpeg
      const ffmpegPath = getFFmpegPath();
      
      let testProcess;
      let responseHandled = false;
      
      const sendResponse = (data) => {
        if (!responseHandled) {
          responseHandled = true;
          res.json(data);
        }
      };
      
      const timeout = setTimeout(() => {
        if (testProcess) {
          testProcess.kill();
        }
        sendResponse({ 
          success: false, 
          message: 'Connection timeout - camera not responding' 
        });
      }, 10000); // 10 second timeout
      
      testProcess = spawn(ffmpegPath, [
        '-rtsp_transport', 'tcp',
        '-i', ipCameraUrl,
        '-frames:v', '1',
        '-f', 'null',
        '-'
      ]);
      
      let errorOutput = '';
      
      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      testProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0 || errorOutput.includes('Stream #0:0') || errorOutput.includes('Input #0')) {
          sendResponse({ 
            success: true, 
            message: 'Camera connection successful!' 
          });
        } else if (errorOutput.includes('Connection refused') || errorOutput.includes('Connection timed out')) {
          sendResponse({ 
            success: false, 
            message: 'Connection failed - check IP address and port' 
          });
        } else if (errorOutput.includes('401 Unauthorized') || errorOutput.includes('403 Forbidden')) {
          sendResponse({ 
            success: false, 
            message: 'Authentication failed - check username and password' 
          });
        } else if (errorOutput.includes('404 Not Found')) {
          sendResponse({ 
            success: false, 
            message: 'Stream path not found - check RTSP URL path' 
          });
        } else {
          sendResponse({ 
            success: false, 
            message: 'Connection failed - invalid URL or camera offline' 
          });
        }
      });
      
      testProcess.on('error', (err) => {
        clearTimeout(timeout);
        sendResponse({ 
          success: false, 
          message: `Error: ${err.message}` 
        });
      });
      
      return; // Prevent fall-through
    }
    
    res.json({ success: false, message: 'Unknown camera type' });
  } catch (error) {
    console.error('Test camera error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during camera test' 
    });
  }
});

// Upload video file
router.post('/api/camera/upload-video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }
    
    const filePath = req.file.path;
    
    // Update user settings with video file path
    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    await Settings.findOneAndUpdate(
      { userId: req.session.userId, userModel: userModel },
      { videoFilePath: filePath },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      filePath: filePath,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload video' });
  }
});

// Get video file info for current user
router.get('/api/camera/video-info', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    const settings = await Settings.findOne({
      userId: req.session.userId,
      userModel: userModel
    });
    
    if (!settings || !settings.videoFilePath) {
      return res.json({ hasVideo: false });
    }
    
    // Check if file exists
    if (!fs.existsSync(settings.videoFilePath)) {
      return res.json({ hasVideo: false });
    }
    
    res.json({
      hasVideo: true,
      filePath: settings.videoFilePath,
      fileName: path.basename(settings.videoFilePath)
    });
  } catch (error) {
    console.error('Video info error:', error);
    res.status(500).json({ success: false, message: 'Failed to get video info' });
  }
});

// Serve video file for playback
router.get('/api/camera/video-stream', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).send('Not authenticated');
    }
    
    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    const settings = await Settings.findOne({
      userId: req.session.userId,
      userModel: userModel
    });
    
    if (!settings || !settings.videoFilePath) {
      return res.status(404).send('No video file configured');
    }
    
    const videoPath = settings.videoFilePath;
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video file not found');
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Support range requests for video seeking
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      const file = fs.createReadStream(videoPath, { start, end });
      const ext = path.extname(videoPath).toLowerCase();
      const mimeTypes = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/avi',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska'
      };
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeTypes[ext] || 'video/mp4'
      });
      
      file.pipe(res);
    } else {
      const ext = path.extname(videoPath).toLowerCase();
      const mimeTypes = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/avi',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska'
      };
      
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeTypes[ext] || 'video/mp4'
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Video stream error:', error);
    res.status(500).send('Error streaming video');
  }
});

// Delete uploaded video
router.delete('/api/camera/video', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const userModel = req.session.role === 'admin' ? 'Admin' : 'Teacher';
    const settings = await Settings.findOne({
      userId: req.session.userId,
      userModel: userModel
    });
    
    if (settings && settings.videoFilePath && fs.existsSync(settings.videoFilePath)) {
      fs.unlinkSync(settings.videoFilePath);
    }
    
    await Settings.findOneAndUpdate(
      { userId: req.session.userId, userModel: userModel },
      { videoFilePath: '' }
    );
    
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete video' });
  }
});

module.exports = router;
