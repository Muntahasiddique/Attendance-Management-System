const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Camera Settings
  cameraType: {
    type: String,
    enum: ['webcam', 'usb', 'ip'],
    default: 'webcam'
  },
  ipCameraUrl: {
    type: String,
    default: ''
  },
  resolution: {
    type: String,
    enum: ['1080p', '720p', '480p'],
    default: '720p'
  },
  
  // Time Settings
  workStartTime: {
    type: String,
    default: '09:00'
  },
  lateCutoffTime: {
    type: String,
    default: '09:15'
  },
  workEndTime: {
    type: String,
    default: '17:00'
  },
  timezone: {
    type: String,
    default: 'UTC-5'
  },
  
  // AI Recognition Settings
  matchingThreshold: {
    type: Number,
    default: 0.75,
    min: 0.5,
    max: 0.95
  },
  detectionModel: {
    type: String,
    enum: ['hog', 'cnn'],
    default: 'cnn'
  },
  minimumFaceSize: {
    type: Number,
    default: 60
  },
  
  // Notification Settings
  unknownPersonAlert: {
    type: Boolean,
    default: true
  },
  lateArrivalAlert: {
    type: Boolean,
    default: true
  },
  dailySummaryEmail: {
    type: Boolean,
    default: true
  },
  systemHealthAlerts: {
    type: Boolean,
    default: true
  },
  
  // Singleton pattern - only one settings document
  singleton: {
    type: Boolean,
    default: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
