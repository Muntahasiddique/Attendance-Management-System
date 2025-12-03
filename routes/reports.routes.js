const router = require('express').Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { Attendance, Student, Class, Course } = require('../models');

// Admin reports - all attendance records
router.get('/api/reports/admin-data', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const { dateFrom, dateTo, classId, status, search } = req.query;
    
    let query = {};
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.sessionDate = {};
      if (dateFrom) query.sessionDate.$gte = new Date(dateFrom);
      if (dateTo) query.sessionDate.$lte = new Date(dateTo);
    }
    
    // Class filter
    if (classId) {
      query.classRef = classId;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    let attendanceRecords = await Attendance.find(query)
      .populate('studentRef', 'fullName rollNo')
      .populate('classRef', 'name')
      .populate('courseRef', 'name')
      .sort({ sessionDate: -1, timestamp: -1 })
      .lean();
    
    // Search filter (after population)
    if (search) {
      attendanceRecords = attendanceRecords.filter(record => 
        record.studentRef?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        record.studentRef?.rollNo?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Calculate summary stats
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const avgAttendance = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
    
    res.json({
      records: attendanceRecords,
      summary: {
        totalRecords,
        avgAttendance,
        lateCount,
        absentCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher reports - only their assigned courses
router.get('/api/reports/teacher-data', isAuthenticated, hasRole('teacher'), async (req, res) => {
  try {
    const teacherId = req.session.userId;
    const { dateFrom, dateTo, classId, status, search } = req.query;
    
    // Get teacher's courses
    const teacherCourses = await Course.find({ instructorRef: teacherId }).select('_id');
    const courseIds = teacherCourses.map(c => c._id);
    
    let query = { courseRef: { $in: courseIds } };
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.sessionDate = {};
      if (dateFrom) query.sessionDate.$gte = new Date(dateFrom);
      if (dateTo) query.sessionDate.$lte = new Date(dateTo);
    }
    
    // Class filter
    if (classId) {
      query.classRef = classId;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    let attendanceRecords = await Attendance.find(query)
      .populate('studentRef', 'fullName rollNo')
      .populate('classRef', 'name')
      .populate('courseRef', 'name')
      .sort({ sessionDate: -1, timestamp: -1 })
      .lean();
    
    // Search filter
    if (search) {
      attendanceRecords = attendanceRecords.filter(record => 
        record.studentRef?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        record.studentRef?.rollNo?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Calculate summary stats
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const avgAttendance = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
    
    res.json({
      records: attendanceRecords,
      summary: {
        totalRecords,
        avgAttendance,
        lateCount,
        absentCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student reports - only their own attendance
router.get('/api/reports/student-data', isAuthenticated, hasRole('student'), async (req, res) => {
  try {
    const studentId = req.session.userId;
    const { dateFrom, dateTo, status } = req.query;
    
    let query = { studentRef: studentId };
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.sessionDate = {};
      if (dateFrom) query.sessionDate.$gte = new Date(dateFrom);
      if (dateTo) query.sessionDate.$lte = new Date(dateTo);
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const attendanceRecords = await Attendance.find(query)
      .populate('classRef', 'name')
      .populate('courseRef', 'name')
      .sort({ sessionDate: -1, timestamp: -1 })
      .lean();
    
    // Calculate summary stats
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const avgAttendance = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
    
    res.json({
      records: attendanceRecords,
      summary: {
        totalRecords,
        avgAttendance,
        lateCount,
        absentCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all classes (for filter dropdown)
router.get('/api/reports/classes', isAuthenticated, async (req, res) => {
  try {
    const classes = await Class.find().select('name semester section').sort({ name: 1, semester: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
