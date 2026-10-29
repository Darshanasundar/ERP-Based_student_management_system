const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const departmentRoutes = require('./department.routes');
const admissionsRoutes = require('./admissions.routes');
const studentRoutes = require('./student.routes');
const courseRoutes = require('./course.routes');
const attendanceRoutes = require('./attendance.routes');
const invoiceRoutes = require('./invoice.routes');
const paymentRoutes = require('./payment.routes');
const marksRoutes = require('./marks.routes');
const internalRoutes = require('./internal.routes');
const messageRoutes = require('./message.routes');
const leaveRoutes = require('./leave.routes');

const router = express.Router();

// Modular sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/admissions', admissionsRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/marks', marksRoutes);
router.use('/internal', internalRoutes);
router.use('/messages', messageRoutes);
router.use('/leaves', leaveRoutes);
router.use('/', adminRoutes); // Mounts /system/metrics & /admin/metrics

module.exports = router;
