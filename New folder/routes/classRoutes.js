const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken, isTeacher } = require('../middleware/auth');

// Named GET routes FIRST (before /:id wildcard)
router.get('/all',                verifyToken,            classController.getAllClasses);
router.get('/teacher/my-classes', verifyToken, isTeacher, classController.getTeacherClasses);
router.get('/student/my-classes', verifyToken,            classController.getStudentClasses);

// Wildcard GET must be last among GET routes
router.get('/:id',                verifyToken,            classController.getClassDetails);

// Write operations (POST/PUT/DELETE - no conflict with GET wildcard)
router.post('/',                  verifyToken, isTeacher, classController.createClass);
router.post('/enroll',            verifyToken,            classController.enrollClass);
router.put('/:id',                verifyToken, isTeacher, classController.updateClass);
router.delete('/:id',             verifyToken, isTeacher, classController.deleteClass);

module.exports = router;
