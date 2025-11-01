// const express = require('express');
// const router = express.Router();
// const { check } = require('express-validator');

// // Import controller functions
// const {
//   getTasks,
//   createTask,
//   updateTask,
//   deleteTask,
//   addSubTask,
//   getSubTasks,
//   updateSubTask,
//   deleteSubTask,
// } = require('../../controllers/taskController');

// // Import middleware
// const { protect } = require('../../middleware/authMiddleware');
// const { validate } = require('../../middleware/validationMiddleware');

// /* -----------------------------------------------------------
//    Validation Rule Sets
// ----------------------------------------------------------- */

// // CREATE task validation (Title required)
// const createTaskValidationRules = [
//   check('title', 'Title is required and cannot be empty')
//     .not()
//     .isEmpty()
//     .bail()
//     .isString()
//     .trim(),

//   // ✅ Force validation to only look in request body (fixes Render HTTP/2 conflict)
//   check('priority', 'Priority must be High, Medium, or Low')
//     .optional({ checkFalsy: true })
//     .isIn(['High', 'Medium', 'Low'])
//     .exists({ in: ['body'] }),
// ];

// // UPDATE task validation (all fields optional)
// const updateTaskValidationRules = [
//   check('title', 'Title cannot be empty')
//     .optional()
//     .not()
//     .isEmpty()
//     .isString()
//     .trim(),

//   // ✅ Same fix applied here
//   check('priority', 'Priority must be High, Medium, or Low')
//     .optional({ checkFalsy: true })
//     .isIn(['High', 'Medium', 'Low'])
//     .exists({ in: ['body'] }),
// ];

// // Sub-task validation (text required)
// const subTaskValidationRules = [
//   check('text', 'Sub-task text is required and cannot be empty')
//     .not()
//     .isEmpty()
//     .bail()
//     .isString()
//     .trim(),
// ];

// /* -----------------------------------------------------------
//    ROUTES
// ----------------------------------------------------------- */

// // --- PARENT TASK ROUTES ---
// // Base Path: /api/v1/tasks
// router
//   .route('/')
//   .get(protect, getTasks)
//   .post(protect, createTaskValidationRules, validate, createTask);

// router
//   .route('/:id')
//   .put(protect, updateTaskValidationRules, validate, updateTask)
//   .delete(protect, deleteTask);

// // --- SUB-TASK ROUTES ---
// // Base Path: /api/v1/tasks/:taskId/subtasks
// router
//   .route('/:taskId/subtasks')
//   .get(protect, getSubTasks)
//   .post(protect, subTaskValidationRules, validate, addSubTask);

// router
//   .route('/:taskId/subtasks/:subTaskId')
//   .put(protect, subTaskValidationRules, validate, updateSubTask)
//   .delete(protect, deleteSubTask);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

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

const { protect } = require('../../middleware/authMiddleware');
const { validate } = require('../../middleware/validationMiddleware');

/* Validation Rules */

// CREATE task
const createTaskValidationRules = [
  check('title', 'Title is required and cannot be empty').not().isEmpty().trim(),
  check('taskPriority', 'Priority must be High, Medium, or Low')
    .optional({ checkFalsy: true })
    .isIn(['High', 'Medium', 'Low'])
    .exists({ in: ['body'] }),
];

// UPDATE task
const updateTaskValidationRules = [
  check('title', 'Title cannot be empty').optional().not().isEmpty().trim(),
  check('taskPriority', 'Priority must be High, Medium, or Low')
    .optional({ checkFalsy: true })
    .isIn(['High', 'Medium', 'Low'])
    .exists({ in: ['body'] }),
];

// Sub-task
const subTaskValidationRules = [
  check('text', 'Sub-task text is required and cannot be empty').not().isEmpty().trim(),
];

/* ROUTES */

// Parent tasks
router
  .route('/')
  .get(protect, getTasks)
  .post(protect, createTaskValidationRules, validate, createTask);

router
  .route('/:id')
  .put(protect, updateTaskValidationRules, validate, updateTask)
  .delete(protect, deleteTask);

// Sub-tasks
router
  .route('/:taskId/subtasks')
  .get(protect, getSubTasks)
  .post(protect, subTaskValidationRules, validate, addSubTask);

router
  .route('/:taskId/subtasks/:subTaskId')
  .put(protect, subTaskValidationRules, validate, updateSubTask)
  .delete(protect, deleteSubTask);

module.exports = router;
