const express = require('express');
const passport = require('passport');
const router = express.Router();

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth authentication
 *     description: Redirects to GitHub for OAuth authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: Handles the callback from GitHub OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to API docs on success, login on failure
 *       500:
 *         description: Internal server error
 */
router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/auth/failure',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication
    console.log(`✅ User ${req.user.email} logged in successfully`);
    
    // Redirect based on context, fallback to Swagger docs
    const redirectUrl = req.session.returnTo || '/api-docs';
    delete req.session.returnTo;
    
    res.redirect(redirectUrl);
  }
);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check authentication status
 *     description: Returns the current authentication status and user info
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   nullable: true
 */
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user.getPublicProfile() : null,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Ends the user session and logs them out
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Internal server error
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      
      res.json({
        message: 'Successfully logged out',
        timestamp: new Date().toISOString()
      });
    });
  });
});

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: Authentication failure
 *     description: Endpoint for handling authentication failures
 *     tags: [Authentication]
 *     responses:
 *       401:
 *         description: Authentication failed
 */
router.get('/failure', (req, res) => {
  const message = req.session.messages ? req.session.messages[0] : 'Authentication failed';
  
  res.status(401).json({
    error: 'Authentication failed',
    message: message,
    retryUrl: '/auth/github'
  });
});

/**
 * @swagger
 * /auth/protected:
 *   get:
 *     summary: Protected route example
 *     description: Example of a protected route that requires authentication
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed protected route
 *       401:
 *         description: Not authenticated
 */
router.get('/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'This route requires authentication'
    });
  }
  
  res.json({
    message: 'Welcome to protected route!',
    user: req.user.getPublicProfile(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;