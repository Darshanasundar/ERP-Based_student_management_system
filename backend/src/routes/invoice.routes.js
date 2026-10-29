const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/invoices - Generate fee invoice (restricted to SUPER_ADMIN, ADMIN)
router.post(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  invoiceController.createInvoice
);

// GET /api/invoices - List all invoices in institution
router.get(
  '/',
  verifyToken,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  invoiceController.getAllInvoices
);

// GET /api/invoices/student/:studentId - List invoices for a student
router.get(
  '/student/:studentId',
  invoiceController.getStudentInvoices
);

module.exports = router;
