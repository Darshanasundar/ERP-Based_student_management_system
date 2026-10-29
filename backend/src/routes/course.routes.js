const express = require('express');
const courseController = require('../controllers/course.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/courses - Create course (restricted to SUPER_ADMIN, ADMIN, TEACHER)
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'TEACHER']),
  courseController.createCourse
);

// GET /api/courses - List courses
router.get('/', courseController.getCourses);

module.exports = router;
