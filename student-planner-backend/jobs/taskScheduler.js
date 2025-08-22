const cron = require('node-cron');
const User = require('../models/User'); // Import User model to find all users
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail');

// --- JOB 1: RECURRING TASK CREATION ---

/**
 * The core logic for finding and processing recurring tasks.
 */
const handleRecurringTasks = async () => {
  console.log('SCHEDULER: Running recurring task check...');
  const now = new Date();
  try {
    const recurringTasks = await Task.find({ isRecurring: true, nextDueDate: { $lte: now } });
    if (recurringTasks.length === 0) {
      console.log('SCHEDULER: No recurring tasks to process.');
      return;
    }
    console.log(`SCHEDULER: Found ${recurringTasks.length} recurring task(s) to process.`);
    for (const task of recurringTasks) {
      await Task.create({
        user: task.user,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        deadline: task.nextDueDate,
        isRecurring: false,
        recurrenceType: null,
      });
      let newNextDueDate = new Date(task.nextDueDate);
      switch (task.recurrenceType) {
        case 'daily': newNextDueDate.setDate(newNextDueDate.getDate() + 1); break;
        case 'weekly': newNextDueDate.setDate(newNextDueDate.getDate() + 7); break;
        case 'monthly': newNextDueDate.setMonth(newNextDueDate.getMonth() + 1); break;
        default: task.isRecurring = false; break;
      }
      task.nextDueDate = newNextDueDate;
      await task.save();
      console.log(`SCHEDULER: Processed recurring task "${task.title}". New due date: ${newNextDueDate.toISOString()}`);
    }
  } catch (error) {
    console.error('SCHEDULER: Error during recurring task handling:', error);
  }
};


// --- JOB 2: DAILY EMAIL REMINDERS ---

/**
 * Finds tasks due in the next 24 hours and sends a summary email to relevant users.
 */
const sendTaskReminders = async () => {
  console.log('REMINDER: Running daily task reminder check...');
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    // 1. Find all users to iterate through them.
    const users = await User.find({});
    if (!users || users.length === 0) {
      console.log('REMINDER: No users found in the database.');
      return;
    }

    // 2. Loop through each user to check their tasks individually.
    for (const user of users) {
      const upcomingTasks = await Task.find({
        user: user._id, // Find tasks for this specific user
        deadline: { $gte: now, $lte: twentyFourHoursLater },
        completed: false,
      });

      // If the user has upcoming tasks, send them an email.
      if (upcomingTasks.length > 0) {
        const taskList = upcomingTasks
          .map(t => `- "${t.title}" (Priority: ${t.priority})`)
          .join('\n');

        const message = `Hello ${user.username},\n\nThis is a friendly reminder that you have the following task(s) due in the next 24 hours:\n\n${taskList}\n\nStay productive!\n- The Student Planner Team`;

        await sendEmail({
          email: user.email,
          subject: 'Your Daily Task Reminder',
          message,
        });

        console.log(`REMINDER: Sent reminder email to ${user.email} for ${upcomingTasks.length} task(s).`);
      }
    }
  } catch (error) {
    console.error('REMINDER: Error during email reminder job:', error);
  }
};


// --- SCHEDULER INITIALIZATION ---

/**
 * Initializes and starts all cron jobs for the application.
 */
const initializeJobs = () => {
  // Job 1: Runs daily at 1 minute past midnight to create recurring tasks.
  // CRON for production: '1 0 * * *'
  cron.schedule('1 0 * * *', handleRecurringTasks);
  console.log('SCHEDULER: Recurring task job scheduled to run daily at 00:01.');

  // Job 2: Runs daily at 8:00 AM to send email reminders.
  // CRON for production: '0 8 * * *'
  // CRON for testing every minute: '* * * * *'
  cron.schedule('0 8 * * *', sendTaskReminders);
  console.log('SCHEDULER: Daily email reminder job scheduled to run daily at 08:00.');
};

module.exports = { initializeJobs };