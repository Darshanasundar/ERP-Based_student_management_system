const db = require('../config/db');
const { publishRiskAssessment } = require('../config/rabbitmq');
const { getCache, setCache, delCache } = require('../config/redis');
const { getIo } = require('../config/socket');
const { evaluateAcademicRisk } = require('../services/aiRiskEngine');

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

    // Verify course exists or auto-provision standard curriculum courses
    let courseInfo;
    const courseCheck = await db.query(
      'SELECT id, name, credits FROM courses WHERE id = $1',
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      const knownCourses = {
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { name: 'Operating Systems', credits: 4 },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { name: 'Computer Networks', credits: 3 },
      };
      const known = knownCourses[course_id] || { name: req.body.courseName || 'Curriculum Course', credits: 4 };
      const deptCheck = await db.query('SELECT id FROM departments LIMIT 1');
      const deptId = deptCheck.rows[0]?.id || null;
      await db.query(
        'INSERT INTO courses (id, name, department_id, credits) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [course_id, known.name, deptId, known.credits]
      );
      courseInfo = { id: course_id, name: known.name, credits: known.credits };
    } else {
      courseInfo = courseCheck.rows[0];
    }

    // Determine preliminary letter grade
    let grade = 'F';
    if (parsedScore >= 90) grade = 'O';
    else if (parsedScore >= 80) grade = 'A+';
    else if (parsedScore >= 70) grade = 'A';
    else if (parsedScore >= 60) grade = 'B+';
    else if (parsedScore >= 50) grade = 'B';

    // 1. Calculate Live Attendance Rate for student in course
    let attendanceRate = 85.0;
    try {
      const attRes = await db.query(
        `SELECT 
           COUNT(*) AS total_sessions,
           COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) AS present_count
         FROM attendance 
         WHERE student_id = $1 AND course_id = $2`,
        [student_id, course_id]
      );
      if (attRes.rows.length > 0 && Number(attRes.rows[0].total_sessions) > 0) {
        attendanceRate = (Number(attRes.rows[0].present_count) / Number(attRes.rows[0].total_sessions)) * 100;
      }
    } catch (attErr) {
      console.warn('Attendance lookup warning during risk calculation:', attErr.message);
    }

    // 2. Run Enhanced AI Risk Assessment Engine
    const riskAssessment = evaluateAcademicRisk({
      marks: parsedScore,
      attendancePercentage: attendanceRate,
    });

    console.log(
      `[AI Risk Engine] Evaluated student ${student_id} for course ${courseInfo.name}: ` +
      `Score=${parsedScore}, Attendance=${attendanceRate.toFixed(1)}% -> Risk=${riskAssessment.riskScore} (${riskAssessment.riskStatus})`
    );

    // 3. Database Upsert into marks table with evaluated risk
    const upsertQuery = `
      INSERT INTO marks (student_id, course_id, internal_score, total_score, grade, risk_score, risk_status)
      VALUES ($1, $2, $3, $3, $4, $5, $6)
      ON CONFLICT (student_id, course_id)
      DO UPDATE SET
        internal_score = EXCLUDED.internal_score,
        total_score = EXCLUDED.internal_score,
        grade = EXCLUDED.grade,
        risk_score = EXCLUDED.risk_score,
        risk_status = EXCLUDED.risk_status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [
      student_id,
      course_id,
      parsedScore,
      grade,
      riskAssessment.riskScore,
      riskAssessment.riskStatus,
    ]);
    const marksRecord = result.rows[0];

    // 4. Invalidate Redis Caches
    await delCache(`student:data:${student_id}`);
    await delCache(`student:marks:${student_id}`);
    await delCache('admin:metrics');
    await delCache('high:risk:roster');

    // 5. Publish to RabbitMQ if available (graceful fallback)
    try {
      await publishRiskAssessment({
        student_id,
        userId: studentInfo.user_id,
        enrollment_number: studentInfo.enrollment_number,
        student_email: studentInfo.email,
        course_id,
        course_name: courseInfo.name,
        internal_score: parsedScore,
        marks: parsedScore,
        attendance_rate: attendanceRate,
        risk_score: riskAssessment.riskScore,
        risk_status: riskAssessment.riskStatus,
        grade,
        timestamp: new Date().toISOString(),
      });
    } catch (amqpErr) {
      console.warn('RabbitMQ publish skipped (operating serverless):', amqpErr.message);
    }

    // 6. Emit Real-time WebSocket Events
    const io = getIo();
    if (io) {
      const payload = {
        student_id,
        course_id,
        courseName: courseInfo.name,
        internal_score: parsedScore,
        grade,
        risk_score: riskAssessment.riskScore,
        risk_status: riskAssessment.riskStatus,
        risk: riskAssessment,
        updated_at: marksRecord.updated_at,
      };

      io.to('room_admin')
        .to('room_faculty')
        .to(`room_student_${student_id}`)
        .to(`room_student_${studentInfo.user_id}`)
        .emit('MARKS_UPDATED', payload);

      io.to('room_admin')
        .to('room_faculty')
        .to(`room_student_${student_id}`)
        .emit('RISK_UPDATED', payload);

      io.emit('MARKS_UPDATED', payload);
      io.emit('RISK_UPDATED', payload);
    }

    // 7. Return detailed response with evaluated AI risk
    return res.status(200).json({
      message: 'Marks recorded and AI risk assessment evaluated successfully',
      marks: {
        id: marksRecord.id,
        studentId: student_id,
        courseId: course_id,
        courseName: courseInfo.name,
        internalScore: parseFloat(marksRecord.internal_score),
        grade: marksRecord.grade,
        riskScore: parseFloat(marksRecord.risk_score),
        riskStatus: marksRecord.risk_status,
        updatedAt: marksRecord.updated_at,
      },
      risk: riskAssessment,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Batch record or update marks for multiple students in a course
 * POST /api/marks/batch
 * Protected: SUPER_ADMIN, TEACHER
 */
async function batchRecordMarks(req, res, next) {
  try {
    const { course_id, records } = req.body;
    if (!course_id || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'course_id and records array are required.',
      });
    }

    let courseInfo;
    const courseCheck = await db.query(
      'SELECT id, name, credits FROM courses WHERE id = $1',
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      const knownCourses = {
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { name: 'Operating Systems', credits: 4 },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { name: 'Computer Networks', credits: 3 },
      };
      const known = knownCourses[course_id] || { name: req.body.courseName || 'Curriculum Course', credits: 4 };
      const deptCheck = await db.query('SELECT id FROM departments LIMIT 1');
      const deptId = deptCheck.rows[0]?.id || null;
      await db.query(
        'INSERT INTO courses (id, name, department_id, credits) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [course_id, known.name, deptId, known.credits]
      );
      courseInfo = { id: course_id, name: known.name, credits: known.credits };
    } else {
      courseInfo = courseCheck.rows[0];
    }
    const updatedRecords = [];

    for (const record of records) {
      const { student_id, marks } = record;
      if (!student_id || marks === undefined) continue;

      const parsedScore = Math.max(0, Math.min(100, Number(marks) || 0));

      let grade = 'F';
      if (parsedScore >= 90) grade = 'O';
      else if (parsedScore >= 80) grade = 'A+';
      else if (parsedScore >= 70) grade = 'A';
      else if (parsedScore >= 60) grade = 'B+';
      else if (parsedScore >= 50) grade = 'B';

      let attendanceRate = 85.0;
      try {
        const attRes = await db.query(
          `SELECT 
             COUNT(*) AS total_sessions,
             COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) AS present_count
           FROM attendance 
           WHERE student_id = $1 AND course_id = $2`,
          [student_id, course_id]
        );
        if (attRes.rows.length > 0 && Number(attRes.rows[0].total_sessions) > 0) {
          attendanceRate = (Number(attRes.rows[0].present_count) / Number(attRes.rows[0].total_sessions)) * 100;
        }
      } catch (attErr) {
        console.warn('Attendance lookup warning:', attErr.message);
      }

      const riskAssessment = evaluateAcademicRisk({
        marks: parsedScore,
        attendancePercentage: attendanceRate,
      });

      const upsertQuery = `
        INSERT INTO marks (student_id, course_id, internal_score, total_score, grade, risk_score, risk_status)
        VALUES ($1, $2, $3, $3, $4, $5, $6)
        ON CONFLICT (student_id, course_id)
        DO UPDATE SET
          internal_score = EXCLUDED.internal_score,
          total_score = EXCLUDED.internal_score,
          grade = EXCLUDED.grade,
          risk_score = EXCLUDED.risk_score,
          risk_status = EXCLUDED.risk_status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;

      const result = await db.query(upsertQuery, [
        student_id,
        course_id,
        parsedScore,
        grade,
        riskAssessment.riskScore,
        riskAssessment.riskStatus,
      ]);

      const marksRecord = result.rows[0];

      await delCache(`student:data:${student_id}`);
      await delCache(`student:marks:${student_id}`);

      updatedRecords.push({
        id: marksRecord.id,
        studentId: student_id,
        courseId: course_id,
        courseName: courseInfo.name,
        internalScore: parseFloat(marksRecord.internal_score),
        grade: marksRecord.grade,
        riskScore: parseFloat(marksRecord.risk_score),
        riskStatus: marksRecord.risk_status,
        updatedAt: marksRecord.updated_at,
        risk: riskAssessment,
      });
    }

    await delCache('admin:metrics');
    await delCache('high:risk:roster');

    const io = getIo();
    if (io) {
      io.emit('MARKS_BATCH_UPDATED', {
        course_id,
        courseName: courseInfo.name,
        updatedCount: updatedRecords.length,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      message: `Batch marks updated successfully for ${updatedRecords.length} students in ${courseInfo.name}`,
      courseId: course_id,
      courseName: courseInfo.name,
      records: updatedRecords,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get marks for all students in a specific course
 * GET /api/marks/course/:courseId
 */
async function getCourseMarks(req, res, next) {
  try {
    const { courseId } = req.params;
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
        s.enrollment_number,
        u.email,
        (
          SELECT ROUND((COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100), 1)
          FROM attendance a
          WHERE a.student_id = m.student_id AND a.course_id = m.course_id
        ) AS live_attendance_percentage
      FROM marks m
      INNER JOIN students s ON m.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE m.course_id = $1
      ORDER BY m.updated_at DESC
    `;

    const result = await db.query(query, [courseId]);

    return res.status(200).json({
      courseId,
      count: result.rows.length,
      marks: result.rows.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        enrollmentNumber: r.enrollment_number,
        email: r.email,
        internalScore: parseFloat(r.internal_score),
        totalScore: r.total_score ? parseFloat(r.total_score) : parseFloat(r.internal_score),
        grade: r.grade,
        riskScore: r.risk_score ? parseFloat(r.risk_score) : 0.12,
        riskStatus: r.risk_status || 'Low Risk',
        attendancePercentage: r.live_attendance_percentage !== null ? parseFloat(r.live_attendance_percentage) : 85.0,
        updatedAt: r.updated_at,
      })),
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

/**
 * Get all students flagged as High Risk or failing
 * GET /api/marks/high-risk
 * Protected: SUPER_ADMIN, TEACHER
 */
async function getHighRiskStudents(req, res, next) {
  try {
    const query = `
      SELECT 
        m.id AS mark_id,
        m.student_id,
        m.course_id,
        m.internal_score,
        m.external_score,
        m.total_score,
        m.grade,
        m.risk_score,
        m.risk_status,
        m.updated_at,
        s.enrollment_number,
        u.email,
        c.name AS course_name,
        d.name AS department_name,
        (
          SELECT ROUND((COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100), 1)
          FROM attendance a
          WHERE a.student_id = m.student_id AND a.course_id = m.course_id
        ) AS live_attendance_percentage
      FROM marks m
      INNER JOIN students s ON m.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN courses c ON m.course_id = c.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE m.risk_status = 'High Risk' 
         OR m.internal_score < 50 
         OR m.risk_score >= 0.65
      ORDER BY m.risk_score DESC, m.internal_score ASC;
    `;

    const result = await db.query(query);

    const students = result.rows.map((row) => {
      const attendance = row.live_attendance_percentage !== null ? parseFloat(row.live_attendance_percentage) : 75.0;
      const marksVal = parseFloat(row.internal_score) || 0;
      const diagnosis = evaluateAcademicRisk({
        marks: marksVal,
        attendancePercentage: attendance,
      });

      return {
        id: row.mark_id,
        studentId: row.student_id,
        enrollmentNumber: row.enrollment_number,
        email: row.email,
        name: row.email.split('@')[0].split('.').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        courseId: row.course_id,
        courseName: row.course_name,
        departmentName: row.department_name,
        internalScore: marksVal,
        grade: row.grade,
        attendancePercentage: attendance,
        riskScore: row.risk_score ? parseFloat(row.risk_score) : diagnosis.riskScore,
        riskStatus: row.risk_status || diagnosis.riskStatus,
        severityLevel: diagnosis.severityLevel,
        primaryFactors: diagnosis.primaryFactors,
        recommendations: diagnosis.recommendations,
        updatedAt: row.updated_at,
      };
    });

    return res.status(200).json({
      count: students.length,
      students,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * On-demand AI Risk calculation simulator
 * POST /api/marks/evaluate-risk
 */
async function calculateRiskOnDemand(req, res, next) {
  try {
    const { marks, attendancePercentage, pendingFeeCount, priorBacklogs } = req.body;
    const diagnosis = evaluateAcademicRisk({
      marks,
      attendancePercentage,
      pendingFeeCount,
      priorBacklogs,
    });
    return res.status(200).json({
      success: true,
      diagnosis,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  recordMarks,
  batchRecordMarks,
  getCourseMarks,
  getStudentMarks,
  getHighRiskStudents,
  calculateRiskOnDemand,
};
