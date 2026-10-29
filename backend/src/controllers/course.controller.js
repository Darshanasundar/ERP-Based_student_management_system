const db = require('../config/db');

/**
 * Create a course
 * POST /api/courses
 * Protected: SUPER_ADMIN, TEACHER
 */
async function createCourse(req, res, next) {
  try {
    const { name, department_id, credits } = req.body;

    if (!name || !department_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'name and department_id are required fields.',
      });
    }

    // Verify department exists
    const deptCheck = await db.query(
      'SELECT id, name FROM departments WHERE id = $1',
      [department_id]
    );

    if (deptCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The specified department_id does not exist.',
      });
    }

    const courseCredits = Number.isInteger(Number(credits)) && Number(credits) > 0 ? Number(credits) : 3;

    const query = `
      INSERT INTO courses (name, department_id, credits)
      VALUES ($1, $2, $3)
      RETURNING id, name, department_id, credits, created_at, updated_at
    `;
    const result = await db.query(query, [name.trim(), department_id, courseCredits]);
    const course = result.rows[0];

    return res.status(201).json({
      message: 'Course created successfully',
      course: {
        ...course,
        departmentName: deptCheck.rows[0].name,
      },
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format provided for department_id.',
      });
    }
    return next(err);
  }
}

/**
 * List all courses (optional helper)
 * GET /api/courses
 */
async function getCourses(req, res, next) {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.credits,
        c.created_at,
        c.updated_at,
        d.id AS department_id,
        d.name AS department_name
      FROM courses c
      INNER JOIN departments d ON c.department_id = d.id
      ORDER BY c.name ASC
    `;
    const result = await db.query(query);

    return res.status(200).json({
      count: result.rows.length,
      courses: result.rows,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createCourse,
  getCourses,
};
