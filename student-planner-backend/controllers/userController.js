const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// --- Helper Function to Generate JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- AUTHENTICATION CONTROLLERS ---

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ username, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role, // Include role in response
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/users/login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role, // Include role in response
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current logged in user's data
 * @route   GET /api/v1/users/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

/**
 * @desc    Logout user (placeholder for future blocklist logic)
 * @route   POST /api/v1/users/logout
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'User logged out successfully' });
});


// --- NEW: USER PROFILE & SETTINGS CONTROLLERS ---

/**
 * @desc    Update user details (username)
 * @route   PUT /api/v1/users/updatedetails
 */
const updateUserDetails = asyncHandler(async (req, res) => {
  // We get the user from the 'protect' middleware, not a fresh DB call, for efficiency
  const user = await User.findById(req.user.id);

  if (user) {
    user.username = req.body.username || user.username;
    // Note: Allowing email updates would require checking if the new email is already taken
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user password
 * @route   PUT /api/v1/users/updatepassword
 */
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both current and new passwords');
  }
  
  const user = await User.findById(req.user.id).select('+password');

  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    // If current password is correct, set the new one.
    // The pre-save hook in the User model will automatically hash it before saving.
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
});


// --- PASSWORD RESET CONTROLLERS ---

/**
 * @desc    Forgot password - sends email with reset token
 * @route   POST /api/v1/users/forgotpassword
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `You are receiving this email because you have requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent successfully' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/v1/users/resetpassword/:resettoken
 */
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    data: 'Password reset successful',
    token: generateToken(user._id),
  });
});


// --- EXPORTS ---
// Ensure all functions are exported
module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateUserDetails,
  updateUserPassword,
  forgotPassword,
  resetPassword,
};