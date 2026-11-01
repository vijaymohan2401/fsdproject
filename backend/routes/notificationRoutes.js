const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * Notification Routes
 * FSD-2 Concept: Notification inbox, read receipts, mass mutations
 */

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

