const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_erp_jwt_encryption_key_2026';

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware for WebSocket Connections
  io.use(async (socket, next) => {
    try {
      const authHeader =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

      if (!authHeader) {
        return next(new Error('Authentication Error: Missing JWT token'));
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;

      // Also lookup student record if role is STUDENT
      if (decoded.role === 'STUDENT') {
        try {
          const res = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [decoded.id]
          );
          if (res.rows.length > 0) {
            socket.studentId = res.rows[0].id;
          }
        } catch (dbErr) {
          console.warn('Socket student lookup warning:', dbErr.message);
        }
      }

      next();
    } catch (err) {
      console.warn('Socket connection authentication rejected:', err.message);
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  // Handle Socket Connection & Room Allocations
  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;
    console.log(`WebSocket client connected: ${socket.id} (User: ${userId}, Role: ${role})`);

    // Assign rooms based on RBAC
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      socket.join('room_admin');
      console.log(`Socket ${socket.id} joined room: room_admin`);
    } else if (role === 'TEACHER' || role === 'FACULTY') {
      socket.join('room_faculty');
      console.log(`Socket ${socket.id} joined room: room_faculty`);
    } else if (role === 'STUDENT') {
      // Join room for user UUID and student UUID (if enrolled)
      socket.join(`room_student_${userId}`);
      console.log(`Socket ${socket.id} joined room: room_student_${userId}`);

      if (socket.studentId) {
        socket.join(`room_student_${socket.studentId}`);
        console.log(`Socket ${socket.id} joined room: room_student_${socket.studentId}`);
      }
    }

    // Ping / Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    console.warn('Socket.IO has not been initialized yet.');
  }
  return io;
}

module.exports = {
  initSocket,
  getIo,
};
