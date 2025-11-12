const express = require('express');
const router = express.Router();
const hustlerController = require('../app/controllers/hustlerController');
const { authenticate } = require('../middleware/authMiddleware');

// Hustler routes
// Protect routes with authentication middleware
router.get('/services', authenticate, hustlerController.getMyServices); // Get all services for authenticated seller
router.post('/services', authenticate, hustlerController.createService); // Create new service
router.put('/services/:id', authenticate, hustlerController.updateService); // Update service by ID
router.patch('/services/:id', authenticate, hustlerController.updateService); // Also support PATCH
router.post('/services/:id/request-delete', authenticate, hustlerController.requestServiceDeletion); // Request service deletion
router.patch('/services/:id/toggle', authenticate, hustlerController.toggleServiceStatus); // Toggle service status (pause/unpause)


module.exports = router;
