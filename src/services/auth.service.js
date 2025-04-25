import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import { env } from '../config/keys.js';
import { sendEmailWithHtml } from './email.service.js';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      authType: user.authType
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Email template helpers
const getEmailHeader = () => `
  <div style="background-color: #f7f7f7; padding: 20px 0; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
      <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${env.APP_NAME || 'AI Platform'}</h1>
      </div>
      <div style="padding: 30px;">
`;

const getEmailFooter = () => `
      </div>
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} ${env.APP_NAME || 'AI Platform'}. All rights reserved.</p>
        <p>If you did not request this email, please ignore it or <a href="${env.CLIENT_URL}/contact" style="color: #4F46E5; text-decoration: none;">contact support</a>.</p>
      </div>
    </div>
  </div>
`;

const getButton = (text, url, isPrimary = true) => `
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" 
      style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; text-align: center; 
      text-decoration: none; border-radius: 6px; 
      background-color: ${isPrimary ? '#4F46E5' : '#ffffff'}; 
      color: ${isPrimary ? '#ffffff' : '#4F46E5'}; 
      border: ${isPrimary ? 'none' : '1px solid #4F46E5'};
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      ${text}
    </a>
  </div>
`;

// Send verification email
export const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  
  const emailHtml = `
    ${getEmailHeader()}
      <h2 style="color: #333; margin-top: 0; font-size: 20px;">Welcome, ${name || 'there'}!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for joining ${env.APP_NAME || 'our platform'}. We're excited to have you!</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">To get started, please verify your email address by clicking the button below:</p>
      ${getButton('Verify Email Address', verificationUrl)}
      <p style="color: #555; font-size: 16px; line-height: 1.5;">This link will expire in 24 hours. If you don't verify your email within that time, you'll need to request a new verification link.</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p style="background-color: #f7f7f7; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
    ${getEmailFooter()}
  `;
  
  try {
    await sendEmailWithHtml(email, `Verify your ${env.APP_NAME || 'account'} email`, emailHtml);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
export const sendResetPasswordEmail = async (email, token, name) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  
  const emailHtml = `
    ${getEmailHeader()}
      <h2 style="color: #333; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. If you made this request, click the button below to choose a new password:</p>
      ${getButton('Reset Password', resetUrl)}
      <p style="color: #555; font-size: 16px; line-height: 1.5;">This password reset link will expire in 1 hour.</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p style="background-color: #f7f7f7; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">${resetUrl}</p>
    ${getEmailFooter()}
  `;
  
  try {
    await sendEmailWithHtml(email, `Reset your ${env.APP_NAME || 'account'} password`, emailHtml);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
  const loginUrl = `${env.CLIENT_URL}/login`;
  
  const emailHtml = `
    ${getEmailHeader()}
      <h2 style="color: #333; margin-top: 0; font-size: 20px;">Welcome to ${env.APP_NAME || 'our platform'}!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for verifying your email address. Your account is now fully activated!</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">We're excited to have you on board. You can now log in and start exploring all the features we offer.</p>
      ${getButton('Log In Now', loginUrl)}
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help!</p>
    ${getEmailFooter()}
  `;
  
  try {
    await sendEmailWithHtml(email, `Welcome to ${env.APP_NAME || 'our platform'}!`, emailHtml);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password changed confirmation email
export const sendPasswordChangedEmail = async (email, name) => {
  const emailHtml = `
    ${getEmailHeader()}
      <h2 style="color: #333; margin-top: 0; font-size: 20px;">Password Changed Successfully</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Your password has been successfully changed.</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If you did not make this change, please contact our support team immediately.</p>
      ${getButton('Contact Support', `${env.CLIENT_URL}/contact`, false)}
    ${getEmailFooter()}
  `;
  
  try {
    await sendEmailWithHtml(email, 'Your password has been changed', emailHtml);
    return true;
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return false;
  }
};

// Register new email user
export const registerEmailUser = async (userData) => {
  try {
    const { email, password, name } = userData;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered'
      };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user
    await User.create({
      email,
      password,
      name,
      authType: 'email',
      verificationToken,
      isVerified: false
    });
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);
    
    return {
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.'
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      message: 'Registration failed'
    };
  }
};

// Verify user email
export const verifyEmail = async (token) => {
  try {
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid verification token'
      };
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);
    
    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      success: false,
      message: 'Email verification failed'
    };
  }
};

// Reset password request
export const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email, authType: 'email' });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send reset email
    await sendResetPasswordEmail(user.email, resetToken, user.name);
    
    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      message: 'Password reset request failed'
    };
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      };
    }
    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Send password changed confirmation
    await sendPasswordChangedEmail(user.email, user.name);
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'Password reset failed'
    };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      message: 'Failed to get user profile'
    };
  }
};

// Send new device login notification
export const sendNewDeviceLoginEmail = async (email, name, deviceInfo) => {
  const emailHtml = `
    ${getEmailHeader()}
      <h2 style="color: #333; margin-top: 0; font-size: 20px;">New Login Detected</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">We detected a login to your account from a new device:</p>
      
      <div style="background-color: #f7f7f7; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 8px 0; font-size: 14px;"><strong>Device:</strong> ${deviceInfo.device || 'Unknown'}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>Browser:</strong> ${deviceInfo.browser || 'Unknown'}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>Location:</strong> ${deviceInfo.location || 'Unknown'}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>IP Address:</strong> ${deviceInfo.ip || 'Unknown'}</p>
      </div>
      
      <p style="color: #555; font-size: 16px; line-height: 1.5;">If this was you, you can ignore this email. If you don't recognize this activity, we recommend that you:</p>
      
      <ol style="color: #555; font-size: 16px; line-height: 1.7;">
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication if you haven't already</li>
        <li>Contact our support team</li>
      </ol>
      
      ${getButton('Change Password', `${env.CLIENT_URL}/change-password`)}
    ${getEmailFooter()}
  `;
  
  try {
    await sendEmailWithHtml(email, 'New login detected on your account', emailHtml);
    return true;
  } catch (error) {
    console.error('Error sending new device login email:', error);
    return false;
  }
};