const express = require('express');
const leaveController = require('../controllers/leave.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/leaves - Apply for leave (Faculty / Super Admin)
router.post(
  '/',
  verifyToken,
  requireRole(['TEACHER', 'SUPER_ADMIN']),
  leaveController.applyLeave
);

// GET /api/leaves - View leave applications
router.get(
  '/',
  verifyToken,
  leaveController.getLeaves
);

// PATCH /api/leaves/:id/status - Approve or reject leave (Super Admin)
router.patch(
  '/:id/status',
  verifyToken,
  requireRole(['SUPER_ADMIN']),
  leaveController.updateLeaveStatus
);

module.exports = router;
