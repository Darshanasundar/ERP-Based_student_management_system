const express = require('express');
const studentController = require('../controllers/student.controller');

const router = express.Router();

// GET /api/students - Directory of all enrolled students with JOINed user and department info
router.get('/', studentController.getStudents);

module.exports = router;
