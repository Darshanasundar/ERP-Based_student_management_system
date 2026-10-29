import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import {
  BookOpen,
  CheckCircle2,
  Save,
  Sparkles,
  Calendar,
  Clock,
  Database,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  ArrowUpRight,
  CalendarCheck,
  FileSpreadsheet,
  MessageSquare,
  Send,
  Mail,
  UserCheck,
  Search,
  Bell,
  CalendarRange,
  FileText,
  PlusCircle,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

export default function FacultyDashboard() {
  const { socket, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'attendance';

  const [courses, setCourses] = useState([
    { id: '27d6a359-8570-4e13-b2a8-73e03546e31e', code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, section: 'CSE - A' },
    { id: '5bb138c2-848b-4ca3-9719-d8b8b07a719c', code: 'CS302', name: 'Introduction to Databases', credits: 3, section: 'CSE - B' },
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState('27d6a359-8570-4e13-b2a8-73e03546e31e');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Intervention Message Modal State
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('HIGH');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Leave Management (HR) State
  const [leavesList, setLeavesList] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: 'CASUAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    days_count: 1,
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Weekly Teaching Timetable Data
  const facultySchedule = [
    {
      day: 'Monday',
      slots: [
        { time: '09:00 - 10:30', course: 'CS301 Data Structures & Algorithms', type: 'Lecture', section: 'CSE - Sec A', room: 'LH-201', attendanceExpected: '64 Students' },
        { time: '11:00 - 12:30', course: 'CS302 Intro to Databases', type: 'Lecture', section: 'CSE - Sec B', room: 'LH-104', attendanceExpected: '58 Students' },
        { time: '14:00 - 16:00', course: 'Student Mentoring & Advisory', type: 'Office Hours', section: 'Open Consultation', room: 'Cabin CS-402', attendanceExpected: 'Drop-in' },
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '09:00 - 12:00', course: 'CS301P Advanced Algorithms Laboratory', type: 'Hands-on Lab', section: 'CSE - Batch A1', room: 'Systems Lab 3', attendanceExpected: '32 Students' },
        { time: '14:30 - 16:00', course: 'Department Academic Council', type: 'Faculty Meeting', section: 'CSE Dept', room: 'Conference Hall B', attendanceExpected: 'Faculty Staff' },
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '10:30 - 12:00', course: 'CS301 Data Structures & Algorithms', type: 'Lecture', section: 'CSE - Sec A', room: 'LH-201', attendanceExpected: '64 Students' },
        { time: '13:30 - 15:00', course: 'CS302 Intro to Databases', type: 'Lecture', section: 'CSE - Sec B', room: 'LH-104', attendanceExpected: '58 Students' },
        { time: '15:30 - 17:00', course: 'AI Risk Advisory & Remedial Sessions', type: 'Tutorial', section: 'Flagged Students', room: 'Room CS-402', attendanceExpected: '8 Students' },
      ],
    },
    {
      day: 'Thursday',
      slots: [
        { time: '10:00 - 12:30', course: 'CS491 Final Year Capstone Project', type: 'Project Review', section: 'Phase-1 Evaluation', room: 'R&D Center', attendanceExpected: '12 Teams' },
        { time: '14:00 - 15:30', course: 'CS301 Tutorial & Problem Solving', type: 'Tutorial', section: 'CSE - Sec A', room: 'LH-201', attendanceExpected: '64 Students' },
      ],
    },
    {
      day: 'Friday',
      slots: [
        { time: '09:30 - 11:30', course: 'CS302P Database Engineering Lab', type: 'Hands-on Lab', section: 'CSE - Batch B2', room: 'Database Lab 2', attendanceExpected: '30 Students' },
        { time: '14:00 - 17:00', course: 'Curriculum & Research Development', type: 'Research Slot', section: 'Self-Directed', room: 'Cabin CS-402', attendanceExpected: 'Faculty' },
      ],
    },
  ];

  // Fetch faculty leaves from backend
  const fetchFacultyLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await api.get('/leaves?faculty_email=faculty@erp.com');
      if (res.data?.leaves) {
        setLeavesList(res.data.leaves);
      }
    } catch (err) {
      console.warn('Could not fetch faculty leaves:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchFacultyLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      await api.post('/leaves', {
        faculty_name: 'Dr. Subramanian Ramanujan',
        faculty_email: 'faculty@erp.com',
        leave_type: leaveFormData.leave_type,
        start_date: leaveFormData.start_date,
        end_date: leaveFormData.end_date,
        days_count: Number(leaveFormData.days_count) || 1,
        reason: leaveFormData.reason,
      });
      setToastMessage('✓ Leave request submitted! Successfully routed to Admin portal for approval.');
      setShowApplyModal(false);
      setLeaveFormData({
        leave_type: 'CASUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        days_count: 1,
        reason: '',
      });
      fetchFacultyLeaves();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error applying for leave:', err);
      setToastMessage(`Error submitting leave: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Student roster state: Alex Turner is the database-connected student; others are rich dummy data from Apex Institute
  const [roster, setRoster] = useState([
    {
      id: '0937df8b-2b8f-49a7-bfee-84eace226eec',
      rollNo: 'STU-2026-CCF9BC',
      name: 'Alex Turner',
      email: 'alex.turner@erp.com',
      department: 'Computer Science & Engineering',
      riskStatus: 'Low Risk',
      riskScore: 0.12,
      attendancePresent: true,
      marks: 92,
      isLiveDbUser: true,
      lastSavedStatus: 'PRESENT',
      isGlowing: false,
    },
    {
      id: 'dummy-1',
      rollNo: 'AIT-2024-CS101',
      name: 'Aarav Sharma',
      email: 'aarav.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Low Risk',
      riskScore: 0.14,
      attendancePresent: true,
      marks: 88,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
    },
    {
      id: 'dummy-2',
      rollNo: 'AIT-2024-CS102',
      name: 'Bhavya Patel',
      email: 'bhavya.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'High Risk',
      riskScore: 0.84,
      attendancePresent: false,
      marks: 42,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
    },
    {
      id: 'dummy-3',
      rollNo: 'AIT-2024-CS103',
      name: 'Chetan Verma',
      email: 'chetan.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Medium Risk',
      riskScore: 0.58,
      attendancePresent: true,
      marks: 61,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
    },
    {
      id: 'dummy-4',
      rollNo: 'AIT-2024-CS104',
      name: 'Divya Sundaram',
      email: 'divya.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Low Risk',
      riskScore: 0.08,
      attendancePresent: true,
      marks: 94,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
    },
    {
      id: 'dummy-5',
      rollNo: 'AIT-2024-CS105',
      name: 'Eashwar Pillai',
      email: 'eashwar.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Medium Risk',
      riskScore: 0.52,
      attendancePresent: true,
      marks: 67,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
    },
  ]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Load real courses and Alex Turner data from PostgreSQL backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get('/courses').catch(() => null);
        if (courseRes?.data?.courses && courseRes.data.courses.length > 0) {
          const mappedCourses = courseRes.data.courses.map((c, idx) => ({
            id: c.id,
            code: `CS30${idx + 1}`,
            name: c.name,
            credits: c.credits,
            section: 'CSE - A',
          }));
          setCourses(mappedCourses);
          setSelectedCourseId(mappedCourses[0].id);
        }

        // Check latest attendance for Alex Turner from DB
        const attRes = await api.get('/attendance/student/0937df8b-2b8f-49a7-bfee-84eace226eec').catch(() => null);
        if (attRes?.data?.records && attRes.data.records.length > 0) {
          const latest = attRes.data.records[0];
          setRoster((prev) =>
            prev.map((s) =>
              s.email === 'alex.turner@erp.com'
                ? {
                    ...s,
                    attendancePresent: latest.status === 'PRESENT',
                    lastSavedStatus: latest.status,
                  }
                : s
            )
          );
        }

        // Check latest marks for Alex Turner from DB
        const marksRes = await api.get('/marks/student/0937df8b-2b8f-49a7-bfee-84eace226eec').catch(() => null);
        if (marksRes?.data?.marks && marksRes.data.marks.length > 0) {
          const latestMark = marksRes.data.marks[0];
          setRoster((prev) =>
            prev.map((s) =>
              s.email === 'alex.turner@erp.com'
                ? {
                    ...s,
                    marks: latestMark.internalScore,
                    riskStatus: latestMark.riskStatus || s.riskStatus,
                    riskScore: latestMark.riskScore || s.riskScore,
                  }
                : s
            )
          );
        }
      } catch (err) {
        console.warn('Could not sync live DB data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // WebSockets: Real-Time Listeners for MARKS_UPDATED and RISK_UPDATED
  useEffect(() => {
    if (!socket) return;

    const handleMarksUpdated = (data) => {
      console.log('[WebSocket Event: Faculty] MARKS_UPDATED received:', data);
      setRoster((prev) =>
        prev.map((s) => {
          if (s.id === data.student_id || (s.isLiveDbUser && data.student_id === '0937df8b-2b8f-49a7-bfee-84eace226eec')) {
            return {
              ...s,
              marks: data.internal_score !== undefined ? data.internal_score : s.marks,
              isGlowing: true,
            };
          }
          return s;
        })
      );
      setTimeout(() => {
        setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
      }, 3000);
    };

    const handleRiskUpdated = (data) => {
      console.log('[WebSocket Event: Faculty] RISK_UPDATED received:', data);
      setRoster((prev) =>
        prev.map((s) => {
          if (s.id === data.student_id || (s.isLiveDbUser && data.student_id === '0937df8b-2b8f-49a7-bfee-84eace226eec')) {
            return {
              ...s,
              riskStatus: data.risk_status,
              riskScore: data.risk_score,
              isGlowing: true,
            };
          }
          return s;
        })
      );

      setToastMessage(
        `⚡ Real-Time ML Risk Assessment: Alex Turner recalculated to ${data.risk_status} (Score: ${data.risk_score})!`
      );
      setTimeout(() => {
        setToastMessage(null);
        setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
      }, 4500);
    };

    socket.on('MARKS_UPDATED', handleMarksUpdated);
    socket.on('RISK_UPDATED', handleRiskUpdated);

    return () => {
      socket.off('MARKS_UPDATED', handleMarksUpdated);
      socket.off('RISK_UPDATED', handleRiskUpdated);
    };
  }, [socket]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Toggle Attendance
  const handleAttendanceToggle = async (id) => {
    const targetStudent = roster.find((s) => s.id === id);
    if (!targetStudent) return;

    const newPresent = !targetStudent.attendancePresent;
    const newStatus = newPresent ? 'PRESENT' : 'ABSENT';

    // Update local state immediately
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendancePresent: newPresent } : s))
    );

    // If this is Alex Turner (connected to DB), immediately save to PostgreSQL
    if (targetStudent.isLiveDbUser) {
      try {
        await api.post('/attendance', {
          student_id: targetStudent.id,
          course_id: selectedCourse.id,
          attendance_date: attendanceDate,
          status: newStatus,
        });

        setRoster((prev) =>
          prev.map((s) => (s.id === id ? { ...s, lastSavedStatus: newStatus } : s))
        );

        setToastMessage(`✓ PostgreSQL & Student Page Synced: Alex Turner marked ${newStatus} for ${selectedCourse.name}!`);
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err) {
        console.error('Error updating live attendance:', err);
        setToastMessage(`Error updating PostgreSQL for Alex Turner: ${err.response?.data?.message || err.message}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  const handleMarkChange = (id, newMark) => {
    const val = Math.max(0, Math.min(100, Number(newMark) || 0));
    setRoster((prev) =>
      prev.map((student) => {
        if (student.id === id) {
          return { ...student, marks: val };
        }
        return student;
      })
    );
  };

  // Submit Marks: Posts to /api/marks -> Publishes to RabbitMQ -> ML Evaluates -> WebSockets Emits
  const handleSaveMarksAndAssessRisk = async (student) => {
    try {
      setToastMessage(`Publishing marks (${student.marks}) for ${student.name} to RabbitMQ risk queue...`);

      const res = await api.post('/marks', {
        student_id: student.id,
        course_id: selectedCourse.id,
        marks: student.marks,
      });

      setToastMessage(
        `✓ Marks (${student.marks}) saved & synced to Student Portal! ML Microservice evaluating risk asynchronously...`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error saving marks:', err);
      setToastMessage(`Error saving marks: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Save Attendance explicitly
  const handleSaveStudentAttendance = async (student) => {
    const status = student.attendancePresent ? 'PRESENT' : 'ABSENT';

    if (!student.isLiveDbUser) {
      setToastMessage(`Updated dummy student ${student.name} as ${status}.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      await api.post('/attendance', {
        student_id: student.id,
        course_id: selectedCourse.id,
        attendance_date: attendanceDate,
        status,
      });

      setRoster((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, lastSavedStatus: status } : s))
      );

      setToastMessage(`✓ PostgreSQL Synced: Alex Turner marked ${status} for ${selectedCourse.name} (${attendanceDate})!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Attendance recording error:', err);
      setToastMessage(`Error: Could not save attendance. ${err.response?.data?.message || ''}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Bulk save attendance
  const handleSaveAllAttendance = async () => {
    setSaving(true);
    try {
      const alex = roster.find((s) => s.isLiveDbUser);
      if (alex) {
        const status = alex.attendancePresent ? 'PRESENT' : 'ABSENT';
        await api.post('/attendance', {
          student_id: alex.id,
          course_id: selectedCourse.id,
          attendance_date: attendanceDate,
          status,
        });
        setRoster((prev) =>
          prev.map((s) => (s.id === alex.id ? { ...s, lastSavedStatus: status } : s))
        );
      }

      setToastMessage(`✓ Saved all attendance: Alex Turner synced to Student Portal as ${alex?.attendancePresent ? 'PRESENT' : 'ABSENT'}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Bulk save error:', err);
      setToastMessage('Error saving attendance to database.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  // Open Message Modal for Student
  const handleOpenMessageModal = (student) => {
    setSelectedStudentForMessage(student);
    setMessageSubject(`Academic Advisory: Performance Intervention in ${selectedCourse.name}`);
    setMessageBody(
      `Dear ${student.name},\n\nOur AI academic performance monitor has highlighted that your recent scores (${student.marks}/100) and attendance require immediate attention.\n\nPlease attend the academic mentoring hour this Thursday at 3:30 PM in Room CS-402 to review remedial assignments.\n\nBest regards,\nFaculty Academic Advisor`
    );
    setMessagePriority(student.riskStatus === 'High Risk' ? 'URGENT' : 'HIGH');
  };

  // Send Live Message via /api/messages
  const handleSendLiveMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudentForMessage || !messageSubject || !messageBody) return;

    setSendingMessage(true);
    try {
      await api.post('/messages', {
        student_id: selectedStudentForMessage.id,
        sender_name: 'Dr. Subramanian Ramanujan (Faculty Advisor)',
        sender_email: 'faculty@erp.com',
        subject: messageSubject,
        message: messageBody,
        priority: messagePriority,
        risk_status: selectedStudentForMessage.riskStatus,
      });

      setToastMessage(
        `✓ Live Intervention Message sent to ${selectedStudentForMessage.name}! Student will receive it live via WebSockets.`
      );
      setSelectedStudentForMessage(null);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Failed to send intervention message:', err);
      setToastMessage(`Error sending message: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSendingMessage(false);
    }
  };

  const getRiskBadge = (status, isGlowing) => {
    const glowClass = isGlowing ? 'ring-2 ring-indigo-500 animate-pulse' : '';
    switch (status) {
      case 'High Risk':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 ${glowClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            High Risk
          </span>
        );
      case 'Medium Risk':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ${glowClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Medium Risk
          </span>
        );
      case 'Low Risk':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${glowClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Low Risk
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Real-time WebSockets & Architecture Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="font-bold text-slate-800">
                WebSockets: {isConnected ? 'LIVE CONNECTED' : 'CONNECTING...'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Redis Cache Write-Through: Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>RabbitMQ ML Risk Queue: Ready</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 font-semibold">
            Real-Time Push to Student Portal Active
          </span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Faculty Academic Console • Apex Institute of Technology
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Academic Operations Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Structured modules for daily attendance, course grading, and live AI academic risk alerts.
            </p>
          </div>

          {/* Controls: Course selection */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <label htmlFor="course-select" className="text-xs text-slate-500 font-medium">
              Course:
            </label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-white text-slate-900">
                  {course.name} ({course.credits} Credits)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Switcher: Attendance vs Grading vs AI Risk */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => handleTabChange('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>1. Daily Attendance</span>
          </button>

          <button
            onClick={() => handleTabChange('grading')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Course Grading & Marks</span>
          </button>

          <button
            onClick={() => handleTabChange('airisk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'airisk'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>3. AI Academic Risk & Student Alerts</span>
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. Teaching Timetable</span>
          </button>

          <button
            onClick={() => handleTabChange('leave')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leave'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>5. HR Leave Management</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-indigo-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-indigo-700 font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: DAILY ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Daily Attendance Register • {selectedCourse.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Marking attendance updates Alex Turner's Student Portal live via WebSockets.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <label htmlFor="date-input" className="text-xs text-slate-500 font-medium">
                    Date:
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveAllAttendance}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Syncing...' : 'Save All Attendance'}
                </button>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4">Student Name & Roll No</th>
                      <th scope="col" className="px-6 py-4">Department</th>
                      <th scope="col" className="px-6 py-4 text-center">Status Toggle</th>
                      <th scope="col" className="px-6 py-4 text-right">Database Sync Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((student) => {
                      const isAlex = student.isLiveDbUser;
                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            isAlex ? 'bg-indigo-50/40 hover:bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isAlex
                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                                }`}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                                  {isAlex && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      LIVE CONNECTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                  {student.rollNo} • {student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-slate-600">
                            {student.department}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              id={isAlex ? 'alex-attendance-toggle' : undefined}
                              onClick={() => handleAttendanceToggle(student.id)}
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                student.attendancePresent
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <div
                                className={`w-6 h-3.5 rounded-full flex items-center p-0.5 transition-colors ${
                                  student.attendancePresent ? 'bg-emerald-500 justify-end' : 'bg-rose-400 justify-start'
                                }`}
                              >
                                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs"></div>
                              </div>
                              <span>{student.attendancePresent ? 'PRESENT' : 'ABSENT'}</span>
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              id={isAlex ? 'alex-save-attendance-btn' : undefined}
                              onClick={() => handleSaveStudentAttendance(student)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                isAlex
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {isAlex
                                  ? student.lastSavedStatus
                                    ? `Saved (${student.lastSavedStatus})`
                                    : 'Save to DB'
                                  : 'Save'}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE GRADING & MARKS */}
        {activeTab === 'grading' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-white via-indigo-50/40 to-white border border-indigo-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Internal Assessment & Continuous Evaluation • {selectedCourse.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Posting marks writes to PostgreSQL, invalidates Redis caches, emits WebSocket events, and queues asynchronous RabbitMQ AI risk recalculation.
                  </p>
                </div>
              </div>
            </div>

            {/* Grading Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4">Student Name & Roll No</th>
                      <th scope="col" className="px-6 py-4 text-center">Current Score (/100)</th>
                      <th scope="col" className="px-6 py-4 text-center">Grade Estimate</th>
                      <th scope="col" className="px-6 py-4 text-center">ML Risk Standing</th>
                      <th scope="col" className="px-6 py-4 text-right">Submit & Post Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((student) => {
                      const isAlex = student.isLiveDbUser;
                      const gradeEstimate =
                        student.marks >= 90 ? 'O' : student.marks >= 80 ? 'A+' : student.marks >= 70 ? 'A' : student.marks >= 50 ? 'B' : 'F';

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            isAlex ? 'bg-indigo-50/40 hover:bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                          } ${student.isGlowing ? 'bg-indigo-100/60' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isAlex
                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                                }`}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                                  {isAlex && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      LIVE CONNECTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                  {student.rollNo} • {student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={student.marks}
                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                className="w-16 bg-white border border-slate-200 focus:border-indigo-600 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                              />
                              <span className="text-xs text-slate-400 font-mono">/ 100</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                gradeEstimate === 'O' || gradeEstimate === 'A+'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : gradeEstimate === 'A' || gradeEstimate === 'B'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              Grade {gradeEstimate}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {getRiskBadge(student.riskStatus, student.isGlowing)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSaveMarksAndAssessRisk(student)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                            >
                              <span>Post Marks</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI ACADEMIC RISK & STUDENT ALERTS */}
        {activeTab === 'airisk' && (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-rose-600">High Risk Cohort</p>
                    <h3 className="text-3xl font-black text-rose-700 mt-2">
                      {roster.filter((s) => s.riskStatus === 'High Risk').length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Immediate academic intervention required.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-amber-600">Medium Risk Cohort</p>
                    <h3 className="text-3xl font-black text-amber-700 mt-2">
                      {roster.filter((s) => s.riskStatus === 'Medium Risk').length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Monitor continuous evaluation scores.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">Low Risk (On Track)</p>
                    <h3 className="text-3xl font-black text-emerald-700 mt-2">
                      {roster.filter((s) => s.riskStatus === 'Low Risk').length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Satisfactory academic standing.</p>
              </div>
            </div>

            {/* AI Risk Monitor Table with Send Live Alert button */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  AI Academic Risk Predictor & Early Advisory Console
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send live advisory messages to students at elevated risk. The student receives it in real time via WebSockets.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4">Student Details</th>
                      <th scope="col" className="px-6 py-4 text-center">Score</th>
                      <th scope="col" className="px-6 py-4 text-center">AI Risk Status</th>
                      <th scope="col" className="px-6 py-4 text-center">Calculated Probability</th>
                      <th scope="col" className="px-6 py-4 text-right">Intervention Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((student) => {
                      const isAlex = student.isLiveDbUser;
                      const isElevated = student.riskStatus === 'High Risk' || student.riskStatus === 'Medium Risk' || isAlex;

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            isAlex ? 'bg-indigo-50/40 hover:bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isAlex
                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                                }`}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                                  {isAlex && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      LIVE CONNECTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                  {student.rollNo} • {student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center font-mono font-bold text-slate-900">
                            {student.marks}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {getRiskBadge(student.riskStatus, student.isGlowing)}
                          </td>

                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-600 font-semibold">
                            {Math.round((student.riskScore || 0.12) * 100)}% Risk Index
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenMessageModal(student)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                student.riskStatus === 'High Risk'
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                  : student.riskStatus === 'Medium Risk'
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Send Advisory Alert</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEACHING TIMETABLE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            {/* Faculty Workload Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Weekly Teaching Load</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">18 Hours</h3>
                <p className="text-xs text-slate-500 mt-1">Compliant with UGC norms</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-indigo-600">Assigned Courses</p>
                <h3 className="text-2xl font-black text-indigo-700 mt-1">2 Theory + 2 Labs</h3>
                <p className="text-xs text-slate-500 mt-1">CS301 & CS302 (CSE Dept)</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-amber-600">Laboratory Batches</p>
                <h3 className="text-2xl font-black text-amber-700 mt-1">62 Students</h3>
                <p className="text-xs text-slate-500 mt-1">Batch A1 & Batch B2</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-emerald-600">Office Advisory Hours</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">4 Hours / Week</h3>
                <p className="text-xs text-slate-500 mt-1">Cabin CS-402, Ramanujan Block</p>
              </div>
            </div>

            {/* Weekly Timetable Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    Weekly Lecture & Laboratory Roster • Spring 2026
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official schedule for Dr. Subramanian Ramanujan (Dept. of Computer Science & Engineering)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 self-start sm:self-auto"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Print Teaching Docket</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {facultySchedule.map((dayPlan) => (
                  <div key={dayPlan.day} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 tracking-wide">
                        {dayPlan.day}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {dayPlan.slots.length} Assigned Periods
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
                      {dayPlan.slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {slot.time}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                slot.type === 'Lecture'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : slot.type === 'Hands-on Lab'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : slot.type === 'Office Hours'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {slot.type}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {slot.course}
                          </h4>

                          <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                                Section
                              </span>
                              <span className="font-medium text-slate-800">{slot.section}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                                Room / Hall
                              </span>
                              <span className="font-semibold text-indigo-700">{slot.room}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HR LEAVE MANAGEMENT */}
        {activeTab === 'leave' && (
          <div className="space-y-6 animate-fade-in">
            {/* Leave Balance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Casual Leave (CL)</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">10 Days</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">of 12 Total</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">2 days utilized this academic year</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-600">Medical Leave (ML)</p>
                    <h3 className="text-2xl font-black text-indigo-700 mt-1">9 Days</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">of 10 Total</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">1 day utilized</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">Earned Leave (EL)</p>
                    <h3 className="text-2xl font-black text-emerald-700 mt-1">15 Days</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">of 15 Total</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">0 days utilized (Fully Available)</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-purple-600">On Duty (OD) Quota</p>
                    <h3 className="text-2xl font-black text-purple-700 mt-1">8 Days</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Available</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">For conferences & university duties</p>
              </div>
            </div>

            {/* Leave History and Application Header */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Faculty Leave Records & Applications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit leave applications online. Requests are routed in real-time to the Academic Dean / Admin portal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-600/20 flex items-center gap-2 self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Apply for Leave</span>
                </button>
              </div>

              {loadingLeaves ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Loading leave records...
                </div>
              ) : leavesList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No leave requests found. Click "Apply for Leave" to submit your first application.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">Leave Type</th>
                        <th scope="col" className="px-6 py-3.5">Duration</th>
                        <th scope="col" className="px-6 py-3.5">Days</th>
                        <th scope="col" className="px-6 py-3.5">Reason</th>
                        <th scope="col" className="px-6 py-3.5">Admin Remarks</th>
                        <th scope="col" className="px-6 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leavesList.map((lv) => (
                        <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {lv.leave_type} LEAVE
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-700">
                            {new Date(lv.start_date).toLocaleDateString()} to {new Date(lv.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-900">
                            {lv.days_count} {lv.days_count === 1 ? 'Day' : 'Days'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                            {lv.reason}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 italic">
                            {lv.admin_remarks || 'Pending Review'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                lv.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : lv.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                              }`}
                            >
                              {lv.status === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
                              {lv.status === 'REJECTED' && <X className="w-3.5 h-3.5" />}
                              {lv.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                              {lv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply for Leave Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Apply for Faculty Leave
                    </h3>
                    <p className="text-xs text-slate-500">
                      Applicant: Dr. Subramanian Ramanujan (faculty@erp.com)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leave Type
                  </label>
                  <select
                    value={leaveFormData.leave_type}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  >
                    <option value="CASUAL">Casual Leave (CL)</option>
                    <option value="MEDICAL">Medical Leave (ML)</option>
                    <option value="EARNED">Earned Leave (EL)</option>
                    <option value="ON_DUTY">On Duty (OD - Academic Conference/Exam)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={leaveFormData.start_date}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={leaveFormData.end_date}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={leaveFormData.days_count}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, days_count: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Leave / Duty Details
                  </label>
                  <textarea
                    rows="3"
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                    placeholder="Provide details regarding the reason or external conference name..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingLeave ? 'Submitting...' : 'Submit to Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive Advisory Message Composer Modal */}
        {selectedStudentForMessage && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Send Live Academic Advisory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Recipient: <strong className="text-slate-800">{selectedStudentForMessage.name}</strong> ({selectedStudentForMessage.rollNo})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudentForMessage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendLiveMessage} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Reason for Intervention
                  </label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Advisory Message Body
                    </label>
                    <span className="text-[10px] text-slate-400">Delivered live via WebSocket</span>
                  </div>
                  <textarea
                    rows="5"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Priority:</span>
                    <select
                      value={messagePriority}
                      onChange={(e) => setMessagePriority(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                      <option value="URGENT">URGENT</option>
                      <option value="HIGH">HIGH</option>
                      <option value="NORMAL">NORMAL</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForMessage(null)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingMessage ? 'Broadcasting...' : 'Send Live Advisory'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
