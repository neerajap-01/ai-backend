import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Only required if authType is 'email'
      return this.authType === 'email';
    }
  },
  name: {
    type: String,
    required: true
  },
  authType: {
    type: String,
    required: true,
    enum: ['email', 'google', 'github'],
    default: 'email'
  },
  googleId: String,
  githubId: String,
  profilePicture: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.authType !== 'email' || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if reset token is expired
userSchema.methods.isResetTokenExpired = function() {
  return this.resetPasswordExpires && this.resetPasswordExpires < Date.now();
};

const User = mongoose.model('User', userSchema);

export default User;