/**
 * Input Validation & Sanitization Helpers
 * FSD-2 Concept: Server-side validation, Defense-in-depth, Data integrity
 */

const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validateRegistration = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters long.',
    });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password and Confirm Password do not match.',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email format.',
    });
  }

  next();
};

const validateTransaction = (req, res, next) => {
  const { type, amount, category, date } = req.body;

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Transaction type must be either "income" or "expense".',
    });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a valid positive number greater than zero.',
    });
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Category is required.',
    });
  }

  if (date && isNaN(new Date(date).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid date.',
    });
  }

  // Normalize parsed values for controller
  req.body.type = type.toLowerCase();
  req.body.amount = Math.round(numericAmount * 100) / 100; // Round to 2 decimal places
  req.body.category = category.trim();

  next();
};

const validateBudget = (req, res, next) => {
  const { month, category, amount } = req.body;

  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!month || !monthRegex.test(month)) {
    return res.status(400).json({
      success: false,
      message: 'Month is required and must follow the YYYY-MM format (e.g. 2026-10).',
    });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Budget amount limit must be a positive number greater than zero.',
    });
  }

  req.body.category = category && typeof category === 'string' && category.trim() ? category.trim() : 'Overall';
  req.body.amount = Math.round(numericAmount * 100) / 100;

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTransaction,
  validateBudget,
};
