// --- IMPORTS ---
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import your route files from the versioned directory
const userRoutes = require('./routes/v1/userRoutes');
const taskRoutes = require('./routes/v1/taskRoutes');
const statsRoutes = require('./routes/v1/statsRoutes');
const noteRoutes = require('./routes/v1/noteRoutes');

// Import custom middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Import the consolidated background job initializer
const { initializeJobs } = require('./jobs/taskScheduler');


// --- CONFIGURATION ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// --- SECURITY & CORE MIDDLEWARE ---

// --- THIS IS THE FIX: A Robust CORS Configuration ---
// Define the options for CORS
const corsOptions = {
  // This must be the origin of your frontend application
  // origin: 'http://localhost:3000',
  origin: process.env.FRONTEND_URL, 
  // Specify which methods are allowed
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // This is essential for preflight requests (sent before PUT/DELETE) to succeed
  credentials: true,
  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 204
};
// Use the cors middleware with our new options. This MUST come before your routes.
app.use(cors(corsOptions));


// Set various security-related HTTP headers
app.use(helmet());

// Apply rate limiting to all requests to the API to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter); // Apply the limiter only to API routes

// Allow the app to parse JSON from the request body
app.use(express.json());


// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error('MongoDB connection error:', err));


// --- API ROUTES ---
// Mount the routers for the version 1 of the API
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/notes', noteRoutes);


// --- ROOT ENDPOINT for simple health check ---
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});


// --- CUSTOM MIDDLEWARE for 404 NOT FOUND and ERROR HANDLING ---
// This must be placed AFTER all other routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// This is the final middleware. It catches all errors passed by next()
app.use(errorHandler);


// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start all scheduled jobs once the server is successfully running
  initializeJobs();
});