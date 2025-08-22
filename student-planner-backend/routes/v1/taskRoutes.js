const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import all required controller functions
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addSubTask,
  getSubTasks,
  updateSubTask,
  deleteSubTask,
} = require('../../controllers/taskController');

// Import middleware
const { protect } = require('../../middleware/authMiddleware');
const { validate } = require('../../middleware/validationMiddleware');


// --- Validation Rule Sets ---

// Rule set for CREATING a task. Title is strictly required.
const createTaskValidationRules = [
  check('title', 'Title is required and cannot be empty').not().isEmpty(),
  check('priority', 'Priority must be High, Medium, or Low').optional().isIn(['High', 'Medium', 'Low']),
];

// Rule set for UPDATING a task. All fields are optional.
// This allows for partial updates (e.g., just updating the 'completed' status).
const updateTaskValidationRules = [
  check('title', 'Title cannot be empty').optional().not().isEmpty(),
  check('priority', 'Priority must be High, Medium, or Low').optional().isIn(['High', 'Medium', 'Low']),
];

// Rule set for sub-tasks. Text is always required.
const subTaskValidationRules = [
  check('text', 'Sub-task text is required and cannot be empty').not().isEmpty(),
];


// --- PARENT TASK ROUTES ---
// Base Path: /api/v1/tasks
router
  .route('/')
  .get(protect, getTasks)
  // Use the STRICT validation rules for creating a task
  .post(protect, createTaskValidationRules, validate, createTask);

router
  .route('/:id')
  // Use the LENIENT (optional) validation rules for updating a task
  .put(protect, updateTaskValidationRules, validate, updateTask)
  .delete(protect, deleteTask);


// --- SUB-TASK ROUTES ---
// Base Path: /api/v1/tasks/:taskId/subtasks
router
  .route('/:taskId/subtasks')
  .get(protect, getSubTasks)
  .post(protect, subTaskValidationRules, validate, addSubTask);

// Base Path: /api/v1/tasks/:taskId/subtasks/:subTaskId
router
  .route('/:taskId/subtasks/:subTaskId')
  // Sub-task text is required even when updating, so we can reuse the same rule.
  .put(protect, subTaskValidationRules, validate, updateSubTask)
  .delete(protect, deleteSubTask);


module.exports = router;