const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_erp_jwt_encryption_key_2026';

/**
 * Middleware to validate JWT from Authorization: Bearer <token> header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token required. Header format: Authorization: Bearer <token>',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization format. Format must be: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token.',
    });
  }
}

/**
 * Factory middleware that restricts access based on allowed user roles
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 */
function requireRole(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${req.user.role}' does not have sufficient permissions. Required roles: ${roles.join(', ')}`,
      });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
};
