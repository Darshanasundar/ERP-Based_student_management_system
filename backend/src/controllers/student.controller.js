const db = require('../config/db');

/**
 * Fetch all enrolled students with user & department details
 * GET /api/students
 */
async function getStudents(req, res, next) {
  try {
    const query = `
      SELECT 
        s.id AS student_id,
        s.enrollment_number,
        s.date_of_birth,
        s.created_at AS student_enrolled_at,
        u.id AS user_id,
        u.email,
        u.is_active,
        u.role,
        d.id AS department_id,
        d.name AS department_name
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN departments d ON s.department_id = d.id
      ORDER BY s.created_at DESC
    `;

    const result = await db.query(query);

    const students = result.rows.map((row) => ({
      id: row.student_id,
      enrollmentNumber: row.enrollment_number,
      dateOfBirth: row.date_of_birth,
      enrolledAt: row.student_enrolled_at,
      user: {
        id: row.user_id,
        email: row.email,
        isActive: row.is_active,
        role: row.role,
      },
      department: {
        id: row.department_id,
        name: row.department_name,
      },
    }));

    return res.status(200).json({
      count: students.length,
      students,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getStudents,
};
