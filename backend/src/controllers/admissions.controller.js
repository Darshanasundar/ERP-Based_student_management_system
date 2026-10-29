const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');

const SALT_ROUNDS = 10;

/**
 * Generate a unique enrollment number: STU-YYYY-RANDOM
 */
function generateEnrollmentNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
  return `STU-${year}-${randomSuffix}`;
}

/**
 * Enroll a student using an atomic PostgreSQL transaction
 * POST /api/admissions/enroll
 * Protected: SUPER_ADMIN, TEACHER
 */
async function enrollStudent(req, res, next) {
  const { email, password, department_id, date_of_birth } = req.body;

  // Validate required fields
  if (!email || !password || !department_id || !date_of_birth) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'email, password, department_id, and date_of_birth are required fields.',
    });
  }

  // Validate date format
  const parsedDate = new Date(date_of_birth);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid date_of_birth format. Use YYYY-MM-DD.',
    });
  }

  const client = await db.pool.connect();

  try {
    // 1. Begin atomic transaction
    await client.query('BEGIN');

    // 2. Validate department exists
    const deptCheck = await client.query(
      'SELECT id, name FROM departments WHERE id = $1',
      [department_id]
    );

    if (deptCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Not Found',
        message: 'The specified department_id does not exist.',
      });
    }

    const department = deptCheck.rows[0];

    // 3. Step 1: Create user record with role STUDENT and hashed password
    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userInsertQuery = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'STUDENT')
      RETURNING id, email, role, is_active, created_at
    `;
    const userResult = await client.query(userInsertQuery, [normalizedEmail, passwordHash]);
    const newUser = userResult.rows[0];

    // 4. Step 2: Generate unique enrollment number
    const enrollmentNumber = generateEnrollmentNumber();

    // 5. Step 3: Insert into students table linking user_id, department_id, and enrollment_number
    const studentInsertQuery = `
      INSERT INTO students (user_id, department_id, enrollment_number, date_of_birth)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, department_id, enrollment_number, date_of_birth, created_at, updated_at
    `;
    const studentResult = await client.query(studentInsertQuery, [
      newUser.id,
      department.id,
      enrollmentNumber,
      date_of_birth,
    ]);
    const newStudent = studentResult.rows[0];

    // 6. Commit transaction atomically
    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Student enrolled successfully',
      student: {
        id: newStudent.id,
        enrollmentNumber: newStudent.enrollment_number,
        dateOfBirth: newStudent.date_of_birth,
        createdAt: newStudent.created_at,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.is_active,
        },
        department: {
          id: department.id,
          name: department.name,
        },
      },
    });
  } catch (err) {
    // If any SQL insert fails, rollback entire transaction
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this email or enrollment number already exists.',
      });
    }

    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format provided for department_id.',
      });
    }

    return next(err);
  } finally {
    // Always release client back to pool
    client.release();
  }
}

module.exports = {
  enrollStudent,
};
