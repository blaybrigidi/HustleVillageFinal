const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');

// Admin routes
// TODO: Add admin role check middleware
// For now, using authenticate - you should add an isAdmin check
// Get all delete requests (optionally filter by status query param: ?status=pending)
router.get('/delete-requests', authenticate, adminController.getDeleteRequests);
router.post('/delete-requests/:id/approve', authenticate, adminController.approveDeleteRequest); // Approve delete request
router.post('/delete-requests/:id/deny', authenticate, adminController.denyDeleteRequest); // Deny delete request

module.exports = router;

