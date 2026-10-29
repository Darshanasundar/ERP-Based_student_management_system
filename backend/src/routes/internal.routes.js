const express = require('express');
const db = require('../config/db');
const { getIo } = require('../config/socket');
const { delCache } = require('../config/redis');

const router = express.Router();

/**
 * Internal Webhook hit by ML Microservice
 * POST /api/internal/emit-risk-update
 */
router.post('/emit-risk-update', async (req, res, next) => {
  try {
    const { student_id, course_id, risk_score, risk_status, marks } = req.body;

    if (!student_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'student_id is required',
      });
    }

    const numericScore = parseFloat(risk_score) || 0.12;
    const statusLabel = risk_status || (numericScore > 0.7 ? 'High Risk' : numericScore > 0.4 ? 'Medium Risk' : 'Low Risk');

    // 1. Update marks table in PostgreSQL with evaluated risk score & status
    if (course_id) {
      await db.query(
        `UPDATE marks 
         SET risk_score = $1, risk_status = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE student_id = $3 AND course_id = $4`,
        [numericScore, statusLabel, student_id, course_id]
      );
    } else {
      await db.query(
        `UPDATE marks 
         SET risk_score = $1, risk_status = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE student_id = $3`,
        [numericScore, statusLabel, student_id]
      );
    }

    // 2. Invalidate Redis Caches
    await delCache(`student:data:${student_id}`);
    await delCache('admin:metrics');

    // 3. Trigger WebSocket Emission (RISK_UPDATED) to rooms
    const io = getIo();
    if (io) {
      const payload = {
        student_id,
        course_id,
        risk_score: numericScore,
        risk_status: statusLabel,
        marks,
        evaluatedAt: new Date().toISOString(),
      };

      // Broadcast to Admin, Faculty, and Student rooms
      io.to('room_admin').to('room_faculty').to(`room_student_${student_id}`).emit('RISK_UPDATED', payload);
      // Also broadcast broadly to ensure all connected dashboards update
      io.emit('RISK_UPDATED', payload);

      console.log(`[WebSocket] RISK_UPDATED broadcasted for student ${student_id}: Score=${numericScore}, Status=${statusLabel}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Risk update successfully processed and broadcasted via WebSockets',
      data: {
        student_id,
        risk_score: numericScore,
        risk_status: statusLabel,
      },
    });
  } catch (err) {
    console.error('Error in internal emit-risk-update webhook:', err);
    return next(err);
  }
});

module.exports = router;
