const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { verifyToken, isTeacher } = require('../middleware/auth');

// ─── Plan routes (teacher manages) ───────────────────────────
router.get('/class/:classId', verifyToken, planController.getPlans);
router.post('/class/:classId', verifyToken, isTeacher, planController.createPlan);
router.put('/:planId', verifyToken, isTeacher, planController.updatePlan);
router.delete('/:planId', verifyToken, isTeacher, planController.deletePlan);

// ─── Subscription routes (student pays) ──────────────────────
router.post('/subscribe', verifyToken, planController.subscribe);
router.get('/my-subscription/:classId', verifyToken, planController.getMySubscription);

// ─── Meeting routes ───────────────────────────────────────────
router.post('/meetings', verifyToken, isTeacher, planController.createMeeting);
router.get('/meetings/class/:classId', verifyToken, planController.getMeetings);
router.post('/meetings/join', verifyToken, planController.joinByCode);
router.patch('/meetings/:meetingId/toggle', verifyToken, isTeacher, planController.toggleMeeting);

module.exports = router;
