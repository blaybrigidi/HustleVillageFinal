const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');

// Auth routes
router.post('/signup', authController.requestSignup); // Request verification code
router.post('/verify', authController.verifySignup); // Verify code and create user

module.exports = router;

