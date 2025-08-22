const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const mongoose = require('mongoose');

/**
 * @desc    Get productivity statistics for the logged-in user
 * @route   GET /api/v1/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Get the date 30 days ago from today
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // The Aggregation Pipeline allows for advanced data processing in the database.
  // We use $facet to run multiple aggregation pipelines within a single query for efficiency.
  const stats = await Task.aggregate([
    {
      // Stage 1: Filter tasks to only include those of the logged-in user
      $match: {
        user: userId,
      },
    },
    {
      // Stage 2: Run multiple sub-pipelines (one for each chart)
      $facet: {
        // --- Pipeline for Pie Chart: Tasks by Category ---
        tasksByCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $project: { _id: 0, category: '$_id', count: 1 } },
        ],

        // --- Pipeline for Bar Chart: Completed vs. Created (Last 4 Weeks) ---
        tasksByWeek: [
          {
            $match: {
              createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 28)) },
            },
          },
          {
            $group: {
              _id: { $week: '$createdAt' },
              createdCount: { $sum: 1 },
              completedCount: {
                $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] },
              },
            },
          },
          { $sort: { '_id': 1 } },
          { $project: { _id: 0, week: '$_id', created: '$createdCount', completed: '$completedCount' } },
        ],

        // --- Pipeline for Line Chart: Productivity Trend (Last 30 Days) ---
        productivityTrend: [
          {
            $match: {
              // Only consider tasks completed in the last 30 days
              completed: true,
              updatedAt: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
              tasksCompleted: { $sum: 1 },
            },
          },
          { $sort: { '_id': 1 } }, // Sort by date ascending
          { $project: { _id: 0, date: '$_id', count: '$tasksCompleted' } },
        ],
      },
    },
  ]);

  // The result from an aggregation is an array, we expect a single document here.
  const formattedStats = {
    tasksByCategory: stats[0].tasksByCategory,
    tasksByWeek: stats[0].tasksByWeek,
    productivityTrend: stats[0].productivityTrend,
  };

  res.status(200).json(formattedStats);
});

module.exports = {
  getStats,
};