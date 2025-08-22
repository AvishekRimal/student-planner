const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    // A reference to the User who owns this note
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    // The main body of the note. We'll use a simple String for now.
    // The rich text editor from the prompt (Tiptap/Quill) is a frontend implementation detail.
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    // Optional: Allow users to categorize notes, similar to tasks
    category: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;