const express = require('express');
const router = express.Router();
const hustlerController = require('../app/controllers/hustlerController');
const { authenticate } = require('../middleware/authMiddleware');

// Hustler routes
// Protect the service creation route with authentication middleware
router.post('/services', authenticate, hustlerController.createService);

module.exports = router;
