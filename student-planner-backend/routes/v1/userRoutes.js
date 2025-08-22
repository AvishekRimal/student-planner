const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import middleware
const { validate } = require('../../middleware/validationMiddleware');
const { protect } = require('../../middleware/authMiddleware'); // <-- Crucial import for the new route

// Import all required controller functions
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe, // <-- Import the new controller function
} = require('../../controllers/userController');


// --- PUBLIC AUTHENTICATION ROUTES ---

// @route   POST /api/v1/users/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  validate,
  registerUser
);

// @route   POST /api/v1/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  validate,
  loginUser
);


// --- NEW PROTECTED ROUTE for fetching user data ---

// @route   GET /api/v1/users/me
// @desc    Get current logged-in user's data
// @access  Private (requires a valid token)
router.get('/me', protect, getMe);


// --- PASSWORD RESET ROUTES ---

// @route   POST /api/v1/users/forgotpassword
// @desc    Request a password reset email
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/v1/users/resetpassword/:resettoken
// @desc    Reset password using the token
// @access  Public
router.put('/resetpassword/:resettoken', resetPassword);


module.exports = router;