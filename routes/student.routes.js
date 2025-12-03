const router = require('express').Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Student Dashboard
router.get('/dashboard', isAuthenticated, hasRole('student'), (req, res) => {
  res.render('dashboard');
});

// Student Attendance View
router.get('/attendance', isAuthenticated, hasRole('student'), (req, res) => {
  res.render('student/attendance');
});

module.exports = router;
