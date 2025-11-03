// const asyncHandler = require('express-async-handler');
// const Task = require('../models/Task');

// // --- PARENT TASK CONTROLLERS ---

// /**
//  * @desc    Get all tasks for a logged-in user with filtering, searching, and sorting
//  * @route   GET /api/v1/tasks
//  * @access  Private
//  */
// const getTasks = asyncHandler(async (req, res) => {
//   // 1. Initialize the base query object. This ensures users can only get their own tasks.
//   const queryObject = {
//     user: req.user.id,
//   };

//   // 2. Add filters to the query object based on URL query parameters
//   const { priority, category, completed, search } = req.query;

//   if (priority) {
//     queryObject.priority = priority;
//   }
//   if (category) {
//     queryObject.category = category;
//   }
//   if (completed) {
//     // Convert string from URL ('true' or 'false') to a boolean
//     queryObject.completed = completed === 'true';
//   }

//   // 3. Add search functionality
//   // This looks for the search term in both the title and description fields.
//   if (search) {
//     queryObject.$or = [
//       { title: { $regex: search, $options: 'i' } }, // 'i' makes it case-insensitive
//       { description: { $regex: search, $options: 'i' } },
//     ];
//   }

//   // 4. Start building the Mongoose query chain
//   let result = Task.find(queryObject);

//   // 5. Add sorting functionality
//   if (req.query.sort) {
//     // Allows for complex sorting like 'priority,-createdAt'
//     const sortList = req.query.sort.split(',').join(' ');
//     result = result.sort(sortList);
//   } else {
//     // Default sort order if none is provided: newest tasks first
//     result = result.sort('-createdAt');
//   }

//   // 6. Execute the final query
//   const tasks = await result;

//   // 7. Send the response
//   res.status(200).json({
//     count: tasks.length, // Include the number of results
//     tasks,
//   });
// });


// /**
//  * @desc    Create a new parent task
//  * @route   POST /api/v1/tasks
//  * @access  Private
//  */
// const createTask = asyncHandler(async (req, res) => {
//   const { title, description, category, deadline, priority } = req.body;
//   const task = await Task.create({
//     title,
//     description,
//     category,
//     deadline,
//     priority,
//     user: req.user.id,
//   });
//   res.status(201).json(task);
// });

// /**
//  * @desc    Update a parent task
//  * @route   PUT /api/v1/tasks/:id
//  * @access  Private
//  */
// const updateTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.id);
//   if (!task) {
//     res.status(404);
//     throw new Error('Task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.status(200).json(updatedTask);
// });

// /**
//  * @desc    Delete a parent task
//  * @route   DELETE /api/v1/tasks/:id
//  * @access  Private
//  */
// const deleteTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.id);
//   if (!task) {
//     res.status(404);
//     throw new Error('Task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   await task.deleteOne();
//   res.status(200).json({ id: req.params.id, message: 'Task removed' });
// });


// // --- SUB-TASK CONTROLLERS ---

// /**
//  * @desc    Add a sub-task to a parent task
//  * @route   POST /api/v1/tasks/:taskId/subtasks
//  * @access  Private
//  */
// const addSubTask = asyncHandler(async (req, res) => {
//   const { text } = req.body;
//   const task = await Task.findById(req.params.taskId);
//   if (!task) {
//     res.status(404);
//     throw new Error('Parent task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   const subTask = { text, completed: false };
//   task.subTasks.push(subTask);
//   await task.save();
//   res.status(201).json(task.subTasks[task.subTasks.length - 1]);
// });

// /**
//  * @desc    Get all sub-tasks for a task
//  * @route   GET /api/v1/tasks/:taskId/subtasks
//  * @access  Private
//  */
// const getSubTasks = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.taskId);
//   if (!task) {
//     res.status(404);
//     throw new Error('Parent task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   res.status(200).json(task.subTasks);
// });

// /**
//  * @desc    Update a specific sub-task
//  * @route   PUT /api/v1/tasks/:taskId/subtasks/:subTaskId
//  * @access  Private
//  */
// const updateSubTask = asyncHandler(async (req, res) => {
//   const { text, completed } = req.body;
//   const task = await Task.findById(req.params.taskId);
//   if (!task) {
//     res.status(404);
//     throw new Error('Parent task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   const subTask = task.subTasks.id(req.params.subTaskId);
//   if (!subTask) {
//     res.status(44);
//     throw new Error('Sub-task not found');
//   }
//   subTask.text = text ?? subTask.text;
//   subTask.completed = completed ?? subTask.completed;
//   await task.save();
//   res.status(200).json(subTask);
// });

// /**
//  * @desc    Delete a specific sub-task
//  * @route   DELETE /api/v1/tasks/:taskId/subtasks/:subTaskId
//  * @access  Private
//  */
// const deleteSubTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.taskId);
//   if (!task) {
//     res.status(404);
//     throw new Error('Parent task not found');
//   }
//   if (task.user.toString() !== req.user.id) {
//     res.status(401);
//     throw new Error('User not authorized');
//   }
//   const subTask = task.subTasks.id(req.params.subTaskId);
//   if (!subTask) {
//     res.status(404);
//     throw new Error('Sub-task not found');
//   }
//   await subTask.deleteOne();
//   await task.save();
//   res.status(200).json({ id: req.params.subTaskId, message: 'Sub-task removed' });
// });


// // Export all controller functions
// module.exports = {
//   getTasks,
//   createTask,
//   updateTask,
//   deleteTask,
//   addSubTask,
//   getSubTasks,
//   updateSubTask,
//   deleteSubTask,
// };




const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// --- PARENT TASK CONTROLLERS ---

/**
 * @desc    Get all tasks for a logged-in user with filtering, searching, and sorting
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const queryObject = { user: req.user.id };
  const { taskPriority, category, completed, search } = req.query;

  if (taskPriority) queryObject.priority = taskPriority;
  if (category) queryObject.category = category;
  if (completed) queryObject.completed = completed === 'true';

  if (search) {
    queryObject.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  let result = Task.find(queryObject);

  if (req.query.sort) {
    const sortList = req.query.sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('-createdAt');
  }

  const tasks = await result;

  res.status(200).json({
    count: tasks.length,
    tasks,
  });
});

/**
 * @desc    Create a new parent task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, deadline, taskPriority } = req.body;

  const task = await Task.create({
    title,
    description,
    category,
    deadline,
    priority: taskPriority, // Store in DB as "priority"
    user: req.user.id,
  });

  res.status(201).json(task);
});

/**
 * @desc    Update a parent task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { title, description, category, deadline, taskPriority  } = req.body;

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.category = category ?? task.category;
  task.deadline = deadline ?? task.deadline;
  task.priority = taskPriority ?? task.priority;
  task.completed = req.body.completed ?? task.completed;

  await task.save();

  res.status(200).json(task);
});

/**
 * @desc    Delete a parent task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await task.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Task removed' });
});

// --- SUB-TASK CONTROLLERS ---

/**
 * @desc    Add a sub-task to a parent task
 * @route   POST /api/v1/tasks/:taskId/subtasks
 * @access  Private
 */
const addSubTask = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Parent task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const subTask = { text, completed: false };
  task.subTasks.push(subTask);
  await task.save();

  res.status(201).json(task.subTasks[task.subTasks.length - 1]);
});

/**
 * @desc    Get all sub-tasks for a task
 * @route   GET /api/v1/tasks/:taskId/subtasks
 * @access  Private
 */
const getSubTasks = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Parent task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  res.status(200).json(task.subTasks);
});

/**
 * @desc    Update a specific sub-task
 * @route   PUT /api/v1/tasks/:taskId/subtasks/:subTaskId
 * @access  Private
 */
const updateSubTask = asyncHandler(async (req, res) => {
  const { text, completed } = req.body;
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Parent task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const subTask = task.subTasks.id(req.params.subTaskId);
  if (!subTask) {
    res.status(404);
    throw new Error('Sub-task not found');
  }

  subTask.text = text ?? subTask.text;
  subTask.completed = completed ?? subTask.completed;
  await task.save();

  res.status(200).json(subTask);
});

/**
 * @desc    Delete a specific sub-task
 * @route   DELETE /api/v1/tasks/:taskId/subtasks/:subTaskId
 * @access  Private
 */
const deleteSubTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Parent task not found');
  }
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const subTask = task.subTasks.id(req.params.subTaskId);
  if (!subTask) {
    res.status(404);
    throw new Error('Sub-task not found');
  }

  subTask.remove(); // Remove sub-task from array
  await task.save();

  res.status(200).json({ id: req.params.subTaskId, message: 'Sub-task removed' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addSubTask,
  getSubTasks,
  updateSubTask,
  deleteSubTask,
};
