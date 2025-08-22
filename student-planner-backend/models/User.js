// models/User.js

const crypto = require('crypto'); // Node.js built-in crypto library
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Prevents password from being returned in queries by default
  },
  // --- NEW FIELDS FOR PASSWORD RESET ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Mongoose middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password with cost of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- NEW METHOD on the User model ---
// This method generates and hashes the password reset token
userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate a random, URL-safe token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash the token and store it in the database
  // This is a security measure. If the DB is compromised, tokens are not exposed.
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set an expiration time for the token (e.g., 10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 4. Return the UN-HASHED token. This is what will be sent to the user's email.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;