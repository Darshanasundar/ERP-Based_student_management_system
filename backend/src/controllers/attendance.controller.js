const db = require('../config/db');

const ALLOWED_STATUSES = ['PRESENT', 'ABSENT', 'LATE'];

/**
 * Mark or update attendance using PostgreSQL UPSERT
 * POST /api/attendance
 * Protected: SUPER_ADMIN, TEACHER
 */
async function markAttendance(req, res, next) {
  try {
    const { student_id, course_id, attendance_date, status } = req.body;

    if (!student_id || !course_id || !attendance_date || !status) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'student_id, course_id, attendance_date, and status are required fields.',
      });
    }

    const normalizedStatus = String(status).trim().toUpperCase();
    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid status '${status}'. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    // Validate attendance_date format
    const parsedDate = new Date(attendance_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid attendance_date format. Use YYYY-MM-DD.',
      });
    }

    // Verify student exists
    const studentCheck = await db.query(
      'SELECT id, enrollment_number FROM students WHERE id = $1',
      [student_id]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The specified student_id does not exist.',
      });
    }

    // Verify course exists
    const courseCheck = await db.query(
      'SELECT id, name FROM courses WHERE id = $1',
      [course_id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The specified course_id does not exist.',
      });
    }

    // PostgreSQL Upsert on composite unique constraint (student_id, course_id, attendance_date)
    const upsertQuery = `
      INSERT INTO attendance (student_id, course_id, attendance_date, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, course_id, attendance_date)
      DO UPDATE SET 
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, student_id, course_id, attendance_date, status, created_at, updated_at
    `;

    const result = await db.query(upsertQuery, [
      student_id,
      course_id,
      attendance_date,
      normalizedStatus,
    ]);

    const record = result.rows[0];

    // Emit ATTENDANCE_UPDATED WebSocket event to student and faculty rooms
    try {
      const { getIo } = require('../config/socket');
      const { delCache } = require('../config/redis');
      const io = getIo();

      await delCache(`student:data:${student_id}`);
      await delCache('admin:metrics');

      if (io) {
        const payload = {
          student_id,
          studentId: student_id,
          enrollmentNumber: studentCheck.rows[0].enrollment_number,
          course_id,
          courseName: courseCheck.rows[0].name,
          attendance_date,
          status: record.status,
          updated_at: record.updated_at,
        };
        io.to('room_admin').to('room_faculty').to(`room_student_${student_id}`).emit('ATTENDANCE_UPDATED', payload);
        io.emit('ATTENDANCE_UPDATED', payload);
        console.log(`[WebSocket] ATTENDANCE_UPDATED emitted for student ${student_id}: ${record.status}`);
      }
    } catch (wsErr) {
      console.warn('Attendance WebSocket emission warning:', wsErr.message);
    }

    return res.status(200).json({
      message: 'Attendance recorded successfully',
      attendance: {
        id: record.id,
        studentId: record.student_id,
        enrollmentNumber: studentCheck.rows[0].enrollment_number,
        courseId: record.course_id,
        courseName: courseCheck.rows[0].name,
        attendanceDate: record.attendance_date,
        status: record.status,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      },
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format provided for student_id or course_id.',
      });
    }
    return next(err);
  }
}

/**
 * Fetch a student's attendance history with joined course details
 * GET /api/attendance/student/:studentId
 */
async function getStudentAttendance(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'studentId parameter is required.',
      });
    }

    // Verify student exists
    const studentCheck = await db.query(
      `SELECT s.id, s.enrollment_number, u.email
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student not found.',
      });
    }

    const studentInfo = studentCheck.rows[0];

    const query = `
      SELECT 
        a.id AS attendance_id,
        a.attendance_date,
        a.status,
        a.created_at,
        a.updated_at,
        c.id AS course_id,
        c.name AS course_name,
        c.credits
      FROM attendance a
      INNER JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = $1
      ORDER BY a.attendance_date DESC, a.created_at DESC
    `;

    const result = await db.query(query, [studentId]);

    const summary = {
      total: result.rows.length,
      present: result.rows.filter((r) => r.status === 'PRESENT').length,
      absent: result.rows.filter((r) => r.status === 'ABSENT').length,
      late: result.rows.filter((r) => r.status === 'LATE').length,
    };

    return res.status(200).json({
      student: {
        id: studentInfo.id,
        enrollmentNumber: studentInfo.enrollment_number,
        email: studentInfo.email,
      },
      summary,
      records: result.rows.map((row) => ({
        id: row.attendance_id,
        courseId: row.course_id,
        courseName: row.course_name,
        credits: row.credits,
        date: row.attendance_date,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid UUID format for studentId.',
      });
    }
    return next(err);
  }
}

module.exports = {
  markAttendance,
  getStudentAttendance,
};
