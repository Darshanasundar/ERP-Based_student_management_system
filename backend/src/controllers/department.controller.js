const db = require('../config/db');

/**
 * Create a new department
 * POST /api/departments
 * Protected: SUPER_ADMIN
 */
async function createDepartment(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Department name is required.',
      });
    }

    const trimmedName = String(name).trim();
    const trimmedDescription = description ? String(description).trim() : null;

    const query = `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at
    `;
    const result = await db.query(query, [trimmedName, trimmedDescription]);

    return res.status(201).json({
      message: 'Department created successfully',
      department: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: `Department '${req.body.name}' already exists.`,
      });
    }
    return next(err);
  }
}

/**
 * List all departments
 * GET /api/departments
 */
async function getDepartments(req, res, next) {
  try {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM departments
      ORDER BY name ASC
    `;
    const result = await db.query(query);

    return res.status(200).json({
      count: result.rows.length,
      departments: result.rows,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createDepartment,
  getDepartments,
};
