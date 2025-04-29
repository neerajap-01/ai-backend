import express from 'express';
import passport from '../config/passport.js';
import { forgotPasswordController, loginController, logoutController, registerController, resetPasswordController, verifyEmailController } from '../controllers/auth.controller.js';
import { env } from '../config/keys.js';
import { generateToken } from '../services/auth.service.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { 
  session: false,
  failureRedirect: `${env.CLIENT_URL}/auth/error?source=google` 
}), (req, res) => {
  const token = generateToken(req.user);
  // Extract domain from CLIENT_URL if needed
  // For localhost development, don't set domain at all
  let cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', 
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Set path to root
  };
  
  // Only add domain in production for cross-subdomain support
  if (env.NODE_ENV === 'production' && env.CLIENT_URL) {
    // Extract just the domain part from CLIENT_URL
    try {
      const url = new URL(env.CLIENT_URL);
      cookieOptions.domain = url.hostname;
    } catch (err) {
      console.error('Invalid CLIENT_URL format', err);
    }
  }
  // Set the cookie with fixed options
  res.cookie('auth_token', token, cookieOptions);
  res.redirect(`${env.CLIENT_URL}/auth/success?source=google&token=${token}`);
});

// GitHub Auth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const token = generateToken(req.user);
  // Extract domain from CLIENT_URL if needed
  // For localhost development, don't set domain at all
  let cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', 
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Set path to root
  };
  
  // Only add domain in production for cross-subdomain support
  if (env.NODE_ENV === 'production' && env.CLIENT_URL) {
    // Extract just the domain part from CLIENT_URL
    try {
      const url = new URL(env.CLIENT_URL);
      cookieOptions.domain = url.hostname;
    } catch (err) {
      console.error('Invalid CLIENT_URL format', err);
    }
  }
  // Set the cookie with fixed options
  res.cookie('auth_token', token, cookieOptions);
  res.redirect(`${env.CLIENT_URL}/auth/success?source=github&token=${token}`);
});

// Local Auth Routes
router.post('/register', registerController);
router.get('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.get('/logout', logoutController);

router.get('/profile/:userId', authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

export default router;