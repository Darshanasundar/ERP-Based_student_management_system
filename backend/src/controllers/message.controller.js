const db = require('../config/db');
const { getIo } = require('../config/socket');

/**
 * Send an academic advisory / intervention message to a student
 * POST /api/messages
 * Protected: SUPER_ADMIN, TEACHER
 */
async function sendMessage(req, res, next) {
  try {
    const { student_id, sender_name, sender_email, subject, message, priority, risk_status } = req.body;

    if (!student_id || !subject || !message) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'student_id, subject, and message are required fields.',
      });
    }

    const senderName = sender_name || req.user?.email?.split('@')[0] || 'Faculty Advisor';
    const senderEmail = sender_email || req.user?.email || 'faculty@erp.com';
    const messagePriority = priority || 'HIGH';

    const insertQuery = `
      INSERT INTO messages (student_id, sender_name, sender_email, subject, message, priority)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, student_id, sender_name, sender_email, subject, message, priority, is_read, created_at
    `;

    const result = await db.query(insertQuery, [
      student_id,
      senderName,
      senderEmail,
      subject,
      message,
      messagePriority,
    ]);

    const createdMessage = result.rows[0];

    // Emit live WebSocket event so the student receives the message instantly
    try {
      const io = getIo();
      if (io) {
        const payload = {
          ...createdMessage,
          risk_status: risk_status || 'High Risk',
          receivedAt: createdMessage.created_at,
        };

        io.to(`room_student_${student_id}`).emit('STUDENT_MESSAGE_RECEIVED', payload);
        io.emit('STUDENT_MESSAGE_RECEIVED', payload);
        console.log(`[WebSocket] Live message emitted to student ${student_id}: "${subject}"`);
      }
    } catch (wsErr) {
      console.warn('Message WebSocket emission warning:', wsErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Advisory message sent successfully and broadcasted live',
      data: createdMessage,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Fetch advisory messages for a student
 * GET /api/messages/student/:studentId
 */
async function getStudentMessages(req, res, next) {
  try {
    const { studentId } = req.params;

    const query = `
      SELECT id, student_id, sender_name, sender_email, subject, message, priority, is_read, created_at
      FROM messages
      WHERE student_id = $1
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [studentId]);

    return res.status(200).json({
      count: result.rows.length,
      messages: result.rows,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  sendMessage,
  getStudentMessages,
};
