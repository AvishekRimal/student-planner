const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token's payload (we stored the user's ID)
      // and attach the user object to the request (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Call the next middleware/controller
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };