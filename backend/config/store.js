const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * In-Memory Demo Data Store (Active only if MongoDB is not connected)
 * FSD-2 Concept: Repository Pattern & Graceful Degradation / Offline Resilience
 */
const inMemory = {
  users: [],
  transactions: [],
  budgets: [],
  notifications: [],
  initialized: false,
};

// Seed sample user if running in fallback mode
const initFallbackData = async () => {
  if (inMemory.initialized) return;

  const hashedPassword = await bcrypt.hash('DemoPass123!', 10);
  const demoUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Demo Student',
    email: 'demo@spendwise.edu',
    password: hashedPassword,
    preferredCurrency: 'INR',
    themePreference: 'light',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemory.users.push(demoUser);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Seed sample transactions for current month
  const sampleTx = [
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'income',
      amount: 15000,
      category: 'Pocket money or allowance',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      description: 'Monthly student stipend & allowance',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'income',
      amount: 3500,
      category: 'Freelance income',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      description: 'Web development freelance project',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'expense',
      amount: 2800,
      category: 'Food',
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      description: 'College canteen and groceries',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'expense',
      amount: 1200,
      category: 'Transportation',
      date: new Date(now.getFullYear(), now.getMonth(), 6),
      description: 'Monthly metro pass and bus fares',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'expense',
      amount: 1500,
      category: 'Education',
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      description: 'Reference textbooks and stationery',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      user: demoUser._id,
      type: 'expense',
      amount: 999,
      category: 'Subscriptions',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      description: 'Cloud hosting & coding tools',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  inMemory.transactions.push(...sampleTx);

  // Seed sample budget for current month
  inMemory.budgets.push({
    _id: new mongoose.Types.ObjectId(),
    user: demoUser._id,
    month: currentMonthStr,
    category: 'Overall',
    amount: 10000,
    lastAlertThreshold: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  inMemory.budgets.push({
    _id: new mongoose.Types.ObjectId(),
    user: demoUser._id,
    month: currentMonthStr,
    category: 'Food',
    amount: 3500,
    lastAlertThreshold: 'warning',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed sample budget alert notification for Food (spent 2,800 of 3,500 = 80%)
  inMemory.notifications.push({
    _id: new mongoose.Types.ObjectId(),
    user: demoUser._id,
    title: 'Food Budget Running Low',
    message: 'Your Food budget is running low. Only ₹700 remains.',
    type: 'warning',
    month: currentMonthStr,
    category: 'Food',
    thresholdTier: 'warning',
    isRead: false,
    createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
    updatedAt: new Date(now.getTime() - 1000 * 60 * 30),
  });

  inMemory.initialized = true;
};

const isMongooseConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  inMemory,
  initFallbackData,
  isMongooseConnected,
};
