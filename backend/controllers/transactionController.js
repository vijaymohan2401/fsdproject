const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { inMemory, isMongooseConnected } = require('../config/store');
const { evaluateBudgetAlerts } = require('../services/budgetAlertService');

/**
 * Transaction Controller
 * FSD-2 Concept: CRUD Operations, MongoDB Aggregation Framework, Pagination, Sorting, CSV Sanitization
 */

// Helper to sanitize CSV fields against CSV Injection (Formula Injection)
const sanitizeCsvField = (field) => {
  if (field === null || field === undefined) return '""';
  let str = String(field);

  // If cell starts with dangerous spreadsheet formula triggers, prepend single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * @desc    Get user transactions with search, filter, sort & pagination
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type,
      category,
      startDate,
      endDate,
      month,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    if (isMongooseConnected()) {
      const query = { user: userId };

      // Type filter
      if (type && ['income', 'expense'].includes(type.toLowerCase())) {
        query.type = type.toLowerCase();
      }

      // Category filter
      if (category && category !== 'All') {
        query.category = category;
      }

      // Date filtering: Specific month (YYYY-MM) takes precedence or custom range
      if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        const [yearStr, monthStr] = month.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1; // 0-indexed in JS
        const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
        query.date = { $gte: start, $lte: end };
      } else if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const endD = new Date(endDate);
          endD.setHours(23, 59, 59, 999);
          query.date.$lte = endD;
        }
      }

      // Search keyword
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ description: searchRegex }, { category: searchRegex }];
      }

      // Sorting
      const sort = {};
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'amount') {
        sort.amount = order;
      } else {
        sort.date = order;
      }

      const totalCount = await Transaction.countDocuments(query);
      const transactions = await Transaction.find(query)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: transactions.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        currentPage: pageNum,
        transactions,
      });
    } else {
      // In-Memory Fallback Filter & Sort
      let results = inMemory.transactions.filter(
        (t) => t.user.toString() === userId.toString()
      );

      if (type && ['income', 'expense'].includes(type.toLowerCase())) {
        results = results.filter((t) => t.type === type.toLowerCase());
      }

      if (category && category !== 'All') {
        results = results.filter((t) => t.category === category);
      }

      if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        const [yearStr, monthStr] = month.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1;
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
        results = results.filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        });
      } else if (startDate || endDate) {
        if (startDate) {
          const s = new Date(startDate);
          results = results.filter((t) => new Date(t.date) >= s);
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          results = results.filter((t) => new Date(t.date) <= e);
        }
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        results = results.filter(
          (t) =>
            (t.description && t.description.toLowerCase().includes(q)) ||
            t.category.toLowerCase().includes(q)
        );
      }

      const order = sortOrder === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        if (sortBy === 'amount') {
          return (a.amount - b.amount) * order;
        }
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
      });

      const totalCount = results.length;
      const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        currentPage: pageNum,
        transactions: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (isMongooseConnected()) {
      const transaction = await Transaction.findOne({ _id: id, user: userId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      return res.status(200).json({ success: true, transaction });
    } else {
      const tx = inMemory.transactions.find(
        (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
      );
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      return res.status(200).json({ success: true, transaction: tx });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, amount, category, date, description } = req.body;

    const txDate = date ? new Date(date) : new Date();

    let createdTransaction;
    if (isMongooseConnected()) {
      createdTransaction = await Transaction.create({
        user: userId,
        type,
        amount,
        category,
        date: txDate,
        description: description ? description.trim() : '',
      });
    } else {
      createdTransaction = {
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        type,
        amount,
        category,
        date: txDate,
        description: description ? description.trim() : '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemory.transactions.unshift(createdTransaction);
    }

    // Recalculate budget status and trigger threshold alerts if an expense was recorded
    if (type === 'expense') {
      const txMonth = txDate.toISOString().slice(0, 7);
      await evaluateBudgetAlerts(userId, txMonth, [category]);
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully!',
      transaction: createdTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { type, amount, category, date, description } = req.body;

    let updatedTx;
    let oldCategory;
    let oldMonth;
    let oldType;

    if (isMongooseConnected()) {
      const transaction = await Transaction.findOne({ _id: id, user: userId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      oldCategory = transaction.category;
      oldMonth = new Date(transaction.date).toISOString().slice(0, 7);
      oldType = transaction.type;

      if (type) transaction.type = type;
      if (amount !== undefined) transaction.amount = amount;
      if (category) transaction.category = category;
      if (date) transaction.date = new Date(date);
      if (description !== undefined) transaction.description = description.trim();

      await transaction.save();
      updatedTx = transaction;
    } else {
      const tx = inMemory.transactions.find(
        (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
      );
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      oldCategory = tx.category;
      oldMonth = new Date(tx.date).toISOString().slice(0, 7);
      oldType = tx.type;

      if (type) tx.type = type;
      if (amount !== undefined) tx.amount = amount;
      if (category) tx.category = category;
      if (date) tx.date = new Date(date);
      if (description !== undefined) tx.description = description.trim();
      tx.updatedAt = new Date();
      updatedTx = tx;
    }

    // If either old or new transaction was an expense, re-evaluate affected budgets
    if (oldType === 'expense' || updatedTx.type === 'expense') {
      const newMonth = new Date(updatedTx.date).toISOString().slice(0, 7);
      const affectedMonths = new Set([oldMonth, newMonth]);
      const affectedCats = new Set([oldCategory, updatedTx.category]);

      for (const m of affectedMonths) {
        await evaluateBudgetAlerts(userId, m, Array.from(affectedCats));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully!',
      transaction: updatedTx,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    let deletedTx;

    if (isMongooseConnected()) {
      deletedTx = await Transaction.findOneAndDelete({ _id: id, user: userId });
      if (!deletedTx) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
    } else {
      const index = inMemory.transactions.findIndex(
        (t) => t._id.toString() === id.toString() && t.user.toString() === userId.toString()
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      deletedTx = inMemory.transactions.splice(index, 1)[0];
    }

    // Re-evaluate budget status if the deleted transaction was an expense
    if (deletedTx && deletedTx.type === 'expense') {
      const txMonth = new Date(deletedTx.date).toISOString().slice(0, 7);
      await evaluateBudgetAlerts(userId, txMonth, [deletedTx.category]);
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export filtered transactions to CSV with formula injection protection
 * @route   GET /api/transactions/export/csv
 * @access  Private
 */
const exportCSV = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, type, category } = req.query;

    let transactions;
    if (isMongooseConnected()) {
      const query = { user: userId };
      if (type && ['income', 'expense'].includes(type.toLowerCase())) {
        query.type = type.toLowerCase();
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        const [yearStr, monthStr] = month.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1;
        const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
        query.date = { $gte: start, $lte: end };
      }
      transactions = await Transaction.find(query).sort({ date: -1 });
    } else {
      transactions = inMemory.transactions.filter(
        (t) => t.user.toString() === userId.toString()
      );
      if (type && ['income', 'expense'].includes(type.toLowerCase())) {
        transactions = transactions.filter((t) => t.type === type.toLowerCase());
      }
      if (category && category !== 'All') {
        transactions = transactions.filter((t) => t.category === category);
      }
      if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        const [yearStr, monthStr] = month.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1;
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
        transactions = transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        });
      }
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Prepare CSV rows
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = transactions.map((t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      return [
        sanitizeCsvField(t._id),
        sanitizeCsvField(dateStr),
        sanitizeCsvField(t.type.toUpperCase()),
        sanitizeCsvField(t.category),
        sanitizeCsvField(t.amount.toFixed(2)),
        sanitizeCsvField(t.description || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    const filename = `spendwise_transactions_${month || 'all'}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV,
};
