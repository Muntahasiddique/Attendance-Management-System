const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  classRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  instructorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  totalSessions: {
    type: Number,
    default: 30,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
courseSchema.index({ classRef: 1 }); // For finding courses by class
courseSchema.index({ instructorRef: 1 }); // For finding courses by teacher
courseSchema.index({ code: 1 }); // Already unique but explicit

module.exports = mongoose.model('Course', courseSchema);
