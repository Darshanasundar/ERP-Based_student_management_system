const db = require('../config/db');
const { publishRiskAssessment } = require('../config/rabbitmq');
const { getCache, setCache, delCache } = require('../config/redis');
const { getIo } = require('../config/socket');

/**
 * Record or update marks for a student in a course
 * POST /api/marks
 * Protected: SUPER_ADMIN, TEACHER
 */
async function recordMarks(req, res, next) {
  try {
    const { student_id, course_id, marks, internal_score, external_score } = req.body;

    const scoreValue = marks !== undefined ? marks : internal_score;

    if (!student_id || !course_id || scoreValue === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'student_id, course_id, and marks (or internal_score) are required.',
      });
    }

    const parsedScore = Math.max(0, Math.min(100, Number(scoreValue) || 0));

    // Verify student exists
    const studentCheck = await db.query(
      `SELECT s.id, s.user_id, s.enrollment_number, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = $1`,
      [student_id]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student record not found.',
      });
    }

    const studentInfo = studentCheck.rows[0];

    // Verify course exists
    const courseCheck = await db.query(
      'SELECT id, name, credits FROM courses WHERE id = $1',
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Course record not found.',
      });
    }

    const courseInfo = courseCheck.rows[0];

    // Determine preliminary grade
    let grade = 'F';
    if (parsedScore >= 90) grade = 'O';
    else if (parsedScore >= 80) grade = 'A+';
    else if (parsedScore >= 70) grade = 'A';
    else if (parsedScore >= 60) grade = 'B+';
    else if (parsedScore >= 50) grade = 'B';

    // 1. Database Upsert into marks table
    const upsertQuery = `
      INSERT INTO marks (student_id, course_id, internal_score, total_score, grade)
      VALUES ($1, $2, $3, $3, $4)
      ON CONFLICT (student_id, course_id)
      DO UPDATE SET
        internal_score = EXCLUDED.internal_score,
        total_score = EXCLUDED.internal_score,
        grade = EXCLUDED.grade,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [student_id, course_id, parsedScore, grade]);
    const marksRecord = result.rows[0];

    // 2. Explicitly Invalidate Redis Caches
    await delCache(`student:data:${student_id}`);
    await delCache(`student:marks:${student_id}`);
    await delCache('admin:metrics');
    console.log(`Cache invalidated for student ${student_id} and admin:metrics.`);

    // 3. Publish to RabbitMQ risk_assessment_queue asynchronously
    await publishRiskAssessment({
      student_id,
      userId: studentInfo.user_id,
      enrollment_number: studentInfo.enrollment_number,
      student_email: studentInfo.email,
      course_id,
      course_name: courseInfo.name,
      internal_score: parsedScore,
      marks: parsedScore,
      grade,
      timestamp: new Date().toISOString(),
    });

    // 4. Emit MARKS_UPDATED WebSocket Event to Rooms
    const io = getIo();
    if (io) {
      const payload = {
        student_id,
        course_id,
        courseName: courseInfo.name,
        internal_score: parsedScore,
        grade,
        updated_at: marksRecord.updated_at,
      };

      io.to('room_admin').to('room_faculty').to(`room_student_${student_id}`).to(`room_student_${studentInfo.user_id}`).emit('MARKS_UPDATED', payload);
      io.emit('MARKS_UPDATED', payload);
      console.log(`Emitted MARKS_UPDATED via WebSocket for student ${student_id}`);
    }

    // 5. Immediately Return 200 OK without blocking on ML evaluation
    return res.status(200).json({
      message: 'Marks recorded successfully and queued for asynchronous AI risk assessment',
      marks: {
        id: marksRecord.id,
        studentId: student_id,
        courseId: course_id,
        courseName: courseInfo.name,
        internalScore: marksRecord.internal_score,
        grade: marksRecord.grade,
        updatedAt: marksRecord.updated_at,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get marks and 8-semester performance for a student (Write-Through Caching)
 * GET /api/marks/student/:studentId
 */
async function getStudentMarks(req, res, next) {
  try {
    const { studentId } = req.params;
    const cacheKey = `student:data:${studentId}`;

    // 1. Check Redis Cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        fromCache: true,
        ...cachedData,
      });
    }

    // 2. Query Database on Cache Miss
    const query = `
      SELECT 
        m.id,
        m.student_id,
        m.course_id,
        m.internal_score,
        m.external_score,
        m.total_score,
        m.grade,
        m.risk_score,
        m.risk_status,
        m.updated_at,
        c.name AS course_name,
        c.credits
      FROM marks m
      INNER JOIN courses c ON m.course_id = c.id
      WHERE m.student_id = $1
      ORDER BY m.updated_at DESC
    `;

    const result = await db.query(query, [studentId]);

    const payload = {
      studentId,
      count: result.rows.length,
      marks: result.rows.map((r) => ({
        id: r.id,
        courseId: r.course_id,
        courseName: r.course_name,
        credits: r.credits,
        internalScore: parseFloat(r.internal_score),
        totalScore: r.total_score ? parseFloat(r.total_score) : parseFloat(r.internal_score),
        grade: r.grade,
        riskScore: r.risk_score ? parseFloat(r.risk_score) : 0.12,
        riskStatus: r.risk_status || 'Low Risk',
        updatedAt: r.updated_at,
      })),
    };

    // 3. Write to Redis Cache
    await setCache(cacheKey, payload, 300);

    return res.status(200).json({
      fromCache: false,
      ...payload,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  recordMarks,
  getStudentMarks,
};
