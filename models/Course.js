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
  totalSessions: {
    type: Number,
    default: 0
  },
  instructor: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
