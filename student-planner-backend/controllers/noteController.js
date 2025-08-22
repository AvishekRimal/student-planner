const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');

/**
 * @desc    Get all notes for a logged-in user
 * @route   GET /api/v1/notes
 * @access  Private
 */
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.status(200).json(notes);
});

/**
 * @desc    Create a new note
 * @route   POST /api/v1/notes
 * @access  Private
 */
const createNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const note = await Note.create({
    title,
    content,
    category,
    user: req.user.id, // Link the note to the logged-in user
  });

  res.status(201).json(note);
});

/**
 * @desc    Get a single note by ID
 * @route   GET /api/v1/notes/:id
 * @access  Private
 */
const getNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Ensure the user owns this note
    if (note.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(note);
});


/**
 * @desc    Update a note
 * @route   PUT /api/v1/notes/:id
 * @access  Private
 */
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Ensure the user owns this note
  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the modified document
  });

  res.status(200).json(updatedNote);
});

/**
 * @desc    Delete a note
 * @route   DELETE /api/v1/notes/:id
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await note.deleteOne();

  res.status(200).json({ id: req.params.id, message: 'Note removed' });
});

module.exports = {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
};