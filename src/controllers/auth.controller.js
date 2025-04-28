import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { registerEmailUser, requestPasswordReset, resetPassword, verifyEmail } from "../services/auth.service.js";
import User from "../models/user.model.js";
import { env } from "../config/keys.js";

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || 'user' },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const registerController = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: 'Email, password, and name are required',
        data: null
      });
    }
    
    const result = await registerEmailUser({ email, password, name });
    
    if (!result.success) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: result.message,
        data: null
      });
    }
    
    res.status(201).json({
      statusCode: 201,
      error: 0,
      message: result.message,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: 'Verification token is required',
        data: null
      });
    }
    
    const result = await verifyEmail(token);
    
    if (!result.success) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: result.message,
        data: null
      });
    }
    
    res.status(200).json({
      statusCode: 200,
      error: 0,
      message: result.message,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    });
  }
}

const loginController = async (req, res, next) => {
  try {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) {
        return res.status(500).json({
          statusCode: 500,
          error: 1,
          message: err.message,
          data: null
        });
      }
      
      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          error: 1,
          message: info?.message || 'Authentication failed',
          data: null
        });
      }
      
      if (!user.isVerified && user.authType === 'email') {  // Changed verified to isVerified and authProvider to authType
        return res.status(401).json({
          statusCode: 401,
          error: 1,
          message: 'Please verify your email first',
          data: null
        });
      }
      
      // // Update last login time
      // user.lastLogin = new Date();
      // await user.save();
      
      const token = generateToken(user);
  
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
        cookieOptions.domain = env.CLIENT_URL;
      }
      // Set the cookie with fixed options
      res.cookie('auth_token', token, cookieOptions);
      return res.json({
        statusCode: 200,
        error: 0,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role || 'user'
          }
        }
      });
    })(req, res, next);
  } catch (error) {
    console.log("Error in loginController:", error);
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: 'Email is required',
        data: null
      });
    }
    
    await requestPasswordReset(email);
    
    // For security, don't reveal if user exists or not
    res.status(200).json({
      statusCode: 200,
      error: 0,
      message: 'If your email is registered, you will receive a password reset link',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: 'Server error',
      data: null
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: 'Token and new password are required',
        data: null
      });
    }
    
    const result = await resetPassword(token, password);
    
    if (!result.success) {
      return res.status(400).json({
        statusCode: 400,
        error: 1,
        message: result.message,
        data: null
      });
    }
    
    res.status(200).json({
      statusCode: 200,
      error: 0,
      message: result.message,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: 'Server error',
      data: null
    });
  }
}

// Get current user controller
const getCurrentUserController = async (req, res) => {
  try {
    // req.user is set by passport JWT middleware
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        error: 1,
        message: 'Not authenticated',
        data: null
      });
    }
    
    res.status(200).json({
      statusCode: 200,
      error: 0,
      message: 'User details retrieved successfully',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role || 'user'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: error.message,
      data: null
    });
  }
};

const logoutController = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.json({
      statusCode: 200,
      error: 0,
      message: 'Logged out successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error: 1,
      message: 'Server error',
      data: null
    });
  }
};

export { 
  registerController,
  verifyEmailController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  getCurrentUserController,
  logoutController
};