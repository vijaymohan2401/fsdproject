const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { inMemory, isMongooseConnected } = require('../config/store');

/**
 * Notification Controller
 * FSD-2 Concept: Notification inbox, unread counts, read state mutation
 */

/**
 * @desc    Get user notifications with unread count
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { unreadOnly, limit = 30 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

    if (isMongooseConnected()) {
      const query = { user: userId };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      const [notifications, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).limit(limitNum),
        Notification.countDocuments({ user: userId, isRead: false }),
      ]);

      return res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
      });
    } else {
      let userNotifications = inMemory.notifications.filter(
        (n) => n.user.toString() === userId.toString()
      );

      const unreadCount = userNotifications.filter((n) => !n.isRead).length;

      if (unreadOnly === 'true') {
        userNotifications = userNotifications.filter((n) => !n.isRead);
      }

      userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = userNotifications.slice(0, limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        unreadCount,
        notifications: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (isMongooseConnected()) {
      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

      return res.status(200).json({
        success: true,
        notification,
        unreadCount,
      });
    } else {
      const notif = inMemory.notifications.find(
        (n) => n._id.toString() === id.toString() && n.user.toString() === userId.toString()
      );

      if (!notif) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      notif.isRead = true;
      notif.updatedAt = new Date();

      const unreadCount = inMemory.notifications.filter(
        (n) => n.user.toString() === userId.toString() && !n.isRead
      ).length;

      return res.status(200).json({
        success: true,
        notification: notif,
        unreadCount,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (isMongooseConnected()) {
      await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        unreadCount: 0,
      });
    } else {
      inMemory.notifications.forEach((n) => {
        if (n.user.toString() === userId.toString()) {
          n.isRead = true;
          n.updatedAt = new Date();
        }
      });

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        unreadCount: 0,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (isMongooseConnected()) {
      const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, message: 'Notification removed.' });
    } else {
      const idx = inMemory.notifications.findIndex(
        (n) => n._id.toString() === id.toString() && n.user.toString() === userId.toString()
      );
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      inMemory.notifications.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'Notification removed.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};

