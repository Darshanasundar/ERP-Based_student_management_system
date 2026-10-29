const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/payments - Process fee payment (SUPER_ADMIN, ADMIN, PARENT, STUDENT)
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'PARENT', 'STUDENT']),
  paymentController.processPayment
);

module.exports = router;
