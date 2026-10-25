const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { inMemory, isMongooseConnected } = require('../config/store');

/**
 * Auth Controller
 * FSD-2 Concept: Authentication workflows, Password hashing, Session lifecycle
 */

// Helper to serialize user
const serializeUser = (user) => ({
  id: user._id.toString(),
  _id: user._id,
  name: user.name,
  email: user.email,
  preferredCurrency: user.preferredCurrency || 'INR',
  themePreference: user.themePreference || 'light',
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isMongooseConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      // Establish session
      req.session.userId = user._id.toString();

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        user: user.toSafeObject(),
      });
    } else {
      // In-Memory Fallback
      const existingUser = inMemory.users.find((u) => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: new mongoose.Types.ObjectId(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        preferredCurrency: 'INR',
        themePreference: 'light',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemory.users.push(newUser);
      req.session.userId = newUser._id.toString();

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully! (Stored in Memory)',
        user: serializeUser(newUser),
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isMongooseConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      req.session.userId = user._id.toString();

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        user: user.toSafeObject(),
      });
    } else {
      // In-Memory Fallback
      const user = inMemory.users.find((u) => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      req.session.userId = user._id.toString();

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        user: serializeUser(user),
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user and destroy session
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not log out. Please try again.',
      });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: serializeUser(req.user),
  });
};

/**
 * @desc    Update user profile settings
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferredCurrency, themePreference } = req.body;
    const userId = req.user._id;

    if (isMongooseConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name && typeof name === 'string') user.name = name.trim();
      if (['INR', 'USD', 'EUR', 'GBP'].includes(preferredCurrency)) {
        user.preferredCurrency = preferredCurrency;
      }
      if (['light', 'dark'].includes(themePreference)) {
        user.themePreference = themePreference;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: user.toSafeObject(),
      });
    } else {
      const user = inMemory.users.find((u) => u._id.toString() === userId.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name && typeof name === 'string') user.name = name.trim();
      if (['INR', 'USD', 'EUR', 'GBP'].includes(preferredCurrency)) {
        user.preferredCurrency = preferredCurrency;
      }
      if (['light', 'dark'].includes(themePreference)) {
        user.themePreference = themePreference;
      }
      user.updatedAt = new Date();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: serializeUser(user),
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account and all related transactions & budgets
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (isMongooseConnected()) {
      await Transaction.deleteMany({ user: userId });
      await Budget.deleteMany({ user: userId });
      await User.findByIdAndDelete(userId);
    } else {
      inMemory.transactions = inMemory.transactions.filter(
        (t) => t.user.toString() !== userId.toString()
      );
      inMemory.budgets = inMemory.budgets.filter(
        (b) => b.user.toString() !== userId.toString()
      );
      inMemory.users = inMemory.users.filter(
        (u) => u._id.toString() !== userId.toString()
      );
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        message: 'Account and associated financial records deleted successfully.',
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Demo 1-Click Login for examiner/lab testing
 * @route   POST /api/auth/demo
 * @access  Public
 */
const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'demo@spendwise.edu';

    if (isMongooseConnected()) {
      let user = await User.findOne({ email: demoEmail });
      if (!user) {
        user = await User.create({
          name: 'Demo Student',
          email: demoEmail,
          password: 'DemoPass123!',
          preferredCurrency: 'INR',
          themePreference: 'light',
        });
      }
      req.session.userId = user._id.toString();
      return res.status(200).json({
        success: true,
        message: 'Logged in as Demo Student!',
        user: user.toSafeObject(),
      });
    } else {
      const user = inMemory.users.find((u) => u.email === demoEmail);
      if (user) {
        req.session.userId = user._id.toString();
        return res.status(200).json({
          success: true,
          message: 'Logged in as Demo Student!',
          user: serializeUser(user),
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
  demoLogin,
};
