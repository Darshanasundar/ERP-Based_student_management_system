import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('PRESENT');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load initial students and courses
  useEffect(() => {
    const loadData = async () => {
      setInitLoading(true);
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          api.get('/students'),
          api.get('/courses'),
        ]);

        const studentList = studentsRes.data.students || [];
        const courseList = coursesRes.data.courses || [];

        setStudents(studentList);
        setCourses(courseList);

        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0].id);
        }
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setFeedback({
          type: 'error',
          message: 'Failed to load students or courses list from the server.',
        });
      } finally {
        setInitLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch attendance history whenever student changes
  const loadStudentHistory = async (studentId) => {
    if (!studentId) return;
    setHistoryLoading(true);
    try {
      const res = await api.get(`/attendance/student/${studentId}`);
      setStudentHistory(res.data);
    } catch (err) {
      console.warn('Could not load student attendance history:', err);
      setStudentHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentHistory(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedStudentId || !selectedCourseId || !attendanceDate || !status) {
      setFeedback({
        type: 'error',
        message: 'Please complete all attendance fields.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/attendance', {
        student_id: selectedStudentId,
        course_id: selectedCourseId,
        attendance_date: attendanceDate,
        status,
      });

      setFeedback({
        type: 'success',
        message: `Attendance marked as ${status} for ${res.data.attendance?.courseName || 'course'} on ${attendanceDate}.`,
        data: res.data.attendance,
      });

      // Reload student attendance summary
      loadStudentHistory(selectedStudentId);
    } catch (err) {
      console.error('Attendance submit error:', err);
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.message || 'Failed to submit attendance record.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <header className="page-header">
          <div>
            <span className="section-eyebrow">Academic Operations</span>
            <h1>Daily Attendance Workflow</h1>
            <p className="page-description">
              Mark or update student attendance records. Records are automatically updated on conflict.
            </p>
          </div>
        </header>

        {initLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading course and student registries...</p>
          </div>
        ) : (
          <div className="workflow-grid">
            {/* Step-by-Step Attendance Workflow Form Card */}
            <div className="card workflow-card">
              <h2 className="card-title">Mark Attendance</h2>
              <p className="card-subtitle">
                Select student, course, and date below to record or overwrite attendance.
              </p>

              {feedback && (
                <div className={`alert-banner ${feedback.type}`}>
                  <span className="alert-icon">
                    {feedback.type === 'success' ? '✅' : '⚠️'}
                  </span>
                  <span>{feedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="workflow-form">
                {/* Step 1: Student Selection */}
                <div className="form-group">
                  <label htmlFor="student-select">1. Select Student</label>
                  <select
                    id="student-select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    disabled={loading || students.length === 0}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.email} ({s.enrollmentNumber} - {s.department?.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Course Selection */}
                <div className="form-group">
                  <label htmlFor="course-select">2. Select Course</label>
                  <select
                    id="course-select"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    disabled={loading || courses.length === 0}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.credits} Credits - {c.department_name || 'Department'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Attendance Date */}
                <div className="form-group">
                  <label htmlFor="date-input">3. Attendance Date</label>
                  <input
                    id="date-input"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Step 4: Status Selector */}
                <div className="form-group">
                  <label>4. Attendance Status</label>
                  <div className="status-selector-row">
                    {['PRESENT', 'ABSENT', 'LATE'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`btn-status-toggle ${opt.toLowerCase()} ${
                          status === opt ? 'active' : ''
                        }`}
                        onClick={() => setStatus(opt)}
                      >
                        {opt === 'PRESENT' && '✅ '}
                        {opt === 'ABSENT' && '❌ '}
                        {opt === 'LATE' && '⏰ '}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || students.length === 0 || courses.length === 0}
                >
                  {loading ? 'Submitting Upsert...' : '💾 Submit Attendance'}
                </button>
              </form>
            </div>

            {/* Selected Student Profile & Attendance History Card */}
            <div className="card summary-card">
              <h2 className="card-title">Student Summary</h2>
              <p className="card-subtitle">Real-time attendance record</p>

              {studentHistory?.student ? (
                <div className="history-container">
                  <div className="student-badge-hero">
                    <div className="avatar-circle">
                      {studentHistory.student.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3>{studentHistory.student.email}</h3>
                      <span className="enrollment-chip">
                        {studentHistory.student.enrollmentNumber}
                      </span>
                    </div>
                  </div>

                  <div className="metrics-row">
                    <div className="metric-pill present">
                      <span className="pill-num">
                        {studentHistory.summary?.present || 0}
                      </span>
                      <span className="pill-text">Present</span>
                    </div>
                    <div className="metric-pill absent">
                      <span className="pill-num">
                        {studentHistory.summary?.absent || 0}
                      </span>
                      <span className="pill-text">Absent</span>
                    </div>
                    <div className="metric-pill late">
                      <span className="pill-num">
                        {studentHistory.summary?.late || 0}
                      </span>
                      <span className="pill-text">Late</span>
                    </div>
                  </div>

                  <div className="recent-records">
                    <h4>Recent Records</h4>
                    {studentHistory.records?.length === 0 ? (
                      <p className="empty-hint">No attendance marked yet.</p>
                    ) : (
                      <div className="records-vertical-list">
                        {studentHistory.records?.slice(0, 5).map((rec) => (
                          <div key={rec.id} className="record-item">
                            <div>
                              <div className="record-course">{rec.courseName}</div>
                              <div className="record-date">
                                {new Date(rec.date).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`tag-status ${rec.status.toLowerCase()}`}>
                              {rec.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : historyLoading ? (
                <div className="loading-state small">
                  <div className="spinner"></div>
                  <p>Loading attendance stats...</p>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Select a student to inspect attendance logs.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
