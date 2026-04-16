const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { verifyToken, isTeacher, isAdmin } = require('../middleware/auth');

// Teacher submits advertisement for admin approval
router.post('/requests', verifyToken, isTeacher, advertisementController.createRequest);
router.get('/requests/my', verifyToken, isTeacher, advertisementController.getMyRequests);

// Admin actions
router.get('/admin/requests', verifyToken, isAdmin, advertisementController.getAdminRequests);
router.patch('/admin/requests/:requestId/approve', verifyToken, isAdmin, advertisementController.approveRequest);
router.patch('/admin/requests/:requestId/reject', verifyToken, isAdmin, advertisementController.rejectRequest);

// Students see only approved advertisements
router.get('/approved', verifyToken, advertisementController.getApprovedAdvertisements);

module.exports = router;
