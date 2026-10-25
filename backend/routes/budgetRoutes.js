const express = require('express');
const router = express.Router();
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validationMiddleware');

/**
 * Budget Routes
 * FSD-2 Concept: Express Resource Sub-router with authentication and validation
 */

router.use(requireAuth);

router.get('/', getBudgets);
router.post('/', validateBudget, setBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
