const express = require('express');
const admissionsController = require('../controllers/admissions.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/admissions/enroll - Enroll student (restricted to SUPER_ADMIN, ADMIN, TEACHER)
router.post(
  '/enroll',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'TEACHER']),
  admissionsController.enrollStudent
);

module.exports = router;
