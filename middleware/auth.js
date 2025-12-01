// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Role-based authorization middleware
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    
    if (roles.includes(req.session.role)) {
      return next();
    }
    
    res.status(403).render('error', { 
      message: 'Access Denied',
      description: 'You do not have permission to access this resource.'
    });
  };
};

// Check if user is already logged in
const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Redirect based on role
    if (req.session.role === 'student') {
      return res.redirect('/student/dashboard');
    }
    return res.redirect('/dashboard');
  }
  next();
};

// Attach user data to all views
const attachUser = (req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    username: req.session.username,
    fullName: req.session.fullName,
    role: req.session.role,
    email: req.session.email
  } : null;
  next();
};

module.exports = {
  isAuthenticated,
  hasRole,
  isGuest,
  attachUser
};
