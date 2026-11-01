const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { inMemory, isMongooseConnected } = require('../config/store');

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format currency amount with given symbol
 */
const formatAmount = (amount, symbol = '₹') => {
  const rounded = Math.abs(Math.round(amount * 100) / 100);
  return `${symbol}${rounded.toLocaleString('en-IN')}`;
};

/**
 * Helper to get user's currency symbol
 */
const getUserCurrencySymbol = async (userId) => {
  try {
    if (isMongooseConnected()) {
      const user = await User.findById(userId).select('preferredCurrency');
      return CURRENCY_SYMBOLS[user?.preferredCurrency] || '₹';
    } else {
      const user = inMemory.users.find((u) => u._id.toString() === userId.toString());
      return CURRENCY_SYMBOLS[user?.preferredCurrency] || '₹';
    }
  } catch {
    return '₹';
  }
};

/**
 * Helper to get month date bounds in UTC
 */
const getMonthBounds = (monthStr) => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthNumStr, 10) - 1;
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  return { start, end, y, m };
};

/**
 * Evaluate budget status and trigger in-app notifications when crossing thresholds
 * Thresholds:
 * - < 80%: 'normal'
 * - >= 80% && < 100%: 'warning'
 * - === 100%: 'limit_reached'
 * - > 100%: 'exceeded'
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} month - Format 'YYYY-MM'
 * @param {string[]} affectedCategories - Specific categories to evaluate alongside 'Overall'
 * @returns {Promise<Array>} List of newly generated notifications
 */
const evaluateBudgetAlerts = async (userId, month, affectedCategories = []) => {
  try {
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      month = new Date().toISOString().slice(0, 7);
    }

    const { start, end, y, m } = getMonthBounds(month);
    const currencySymbol = await getUserCurrencySymbol(userId);

    // Identify target categories (always include 'Overall')
    const categoriesToCheck = new Set(['Overall']);
    if (Array.isArray(affectedCategories)) {
      affectedCategories.forEach((cat) => {
        if (cat && typeof cat === 'string') {
          categoriesToCheck.add(cat.trim());
        }
      });
    }

    // Find all budgets for this user and month
    let budgets = [];
    if (isMongooseConnected()) {
      budgets = await Budget.find({
        user: userId,
        month,
        category: { $in: Array.from(categoriesToCheck) },
      });
    } else {
      budgets = inMemory.budgets.filter(
        (b) =>
          b.user.toString() === userId.toString() &&
          b.month === month &&
          categoriesToCheck.has(b.category)
      );
    }

    const generatedNotifications = [];

    for (const budget of budgets) {
      const limit = Number(budget.amount);
      if (!Number.isFinite(limit) || limit <= 0) continue;

      const isOverall = budget.category === 'Overall';

      // Calculate total eligible expenses (strictly excluding income)
      let totalSpent = 0;

      if (isMongooseConnected()) {
        const match = {
          user: userId,
          type: 'expense',
          date: { $gte: start, $lte: end },
        };
        if (!isOverall) {
          match.category = budget.category;
        }

        const agg = await Transaction.aggregate([
          { $match: match },
          { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
        ]);

        totalSpent = agg.length > 0 ? agg[0].totalSpent : 0;
      } else {
        const matchingExpenses = inMemory.transactions.filter((t) => {
          if (t.user.toString() !== userId.toString()) return false;
          if (t.type !== 'expense') return false;
          const d = new Date(t.date);
          if (d < new Date(y, m, 1) || d > new Date(y, m + 1, 0, 23, 59, 59, 999)) return false;
          if (!isOverall) {
            return t.category === budget.category;
          }
          return true;
        });

        totalSpent = matchingExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      }

      totalSpent = Math.round(totalSpent * 100) / 100;
      const remaining = Math.round((limit - totalSpent) * 100) / 100;
      const overspent = Math.max(0, Math.round((totalSpent - limit) * 100) / 100);

      // Determine current threshold status
      let currentStatus = 'normal';
      const warningThreshold = Math.round(limit * 0.8 * 100) / 100;

      if (totalSpent > limit) {
        currentStatus = 'exceeded';
      } else if (totalSpent === limit) {
        currentStatus = 'limit_reached';
      } else if (totalSpent >= warningThreshold) {
        currentStatus = 'warning';
      } else {
        currentStatus = 'normal';
      }

      const previousStatus = budget.lastAlertThreshold || 'normal';

      // If status changed to normal (e.g. user deleted an expense)
      if (currentStatus === 'normal') {
        if (previousStatus !== 'normal') {
          budget.lastAlertThreshold = 'normal';
          if (isMongooseConnected()) {
            await Budget.findByIdAndUpdate(budget._id, { lastAlertThreshold: 'normal' });
          } else {
            budget.lastAlertThreshold = 'normal';
            budget.updatedAt = new Date();
          }
        }
        continue;
      }

      // If status changed to a new alert tier (warning, limit_reached, or exceeded)
      if (currentStatus !== previousStatus) {
        let title = '';
        let message = '';
        let type = currentStatus;

        if (currentStatus === 'warning') {
          if (isOverall) {
            title = 'Monthly Budget Running Low';
            message = `Your monthly budget is running low. Only ${formatAmount(remaining, currencySymbol)} remains.`;
          } else {
            title = `${budget.category} Budget Running Low`;
            message = `Your ${budget.category} budget is running low. Only ${formatAmount(remaining, currencySymbol)} remains.`;
          }
        } else if (currentStatus === 'limit_reached') {
          if (isOverall) {
            title = 'Monthly Budget Limit Reached';
            message = 'You have reached your monthly budget limit.';
          } else {
            title = `${budget.category} Budget Limit Reached`;
            message = `You have reached your ${budget.category} budget limit.`;
          }
        } else if (currentStatus === 'exceeded') {
          if (isOverall) {
            title = 'Monthly Budget Exceeded';
            message = `You have exceeded your monthly budget by ${formatAmount(overspent, currencySymbol)}.`;
          } else {
            title = `${budget.category} Budget Exceeded`;
            message = `You have exceeded your ${budget.category} budget by ${formatAmount(overspent, currencySymbol)}.`;
          }
        }

        // Persist notification
        let newNotification;
        if (isMongooseConnected()) {
          newNotification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            month,
            category: budget.category,
            thresholdTier: currentStatus,
            isRead: false,
          });

          await Budget.findByIdAndUpdate(budget._id, { lastAlertThreshold: currentStatus });
        } else {
          newNotification = {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            title,
            message,
            type,
            month,
            category: budget.category,
            thresholdTier: currentStatus,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          inMemory.notifications.unshift(newNotification);
          budget.lastAlertThreshold = currentStatus;
          budget.updatedAt = new Date();
        }

        generatedNotifications.push(newNotification);
      }
    }

    return generatedNotifications;
  } catch (error) {
    console.error('[evaluateBudgetAlerts Error]:', error);
    return [];
  }
};

module.exports = {
  evaluateBudgetAlerts,
  getUserCurrencySymbol,
  formatAmount,
};

