const mongoose = require('mongoose');

// Schema for embedded sub-task documents
const subTaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

// The main schema for a Task document
const taskSchema = new mongoose.Schema(
  {
    // A reference to the User who owns this task
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
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      default: 'General',
    },
    deadline: {
      type: Date,
      required: false,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    subTasks: [subTaskSchema],

    // --- NEW FIELDS FOR RECURRING TASKS ---
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null], // Only allows these values
      default: null,
    },
    // This field tracks the date for the NEXT generated task
    nextDueDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;