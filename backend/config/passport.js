const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'placeholder_google_client_id') {
  
  try {
    logger.info('Initializing Google OAuth strategy with client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...');
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            logger.info('Google OAuth callback received:', {
              profileId: profile.id,
              email: profile.emails?.[0]?.value,
              name: profile.displayName
            });

            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });
            
            if (user) {
              logger.info('Existing Google user found:', user.email);
              return done(null, user);
            }

            // Check if user already exists with this email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await User.findOne({ email: email });
              
              if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                await user.save();
                
                logger.info('Linked Google account to existing user:', user.email);
                return done(null, user);
              }
            }

            // Create new user
            const newUser = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: email,
              avatar: profile.photos?.[0]?.value,
              isVerified: true, // Google accounts are pre-verified
              role: 'user',
              provider: 'google',
              farmLocation: '', // Will be filled later by user
              phone: '' // Will be filled later by user
            });

            logger.info('New Google user created:', newUser.email);
            done(null, newUser);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            done(error, null);
          }
        }
      )
    );
    
    logger.info('Google OAuth strategy initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize Google OAuth strategy:', error.message);
    logger.error('Error details:', error);
  }
  
} else {
  logger.warn('Google OAuth credentials not configured - Google authentication will be unavailable');
}

module.exports = passport;
