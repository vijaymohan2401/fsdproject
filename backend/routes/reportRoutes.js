const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getAnalytics,
} = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * Report & Analytics Routes
 * FSD-2 Concept: Analytics Aggregation API Endpoints
 */

router.use(requireAuth);

router.get('/dashboard', getDashboardData);
router.get('/analytics', getAnalytics);

module.exports = router;
