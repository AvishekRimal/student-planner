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

// --- Authentication Controllers ---

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 * @access  Public
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
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


// --- NEW: Controller for getting current user ---

/**
 * @desc    Get current logged in user's data
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // The 'protect' middleware has already found the user from the token
  // and attached it to the request object as 'req.user'.
  // We just need to send it back.
  res.status(200).json(req.user);
});


// --- Password Reset Controllers ---

/**
 * @desc    Forgot password - sends email with reset token
 * @route   POST /api/v1/users/forgotpassword
 * @access  Public
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

  // Update the email message to be more user-friendly
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

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
 * @access  Public
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
module.exports = {
  registerUser,
  loginUser,
  getMe, // <-- Export the new function
  forgotPassword,
  resetPassword,
};