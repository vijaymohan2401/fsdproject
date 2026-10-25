const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { inMemory, isMongooseConnected } = require('../config/store');

/**
 * Report & Analytics Controller
 * FSD-2 Concept: Aggregation pipelines ($match, $group, $sort, $project), Financial mathematics
 */

// Helper: Calculate month boundary dates in UTC
const getMonthRange = (monthStr) => {
  const [yearStr, mStr] = monthStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  return { start, end, y, m };
};

// Helper: Get previous month string "YYYY-MM"
const getPrevMonthStr = (monthStr) => {
  const [yearStr, mStr] = monthStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10) - 1; // 1-indexed to 0-indexed
  if (m === 0) {
    y -= 1;
    m = 12;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
};

/**
 * @desc    Get dashboard summary metrics and monthly stats
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    const currentMonth =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ? month
        : new Date().toISOString().slice(0, 7);

    const { start, end } = getMonthRange(currentMonth);

    let transactionsInMonth = [];
    let recentTransactions = [];
    let overallBudget = null;

    if (isMongooseConnected()) {
      transactionsInMonth = await Transaction.find({
        user: userId,
        date: { $gte: start, $lte: end },
      }).sort({ date: -1 });

      recentTransactions = await Transaction.find({ user: userId })
        .sort({ date: -1 })
        .limit(5);

      overallBudget = await Budget.findOne({
        user: userId,
        month: currentMonth,
        category: 'Overall',
      });
    } else {
      transactionsInMonth = inMemory.transactions.filter((t) => {
        if (t.user.toString() !== userId.toString()) return false;
        const d = new Date(t.date);
        return d >= start && d <= end;
      });

      const userAll = inMemory.transactions
        .filter((t) => t.user.toString() === userId.toString())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      recentTransactions = userAll.slice(0, 5);

      overallBudget = inMemory.budgets.find(
        (b) =>
          b.user.toString() === userId.toString() &&
          b.month === currentMonth &&
          b.category === 'Overall'
      );
    }

    // Calculate totals for selected month
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};

    transactionsInMonth.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const netBalance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Budget Calculations
    const budgetLimit = overallBudget ? overallBudget.amount : 0;
    const budgetRemaining = Math.max(0, Math.round((budgetLimit - totalExpenses) * 100) / 100);
    const budgetPercentage =
      budgetLimit > 0 ? Math.round((totalExpenses / budgetLimit) * 100) : 0;

    let budgetStatus = 'none';
    if (budgetLimit > 0) {
      if (budgetPercentage >= 100) budgetStatus = 'exceeded';
      else if (budgetPercentage >= 80) budgetStatus = 'warning';
      else budgetStatus = 'normal';
    }

    // Category Breakdown sorted highest to lowest
    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage:
          totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return res.status(200).json({
      success: true,
      month: currentMonth,
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        budgetLimit,
        budgetRemaining,
        budgetPercentage,
        budgetStatus,
      },
      categoryBreakdown,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed analytics, month-over-month comparison and 6-month trends
 * @route   GET /api/reports/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    const currentMonth =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ? month
        : new Date().toISOString().slice(0, 7);

    const prevMonth = getPrevMonthStr(currentMonth);

    const currRange = getMonthRange(currentMonth);
    const prevRange = getMonthRange(prevMonth);

    let allUserTransactions = [];
    if (isMongooseConnected()) {
      allUserTransactions = await Transaction.find({ user: userId });
    } else {
      allUserTransactions = inMemory.transactions.filter(
        (t) => t.user.toString() === userId.toString()
      );
    }

    // Helper: Summarize transactions within a range
    const summarizeRange = (start, end) => {
      let income = 0;
      let expense = 0;
      const catMap = {};

      allUserTransactions.forEach((t) => {
        const d = new Date(t.date);
        if (d >= start && d <= end) {
          const amt = Number(t.amount);
          if (t.type === 'income') {
            income += amt;
          } else {
            expense += amt;
            catMap[t.category] = (catMap[t.category] || 0) + amt;
          }
        }
      });

      return {
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        net: Math.round((income - expense) * 100) / 100,
        catMap,
      };
    };

    const currentStats = summarizeRange(currRange.start, currRange.end);
    const prevStats = summarizeRange(prevRange.start, prevRange.end);

    // Percentage Changes vs Previous Month
    const calcPctChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const comparison = {
      prevMonth,
      currentMonth,
      incomeChangePct: calcPctChange(currentStats.income, prevStats.income),
      expenseChangePct: calcPctChange(currentStats.expense, prevStats.expense),
      prevIncome: prevStats.income,
      prevExpense: prevStats.expense,
      prevNet: prevStats.net,
    };

    // Category breakdown with shares
    const categoryBreakdown = Object.entries(currentStats.catMap)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage:
          currentStats.expense > 0
            ? Math.round((amount / currentStats.expense) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const highestExpenseCategory = categoryBreakdown[0] || null;

    // 6-Month Trend Data for charts
    const monthlyTrends = [];
    const [cYear, cMonth] = currentMonth.split('-').map(Number);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(cYear, cMonth - 1 - i, 1));
      const mStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const { start, end } = getMonthRange(mStr);
      const stats = summarizeRange(start, end);

      const monthName = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

      monthlyTrends.push({
        month: mStr,
        label: `${monthName} '${String(d.getUTCFullYear()).slice(-2)}`,
        income: stats.income,
        expense: stats.expense,
        net: stats.net,
      });
    }

    return res.status(200).json({
      success: true,
      currentMonth,
      currentStats,
      comparison,
      categoryBreakdown,
      highestExpenseCategory,
      monthlyTrends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getAnalytics,
};
