const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, return a 400 response with the errors
    return res.status(400).json({ errors: errors.array() });
  }
  // If validation passes, proceed to the next middleware or controller
  next();
};

module.exports = { validate };