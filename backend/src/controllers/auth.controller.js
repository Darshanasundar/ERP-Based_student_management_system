const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ALLOWED_ROLES = ['SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_erp_jwt_encryption_key_2026';
const SALT_ROUNDS = 10;

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    // Validate inputs
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'email, password, and role are required fields.',
      });
    }

    const normalizedRole = String(role).trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid role '${role}'. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user into database
    const insertQuery = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, is_active, created_at, updated_at
    `;
    const result = await db.query(insertQuery, [normalizedEmail, passwordHash, normalizedRole]);
    const newUser = result.rows[0];

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.is_active,
        createdAt: newUser.created_at,
      },
    });
  } catch (err) {
    // Unique violation error in PostgreSQL
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this email already exists.',
      });
    }
    return next(err);
  }
}

/**
 * Authenticate user and issue JWT
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'email and password are required fields.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Query user by email
    const query = `
      SELECT id, email, password_hash, role, is_active
      FROM users
      WHERE LOWER(email) = $1
    `;
    const result = await db.query(query, [normalizedEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Check account status
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Generate 24-hour JWT containing user's id and role
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      expiresIn: '24h',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
};
