const User = require('../models/User');
const { inMemory, isMongooseConnected } = require('../config/store');

/**
 * Session Authentication Guard Middleware
 * FSD-2 Concept: Express Middleware, Session Validation, Route Protection
 */
const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    let user;
    if (isMongooseConnected()) {
      user = await User.findById(req.session.userId);
    } else {
      user = inMemory.users.find(
        (u) => u._id.toString() === req.session.userId.toString()
      );
    }

    if (!user) {
      // Session exists but user was removed
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'User session has expired or user no longer exists.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth };
