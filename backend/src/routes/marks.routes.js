const express = require('express');
const marksController = require('../controllers/marks.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/marks - Upsert student marks, evaluate AI risk, push to RabbitMQ, invalidate Redis, emit WS
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'TEACHER']),
  marksController.recordMarks
);

// GET /api/marks/high-risk - Retrieve all flagged high-risk students across courses
router.get(
  '/high-risk',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'TEACHER']),
  marksController.getHighRiskStudents
);

// POST /api/marks/evaluate-risk - Run instant AI risk engine calculation
router.post(
  '/evaluate-risk',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'TEACHER']),
  marksController.calculateRiskOnDemand
);

// GET /api/marks/student/:studentId - Fetch student marks with Redis Write-Through cache
router.get(
  '/student/:studentId',
  marksController.getStudentMarks
);

module.exports = router;
