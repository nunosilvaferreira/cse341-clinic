const express = require('express');
const passport = require('../config/passport');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
  })
);

// Login success route
router.get('/login-success', (req, res) => {
  res.json({
    message: 'Login successful!',
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      role: req.user.role
    },
    endpoints: {
      profile: '/auth/profile',
      logout: '/auth/logout'
    }
  });
});

// Login failure route
router.get('/login-failure', (req, res) => {
  res.status(401).json({
    message: 'GitHub authentication failed'
  });
});

// Get current user profile
router.get('/profile', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
      profileUrl: req.user.profileUrl,
      createdAt: req.user.createdAt
    }
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy(() => {
      res.json({ message: 'Logout successful' });
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      role: req.user.role
    } : null
  });
});

module.exports = router;