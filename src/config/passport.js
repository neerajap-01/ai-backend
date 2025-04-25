import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { env } from './keys.js';

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy (Email/Password)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      
      // If user was created with social login and has no password
      if (!user.password) {
        return done(null, false, { message: 'Invalid login method' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        password: profile.id, // Use Google ID as password for social login
        profilePicture: profile.photos[0].value,
        authType: 'google',
        isVerified: true
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ githubId: profile.id });
    
    if (!user) {
      // Create new user if doesn't exist
      const email = profile.emails && profile.emails[0].value;
      
      user = await User.create({
        githubId: profile.id,
        email: email,
        name: profile.displayName || profile.username,
        password: profile.id, // Use GitHub ID as password for social login
        profilePicture: profile.photos && profile.photos[0].value,
        authType: 'github',
        isVerified: true
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['auth_token'];
  }
  return token;
};

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    cookieExtractor
  ]),
  secretOrKey: env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;