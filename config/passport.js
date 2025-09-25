const passport = require('passport');

// Environment variables verification
console.log('🔐 Initializing Passport Configuration...');

const requiredConfig = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback'
};

// Check if required environment variables are present
const missingVars = Object.entries(requiredConfig)
  .filter(([key, value]) => !value && key !== 'callbackURL')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables for GitHub OAuth:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Production mode: Starting without GitHub authentication');
    // Export passport without GitHub strategy for production safety
    module.exports = passport;
    return;
  } else {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

console.log('✅ GitHub OAuth configuration loaded successfully');

const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Configure GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: requiredConfig.clientID,
  clientSecret: requiredConfig.clientSecret,
  callbackURL: requiredConfig.callbackURL,
  scope: ['user:email'],
  proxy: true // Important for production behind proxy
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log(`🔑 GitHub authentication attempt for user: ${profile.username}`);
    
    // Check if user already exists in database
    let user = await User.findOne({ 
      $or: [
        { githubId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });
    
    if (user) {
      // Update existing user with latest GitHub data
      if (!user.githubId) {
        user.githubId = profile.id;
        await user.save();
      }
      console.log(`✅ Existing user authenticated: ${user.email}`);
      return done(null, user);
    }
    
    // Create new user with GitHub data
    user = await User.create({
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName || profile.username,
      profileUrl: profile.profileUrl,
      avatarUrl: profile.photos?.[0]?.value,
      authProvider: 'github',
      lastLogin: new Date()
    });
    
    console.log(`✅ New user created: ${user.email}`);
    return done(null, user);
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('❌ User deserialization error:', error);
    done(error, null);
  }
});

console.log('✅ Passport configuration completed');

module.exports = passport;