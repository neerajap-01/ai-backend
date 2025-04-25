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
  // Set JWT token as HTTP-only cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', 
    sameSite: 'strict',         // Helps prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days - match token expiration
  });
  res.redirect(`${env.CLIENT_URL}/auth/success?source=google&token=${token}`);
});

// GitHub Auth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const token = generateToken(req.user);
  // Set JWT token as HTTP-only cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict',         // Helps prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days - match token expiration
  });
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