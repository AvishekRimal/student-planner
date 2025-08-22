const express = require('express');
const router = express.Router();
const { getStats } = require('../../controllers/statsController');
const { protect } = require('../../middleware/authMiddleware');

// @route   GET /api/v1/stats
// @desc    Get user productivity statistics
// @access  Private
router.route('/').get(protect, getStats);

module.exports = router;