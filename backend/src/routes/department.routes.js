const express = require('express');
const departmentController = require('../controllers/department.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/departments - Create department (restricted to SUPER_ADMIN, ADMIN)
router.post('/', verifyToken, requireRole(['SUPER_ADMIN', 'ADMIN']), departmentController.createDepartment);

// GET /api/departments - List all departments
router.get('/', departmentController.getDepartments);

module.exports = router;
