const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateTransaction } = require('../validators/transaction.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Create a new transaction
router.post('/', validateTransaction, transactionController.createTransaction);

// Update a transaction
router.put('/:id', validateTransaction, transactionController.updateTransaction);

// Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// Get transaction summary
router.get('/summary', transactionController.getTransactionSummary);

// Get transactions by category
router.get('/by-category', transactionController.getTransactionsByCategory);

// Get transactions by account
router.get('/by-account', transactionController.getTransactionsByAccount);

module.exports = router;
