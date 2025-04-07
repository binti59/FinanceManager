const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateBudget } = require('../validators/budget.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all budgets
router.get('/', budgetController.getAllBudgets);

// Get budget by ID
router.get('/:id', budgetController.getBudgetById);

// Create a new budget
router.post('/', validateBudget, budgetController.createBudget);

// Update a budget
router.put('/:id', validateBudget, budgetController.updateBudget);

// Delete a budget
router.delete('/:id', budgetController.deleteBudget);

// Get budget summary
router.get('/summary', budgetController.getBudgetSummary);

// Get budget progress
router.get('/progress', budgetController.getBudgetProgress);

module.exports = router;
