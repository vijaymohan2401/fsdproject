const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
  demoLogin,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  validateRegistration,
  validateLogin,
} = require('../middleware/validationMiddleware');

/**
 * Authentication Routes
 * FSD-2 Concept: Express Router, RESTful endpoints, Route Middleware chaining
 */

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/demo', demoLogin);

// Protected routes
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

module.exports = router;
