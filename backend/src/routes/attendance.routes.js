const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/attendance - Upsert attendance (restricted to SUPER_ADMIN and TEACHER)
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'TEACHER']),
  attendanceController.markAttendance
);

// GET /api/attendance/student/:studentId - Fetch attendance history with course names
router.get(
  '/student/:studentId',
  attendanceController.getStudentAttendance
);

module.exports = router;
