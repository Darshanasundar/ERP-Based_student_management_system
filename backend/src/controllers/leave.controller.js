const db = require('../config/db');

/**
 * Apply for a new leave request (Faculty HR module)
 * POST /api/leaves
 * Protected: TEACHER, SUPER_ADMIN
 */
async function applyLeave(req, res, next) {
  try {
    const { faculty_id, faculty_name, faculty_email, leave_type, start_date, end_date, days_count, reason } = req.body;

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'leave_type, start_date, end_date, and reason are required fields.',
      });
    }

    const facultyId = faculty_id || 'fac-001';
    const facultyName = faculty_name || 'Dr. Subramanian Ramanujan';
    const facultyEmail = faculty_email || req.user?.email || 'faculty@erp.com';
    const days = parseInt(days_count, 10) || 1;

    const query = `
      INSERT INTO leaves (faculty_id, faculty_name, faculty_email, leave_type, start_date, end_date, days_count, reason, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
      RETURNING *
    `;

    const result = await db.query(query, [
      facultyId,
      facultyName,
      facultyEmail,
      leave_type,
      start_date,
      end_date,
      days,
      reason,
    ]);

    const newLeave = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully and forwarded to Administration',
      leave: newLeave,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get all leave requests (for Admin) or filtered by faculty
 * GET /api/leaves
 */
async function getLeaves(req, res, next) {
  try {
    const { faculty_email } = req.query;

    let query = 'SELECT * FROM leaves ORDER BY created_at DESC';
    let params = [];

    if (faculty_email) {
      query = 'SELECT * FROM leaves WHERE faculty_email = $1 ORDER BY created_at DESC';
      params = [faculty_email];
    }

    const result = await db.query(query, params);

    return res.status(200).json({
      count: result.rows.length,
      leaves: result.rows,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Approve or Reject leave request (Admin workflow)
 * PATCH /api/leaves/:id/status
 * Protected: SUPER_ADMIN
 */
async function updateLeaveStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Status must be APPROVED, REJECTED, or PENDING.',
      });
    }

    const query = `
      UPDATE leaves
      SET status = $1, admin_remarks = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await db.query(query, [status, admin_remarks || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Leave record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Leave application status updated to ${status}`,
      leave: result.rows[0],
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
