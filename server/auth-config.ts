import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage-supabase';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not found. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
}

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile.id);
    
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email not provided by Google'));
    }
    
    // First check if user exists by Google ID
    let user = await storage.getUserByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists by email (in case they signed up before with email)
      user = await storage.getUserByEmail(email);
      
      if (user) {
        // User exists but doesn't have Google ID - update their record
        console.log('Updating existing user with Google ID:', user.id);
        // Note: You might want to add an updateUser method to storage
        // For now, we'll just use the existing user
      } else {
        // Create new user
        const name = profile.displayName || email?.split('@')[0] || 'Unknown User';
        
        user = await storage.createUser({
          googleId: profile.id,
          email,
          name,
          avatar: profile.photos?.[0]?.value
        });
        
        console.log('New user created:', user.id);
      }
    } else {
      console.log('Existing user found by Google ID:', user.id);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (user) {
      // Transform to camelCase for consistency
      const transformedUser = {
        id: user.id,
        googleId: user.google_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.created_at
      };
      done(null, transformedUser);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

export { passport }; 