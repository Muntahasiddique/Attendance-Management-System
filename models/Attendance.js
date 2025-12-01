const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  classRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  markedBy: {
    type: String,
    enum: ['facial_recognition', 'manual', 'system'],
    default: 'facial_recognition'
  },
  sessionDate: {
    type: Date,
    required: true
  }
});

// Index for efficient querying
attendanceSchema.index({ studentRef: 1, sessionDate: 1 });
attendanceSchema.index({ courseRef: 1, sessionDate: 1 });
attendanceSchema.index({ classRef: 1, sessionDate: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
