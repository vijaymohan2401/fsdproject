const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV,
} = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validationMiddleware');

/**
 * Transaction Routes
 * FSD-2 Concept: RESTful resource endpoints (GET, POST, PUT, DELETE), Query parameters, File streaming
 */

router.use(requireAuth); // All transaction endpoints require authenticated session

router.get('/export/csv', exportCSV);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', validateTransaction, createTransaction);
router.put('/:id', validateTransaction, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
