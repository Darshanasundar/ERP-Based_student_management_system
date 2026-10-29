const express = require('express');
const messageController = require('../controllers/message.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/messages - Faculty sends alert message to student
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'TEACHER']),
  messageController.sendMessage
);

// GET /api/messages/student/:studentId - Student or Faculty fetches messages
router.get(
  '/student/:studentId',
  messageController.getStudentMessages
);

module.exports = router;
