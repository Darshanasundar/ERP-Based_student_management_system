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
  TrendingDown,
  Filter,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Table,
  Layers,
  BarChart2,
} from 'lucide-react';

const DEFAULT_COURSES = [
  { id: '27d6a359-8570-4e13-b2a8-73e03546e31e', code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, section: 'CSE - A' },
  { id: '5bb138c2-848b-4ca3-9719-d8b8b07a719c', code: 'CS302', name: 'Introduction to Databases', credits: 3, section: 'CSE - B' },
  { id: '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f', code: 'CS303', name: 'Operating Systems', credits: 4, section: 'CSE - A' },
  { id: '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a', code: 'CS304', name: 'Computer Networks', credits: 3, section: 'CSE - B' },
];

export default function FacultyDashboard() {
  const { socket, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'attendance';

  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState('27d6a359-8570-4e13-b2a8-73e03546e31e');
  const [gradingViewMode, setGradingViewMode] = useState('single'); // 'single' | 'matrix'
  const [highRiskSubjectFilter, setHighRiskSubjectFilter] = useState('ALL');
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

  // High-Risk Dedicated Tab States
  const [highRiskFilter, setHighRiskFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'ATTENDANCE' | 'ACADEMIC'
  const [highRiskSearch, setHighRiskSearch] = useState('');
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [highRiskDbStudents, setHighRiskDbStudents] = useState([]);
  const [sentAlertStudentIds, setSentAlertStudentIds] = useState(new Set());

  // Enhanced AI Risk Engine Diagnostic Mirror (Rule + Weight Multi-Factor)
  const computeRiskDiagnosis = (marks, attendance = 85) => {
    const m = Number(marks) || 0;
    const a = Number(attendance) || 85;
    let marksRisk = 0.10;
    if (m < 35) marksRisk = 0.95;
    else if (m < 50) marksRisk = 0.78;
    else if (m < 65) marksRisk = 0.48;
    else if (m < 80) marksRisk = 0.22;
    else marksRisk = 0.08;

    let attRisk = 0.10;
    if (a < 65) attRisk = 0.92;
    else if (a < 75) attRisk = 0.72;
    else if (a < 85) attRisk = 0.28;
    else attRisk = 0.05;

    const score = Math.max(0.05, Math.min(0.99, Number((marksRisk * 0.55 + attRisk * 0.35).toFixed(2))));
    let status = 'Low Risk';
    let severity = 'LOW';
    if (score >= 0.70 || m < 50 || a < 65) {
      status = 'High Risk';
      severity = score >= 0.85 || m < 40 ? 'CRITICAL' : 'HIGH';
    } else if (score >= 0.40 || m < 65 || a < 75) {
      status = 'Medium Risk';
      severity = 'MODERATE';
    }

    const factors = [];
    if (m < 40) factors.push(`Critical Exam Score: ${m}/100 is severely below pass grade (40).`);
    else if (m < 50) factors.push(`Academic Warning: ${m}/100 is below satisfactory passing threshold.`);
    else if (m < 65) factors.push(`Borderline Score: ${m}/100 requires continuous evaluation tracking.`);

    if (a < 65) factors.push(`Severe Attendance Deficit: ${a.toFixed(1)}% is below 65% statutory debarment limit.`);
    else if (a < 75) factors.push(`Low Attendance: ${a.toFixed(1)}% is below required 75% minimum.`);

    if (factors.length === 0) factors.push('Satisfactory academic test scores and class attendance.');

    const recommendations = [];
    if (m < 40) recommendations.push('Schedule mandatory 1-on-1 remedial mentoring.');
    else if (m < 50) recommendations.push('Assign supplemental problem sets and peer tutor.');
    if (a < 75) recommendations.push('Issue formal attendance warning notice to student and guardian.');
    if (recommendations.length === 0) recommendations.push('Student is in good academic standing. Continue regular coursework.');

    return { riskScore: score, riskStatus: status, severityLevel: severity, primaryFactors: factors, recommendations };
  };  // Grade calculation helper
  const getGradeFromScore = (score) => {
    const s = Number(score) || 0;
    if (s >= 90) return 'O';
    if (s >= 80) return 'A+';
    if (s >= 70) return 'A';
    if (s >= 60) return 'B+';
    if (s >= 50) return 'B';
    return 'F';
  };

  // Subject Marks Getters
  const getStudentSubjectMark = (student, courseId) => {
    if (student?.subjectMarks && student.subjectMarks[courseId]?.marks !== undefined) {
      return Number(student.subjectMarks[courseId].marks);
    }
    return student?.marks !== undefined ? Number(student.marks) : 75;
  };

  const getStudentSubjectAttendance = (student, courseId) => {
    if (student?.subjectMarks && student.subjectMarks[courseId]?.attendance !== undefined) {
      return Number(student.subjectMarks[courseId].attendance);
    }
    return student?.attendancePercentage ?? (student?.attendancePresent ? 88.0 : 58.0);
  };

  const getStudentSubjectDiagnosis = (student, courseId) => {
    const mark = getStudentSubjectMark(student, courseId);
    const att = getStudentSubjectAttendance(student, courseId);
    if (student?.subjectMarks?.[courseId]?.riskScore !== undefined) {
      return {
        riskScore: student.subjectMarks[courseId].riskScore,
        riskStatus: student.subjectMarks[courseId].riskStatus,
        severityLevel: student.subjectMarks[courseId].severityLevel || 'LOW',
        primaryFactors: student.subjectMarks[courseId].primaryFactors || [],
        recommendations: student.subjectMarks[courseId].recommendations || [],
      };
    }
    return computeRiskDiagnosis(mark, att);
  };

  // Evaluate Overall / Cumulative Academic Risk across all enrolled subjects
  const evaluateOverallStudentRisk = (subjectMarksMap, student) => {
    let highestRiskScore = 0.05;
    let anyHighRisk = false;
    let anyMediumRisk = false;
    const failingSubjects = [];
    const allFactors = [];
    const allRecommendations = [];

    courses.forEach((c) => {
      const data = subjectMarksMap?.[c.id];
      const score = data?.marks !== undefined ? Number(data.marks) : (student.marks ?? 75);
      const att = data?.attendance !== undefined ? Number(data.attendance) : (student.attendancePercentage ?? 85);
      const diag = computeRiskDiagnosis(score, att);

      if (diag.riskScore > highestRiskScore) {
        highestRiskScore = diag.riskScore;
      }
      if (diag.riskStatus === 'High Risk' || score < 50 || att < 65) {
        anyHighRisk = true;
        failingSubjects.push(`${c.code} (${score}/100)`);
        allFactors.push(`${c.name} (${c.code}): ${score}/100 is below passing threshold with ${att.toFixed(1)}% attendance.`);
        allRecommendations.push(`Mandatory remedial advisory required for ${c.name}.`);
      } else if (diag.riskStatus === 'Medium Risk' || score < 65 || att < 75) {
        anyMediumRisk = true;
        allFactors.push(`${c.code}: Continuous evaluation score of ${score}/100 requires monitoring.`);
      }
    });

    let riskStatus = 'Low Risk';
    let severityLevel = 'LOW';
    if (anyHighRisk || highestRiskScore >= 0.70) {
      riskStatus = 'High Risk';
      severityLevel = highestRiskScore >= 0.85 ? 'CRITICAL' : 'HIGH';
    } else if (anyMediumRisk || highestRiskScore >= 0.40) {
      riskStatus = 'Medium Risk';
      severityLevel = 'MODERATE';
    }

    if (allFactors.length === 0) {
      allFactors.push('Satisfactory continuous assessment marks and attendance across all subjects.');
    }
    if (allRecommendations.length === 0) {
      allRecommendations.push('Student is in good academic standing. Continue regular coursework.');
    }

    return {
      riskScore: highestRiskScore,
      riskStatus,
      severityLevel,
      primaryFactors: allFactors,
      recommendations: allRecommendations,
      failingSubjects,
    };
  };

  // Student roster state with per-subject marks and risk indicators
  const [roster, setRoster] = useState([
    {
      id: '0937df8b-2b8f-49a7-bfee-84eace226eec',
      rollNo: 'STU-2026-CCF9BC',
      name: 'Alex Turner',
      email: 'alex.turner@erp.com',
      department: 'Computer Science & Engineering',
      riskStatus: 'High Risk',
      riskScore: 0.72,
      severityLevel: 'HIGH',
      attendancePresent: true,
      attendancePercentage: 88,
      marks: 45,
      isLiveDbUser: true,
      lastSavedStatus: 'PRESENT',
      isGlowing: false,
      primaryFactors: ['Academic Warning: 45/100 in Data Structures & Algorithms is below pass threshold.'],
      recommendations: ['Assign supplemental problem sets and peer tutor in Data Structures.'],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 45, attendance: 88, grade: 'F', riskScore: 0.72, riskStatus: 'High Risk', severityLevel: 'HIGH' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 85, attendance: 94, grade: 'A+', riskScore: 0.12, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 78, attendance: 90, grade: 'A', riskScore: 0.18, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 82, attendance: 92, grade: 'A+', riskScore: 0.14, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-1',
      rollNo: 'AIT-2024-CS101',
      name: 'Aarav Sharma',
      email: 'aarav.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Low Risk',
      riskScore: 0.14,
      severityLevel: 'LOW',
      attendancePresent: true,
      attendancePercentage: 88,
      marks: 88,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: ['Consistent test scores and active lab participation across subjects.'],
      recommendations: ['Candidate for advanced honours track.'],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 88, attendance: 88, grade: 'A+', riskScore: 0.14, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 85, attendance: 90, grade: 'A+', riskScore: 0.12, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 90, attendance: 92, grade: 'O', riskScore: 0.08, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 84, attendance: 86, grade: 'A+', riskScore: 0.15, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-2',
      rollNo: 'AIT-2024-CS102',
      name: 'Bhavya Patel',
      email: 'bhavya.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'High Risk',
      riskScore: 0.84,
      severityLevel: 'CRITICAL',
      attendancePresent: false,
      attendancePercentage: 58,
      marks: 42,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: [
        'Academic Warning: 42/100 in CS301 is below satisfactory passing threshold.',
        'Severe Attendance Deficit: 58.0% is below 65% statutory debarment limit.'
      ],
      recommendations: [
        'Schedule mandatory 1-on-1 remedial mentoring in CS301 Data Structures.',
        'Issue formal attendance warning notice to student and guardian.'
      ],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 42, attendance: 58, grade: 'F', riskScore: 0.84, riskStatus: 'High Risk', severityLevel: 'CRITICAL' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 68, attendance: 78, grade: 'B+', riskScore: 0.46, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 38, attendance: 54, grade: 'F', riskScore: 0.90, riskStatus: 'High Risk', severityLevel: 'CRITICAL' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 74, attendance: 80, grade: 'A', riskScore: 0.22, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-3',
      rollNo: 'AIT-2024-CS103',
      name: 'Chetan Verma',
      email: 'chetan.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Medium Risk',
      riskScore: 0.58,
      severityLevel: 'MODERATE',
      attendancePresent: true,
      attendancePercentage: 74,
      marks: 61,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: [
        'Borderline Score: 61/100 in CS301 requires continuous evaluation tracking.',
        'Low Attendance: 74.0% is below required 75% minimum.'
      ],
      recommendations: [
        'Encourage tutorial session attendance.',
        'Obtain absence justification from student.'
      ],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 61, attendance: 74, grade: 'B+', riskScore: 0.58, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 70, attendance: 82, grade: 'A', riskScore: 0.24, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 64, attendance: 72, grade: 'B+', riskScore: 0.52, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 68, attendance: 76, grade: 'B+', riskScore: 0.28, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-4',
      rollNo: 'AIT-2024-CS104',
      name: 'Divya Sundaram',
      email: 'divya.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Low Risk',
      riskScore: 0.08,
      severityLevel: 'LOW',
      attendancePresent: true,
      attendancePercentage: 96,
      marks: 94,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: ['Satisfactory academic test scores and class attendance.'],
      recommendations: ['Student is in good academic standing.'],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 94, attendance: 96, grade: 'O', riskScore: 0.08, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 92, attendance: 94, grade: 'O', riskScore: 0.09, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 96, attendance: 98, grade: 'O', riskScore: 0.06, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 91, attendance: 95, grade: 'O', riskScore: 0.09, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-5',
      rollNo: 'AIT-2024-CS105',
      name: 'Eashwar Pillai',
      email: 'eashwar.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'Medium Risk',
      riskScore: 0.52,
      severityLevel: 'MODERATE',
      attendancePresent: true,
      attendancePercentage: 80,
      marks: 67,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: ['Continuous evaluation scores require regular monitoring.'],
      recommendations: ['Encourage regular tutorial participation.'],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 67, attendance: 80, grade: 'B+', riskScore: 0.52, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 72, attendance: 84, grade: 'A', riskScore: 0.22, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 65, attendance: 78, grade: 'B+', riskScore: 0.48, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 70, attendance: 82, grade: 'A', riskScore: 0.24, riskStatus: 'Low Risk', severityLevel: 'LOW' },
      },
    },
    {
      id: 'dummy-6',
      rollNo: 'AIT-2024-CS106',
      name: 'Fathima Noor',
      email: 'fathima.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'High Risk',
      riskScore: 0.94,
      severityLevel: 'CRITICAL',
      attendancePresent: false,
      attendancePercentage: 52,
      marks: 34,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: [
        'Critical Exam Score: 34/100 in CS301 is severely below pass grade (40).',
        'Severe Attendance Deficit: 52.0% is below 65% statutory debarment limit.'
      ],
      recommendations: [
        'Schedule mandatory 1-on-1 remedial mentoring in CS301 Data Structures.',
        'Issue formal attendance warning notice to student and guardian.'
      ],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 34, attendance: 52, grade: 'F', riskScore: 0.94, riskStatus: 'High Risk', severityLevel: 'CRITICAL' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 72, attendance: 85, grade: 'A', riskScore: 0.22, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 40, attendance: 60, grade: 'B', riskScore: 0.82, riskStatus: 'High Risk', severityLevel: 'CRITICAL' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 66, attendance: 75, grade: 'B+', riskScore: 0.44, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
      },
    },
    {
      id: 'dummy-7',
      rollNo: 'AIT-2024-CS107',
      name: 'Gaurav Nair',
      email: 'gaurav.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      riskStatus: 'High Risk',
      riskScore: 0.76,
      severityLevel: 'HIGH',
      attendancePresent: false,
      attendancePercentage: 62,
      marks: 46,
      isLiveDbUser: false,
      lastSavedStatus: null,
      isGlowing: false,
      primaryFactors: [
        'Academic Warning: 46/100 in CS301 is below satisfactory passing threshold.',
        'Severe Attendance Deficit: 62.0% is below 65% statutory debarment limit.'
      ],
      recommendations: [
        'Assign supplemental problem sets and peer tutor in CS301.',
        'Issue formal attendance warning notice.'
      ],
      subjectMarks: {
        '27d6a359-8570-4e13-b2a8-73e03546e31e': { marks: 46, attendance: 62, grade: 'F', riskScore: 0.76, riskStatus: 'High Risk', severityLevel: 'HIGH' },
        '5bb138c2-848b-4ca3-9719-d8b8b07a719c': { marks: 64, attendance: 70, grade: 'B+', riskScore: 0.50, riskStatus: 'Medium Risk', severityLevel: 'MODERATE' },
        '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f': { marks: 72, attendance: 80, grade: 'A', riskScore: 0.24, riskStatus: 'Low Risk', severityLevel: 'LOW' },
        '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a': { marks: 48, attendance: 66, grade: 'F', riskScore: 0.74, riskStatus: 'High Risk', severityLevel: 'HIGH' },
      },
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
          const dbCourses = courseRes.data.courses.map((c, idx) => ({
            id: c.id,
            code: `CS30${idx + 1}`,
            name: c.name,
            credits: c.credits,
            section: idx % 2 === 0 ? 'CSE - A' : 'CSE - B',
          }));
          const merged = [...dbCourses];
          DEFAULT_COURSES.forEach((def) => {
            if (!merged.some((c) => c.id === def.id || c.name.toLowerCase() === def.name.toLowerCase())) {
              merged.push(def);
            }
          });
          setCourses(merged);
          setSelectedCourseId(merged[0].id);
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
          setRoster((prev) =>
            prev.map((s) => {
              if (s.email !== 'alex.turner@erp.com') return s;
              const updatedSubjMarks = { ...(s.subjectMarks || {}) };
              marksRes.data.marks.forEach((m) => {
                const diag = computeRiskDiagnosis(m.internalScore, m.attendancePercentage || 88);
                updatedSubjMarks[m.courseId] = {
                  marks: m.internalScore,
                  attendance: m.attendancePercentage || 88,
                  grade: m.grade || getGradeFromScore(m.internalScore),
                  riskScore: m.riskScore !== undefined ? m.riskScore : diag.riskScore,
                  riskStatus: m.riskStatus || diag.riskStatus,
                  severityLevel: diag.severityLevel,
                  primaryFactors: diag.primaryFactors,
                  recommendations: diag.recommendations,
                };
              });
              const overall = evaluateOverallStudentRisk(updatedSubjMarks, s);
              return {
                ...s,
                marks: updatedSubjMarks[selectedCourseId]?.marks ?? s.marks,
                subjectMarks: updatedSubjMarks,
                riskStatus: overall.riskStatus,
                riskScore: overall.riskScore,
                severityLevel: overall.severityLevel,
                primaryFactors: overall.primaryFactors,
                recommendations: overall.recommendations,
              };
            })
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
      const targetCourseId = data.course_id;
      const newScore = data.internal_score !== undefined ? data.internal_score : data.marks;
      if (newScore === undefined) return;

      setRoster((prev) =>
        prev.map((s) => {
          if (s.id === data.student_id || (s.isLiveDbUser && data.student_id === '0937df8b-2b8f-49a7-bfee-84eace226eec')) {
            const currentSubj = s.subjectMarks?.[targetCourseId] || {};
            const attRate = currentSubj.attendance ?? s.attendancePercentage ?? 88;
            const diag = computeRiskDiagnosis(newScore, attRate);

            const updatedSubj = {
              ...(s.subjectMarks || {}),
              [targetCourseId]: {
                ...currentSubj,
                marks: newScore,
                grade: data.grade || getGradeFromScore(newScore),
                riskScore: data.risk_score !== undefined ? data.risk_score : diag.riskScore,
                riskStatus: data.risk_status || diag.riskStatus,
                severityLevel: diag.severityLevel,
              },
            };
            const overall = evaluateOverallStudentRisk(updatedSubj, s);

            return {
              ...s,
              marks: targetCourseId === selectedCourseId ? newScore : s.marks,
              subjectMarks: updatedSubj,
              riskStatus: overall.riskStatus,
              riskScore: overall.riskScore,
              severityLevel: overall.severityLevel,
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
  }, [socket, selectedCourseId, courses]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Toggle Attendance
  const handleAttendanceToggle = async (id) => {
    const targetStudent = roster.find((s) => s.id === id);
    if (!targetStudent) return;

    const newPresent = !targetStudent.attendancePresent;
    const newStatus = newPresent ? 'PRESENT' : 'ABSENT';

    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendancePresent: newPresent } : s))
    );

    if (targetStudent.isLiveDbUser) {
      try {
        await api.post('/attendance', {
          student_id: id,
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

  // Subject-Wise Marks Change Handler
  const handleSubjectMarkChange = (studentId, courseId, newMark) => {
    const val = Math.max(0, Math.min(100, Number(newMark) || 0));
    setRoster((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const currentSubj = student.subjectMarks?.[courseId] || {};
        const attRate = currentSubj.attendance ?? student.attendancePercentage ?? 85;
        const diag = computeRiskDiagnosis(val, attRate);
        const grade = getGradeFromScore(val);

        const updatedSubjMarks = {
          ...(student.subjectMarks || {}),
          [courseId]: {
            ...currentSubj,
            marks: val,
            attendance: attRate,
            grade,
            riskScore: diag.riskScore,
            riskStatus: diag.riskStatus,
            severityLevel: diag.severityLevel,
            primaryFactors: diag.primaryFactors,
            recommendations: diag.recommendations,
          },
        };

        const overall = evaluateOverallStudentRisk(updatedSubjMarks, student);

        return {
          ...student,
          marks: courseId === selectedCourseId ? val : student.marks,
          subjectMarks: updatedSubjMarks,
          riskScore: overall.riskScore,
          riskStatus: overall.riskStatus,
          severityLevel: overall.severityLevel,
          primaryFactors: overall.primaryFactors,
          recommendations: overall.recommendations,
        };
      })
    );
  };

  const handleMarkChange = (id, newMark) => {
    handleSubjectMarkChange(id, selectedCourseId, newMark);
  };

  // Submit Marks & Enhanced Multi-Factor AI Risk Assessment for a Subject
  const handleSaveSubjectMarksAndAssessRisk = async (student, courseId = selectedCourseId) => {
    const currentMark = getStudentSubjectMark(student, courseId);
    const targetCourse = courses.find((c) => c.id === courseId) || selectedCourse;

    try {
      setToastMessage(`🧠 AI Risk Engine: Evaluating continuous metrics for ${student.name} in ${targetCourse.name} (Marks: ${currentMark})...`);

      let newRiskScore = 0.20;
      let newRiskStatus = 'Low Risk';
      let newSeverity = 'LOW';
      let newGrade = getGradeFromScore(currentMark);
      let riskDiag = null;

      if (student.isLiveDbUser) {
        const res = await api.post('/marks', {
          student_id: student.id,
          course_id: courseId,
          marks: currentMark,
        });

        if (res.data?.marks) {
          newRiskScore = res.data.marks.riskScore;
          newRiskStatus = res.data.marks.riskStatus;
          newGrade = res.data.marks.grade;
        }
        if (res.data?.risk) {
          riskDiag = res.data.risk;
          newSeverity = res.data.risk.severityLevel;
        }
      } else {
        const attRate = getStudentSubjectAttendance(student, courseId);
        riskDiag = computeRiskDiagnosis(currentMark, attRate);
        newRiskScore = riskDiag.riskScore;
        newRiskStatus = riskDiag.riskStatus;
        newSeverity = riskDiag.severityLevel;
        newGrade = getGradeFromScore(currentMark);
      }

      setRoster((prev) =>
        prev.map((s) => {
          if (s.id !== student.id) return s;

          const updatedSubjMarks = {
            ...(s.subjectMarks || {}),
            [courseId]: {
              ...(s.subjectMarks?.[courseId] || {}),
              marks: currentMark,
              grade: newGrade,
              riskScore: newRiskScore,
              riskStatus: newRiskStatus,
              severityLevel: newSeverity,
              primaryFactors: riskDiag?.primaryFactors || [],
              recommendations: riskDiag?.recommendations || [],
            },
          };

          const overall = evaluateOverallStudentRisk(updatedSubjMarks, s);

          return {
            ...s,
            marks: courseId === selectedCourseId ? currentMark : s.marks,
            subjectMarks: updatedSubjMarks,
            riskScore: overall.riskScore,
            riskStatus: overall.riskStatus,
            severityLevel: overall.severityLevel,
            primaryFactors: overall.primaryFactors,
            recommendations: overall.recommendations,
            isGlowing: true,
          };
        })
      );

      const statusTag = newRiskStatus === 'High Risk' ? '⚠️ High Risk' : newRiskStatus === 'Medium Risk' ? '⚡ Medium Risk' : '✓ Low Risk';
      setToastMessage(
        `✓ AI Assessment Complete: ${student.name} evaluated in "${targetCourse.name}" as ${statusTag} (Risk Index: ${Math.round(newRiskScore * 100)}%)!`
      );
      setTimeout(() => {
        setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
        setToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Error saving subject marks:', err);
      const attRate = getStudentSubjectAttendance(student, courseId);
      const localDiag = computeRiskDiagnosis(currentMark, attRate);
      setToastMessage(`✓ Evaluated locally: ${localDiag.riskStatus} (${Math.round(localDiag.riskScore * 100)}% Risk)`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSaveMarksAndAssessRisk = (student) => {
    handleSaveSubjectMarksAndAssessRisk(student, selectedCourseId);
  };

  // Batch Save all marks for the selected course
  const handleBatchSaveSubjectMarks = async () => {
    setSaving(true);
    try {
      const liveAlex = roster.find((s) => s.isLiveDbUser);
      if (liveAlex) {
        const alexScore = getStudentSubjectMark(liveAlex, selectedCourseId);
        await api.post('/marks', {
          student_id: liveAlex.id,
          course_id: selectedCourseId,
          marks: alexScore,
        });
      }

      setRoster((prev) =>
        prev.map((s) => {
          const mark = getStudentSubjectMark(s, selectedCourseId);
          const att = getStudentSubjectAttendance(s, selectedCourseId);
          const diag = computeRiskDiagnosis(mark, att);
          const grade = getGradeFromScore(mark);

          const updatedSubjMarks = {
            ...(s.subjectMarks || {}),
            [selectedCourseId]: {
              ...(s.subjectMarks?.[selectedCourseId] || {}),
              marks: mark,
              attendance: att,
              grade,
              riskScore: diag.riskScore,
              riskStatus: diag.riskStatus,
              severityLevel: diag.severityLevel,
              primaryFactors: diag.primaryFactors,
              recommendations: diag.recommendations,
            },
          };

          const overall = evaluateOverallStudentRisk(updatedSubjMarks, s);

          return {
            ...s,
            subjectMarks: updatedSubjMarks,
            riskScore: overall.riskScore,
            riskStatus: overall.riskStatus,
            severityLevel: overall.severityLevel,
            primaryFactors: overall.primaryFactors,
            recommendations: overall.recommendations,
            isGlowing: true,
          };
        })
      );

      setToastMessage(`✓ Batch Posted: All student internal marks for "${selectedCourse.name}" saved & evaluated!`);
      setTimeout(() => {
        setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
        setToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Batch save error:', err);
      setToastMessage('Error saving batch marks.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  // Re-evaluate entire course roster across all enrolled subjects
  const handleReevaluateAll = async () => {
    setEvaluatingAll(true);
    setToastMessage('🧠 AI Risk Engine: Performing multi-factor risk inference across all subjects...');
    try {
      setRoster((prev) =>
        prev.map((student) => {
          const updatedSubjMarks = { ...(student.subjectMarks || {}) };
          courses.forEach((c) => {
            const mark = getStudentSubjectMark(student, c.id);
            const att = getStudentSubjectAttendance(student, c.id);
            const diag = computeRiskDiagnosis(mark, att);
            updatedSubjMarks[c.id] = {
              ...(updatedSubjMarks[c.id] || {}),
              marks: mark,
              attendance: att,
              grade: getGradeFromScore(mark),
              riskScore: diag.riskScore,
              riskStatus: diag.riskStatus,
              severityLevel: diag.severityLevel,
              primaryFactors: diag.primaryFactors,
              recommendations: diag.recommendations,
            };
          });

          const overall = evaluateOverallStudentRisk(updatedSubjMarks, student);

          return {
            ...student,
            subjectMarks: updatedSubjMarks,
            riskScore: overall.riskScore,
            riskStatus: overall.riskStatus,
            severityLevel: overall.severityLevel,
            primaryFactors: overall.primaryFactors,
            recommendations: overall.recommendations,
            isGlowing: true,
          };
        })
      );

      try {
        const res = await api.get('/marks/high-risk');
        if (res.data?.students) setHighRiskDbStudents(res.data.students);
      } catch (err) {}

      setTimeout(() => {
        setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
        setToastMessage('✓ AI Academic Risk Analysis complete! Updated subject risk scores and recommendations.');
        setTimeout(() => setToastMessage(null), 4000);
      }, 1200);
    } catch (err) {
      console.error('Error running batch AI evaluation:', err);
    } finally {
      setEvaluatingAll(false);
    }
  };

  // Re-evaluate risk specifically for the active subject
  const handleReevaluateSubjectRisk = (courseId = selectedCourseId) => {
    const targetCourse = courses.find((c) => c.id === courseId) || selectedCourse;
    setToastMessage(`🧠 AI Risk Engine: Assessing cohort risk specifically for "${targetCourse.name}"...`);

    setRoster((prev) =>
      prev.map((s) => {
        const mark = getStudentSubjectMark(s, courseId);
        const att = getStudentSubjectAttendance(s, courseId);
        const diag = computeRiskDiagnosis(mark, att);

        const updatedSubjMarks = {
          ...(s.subjectMarks || {}),
          [courseId]: {
            ...(s.subjectMarks?.[courseId] || {}),
            marks: mark,
            attendance: att,
            grade: getGradeFromScore(mark),
            riskScore: diag.riskScore,
            riskStatus: diag.riskStatus,
            severityLevel: diag.severityLevel,
            primaryFactors: diag.primaryFactors,
            recommendations: diag.recommendations,
          },
        };

        const overall = evaluateOverallStudentRisk(updatedSubjMarks, s);

        return {
          ...s,
          subjectMarks: updatedSubjMarks,
          riskScore: overall.riskScore,
          riskStatus: overall.riskStatus,
          severityLevel: overall.severityLevel,
          primaryFactors: overall.primaryFactors,
          recommendations: overall.recommendations,
          isGlowing: true,
        };
      })
    );

    setTimeout(() => {
      setRoster((prev) => prev.map((s) => ({ ...s, isGlowing: false })));
      setToastMessage(`✓ Subject Risk Analysis complete for ${targetCourse.code}: ${targetCourse.name}!`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1000);
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

  // Open Message Modal for Student (supports custom initial content)
  const handleOpenMessageModal = (student, customSubject = null, customBody = null) => {
    setSelectedStudentForMessage(student);
    setMessageSubject(customSubject || `Academic Advisory: Performance Intervention in ${selectedCourse.name}`);
    setMessageBody(
      customBody ||
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

      setSentAlertStudentIds((prev) => new Set([...prev, selectedStudentForMessage.id]));

      setToastMessage(
        `✓ Live Intervention Message sent to ${selectedStudentForMessage.name}! Student notified in real-time via WebSockets.`
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

  // High-Risk Cohort Computations & Interactive Filtering (Subject-Wise Aware)
  const allHighRiskList = roster.filter((s) => {
    if (highRiskSubjectFilter !== 'ALL') {
      const mark = getStudentSubjectMark(s, highRiskSubjectFilter);
      const att = getStudentSubjectAttendance(s, highRiskSubjectFilter);
      const diag = computeRiskDiagnosis(mark, att);
      return diag.riskStatus === 'High Risk' || mark < 50 || diag.riskScore >= 0.70;
    }
    return s.riskStatus === 'High Risk' || (Number(s.marks) < 50 && s.marks !== null) || s.riskScore >= 0.70;
  });

  const filteredHighRiskStudents = allHighRiskList.filter((s) => {
    if (highRiskSearch.trim()) {
      const q = highRiskSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = s.rollNo.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail) return false;
    }

    const targetCourseForFilter = highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId;
    const mark = getStudentSubjectMark(s, targetCourseForFilter);
    const att = getStudentSubjectAttendance(s, targetCourseForFilter);
    const diag = getStudentSubjectDiagnosis(s, targetCourseForFilter);

    if (highRiskFilter === 'CRITICAL') {
      return s.riskScore >= 0.85 || diag.riskScore >= 0.85 || mark < 40;
    }
    if (highRiskFilter === 'ATTENDANCE') {
      return att < 65;
    }
    if (highRiskFilter === 'ACADEMIC') {
      return mark < 50;
    }
    return true;
  });

  const criticalRiskCount = allHighRiskList.filter((s) => {
    const mark = getStudentSubjectMark(s, highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId);
    return s.riskScore >= 0.85 || mark < 40;
  }).length;
  const examDeficitCount = allHighRiskList.filter((s) => {
    const mark = getStudentSubjectMark(s, highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId);
    return mark < 50;
  }).length;
  const attendanceDeficitCount = allHighRiskList.filter((s) => {
    const att = getStudentSubjectAttendance(s, highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId);
    return att < 65;
  }).length;

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

        {/* Tab Switcher: Attendance vs Grading vs High-Risk vs AI Risk */}
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
            onClick={() => handleTabChange('highrisk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'highrisk'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'highrisk' ? 'text-amber-400' : 'text-slate-600'}`} />
            <span>3. High-Risk Students</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'highrisk'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {roster.filter((s) => s.riskStatus === 'High Risk' || (Number(s.marks) < 50 && s.marks !== null) || s.riskScore >= 0.70).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('airisk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'airisk'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>4. AI Risk Analytics</span>
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
            <span>5. Teaching Timetable</span>
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
            <span>6. HR Leave Management</span>
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

        {/* TAB 2: COURSE GRADING & SUBJECT-WISE INTERNAL MARKS ENTRY */}
        {activeTab === 'grading' && (
          <div className="space-y-6 animate-fade-in">
            {/* Subject Selector Pills & View Mode Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Select Subject:</span>
                </span>
                {courses.map((course) => {
                  const isSelected = course.id === selectedCourseId;
                  const atRiskForSubj = roster.filter((s) => {
                    const mark = getStudentSubjectMark(s, course.id);
                    const diag = getStudentSubjectDiagnosis(s, course.id);
                    return diag.riskStatus === 'High Risk' || mark < 50;
                  }).length;

                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="font-mono">{course.code}</span>
                      <span className="hidden sm:inline">• {course.name}</span>
                      {atRiskForSubj > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {atRiskForSubj} at risk
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Switcher: Single Course vs Full Matrix */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setGradingViewMode('single')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradingViewMode === 'single'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Single Subject</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGradingViewMode('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradingViewMode === 'matrix'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Subject-Wise Matrix</span>
                </button>
              </div>
            </div>

            {/* SINGLE SUBJECT GRADING VIEW */}
            {gradingViewMode === 'single' && (
              <div className="space-y-6">
                {/* Active Subject Banner & Live Metrics */}
                <div className="bg-gradient-to-r from-white via-indigo-50/40 to-white border border-indigo-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {selectedCourse.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedCourse.name} • Internal Marks Entry
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Continuous assessment internal mark out of 100. AI risk engine analyzes subject performance and predicts semester outcome.
                      </p>
                    </div>
                  </div>

                  {/* 3 Subject Quick KPIs & Batch Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Average</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {selectedSubjectAvg} <span className="text-[10px] text-slate-400">/ 100</span>
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Rate</span>
                      <span className="text-sm font-extrabold text-emerald-600 font-mono">
                        {selectedSubjectPassRate}%
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">At-Risk Count</span>
                      <span className={`text-sm font-extrabold font-mono ${selectedSubjectAtRiskCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {selectedSubjectAtRiskCount} Students
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBatchSaveSubjectMarks}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Posting...' : `Post All ${selectedCourse.code}`}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReevaluateSubjectRisk(selectedCourse.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        title="Re-run AI Risk Model on this Subject"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assess Risk</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject-Wise Grading Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-4">Student Name & Roll No</th>
                          <th scope="col" className="px-6 py-4 text-center">Subject Attendance</th>
                          <th scope="col" className="px-6 py-4 text-center">Internal Score (/100)</th>
                          <th scope="col" className="px-6 py-4 text-center">Grade Estimate</th>
                          <th scope="col" className="px-6 py-4 text-center">Subject AI Risk Standing</th>
                          <th scope="col" className="px-6 py-4 text-right">Submit & Post Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map((student) => {
                          const isAlex = student.isLiveDbUser;
                          const currentScore = getStudentSubjectMark(student, selectedCourse.id);
                          const subjectAtt = getStudentSubjectAttendance(student, selectedCourse.id);
                          const gradeEstimate = getGradeFromScore(currentScore);
                          const subjDiag = getStudentSubjectDiagnosis(student, selectedCourse.id);

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
                                          LIVE DB
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
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                    subjectAtt >= 75
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : subjectAtt >= 65
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {subjectAtt.toFixed(1)}%
                                </span>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={currentScore}
                                    onChange={(e) => handleSubjectMarkChange(student.id, selectedCourse.id, e.target.value)}
                                    className="w-16 bg-white border border-slate-300 focus:border-indigo-600 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                                  />
                                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                    gradeEstimate === 'O' || gradeEstimate === 'A+'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : gradeEstimate === 'A' || gradeEstimate === 'B+' || gradeEstimate === 'B'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  Grade {gradeEstimate}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {getRiskBadge(subjDiag.riskStatus, student.isGlowing)}
                                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                    Risk Index: {Math.round(subjDiag.riskScore * 100)}%
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSaveSubjectMarksAndAssessRisk(student, selectedCourse.id)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
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

            {/* ALL-SUBJECTS MATRIX SPREADSHEET VIEW */}
            {gradingViewMode === 'matrix' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Table className="w-4 h-4 text-indigo-600" />
                      Cross-Subject Marks Entry Matrix
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter continuous evaluation marks across all core subjects in one unified spreadsheet. The AI engine recalculates subject and cumulative academic risk in real time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReevaluateAll}
                    disabled={evaluatingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${evaluatingAll ? 'animate-spin' : ''}`} />
                    <span>{evaluatingAll ? 'Analyzing...' : 'Re-Evaluate All Matrix Risk'}</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-4 py-3 min-w-[200px]">Student Details</th>
                          {courses.map((course) => (
                            <th key={course.id} scope="col" className="px-4 py-3 text-center min-w-[130px]">
                              <div>{course.code}</div>
                              <div className="text-[9px] font-normal text-slate-400 capitalize">{course.name}</div>
                            </th>
                          ))}
                          <th scope="col" className="px-4 py-3 text-center min-w-[140px]">Cumulative AI Risk</th>
                          <th scope="col" className="px-4 py-3 text-right min-w-[100px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {roster.map((student) => {
                          const isAlex = student.isLiveDbUser;

                          return (
                            <tr
                              key={student.id}
                              className={`transition-colors ${
                                isAlex ? 'bg-indigo-50/30 hover:bg-indigo-50/60 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/60'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                      isAlex ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                                      {isAlex && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">
                                          LIVE
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono">{student.rollNo}</p>
                                  </div>
                                </div>
                              </td>

                              {courses.map((course) => {
                                const currentScore = getStudentSubjectMark(student, course.id);
                                const grade = getGradeFromScore(currentScore);
                                const diag = getStudentSubjectDiagnosis(student, course.id);
                                const isFail = currentScore < 50;

                                return (
                                  <td key={course.id} className="px-4 py-3 text-center">
                                    <div className="inline-flex flex-col items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={currentScore}
                                        onChange={(e) => handleSubjectMarkChange(student.id, course.id, e.target.value)}
                                        className={`w-14 text-center font-mono font-bold text-xs py-1 px-1.5 rounded-lg border transition-all ${
                                          isFail
                                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-black'
                                            : 'bg-white border-slate-200 text-slate-900'
                                        }`}
                                      />
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                          {grade}
                                        </span>
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            diag.riskStatus === 'High Risk'
                                              ? 'bg-rose-500'
                                              : diag.riskStatus === 'Medium Risk'
                                              ? 'bg-amber-500'
                                              : 'bg-emerald-500'
                                          }`}
                                          title={`Risk: ${Math.round(diag.riskScore * 100)}%`}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}

                              <td className="px-4 py-3 text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  {getRiskBadge(student.riskStatus, student.isGlowing)}
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {Math.round(student.riskScore * 100)}% Index
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSaveSubjectMarksAndAssessRisk(student, selectedCourseId)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Save
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
          </div>
        )}

        {/* TAB 3: DEDICATED HIGH-RISK STUDENTS INTERVENTION CONSOLE (WHITE THEMED) */}
        {activeTab === 'highrisk' && (
          <div className="space-y-6 animate-fade-in">
            {/* Executive Hero Banner (Clean White Themed) */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs relative overflow-hidden">
              <AlertTriangle className="absolute -right-6 -bottom-8 w-56 h-56 text-slate-100 pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>High-Risk Early Warning System • AI Diagnostic Engine</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
                    High-Risk Student Intervention Console
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Automated multi-factor risk inference continuously monitoring continuous exam marks (55% weight), statutory attendance limits (35% weight), and backlog history. Directly dispatch real-time academic advisories that synchronize instantly with the Student Portal.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    onClick={handleReevaluateAll}
                    disabled={evaluatingAll}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${evaluatingAll ? 'animate-spin' : ''}`} />
                    <span>{evaluatingAll ? 'Evaluating Roster Risk...' : 'Re-Evaluate All Roster Risk'}</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('airisk')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-xs cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-slate-600" />
                    <span>View Predictive Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 KPI Summary Cards (Clean White Themed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total High-Risk Cohort</p>
                  <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{allHighRiskList.length}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Immediate Academic Action Mandated</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical Exam Deficit</p>
                  <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <TrendingDown className="w-5 h-5 text-slate-700" />
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{criticalRiskCount}</h3>
                <p className="mt-2 text-xs text-slate-500 font-medium">Scoring &lt; 40 or Risk Index &gt; 85%</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Debarment</p>
                  <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Calendar className="w-5 h-5 text-slate-700" />
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{attendanceDeficitCount}</h3>
                <p className="mt-2 text-xs text-slate-500 font-medium">Below statutory 65% university bar</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Interventions Dispatched</p>
                  <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Send className="w-5 h-5 text-slate-700" />
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {sentAlertStudentIds.size} <span className="text-sm font-semibold text-slate-400">/ {allHighRiskList.length}</span>
                </h3>
                <p className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-time WebSocket alerts sent</span>
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={highRiskSearch}
                  onChange={(e) => setHighRiskSearch(e.target.value)}
                  placeholder="Search at-risk students by name, roll no, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter Cohort:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setHighRiskFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      highRiskFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All High-Risk ({allHighRiskList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighRiskFilter('CRITICAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      highRiskFilter === 'CRITICAL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Critical Severity ({criticalRiskCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighRiskFilter('ACADEMIC')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      highRiskFilter === 'ACADEMIC'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Exam Deficit &lt; 50 ({examDeficitCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighRiskFilter('ATTENDANCE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      highRiskFilter === 'ATTENDANCE'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Debarment Attendance &lt; 65% ({attendanceDeficitCount})
                  </button>
                </div>

                {/* Subject-Wise Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Subject Filter:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setHighRiskSubjectFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      highRiskSubjectFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    All Subjects
                  </button>
                  {courses.map((course) => {
                    const isSelected = highRiskSubjectFilter === course.id;
                    const count = roster.filter((s) => {
                      const m = getStudentSubjectMark(s, course.id);
                      const diag = getStudentSubjectDiagnosis(s, course.id);
                      return diag.riskStatus === 'High Risk' || m < 50;
                    }).length;

                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setHighRiskSubjectFilter(course.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{course.code}</span>
                        <span className="hidden sm:inline">{course.name}</span>
                        <span
                          className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* High-Risk Student Cards Grid (Clean White Themed) */}
            {filteredHighRiskStudents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredHighRiskStudents.map((student) => {
                  const isAlex = student.isLiveDbUser;
                  const attRate = student.attendancePercentage ?? (student.attendancePresent ? 88 : 58);
                  const isCritical = (student.riskScore || 0.8) >= 0.85 || student.marks < 40;
                  const hasSentAlert = sentAlertStudentIds.has(student.id);

                  return (
                    <div
                      key={student.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all p-6 shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Student Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 bg-slate-100 text-slate-800 border border-slate-200">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base leading-tight">{student.name}</h3>
                                {isAlex && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    LIVE DB
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {student.rollNo} • {student.email}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{selectedCourse.name}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                CRITICAL RISK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                HIGH RISK
                              </span>
                            )}
                            {hasSentAlert && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Advisory Sent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Visual Risk Gauge (Clean White Themed) */}
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-700 flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-slate-700" />
                              <span>AI Academic Risk Probability</span>
                            </span>
                            <span className="font-mono text-slate-900 text-sm font-extrabold">
                              {Math.round((student.riskScore || 0.8) * 100)}% Risk Index
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden relative">
                            <div
                              className="h-full rounded-full bg-slate-900 transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.round((student.riskScore || 0.8) * 100))}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-1">
                            <span>0% (Safe)</span>
                            <span>50% (Threshold)</span>
                            <span className="text-slate-700 font-bold">100% (Critical)</span>
                          </div>
                        </div>

                        {/* Performance Diagnostic Scoreboard (Clean White Themed) */}
                        {(() => {
                          const activeSubjId = highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId;
                          const activeSubj = courses.find((c) => c.id === activeSubjId) || selectedCourse;
                          const activeMark = getStudentSubjectMark(student, activeSubjId);
                          const activeAtt = getStudentSubjectAttendance(student, activeSubjId);

                          return (
                            <>
                              <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      {activeSubj.code} Internal Score
                                    </span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                      Grade {getGradeFromScore(activeMark)}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-slate-900 font-mono">{activeMark}</span>
                                    <span className="text-xs text-slate-500 font-semibold">/ 100</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-700 mt-0.5 block">
                                    {activeMark < 40 ? '⚠️ Critical Failure Deficit (<40)' : activeMark < 50 ? '⚠️ Below Passing (<50)' : '✓ Passing Standing'}
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      {activeSubj.code} Attendance
                                    </span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                      {activeAtt >= 75 ? 'Safe' : 'Debarment'}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-black text-slate-900 font-mono">{activeAtt.toFixed(1)}%</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-700 mt-0.5 block">
                                    {activeAtt < 65 ? '⚠️ Statutory Debarment (<65%)' : activeAtt < 75 ? '⚠️ Below Statutory 75%' : '✓ Satisfactory'}
                                  </span>
                                </div>
                              </div>

                              {/* Subject-Wise Academic Breakdown Grid */}
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Subject-Wise Marks & Risk Inference</span>
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400">4 Enrolled Subjects</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {courses.map((course) => {
                                    const mark = getStudentSubjectMark(student, course.id);
                                    const grade = getGradeFromScore(mark);
                                    const diag = getStudentSubjectDiagnosis(student, course.id);
                                    const isDeficit = mark < 50 || diag.riskStatus === 'High Risk';

                                    return (
                                      <div
                                        key={course.id}
                                        className={`p-2.5 rounded-xl border text-center transition-all ${
                                          isDeficit
                                            ? 'bg-rose-50/70 border-rose-200 text-rose-950 ring-1 ring-rose-200 shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-800'
                                        }`}
                                      >
                                        <p className="text-[10px] font-bold font-mono text-slate-500 truncate" title={course.name}>
                                          {course.code}
                                        </p>
                                        <p className="text-base font-black mt-0.5 font-mono">
                                          {mark} <span className="text-[10px] font-normal text-slate-400">/100</span>
                                        </p>
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/90 border border-slate-200">
                                            {grade}
                                          </span>
                                          <span
                                            className={`text-[9px] font-extrabold px-1 py-0.2 rounded ${
                                              diag.riskStatus === 'High Risk'
                                                ? 'bg-rose-100 text-rose-800'
                                                : diag.riskStatus === 'Medium Risk'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}
                                          >
                                            {Math.round(diag.riskScore * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          );
                        })()}

                        {/* AI Diagnostic Factors */}
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                            <span>AI Diagnostic Factors Detected</span>
                          </div>
                          <ul className="space-y-1 text-slate-700">
                            {(student.primaryFactors || [
                              `Continuous test mark: ${student.marks}/100 is below the passing mark.`,
                              `Live attendance: ${attRate.toFixed(1)}% requires statutory rectification.`,
                            ]).map((factor, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5"></span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* AI Recommended Interventions */}
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                            <Zap className="w-3.5 h-3.5 text-slate-700" />
                            <span>Targeted Pedagogical Interventions</span>
                          </div>
                          <ul className="space-y-1 text-slate-700">
                            {(student.recommendations || [
                              'Schedule mandatory 1-on-1 remedial tutorial mentoring.',
                              'Issue formal attendance warning notice to student and guardian.',
                            ]).map((rec, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Intervention Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenMessageModal(student)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Send Urgent Advisory</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const activeSubjId = highRiskSubjectFilter !== 'ALL' ? highRiskSubjectFilter : selectedCourseId;
                              const activeSubj = courses.find((c) => c.id === activeSubjId) || selectedCourse;
                              const mark = getStudentSubjectMark(student, activeSubjId);
                              handleOpenMessageModal(
                                student,
                                `Remedial Tutorial Invitation: ${activeSubj.code} ${activeSubj.name}`,
                                `Dear ${student.name},\n\nYour internal continuous evaluation score in "${activeSubj.name}" (${mark}/100) has flagged an elevated academic risk.\n\nYou are scheduled for a mandatory 1-on-1 Remedial Tutorial this Thursday at 3:30 PM in Room CS-402 with Dr. Ramanujan.\n\nPlease bring your recent coursework notebooks to review subject problem solutions.\n\nBest regards,\nFaculty Academic Advisory`
                              );
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            <span>Schedule Remedial</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveMarksAndAssessRisk(student)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Re-run AI risk scoring"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-Assess</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4">
                  Zero Students In This Filter Category!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  All enrolled students in {selectedCourse.name} currently fulfill satisfactory passing marks and minimum statutory attendance requirements.
                </p>
                <button
                  onClick={() => {
                    setHighRiskFilter('ALL');
                    setHighRiskSearch('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Reset Filter To All
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI ACADEMIC RISK & STUDENT ALERTS */}
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
                            <div>{getStudentSubjectMark(student, selectedCourse.id)}</div>
                            <span className="text-[10px] font-normal text-slate-400 font-sans">{selectedCourse.code}</span>
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
