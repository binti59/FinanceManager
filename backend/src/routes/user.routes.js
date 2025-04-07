const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateUpdateProfile, validateUpdatePassword } = require('../validators/user.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', validateUpdateProfile, userController.updateProfile);

// Update user password
router.put('/password', validateUpdatePassword, userController.updatePassword);

module.exports = router;
