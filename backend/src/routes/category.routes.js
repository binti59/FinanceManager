const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateCategory } = require('../validators/category.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create a new category
router.post('/', validateCategory, categoryController.createCategory);

// Update a category
router.put('/:id', validateCategory, categoryController.updateCategory);

// Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
