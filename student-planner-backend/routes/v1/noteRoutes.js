const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../../controllers/noteController');
const { protect } = require('../../middleware/authMiddleware');

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Chained route handlers
router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;