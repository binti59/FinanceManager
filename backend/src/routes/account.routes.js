const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateAccount } = require('../validators/account.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all accounts
router.get('/', accountController.getAllAccounts);

// Get account by ID
router.get('/:id', accountController.getAccountById);

// Create a new account
router.post('/', validateAccount, accountController.createAccount);

// Update an account
router.put('/:id', validateAccount, accountController.updateAccount);

// Delete an account
router.delete('/:id', accountController.deleteAccount);

// Get account summary
router.get('/summary', accountController.getAccountSummary);

module.exports = router;
