const db = require('../config/db');

/**
 * Generate a new fee invoice for a student
 * POST /api/invoices
 * Protected: SUPER_ADMIN
 */
async function createInvoice(req, res, next) {
  try {
    const { student_id, amount, due_date } = req.body;

    if (!student_id || !amount || !due_date) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'student_id, amount, and due_date are required fields.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'amount must be a positive number.',
      });
    }

    const parsedDueDate = new Date(due_date);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid due_date format. Use YYYY-MM-DD.',
      });
    }

    // Verify student exists
    const studentCheck = await db.query(
      `SELECT s.id, s.enrollment_number, u.email
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [student_id]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The specified student_id does not exist.',
      });
    }

    const student = studentCheck.rows[0];

    const query = `
      INSERT INTO invoices (student_id, amount, due_date, status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING id, student_id, amount, status, due_date, created_at, updated_at
    `;

    const result = await db.query(query, [student_id, numericAmount.toFixed(2), due_date]);
    const invoice = result.rows[0];

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoice: {
        ...invoice,
        student: {
          enrollmentNumber: student.enrollment_number,
          email: student.email,
        },
      },
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format for student_id.',
      });
    }
    return next(err);
  }
}

/**
 * List all invoices for a specific student
 * GET /api/invoices/student/:studentId
 */
async function getStudentInvoices(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'studentId parameter is required.',
      });
    }

    // Verify student exists
    const studentCheck = await db.query(
      `SELECT s.id, s.enrollment_number, u.email
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student not found.',
      });
    }

    const student = studentCheck.rows[0];

    const query = `
      SELECT 
        i.id,
        i.student_id,
        i.amount,
        i.status,
        i.due_date,
        i.created_at,
        i.updated_at,
        COALESCE(SUM(p.amount_paid), 0) AS total_paid,
        (i.amount - COALESCE(SUM(p.amount_paid), 0)) AS remaining_balance
      FROM invoices i
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.student_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `;

    const result = await db.query(query, [studentId]);

    return res.status(200).json({
      student: {
        id: student.id,
        enrollmentNumber: student.enrollment_number,
        email: student.email,
      },
      count: result.rows.length,
      invoices: result.rows.map((inv) => ({
        id: inv.id,
        studentId: inv.student_id,
        amount: parseFloat(inv.amount),
        totalPaid: parseFloat(inv.total_paid),
        remainingBalance: parseFloat(inv.remaining_balance),
        status: inv.status,
        dueDate: inv.due_date,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
      })),
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format for studentId.',
      });
    }
    return next(err);
  }
}

/**
 * List all invoices across the entire institution
 * GET /api/invoices
 */
async function getAllInvoices(req, res, next) {
  try {
    const query = `
      SELECT 
        i.id,
        i.student_id,
        i.amount,
        i.status,
        i.due_date,
        i.created_at,
        i.updated_at,
        s.enrollment_number,
        u.email,
        COALESCE(SUM(p.amount_paid), 0) AS total_paid,
        (i.amount - COALESCE(SUM(p.amount_paid), 0)) AS remaining_balance
      FROM invoices i
      LEFT JOIN students s ON i.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN payments p ON i.id = p.invoice_id
      GROUP BY i.id, s.enrollment_number, u.email
      ORDER BY i.created_at DESC
    `;

    const result = await db.query(query);

    return res.status(200).json({
      count: result.rows.length,
      invoices: result.rows.map((inv) => ({
        id: inv.id,
        studentId: inv.student_id,
        enrollmentNumber: inv.enrollment_number || 'N/A',
        studentEmail: inv.email || 'N/A',
        amount: parseFloat(inv.amount),
        totalPaid: parseFloat(inv.total_paid),
        remainingBalance: parseFloat(inv.remaining_balance),
        status: inv.status,
        dueDate: inv.due_date,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createInvoice,
  getStudentInvoices,
  getAllInvoices,
};
