/**
 * Syllabus Experiment 4c:
 * Program to show the working of middleware in Express.js.
 * FSD-2 Concept: Application-level, Route-specific, and Error-handling middleware with next()
 */

const express = require('express');
const app = express();
const PORT = 4006;

// 1. Application-Level Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[Middleware 1 - Logger] ${timestamp} | ${req.method} ${req.url}`);
  // Pass control to the next middleware in the pipeline
  next();
});

// 2. Authentication Verification Middleware (Simulated Guard)
const checkAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  console.log('[Middleware 2 - Auth Guard] Checking credentials...');

  if (apiKey === 'fsd2secret') {
    req.authenticatedUser = { name: 'Lab Student', role: 'Student' };
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized! Please provide ?apiKey=fsd2secret' });
  }
};

// Public Route (No auth middleware)
app.get('/public', (req, res) => {
  res.send('This is a public endpoint accessible by anyone.');
});

// Protected Route (Chained with checkAuth middleware)
app.get('/protected', checkAuth, (req, res) => {
  res.json({
    message: 'Access granted to protected resource!',
    user: req.authenticatedUser
  });
});

// Route that triggers an intentional error
app.get('/error-test', (req, res, next) => {
  const err = new Error('Intentional error triggered for middleware testing');
  err.status = 500;
  next(err); // Passing error to error-handling middleware
});

// 3. Centralized Error-Handling Middleware (Must have 4 arguments: err, req, res, next)
app.use((err, req, res, next) => {
  console.error('[Middleware 3 - Error Handler Catch]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    errorMessage: err.message,
    handledBy: 'Centralized Error Middleware'
  });
});

app.listen(PORT, () => {
  console.log(`[Experiment 4c] Middleware Server running at http://localhost:${PORT}`);
  console.log(`  Public:    http://localhost:${PORT}/public`);
  console.log(`  Protected: http://localhost:${PORT}/protected?apiKey=fsd2secret`);
  console.log(`  Error:     http://localhost:${PORT}/error-test`);
});
