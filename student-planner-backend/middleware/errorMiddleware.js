// This middleware will run if a route handler calls next(error)
// Or if an error is thrown inside an asyncHandler
const errorHandler = (err, req, res, next) => {
  // Check if a status code was already set, otherwise default to 500 (Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Show the error stack trace only if we are not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};