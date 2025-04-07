const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateGoal } = require('../validators/goal.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all goals
router.get('/', goalController.getAllGoals);

// Get goal by ID
router.get('/:id', goalController.getGoalById);

// Create a new goal
router.post('/', validateGoal, goalController.createGoal);

// Update a goal
router.put('/:id', validateGoal, goalController.updateGoal);

// Delete a goal
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
