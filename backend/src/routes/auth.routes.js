const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

// Register a new user
router.post('/register', validateRegister, authController.register);

// Login user
router.post('/login', validateLogin, authController.login);

// Logout user
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authController.getCurrentUser);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
