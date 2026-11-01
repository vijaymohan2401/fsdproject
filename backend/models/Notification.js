const mongoose = require('mongoose');

/**
 * Notification Schema
 * FSD-2 Concept: Event-driven in-app notifications, threshold alerts, state tracking
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['warning', 'limit_reached', 'exceeded', 'info'],
      default: 'info',
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    category: {
      type: String,
      default: 'Overall',
      trim: true,
    },
    thresholdTier: {
      type: String,
      enum: ['normal', 'warning', 'limit_reached', 'exceeded'],
      default: 'warning',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notifications quickly
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

