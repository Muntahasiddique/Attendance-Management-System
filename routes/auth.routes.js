const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { Admin, Student } = require('../models');

// Login Page
router.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    // Redirect all authenticated users to main dashboard
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Try to find user in Admin collection
    let user = await Admin.findOne({ email: email.toLowerCase() });
    let userType = 'admin';

    // If not found in Admin, try Student collection
    if (!user) {
      user = await Student.findOne({ email: email.toLowerCase() }).populate('classRef');
      userType = 'student';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Update last login for admins
    if (userType === 'admin') {
      user.lastLogin = new Date();
      await user.save();
    }

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.fullName = user.fullName;
    req.session.email = user.email;
    req.session.role = userType === 'student' ? 'student' : user.role;

    // Return redirect URL - all users go to main dashboard
    const redirectUrl = '/dashboard';
    res.json({ success: true, redirect: redirectUrl, role: req.session.role });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true, redirect: '/login' });
  });
});

// Logout GET (for direct link access)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;