const mongoose = require('mongoose');

/**
 * Budget Schema
 * FSD-2 Concept: Compound unique indexes to prevent duplicate active budgets per month/category
 */
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Budget month is required (format YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      default: 'Overall',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount limit is required'],
      min: [1, 'Budget amount must be at least 1'],
      validate: {
        validator: function (val) {
          return Number.isFinite(val) && val > 0;
        },
        message: 'Budget amount must be a positive number',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A user cannot have two budgets for the same category in the same month
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
