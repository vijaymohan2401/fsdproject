const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { inMemory, isMongooseConnected } = require('../config/store');

/**
 * Budget Controller
 * FSD-2 Concept: Business Logic Layer, Budget vs Expense Analytics, Data Normalization
 */

// Helper to compute budget metrics against real expenses
const attachBudgetProgress = async (budget, userId) => {
  const [yearStr, monthStr] = budget.month.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));

  let spent = 0;

  if (isMongooseConnected()) {
    const match = {
      user: userId,
      type: 'expense',
      date: { $gte: start, $lte: end },
    };

    if (budget.category && budget.category !== 'Overall') {
      match.category = budget.category;
    }

    const agg = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
    ]);

    spent = agg.length > 0 ? agg[0].totalSpent : 0;
  } else {
    const matchingExpenses = inMemory.transactions.filter((t) => {
      if (t.user.toString() !== userId.toString()) return false;
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      if (d < new Date(y, m, 1) || d > new Date(y, m + 1, 0, 23, 59, 59, 999)) return false;
      if (budget.category && budget.category !== 'Overall') {
        return t.category === budget.category;
      }
      return true;
    });

    spent = matchingExpenses.reduce((sum, t) => sum + t.amount, 0);
  }

  const limit = budget.amount;
  const remaining = Math.max(0, limit - spent);
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  let status = 'normal';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  const budgetObj = budget.toObject ? budget.toObject() : { ...budget };
  return {
    ...budgetObj,
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentage,
    status,
  };
};

/**
 * @desc    Get all budgets for user in a specified month with progress metrics
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    const currentMonth =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ? month
        : new Date().toISOString().slice(0, 7);

    let rawBudgets = [];

    if (isMongooseConnected()) {
      rawBudgets = await Budget.find({ user: userId, month: currentMonth }).sort({
        category: 1,
      });
    } else {
      rawBudgets = inMemory.budgets.filter(
        (b) => b.user.toString() === userId.toString() && b.month === currentMonth
      );
    }

    const budgetsWithProgress = await Promise.all(
      rawBudgets.map((b) => attachBudgetProgress(b, userId))
    );

    // Find overall budget if present
    const overallBudget = budgetsWithProgress.find((b) => b.category === 'Overall') || null;
    const categoryBudgets = budgetsWithProgress.filter((b) => b.category !== 'Overall');

    return res.status(200).json({
      success: true,
      month: currentMonth,
      overallBudget,
      categoryBudgets,
      allBudgets: budgetsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or upsert a budget
 * @route   POST /api/budgets
 * @access  Private
 */
const setBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, category = 'Overall', amount } = req.body;

    if (isMongooseConnected()) {
      // Find and update or create if doesn't exist
      const updated = await Budget.findOneAndUpdate(
        { user: userId, month, category },
        { amount },
        { new: true, upsert: true, runValidators: true }
      );

      const budgetWithProgress = await attachBudgetProgress(updated, userId);

      return res.status(200).json({
        success: true,
        message: `${category} budget for ${month} saved successfully!`,
        budget: budgetWithProgress,
      });
    } else {
      let existingIndex = inMemory.budgets.findIndex(
        (b) =>
          b.user.toString() === userId.toString() &&
          b.month === month &&
          b.category === category
      );

      let saved;
      if (existingIndex >= 0) {
        inMemory.budgets[existingIndex].amount = amount;
        inMemory.budgets[existingIndex].updatedAt = new Date();
        saved = inMemory.budgets[existingIndex];
      } else {
        saved = {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          month,
          category,
          amount,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemory.budgets.push(saved);
      }

      const budgetWithProgress = await attachBudgetProgress(saved, userId);

      return res.status(200).json({
        success: true,
        message: `${category} budget for ${month} saved successfully! (In Memory)`,
        budget: budgetWithProgress,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (isMongooseConnected()) {
      const budget = await Budget.findOneAndDelete({ _id: id, user: userId });
      if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully.',
      });
    } else {
      const index = inMemory.budgets.findIndex(
        (b) => b._id.toString() === id.toString() && b.user.toString() === userId.toString()
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
      inMemory.budgets.splice(index, 1);
      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};
