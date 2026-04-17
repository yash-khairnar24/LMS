const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');
const { verifyToken, isTeacher } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.use(verifyToken);

// Student reading endpoints
router.get('/live-classes', featureController.getLiveClasses);
router.get('/study-materials', featureController.getStudyMaterials);
router.get('/recordings', featureController.getRecordings);
router.get('/assignments', featureController.getAssignments);

// Teacher writing endpoints
router.post('/materials', isTeacher, upload.single('file'), featureController.uploadMaterial);
router.post('/assignments', isTeacher, featureController.createAssignment);

module.exports = router;
