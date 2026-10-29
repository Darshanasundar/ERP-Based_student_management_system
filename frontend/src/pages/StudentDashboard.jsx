import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import {
  Award,
  CheckCircle,
  TrendingUp,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Clock,
  Database,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  Sparkles,
  CalendarCheck,
  FileSpreadsheet,
  MessageSquare,
  Bell,
  AlertTriangle,
  Mail,
  ShieldCheck,
  User,
  UserCheck,
  Download,
  FileText,
  DollarSign,
  Printer,
  X,
  Check,
  MapPin,
  Phone,
  QrCode,
  School,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const ALEX_STUDENT_ID = '0937df8b-2b8f-49a7-bfee-84eace226eec';

  // Helper date & time formatters
  const safeFormatDate = (val) => {
    if (!val) return 'Today';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return String(val);
    }
  };

  const safeFormatTime = (val) => {
    if (!val) return '10:00 AM';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(val);
    }
  };

  const safeFormatDateTime = (val) => {
    if (!val) return 'Just now';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(val);
    }
  };

  // 1. Attendance state
  const [attendanceData, setAttendanceData] = useState({
    summary: { total: 4, present: 3, absent: 1, late: 0 },
    records: [],
  });
  const [loadingDb, setLoadingDb] = useState(true);
  const [liveEventBanner, setLiveEventBanner] = useState(null);

  // 2. AI Risk state
  const [aiRiskData, setAiRiskData] = useState({
    status: 'Low Risk',
    score: 0.12,
  });

  // 3. Messages inbox state
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 4. Invoices & Payments state
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptModalInvoice, setReceiptModalInvoice] = useState(null);
  const [receiptDocument, setReceiptDocument] = useState(null); // Document vault modal

  // 5. Timetable / Schedule state
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [scheduleViewMode, setScheduleViewMode] = useState('daily'); // 'daily' | 'weekly'

  // 6. Profile state
  const [profileData, setProfileData] = useState({
    fullName: 'Alex Turner',
    rollNo: 'STU-2026-CCF9BC',
    regNo: 'AIT-2024-CSE-042',
    dob: '2004-08-15',
    gender: 'Male',
    bloodGroup: 'O+',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech - Artificial Intelligence & Data Architecture',
    year: '3rd Year (Semester 6)',
    batch: '2024 - 2028',
    campusEmail: 'alex.turner@erp.com',
    personalEmail: 'alex.turner.official@gmail.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Raman Heights, Avinashi Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641048',
    guardianName: 'Robert Turner',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 43219',
    emergencyContact: '+91 98765 43219',
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Dynamic SGPA trend data for Recharts that updates in real-time on MARKS_UPDATED
  const [sgpaTrendData, setSgpaTrendData] = useState([
    { semester: 'Sem 1', sgpa: 8.35, target: 8.5 },
    { semester: 'Sem 2', sgpa: 8.6, target: 8.5 },
    { semester: 'Sem 3', sgpa: 8.45, target: 8.5 },
    { semester: 'Sem 4', sgpa: 8.9, target: 8.5 },
    { semester: 'Sem 5', sgpa: 8.8, target: 8.5 },
    { semester: 'Sem 6', sgpa: 9.15, target: 8.5 },
  ]);

  // Complete 8 Semesters academic dataset with dynamic updates
  const [semestersData, setSemestersData] = useState([
    {
      semNumber: 1,
      title: 'Semester 1',
      academicYear: '2023 - 2024 (Fall)',
      status: 'Completed',
      sgpa: 8.35,
      credits: 22,
      courses: [
        { code: '23MA101', title: 'Calculus & Linear Algebra', credits: 4, internal: 36, external: 51, total: 87, grade: 'A+' },
        { code: '23PH101', title: 'Engineering Physics', credits: 3, internal: 34, external: 49, total: 83, grade: 'A' },
        { code: '23CS101', title: 'Problem Solving & C Programming', credits: 4, internal: 38, external: 55, total: 93, grade: 'O' },
        { code: '23EE101', title: 'Basic Electrical Engineering', credits: 3, internal: 32, external: 46, total: 78, grade: 'A' },
        { code: '23EN101', title: 'Technical Communication & English', credits: 3, internal: 35, external: 50, total: 85, grade: 'A+' },
        { code: '23CS102', title: 'C Programming Laboratory', credits: 2, internal: 39, external: 58, total: 97, grade: 'O' },
        { code: '23GE101', title: 'Engineering Workshop Practice', credits: 3, internal: 37, external: 52, total: 89, grade: 'A+' },
      ],
    },
    {
      semNumber: 2,
      title: 'Semester 2',
      academicYear: '2023 - 2024 (Spring)',
      status: 'Completed',
      sgpa: 8.6,
      credits: 23,
      courses: [
        { code: '23MA201', title: 'Discrete Mathematical Structures', credits: 4, internal: 37, external: 53, total: 90, grade: 'O' },
        { code: '23CH201', title: 'Applied Chemistry & Materials', credits: 3, internal: 35, external: 48, total: 83, grade: 'A' },
        { code: '23CS201', title: 'Object Oriented Programming (Java)', credits: 4, internal: 38, external: 54, total: 92, grade: 'O' },
        { code: '23EC201', title: 'Digital Electronics & Logic Design', credits: 4, internal: 33, external: 50, total: 83, grade: 'A' },
        { code: '23CS202', title: 'Python for Scientific Computing', credits: 3, internal: 39, external: 56, total: 95, grade: 'O' },
        { code: '23CS203', title: 'Java & OOP Laboratory', credits: 2, internal: 38, external: 57, total: 95, grade: 'O' },
        { code: '23GE201', title: 'Environmental Sciences & Sustainability', credits: 3, internal: 34, external: 48, total: 82, grade: 'A' },
      ],
    },
    {
      semNumber: 3,
      title: 'Semester 3',
      academicYear: '2024 - 2025 (Fall)',
      status: 'Completed',
      sgpa: 8.45,
      credits: 24,
      courses: [
        { code: '23CS301', title: 'Data Structures & Algorithms', credits: 4, internal: 38, external: 52, total: 90, grade: 'O' },
        { code: '23CS302', title: 'Computer Organization & Architecture', credits: 4, internal: 32, external: 46, total: 78, grade: 'A' },
        { code: '23CS303', title: 'Database Management Systems', credits: 4, internal: 37, external: 51, total: 88, grade: 'A+' },
        { code: '23MA301', title: 'Probability & Statistics for Engineers', credits: 4, internal: 35, external: 48, total: 83, grade: 'A' },
        { code: '23CS304', title: 'Software Engineering Principles', credits: 3, internal: 36, external: 50, total: 86, grade: 'A+' },
        { code: '23CS305', title: 'Data Structures Lab with C++', credits: 2, internal: 39, external: 58, total: 97, grade: 'O' },
        { code: '23CS306', title: 'DBMS & SQL Laboratory', credits: 3, internal: 38, external: 56, total: 94, grade: 'O' },
      ],
    },
    {
      semNumber: 4,
      title: 'Semester 4',
      academicYear: '2024 - 2025 (Spring)',
      status: 'Completed',
      sgpa: 8.9,
      credits: 24,
      courses: [
        { code: '23CS401', title: 'Operating Systems & System Programming', credits: 4, internal: 39, external: 55, total: 94, grade: 'O' },
        { code: '23CS402', title: 'Design & Analysis of Algorithms', credits: 4, internal: 37, external: 54, total: 91, grade: 'O' },
        { code: '23CS403', title: 'Theory of Computation & Automata', credits: 4, internal: 34, external: 49, total: 83, grade: 'A' },
        { code: '23CS404', title: 'Web Technology & Modern Frameworks', credits: 3, internal: 38, external: 56, total: 94, grade: 'O' },
        { code: '23CS405', title: 'Microprocessors & Microcontrollers', credits: 4, internal: 36, external: 51, total: 87, grade: 'A+' },
        { code: '23CS406', title: 'Operating Systems Laboratory', credits: 2, internal: 39, external: 57, total: 96, grade: 'O' },
        { code: '23GE401', title: 'Universal Human Values & Professional Ethics', credits: 3, internal: 35, external: 50, total: 85, grade: 'A+' },
      ],
    },
    {
      semNumber: 5,
      title: 'Semester 5',
      academicYear: '2025 - 2026 (Fall)',
      status: 'Completed',
      sgpa: 8.8,
      credits: 23,
      courses: [
        { code: '23CS501', title: 'Computer Networks & Internet Protocols', credits: 4, internal: 38, external: 53, total: 91, grade: 'O' },
        { code: '23CS502', title: 'Compiler Design & Construction', credits: 4, internal: 36, external: 48, total: 84, grade: 'A' },
        { code: '23CS503', title: 'Cloud Computing & Virtualization', credits: 3, internal: 37, external: 52, total: 89, grade: 'A+' },
        { code: '23CS504', title: 'Cryptography & Cyber Security', credits: 4, internal: 35, external: 49, total: 84, grade: 'A' },
        { code: '23CS505', title: 'Professional Elective I: Machine Learning', credits: 3, internal: 39, external: 56, total: 95, grade: 'O' },
        { code: '23CS506', title: 'Networks & Security Lab', credits: 2, internal: 39, external: 58, total: 97, grade: 'O' },
        { code: '23CS507', title: 'Cloud DevOps Workshop', credits: 3, internal: 37, external: 53, total: 90, grade: 'O' },
      ],
    },
    {
      semNumber: 6,
      title: 'Semester 6',
      academicYear: '2025 - 2026 (Current Spring)',
      status: 'In Progress',
      sgpa: 9.15,
      credits: 22,
      courses: [
        { code: '23CS601', title: 'Data Structures & Algorithms', credits: 4, internal: 38, external: '-', total: '92', grade: 'Expected O' },
        { code: '23CS602', title: 'Introduction to Databases', credits: 3, internal: 37, external: '-', total: '88', grade: 'Expected A+' },
        { code: '23CS603', title: 'Data Analytics & Big Data Tools', credits: 3, internal: 39, external: '-', total: '95', grade: 'Expected O' },
        { code: '23CS604', title: 'Professional Elective II: NLP & LLMs', credits: 3, internal: 38, external: '-', total: '94', grade: 'Expected O' },
        { code: '23CS605', title: 'Open Elective I: Fintech & Blockchain', credits: 3, internal: 36, external: '-', total: '86', grade: 'Expected A+' },
        { code: '23CS606', title: 'AI & Data Science Laboratory', credits: 2, internal: 39, external: '-', total: '98', grade: 'Expected O' },
        { code: '23CS607', title: 'Mini Project & Product Design', credits: 3, internal: 39, external: '-', total: '96', grade: 'Expected O' },
      ],
    },
    {
      semNumber: 7,
      title: 'Semester 7',
      academicYear: '2026 - 2027 (Upcoming Fall)',
      status: 'Upcoming',
      sgpa: 0,
      credits: 18,
      courses: [
        { code: '23CS701', title: 'High Performance Computing', credits: 4, internal: '-', external: '-', total: '-', grade: '-' },
        { code: '23CS702', title: 'Quantum Computing Fundamentals', credits: 3, internal: '-', external: '-', total: '-', grade: '-' },
        { code: '23CS703', title: 'Professional Elective III: Robotics', credits: 3, internal: '-', external: '-', total: '-', grade: '-' },
        { code: '23CS704', title: 'Open Elective II: Entrepreneurship', credits: 3, internal: '-', external: '-', total: '-', grade: '-' },
        { code: '23CS705', title: 'Project Work Phase I', credits: 4, internal: '-', external: '-', total: '-', grade: '-' },
      ],
    },
    {
      semNumber: 8,
      title: 'Semester 8',
      academicYear: '2026 - 2027 (Upcoming Spring)',
      status: 'Upcoming',
      sgpa: 0,
      credits: 12,
      courses: [
        { code: '23CS801', title: 'Industrial Internship / Capstone Project Phase II', credits: 10, internal: '-', external: '-', total: '-', grade: '-' },
        { code: '23CS802', title: 'Comprehensive Technical Viva Voce', credits: 2, internal: '-', external: '-', total: '-', grade: '-' },
      ],
    },
  ]);

  // Separate Continuous Assessments & Internal Marks (Entered directly from Faculty Portal)
  const [assessmentMarks, setAssessmentMarks] = useState([
    { id: '27d6a359-8570-4e13-b2a8-73e03546e31e', code: 'CS301', title: 'Data Structures & Algorithms', credits: 4, internal: 45, maxMarks: 100, grade: 'Grade F', status: 'At Risk', riskScore: 0.72 },
    { id: '5bb138c2-848b-4ca3-9719-d8b8b07a719c', code: 'CS302', title: 'Introduction to Databases', credits: 3, internal: 85, maxMarks: 100, grade: 'Grade A+', status: 'Passed', riskScore: 0.12 },
    { id: '3a7e4b11-91f2-4c6e-8211-1a2b3c4d5e6f', code: 'CS303', title: 'Operating Systems', credits: 4, internal: 78, maxMarks: 100, grade: 'Grade A', status: 'Passed', riskScore: 0.18 },
    { id: '4b8f5c22-a2e3-4d7f-9322-2b3c4d5e6f7a', code: 'CS304', title: 'Computer Networks', credits: 3, internal: 82, maxMarks: 100, grade: 'Grade A+', status: 'Passed', riskScore: 0.15 },
  ]);
  const [loadingMarks, setLoadingMarks] = useState(false);

  const [expandedSem, setExpandedSem] = useState(6);

  const toggleSemester = (semNum) => {
    setExpandedSem(expandedSem === semNum ? null : semNum);
  };

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Weekly Timetable Data for Alex Turner
  const weeklyTimetable = {
    Monday: [
      { time: '09:00 - 10:00 AM', code: '23CS601', title: 'Data Structures & Algorithms', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '10:00 - 11:00 AM', code: '23CS602', title: 'Introduction to Databases', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Anandhi Murugesan' },
      { time: '11:15 - 12:15 PM', code: '23CS603', title: 'Data Analytics & Big Data', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Prof. Rajesh Kothari' },
      { time: '01:15 - 02:15 PM', code: '23CS604', title: 'Professional Elective: NLP & LLMs', type: 'Lecture', room: 'CS-206 (Turing Block)', faculty: 'Dr. Meenakshi Venkat' },
      { time: '02:15 - 04:15 PM', code: '23CS606', title: 'AI & Data Science Laboratory', type: 'Laboratory', room: 'Lab 3 (Turing Center)', faculty: 'Dr. Anandhi Murugesan' },
    ],
    Tuesday: [
      { time: '09:00 - 10:00 AM', code: '23CS602', title: 'Introduction to Databases', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Anandhi Murugesan' },
      { time: '10:00 - 11:00 AM', code: '23CS601', title: 'Data Structures & Algorithms', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '11:15 - 12:15 PM', code: '23CS605', title: 'Fintech & Blockchain Systems', type: 'Lecture', room: 'CS-102 (Bose Center)', faculty: 'Prof. S. Natarajan' },
      { time: '01:15 - 03:15 PM', code: '23CS607', title: 'Mini Project & Product Design', type: 'Project Lab', room: 'Innovation Hub 2', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '03:15 - 04:15 PM', code: 'MENTOR', title: 'Academic Counseling & Mentoring', type: 'Tutorial', room: 'CS-402 (Faculty Cabin)', faculty: 'Dr. Subramanian Ramanujan' },
    ],
    Wednesday: [
      { time: '09:00 - 10:00 AM', code: '23CS603', title: 'Data Analytics & Big Data', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Prof. Rajesh Kothari' },
      { time: '10:00 - 11:00 AM', code: '23CS604', title: 'Professional Elective: NLP & LLMs', type: 'Lecture', room: 'CS-206 (Turing Block)', faculty: 'Dr. Meenakshi Venkat' },
      { time: '11:15 - 01:15 PM', code: '23CS601', title: 'Advanced Algorithms Laboratory', type: 'Laboratory', room: 'Lab 1 (Ramanujan Block)', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '02:15 - 03:15 PM', code: '23CS605', title: 'Fintech & Blockchain Systems', type: 'Lecture', room: 'CS-102 (Bose Center)', faculty: 'Prof. S. Natarajan' },
      { time: '03:15 - 04:15 PM', code: 'LIB', title: 'Digital Library & Research Hour', type: 'Self Study', room: 'Central Knowledge Library', faculty: 'Librarian In-charge' },
    ],
    Thursday: [
      { time: '09:00 - 10:00 AM', code: '23CS601', title: 'Data Structures & Algorithms', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '10:00 - 11:00 AM', code: '23CS602', title: 'Introduction to Databases', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Anandhi Murugesan' },
      { time: '11:15 - 12:15 PM', code: '23CS603', title: 'Data Analytics & Big Data', type: 'Lecture', room: 'CS-204 (Ramanujan Block)', faculty: 'Prof. Rajesh Kothari' },
      { time: '01:15 - 03:15 PM', code: '23CS602', title: 'SQL & Database Architecture Lab', type: 'Laboratory', room: 'Lab 2 (Turing Center)', faculty: 'Dr. Anandhi Murugesan' },
      { time: '03:15 - 04:15 PM', code: 'SEMINAR', title: 'Technical Colloquium / Guest Lecture', type: 'Seminar', room: 'Auditorium 1', faculty: 'Industry Expert' },
    ],
    Friday: [
      { time: '09:00 - 10:00 AM', code: '23CS604', title: 'Professional Elective: NLP & LLMs', type: 'Lecture', room: 'CS-206 (Turing Block)', faculty: 'Dr. Meenakshi Venkat' },
      { time: '10:00 - 11:00 AM', code: '23CS605', title: 'Fintech & Blockchain Systems', type: 'Lecture', room: 'CS-102 (Bose Center)', faculty: 'Prof. S. Natarajan' },
      { time: '11:15 - 12:15 PM', code: '23CS601', title: 'Problem Solving Tutorial', type: 'Tutorial', room: 'CS-204 (Ramanujan Block)', faculty: 'Dr. Subramanian Ramanujan' },
      { time: '01:15 - 03:15 PM', code: '23CS607', title: 'Capstone Prototype Review', type: 'Project Lab', room: 'Innovation Hub 2', faculty: 'Faculty Evaluation Committee' },
      { time: '03:15 - 04:15 PM', code: 'SPORTS', title: 'Physical Education & Clubs', type: 'Extracurricular', room: 'Sports Complex / Ground', faculty: 'Coach & Mentors' },
    ],
  };

  // Fetch live attendance history from PostgreSQL
  const fetchAttendance = useCallback(async () => {
    try {
      const attRes = await api.get(`/attendance/student/${ALEX_STUDENT_ID}`);
      if (attRes?.data) {
        setAttendanceData({
          summary: attRes.data.summary || { total: 4, present: 3, absent: 1, late: 0 },
          records: attRes.data.records || [],
        });
      }
    } catch (err) {
      console.warn('Could not fetch student attendance:', err);
    } finally {
      setLoadingDb(false);
    }
  }, []);

  // Fetch messages from backend
  const fetchMessages = useCallback(async () => {
    try {
      const msgRes = await api.get(`/messages/student/${ALEX_STUDENT_ID}`);
      if (msgRes?.data?.messages) {
        setMessages(msgRes.data.messages);
        setUnreadCount(msgRes.data.messages.filter((m) => !m.is_read).length);
      }
    } catch (err) {
      console.warn('Could not fetch messages:', err);
    }
  }, []);

  // Fetch invoices from backend
  const fetchInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      const invRes = await api.get(`/invoices/student/${ALEX_STUDENT_ID}`);
      if (invRes?.data?.invoices) {
        setInvoices(invRes.data.invoices);
      }
    } catch (err) {
      console.warn('Could not fetch invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  // Initial load
  const fetchStudentMarks = useCallback(() => {
    setLoadingMarks(true);
    api.get(`/marks/student/${ALEX_STUDENT_ID}`)
      .then((res) => {
        if (res.data?.marks && res.data.marks.length > 0) {
          const marksList = res.data.marks;
          const highestRisk = marksList.reduce(
            (max, m) => ((m.riskScore || 0) > (max.riskScore || 0) ? m : max),
            marksList[0]
          );
          setAiRiskData({
            status: highestRisk.riskStatus || 'Low Risk',
            score: highestRisk.riskScore || 0.12,
          });

          setAssessmentMarks((prev) =>
            prev.map((c) => {
              const match = marksList.find(
                (m) =>
                  (m.courseId && m.courseId === c.id) ||
                  (m.courseName && c.title.toLowerCase().includes(m.courseName.toLowerCase())) ||
                  (m.courseName && m.courseName.toLowerCase().includes(c.title.toLowerCase())) ||
                  (c.code === 'CS301' && (m.courseName || '').toLowerCase().includes('data structures')) ||
                  (c.code === 'CS302' && (m.courseName || '').toLowerCase().includes('database')) ||
                  (c.code === 'CS303' && (m.courseName || '').toLowerCase().includes('operating systems')) ||
                  (c.code === 'CS304' && (m.courseName || '').toLowerCase().includes('computer networks'))
              );
              if (match) {
                const sc = parseFloat(match.internalScore !== undefined ? match.internalScore : match.marks || 0);
                return {
                  ...c,
                  internal: sc,
                  grade: match.grade || (sc >= 90 ? 'Grade O' : sc >= 80 ? 'Grade A+' : sc >= 70 ? 'Grade A' : sc >= 60 ? 'Grade B+' : sc >= 50 ? 'Grade B' : 'Grade F'),
                  status: sc >= 50 ? 'Passed' : 'At Risk',
                  riskScore: match.riskScore || (sc < 50 ? 0.72 : 0.15),
                };
              }
              return c;
            })
          );
        }
      })
      .catch((e) => console.warn('Marks fetch:', e))
      .finally(() => setLoadingMarks(false));
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchMessages();
    fetchInvoices();
    fetchStudentMarks();
  }, [fetchAttendance, fetchMessages, fetchInvoices, fetchStudentMarks]);

  // WebSockets: Real-Time Listeners
  useEffect(() => {
    if (!socket) return;

    // 1. Live Attendance Event
    const handleAttendanceUpdated = (data) => {
      console.log('[WebSocket Event: Student] ATTENDANCE_UPDATED received:', data);

      if (data.student_id === ALEX_STUDENT_ID || data.studentId === ALEX_STUDENT_ID) {
        setAttendanceData((prev) => {
          const currentRecords = prev?.records || [];
          const existingIdx = currentRecords.findIndex(
            (r) =>
              (r.courseId === data.course_id || r.courseName === data.courseName) &&
              (String(r.date).slice(0, 10) === String(data.attendance_date).slice(0, 10))
          );

          let updatedRecords;
          if (existingIdx >= 0) {
            updatedRecords = currentRecords.map((r, idx) =>
              idx === existingIdx ? { ...r, status: data.status, updatedAt: data.updated_at } : r
            );
          } else {
            const newRecord = {
              id: data.id || `att-${Date.now()}`,
              courseId: data.course_id,
              courseName: data.courseName || 'Course',
              credits: data.credits || 4,
              date: data.attendance_date,
              status: data.status,
              createdAt: data.updated_at || new Date().toISOString(),
              updatedAt: data.updated_at || new Date().toISOString(),
            };
            updatedRecords = [newRecord, ...currentRecords];
          }

          const presentCount = updatedRecords.filter((r) => r.status === 'PRESENT').length;
          const absentCount = updatedRecords.filter((r) => r.status === 'ABSENT').length;
          const lateCount = updatedRecords.filter((r) => r.status === 'LATE').length;

          return {
            summary: {
              total: updatedRecords.length,
              present: presentCount,
              absent: absentCount,
              late: lateCount,
            },
            records: updatedRecords,
          };
        });

        fetchAttendance();

        setLiveEventBanner({
          type: 'ATTENDANCE',
          title: 'Live Attendance Updated by Faculty!',
          message: `Your attendance record for "${data.courseName || 'Course'}" has been marked as ${data.status}.`,
        });

        setTimeout(() => setLiveEventBanner(null), 6000);
      }
    };

    // 2. Live Marks Event
    const handleMarksUpdated = (data) => {
      console.log('[WebSocket Event: Student] MARKS_UPDATED received:', data);

      if (data.student_id === ALEX_STUDENT_ID || data.studentId === ALEX_STUDENT_ID) {
        const newScore = parseFloat(data.internal_score !== undefined ? data.internal_score : data.marks || 0);

        setAssessmentMarks((prev) =>
          prev.map((c) => {
            const isMatch =
              (data.course_id && c.id && data.course_id === c.id) ||
              (data.courseName && c.title.toLowerCase().includes(data.courseName.toLowerCase())) ||
              (data.courseName && data.courseName.toLowerCase().includes(c.title.toLowerCase())) ||
              (c.code === 'CS301' && (data.courseName || '').toLowerCase().includes('data structures')) ||
              (c.code === 'CS302' && (data.courseName || '').toLowerCase().includes('database')) ||
              (c.code === 'CS303' && (data.courseName || '').toLowerCase().includes('operating systems')) ||
              (c.code === 'CS304' && (data.courseName || '').toLowerCase().includes('computer networks'));
            if (isMatch) {
              return {
                ...c,
                internal: newScore,
                grade: data.grade || (newScore >= 90 ? 'Grade O' : newScore >= 80 ? 'Grade A+' : newScore >= 70 ? 'Grade A' : newScore >= 60 ? 'Grade B+' : newScore >= 50 ? 'Grade B' : 'Grade F'),
                status: newScore >= 50 ? 'Passed' : 'At Risk',
                riskScore: newScore < 50 ? 0.72 : 0.15,
              };
            }
            return c;
          })
        );

        fetchStudentMarks();

        setLiveEventBanner({
          type: 'MARKS',
          title: 'Assessment Marks Updated by Faculty!',
          message: `Your continuous assessment score for "${data.courseName || 'Curriculum Subject'}" has been updated to ${newScore}/100.`,
        });

        setTimeout(() => setLiveEventBanner(null), 6000);
      }
    };

    // 3. Live AI Risk Event
    const handleRiskUpdated = (data) => {
      console.log('[WebSocket Event: Student] RISK_UPDATED received:', data);

      if (data.student_id === ALEX_STUDENT_ID || data.studentId === ALEX_STUDENT_ID) {
        setAiRiskData({
          status: data.risk_status,
          score: data.risk_score,
        });

        setLiveEventBanner({
          type: 'RISK',
          title: 'AI Academic Risk Recalculated by ML Model',
          message: `Standing updated to ${data.risk_status} (Risk Score: ${data.risk_score}).`,
        });

        setTimeout(() => setLiveEventBanner(null), 6000);
      }
    };

    // 4. Batch Marks Update Event
    const handleBatchMarksUpdated = (data) => {
      console.log('[WebSocket Event: Student] MARKS_BATCH_UPDATED received:', data);
      fetchStudentMarks();
      setLiveEventBanner({
        type: 'MARKS',
        title: 'Batch Marks Synchronized by Faculty!',
        message: `Continuous assessment marks synchronized for ${data.courseName || 'Curriculum Courses'}.`,
      });
      setTimeout(() => setLiveEventBanner(null), 6000);
    };

    // 5. Live Faculty Message Event
    const handleMessageReceived = (data) => {
      console.log('[WebSocket Event: Student] STUDENT_MESSAGE_RECEIVED:', data);

      if (data.student_id === ALEX_STUDENT_ID || data.studentId === ALEX_STUDENT_ID) {
        setMessages((prev) => [
          {
            id: data.id || `msg-${Date.now()}`,
            sender_name: data.sender_name || 'Faculty Academic Advisor',
            sender_email: data.sender_email || 'faculty@erp.com',
            subject: data.subject,
            message: data.message,
            priority: data.priority || 'HIGH',
            is_read: false,
            created_at: data.receivedAt || data.created_at || new Date().toISOString(),
          },
          ...prev,
        ]);

        setUnreadCount((c) => c + 1);

        setLiveEventBanner({
          type: 'MESSAGE',
          title: `🚨 Urgent Faculty Advisory from ${data.sender_name || 'Faculty Member'}!`,
          message: `${data.subject}: "${data.message.slice(0, 90)}..."`,
        });

        setTimeout(() => setLiveEventBanner(null), 9000);
      }
    };

    socket.on('ATTENDANCE_UPDATED', handleAttendanceUpdated);
    socket.on('MARKS_UPDATED', handleMarksUpdated);
    socket.on('MARKS_BATCH_UPDATED', handleBatchMarksUpdated);
    socket.on('RISK_UPDATED', handleRiskUpdated);
    socket.on('STUDENT_MESSAGE_RECEIVED', handleMessageReceived);

    return () => {
      socket.off('ATTENDANCE_UPDATED', handleAttendanceUpdated);
      socket.off('MARKS_UPDATED', handleMarksUpdated);
      socket.off('MARKS_BATCH_UPDATED', handleBatchMarksUpdated);
      socket.off('RISK_UPDATED', handleRiskUpdated);
      socket.off('STUDENT_MESSAGE_RECEIVED', handleMessageReceived);
    };
  }, [socket, fetchAttendance, fetchStudentMarks]);

  // Payment Execution Handler (Connects to Phase 6 atomic transaction backend POST /api/payments)
  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    setProcessingPayment(true);
    try {
      const amountToPay = selectedInvoiceForPayment.remainingBalance || selectedInvoiceForPayment.amount;

      const res = await api.post('/payments', {
        invoice_id: selectedInvoiceForPayment.id,
        amount_paid: amountToPay,
      });

      // Update state immediately
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoiceForPayment.id
            ? { ...inv, status: 'PAID', totalPaid: inv.amount, remainingBalance: 0 }
            : inv
        )
      );

      // Open receipt modal for the paid invoice
      const paidInvoiceWithDetails = {
        ...selectedInvoiceForPayment,
        status: 'PAID',
        paidAmount: amountToPay,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN-AIT-${Date.now().toString(36).toUpperCase()}`,
        paymentMode: paymentMethod,
      };

      setSelectedInvoiceForPayment(null);
      setReceiptModalInvoice(paidInvoiceWithDetails);

      setLiveEventBanner({
        type: 'PAYMENT',
        title: 'Fee Payment Processed Successfully!',
        message: `₹${Number(amountToPay).toLocaleString()} cleared via ${paymentMethod}. Atomic transaction committed with zero outstanding dues.`,
      });
      setTimeout(() => setLiveEventBanner(null), 6000);

      // Re-fetch authoritative invoice list from PostgreSQL
      fetchInvoices();
    } catch (err) {
      console.error('Payment failure:', err);
      alert(`Payment transaction failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 4000);
  };

  // Identity calculations
  const studentEmail = profileData.campusEmail;
  const enrollmentNo = profileData.rollNo;
  const departmentName = profileData.department;

  // Live attendance calculations
  const liveTotal = attendanceData?.summary?.total || 0;
  const livePresent = attendanceData?.summary?.present || 0;
  const liveAbsent = attendanceData?.summary?.absent || 0;
  const baselineTotal = 40;
  const baselinePresent = 38;
  const baselineAbsent = 2;
  const totalCombined = baselineTotal + liveTotal;
  const presentCombined = baselinePresent + livePresent;
  const absentCombined = baselineAbsent + liveAbsent;
  const attendancePercent =
    totalCombined > 0 ? Math.round((presentCombined / totalCombined) * 100) : 95;

  const currentSgpa = sgpaTrendData.find((s) => s.semester === 'Sem 6')?.sgpa || 9.15;

  // Invoices summary calculations
  const totalBilledAmount = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
  const totalPaidAmount = invoices.reduce((acc, inv) => acc + parseFloat(inv.totalPaid || (inv.status === 'PAID' ? inv.amount : 0)), 0);
  const totalOutstandingDues = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((acc, inv) => acc + parseFloat(inv.remainingBalance !== undefined ? inv.remainingBalance : inv.amount), 0);

  // Continuous Assessment Marks & Total Percentage Calculations (Dedicated Assessment Page)
  const assessmentTotalScored = assessmentMarks.reduce(
    (acc, c) => acc + (parseFloat(c.internal) || 0),
    0
  );
  const assessmentMaxMarks = assessmentMarks.length * 100 || 400;
  const assessmentTotalPercentage =
    assessmentMaxMarks > 0 ? ((assessmentTotalScored / assessmentMaxMarks) * 100).toFixed(1) : '0.0';
  const assessmentTotalCredits = assessmentMarks.reduce((acc, c) => acc + (parseInt(c.credits) || 0), 0) || 14;
  const assessmentHasDeficit = assessmentMarks.some(
    (c) => (parseFloat(c.internal) || 0) < 50
  );
  const assessmentDistinctionStatus =
    parseFloat(assessmentTotalPercentage) >= 75
      ? 'Distinction'
      : parseFloat(assessmentTotalPercentage) >= 60
      ? 'First Class'
      : parseFloat(assessmentTotalPercentage) >= 50
      ? 'Second Class'
      : 'Academic Warning';

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Real-time Alert Banner when any WebSocket event arrives */}
        {liveEventBanner && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-xl flex items-center justify-between animate-fade-in border border-indigo-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
                <Zap className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-sm flex items-center gap-2">
                  {liveEventBanner.title}
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-mono">
                    LIVE PUSH EVENT
                  </span>
                </p>
                <p className="text-xs text-indigo-100 mt-0.5">{liveEventBanner.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {liveEventBanner.type === 'MESSAGE' && (
                <button
                  onClick={() => {
                    handleTabChange('messages');
                    setLiveEventBanner(null);
                  }}
                  className="text-xs px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-bold transition-colors"
                >
                  View Message
                </button>
              )}
              <button
                onClick={() => setLiveEventBanner(null)}
                className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Student Profile Header */}
        <div className="bg-gradient-to-r from-white via-indigo-50/40 to-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-0.5 shadow-md shadow-indigo-600/20">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-indigo-700 font-black text-2xl">
                  AT
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {profileData.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Reg No: {enrollmentNo}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Connected Student
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                      aiRiskData.status === 'High Risk'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : aiRiskData.status === 'Medium Risk'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    AI Status: {aiRiskData.status} ({aiRiskData.score})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-1 mt-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Campus Email:</span>
                    <span className="text-slate-900 font-mono font-semibold">{studentEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-900 font-semibold">{departmentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Current Year:</span>
                    <span className="text-indigo-700 font-semibold">3rd Year (Sem 6)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Institution</p>
                <p className="text-xs font-semibold text-slate-700">Apex Institute of Technology</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon: All 7 Structured Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Academic Overview & CGPA</span>
          </button>

          <button
            onClick={() => handleTabChange('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>2. Live Attendance Records</span>
          </button>

          <button
            onClick={() => handleTabChange('marks')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'marks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. 8-Semester Marksheets</span>
          </button>

          <button
            onClick={() => handleTabChange('assessments')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assessments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>4. Course Assessments & Internal Marks</span>
          </button>

          <button
            onClick={() => handleTabChange('fees')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'fees'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>5. Financials & Fee Payments</span>
            {totalOutstandingDues > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                Due
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>6. Class Timetable</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>7. Profile & Document Vault</span>
          </button>

          <button
            onClick={() => handleTabChange('messages')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'messages'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>8. AI Risk & Faculty Alerts</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ACADEMIC OVERVIEW & CGPA */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Stats Row: 3 Core Academic & Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall CGPA */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Current Overall CGPA
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-black text-slate-900">{currentSgpa}</h3>
                      <span className="text-sm font-semibold text-slate-400">/ 10.0</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    First Class with Distinction
                  </span>
                  <span className="text-xs text-slate-500">Official CGPA</span>
                </div>
              </div>

              {/* Live Attendance Percentage */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Attendance (Live Synced)
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-black text-slate-900">{attendancePercent}%</h3>
                      <span className="text-xs font-semibold text-slate-500">
                        ({presentCombined}/{totalCombined} Attended)
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, attendancePercent)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                    <span>Database Synced ({liveTotal} Recorded Live)</span>
                    <span className="font-semibold text-emerald-700">Exam Eligible</span>
                  </p>
                </div>
              </div>

              {/* Fee Payment & Tuition Status */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Semester Fee Status
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-black text-slate-900">
                        {totalOutstandingDues === 0 ? 'Cleared' : `₹${totalOutstandingDues.toLocaleString()}`}
                      </h3>
                      <span className={`text-xs font-semibold ${totalOutstandingDues === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {totalOutstandingDues === 0 ? '₹0 Dues' : 'Outstanding Due'}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Academic Year 2026-27</span>
                  <button
                    onClick={() => handleTabChange('fees')}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    View Invoices & Pay →
                  </button>
                </div>
              </div>
            </div>

            {/* SGPA Progression Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    SGPA Academic Progression (Semesters 1 - 6) • Live WebSockets Connected
                  </h2>
                  <p className="text-xs text-slate-500">
                    Visual trajectory of semester grade point averages updates instantly when faculty modifies grades.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-0.5 bg-indigo-600 rounded"></span> Actual SGPA
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-3 h-0.5 bg-slate-300 border-dashed rounded"></span> Target (8.50)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sgpaTrendData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis domain={[7.5, 10.0]} stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(val) => [`${val}`, 'SGPA']}
                    />
                    <ReferenceLine y={8.5} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target 8.5', fill: '#94a3b8', fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="sgpa"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7, fill: '#4338ca' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ATTENDANCE RECORDS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Sessions</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalCombined}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-emerald-600 font-semibold uppercase">Sessions Attended</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{presentCombined}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-rose-600 font-semibold uppercase">Sessions Absent</span>
                <p className="text-2xl font-black text-rose-700 mt-1">{absentCombined}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs text-indigo-600 font-semibold uppercase">Attendance %</span>
                <p className="text-2xl font-black text-indigo-700 mt-1">{attendancePercent}%</p>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-600" />
                    Live Synced Attendance Log (PostgreSQL & WebSockets)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Whenever your faculty records or updates attendance, this log updates instantly without refreshing.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  {attendanceData?.records?.length || 0} Direct DB Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Course Name & Code</th>
                      <th scope="col" className="px-6 py-3.5">Attendance Date</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Recorded Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(attendanceData?.records || []).length > 0 ? (
                      attendanceData.records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {rec.courseName}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">
                            {safeFormatDate(rec.date)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                rec.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                            {safeFormatTime(rec.createdAt || rec.date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-xs">
                          No recent attendance records found. Wait for faculty to mark attendance.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 8-SEMESTER MARKSHEETS */}
        {activeTab === 'marks' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Complete 8-Semester Marksheets & Course Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any semester to view internal scores, external exam marks, and final letter grades.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
                  Total Enrolled Credits: 172
                </span>
              </div>

              <div className="space-y-3">
                {semestersData.map((sem) => {
                  const isOpen = expandedSem === sem.semNumber;
                  return (
                    <div
                      key={sem.semNumber}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isOpen ? 'border-indigo-300 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      {/* Semester Bar Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleSemester(sem.semNumber)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                              isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            S{sem.semNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900">{sem.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  sem.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : sem.status === 'In Progress'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {sem.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{sem.academicYear}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">SGPA</span>
                            <span className="text-sm font-extrabold text-slate-900">
                              {sem.sgpa > 0 ? sem.sgpa : 'Upcoming'}
                            </span>
                          </div>

                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Credits</span>
                            <span className="text-sm font-semibold text-slate-700">{sem.credits}</span>
                          </div>

                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Table for Semester Courses */}
                      {isOpen && (
                        <div className="border-t border-slate-200 p-5 bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                  <th scope="col" className="px-4 py-3">Course Code</th>
                                  <th scope="col" className="px-4 py-3">Course Title</th>
                                  <th scope="col" className="px-4 py-3 text-center">Credits</th>
                                  <th scope="col" className="px-4 py-3 text-center">Internal (40)</th>
                                  <th scope="col" className="px-4 py-3 text-center">External (60)</th>
                                  <th scope="col" className="px-4 py-3 text-center">Total Score</th>
                                  <th scope="col" className="px-4 py-3 text-right">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {sem.courses.map((course, cIdx) => (
                                  <tr key={cIdx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{course.code}</td>
                                    <td className="px-4 py-3 text-slate-800">{course.title}</td>
                                    <td className="px-4 py-3 text-center font-mono">{course.credits}</td>
                                    <td className="px-4 py-3 text-center font-mono">{course.internal}</td>
                                    <td className="px-4 py-3 text-center font-mono text-slate-400">{course.external}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-indigo-700">{course.total}</td>
                                    <td className="px-4 py-3 text-right">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                          course.grade === 'O' || course.grade.includes('Grade O')
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : course.grade.startsWith('A') || course.grade.includes('Grade A')
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            : course.grade.includes('F')
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}
                                      >
                                        {course.grade}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEDICATED SEPARATE PAGE FOR COURSE ASSESSMENTS & INTERNAL MARKS */}
        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fade-in">
            {/* Page Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    Continuous Evaluation
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Faculty Synchronized
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mt-2">
                  Course Assessments & Internal Marks
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Continuous internal marks and subject assessments entered directly by faculty members via the Faculty Portal.
                  These records evaluate ongoing coursework, tests, assignments, and laboratory components.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStudentMarks}
                  disabled={loadingMarks}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${loadingMarks ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{loadingMarks ? 'Refreshing...' : 'Refresh Marks'}</span>
                </button>
              </div>
            </div>

            {/* 4 Assessment KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Percentage</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{assessmentTotalPercentage}%</span>
                  <span className="text-xs font-semibold text-slate-400">Aggregate</span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      parseFloat(assessmentTotalPercentage) >= 75
                        ? 'bg-emerald-500'
                        : parseFloat(assessmentTotalPercentage) >= 60
                        ? 'bg-indigo-500'
                        : parseFloat(assessmentTotalPercentage) >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(assessmentTotalPercentage)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Weighted continuous internal percentage</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Marks Scored</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{assessmentTotalScored}</span>
                  <span className="text-xs font-semibold text-slate-400">/ {assessmentMaxMarks}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Evaluated across {assessmentMarks.length} active coursework subjects
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Standing</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${
                    parseFloat(assessmentTotalPercentage) >= 60 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {assessmentDistinctionStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  {assessmentHasDeficit ? '⚠️ Action recommended in 1 subject' : 'Consistent performance across subjects'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluated Credits</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{assessmentTotalCredits}</span>
                  <span className="text-xs font-semibold text-slate-400">Credits</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Total credit weighting for internal assessment
                </p>
              </div>
            </div>

            {/* Continuous Assessment Breakdown Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Subject-Wise Continuous Assessment Marks
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live evaluations submitted by course faculty from the Faculty Portal
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {assessmentMarks.length} Course Subjects
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4">Subject Code & Course Title</th>
                      <th className="py-3 px-4">Faculty Instructor</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4">Internal Marks (/100)</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessmentMarks.map((c) => {
                      const score = parseFloat(c.internal) || 0;
                      const isPassing = score >= 50;
                      return (
                        <tr key={c.id || c.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            <div className="font-bold text-slate-900">{c.code}</div>
                            <div className="text-xs text-slate-500">{c.title}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {c.faculty || 'Course Faculty'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {c.credits || 4}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-sm text-slate-900 w-16">
                                {score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                              </span>
                              <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    score >= 75
                                      ? 'bg-emerald-500'
                                      : score >= 60
                                      ? 'bg-indigo-500'
                                      : score >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700">
                              {c.grade || (score >= 90 ? 'Grade O' : score >= 80 ? 'Grade A+' : score >= 70 ? 'Grade A' : score >= 60 ? 'Grade B+' : score >= 50 ? 'Grade B' : 'Grade F')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPassing
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isPassing ? 'Satisfactory' : 'Needs Attention'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                      <td colSpan="2" className="py-4 px-4 text-slate-900 font-black">
                        Aggregate Course Assessment Summary
                      </td>
                      <td className="py-4 px-4 text-center font-black">
                        {assessmentTotalCredits} Credits
                      </td>
                      <td className="py-4 px-4 font-black">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900">
                            {assessmentTotalScored} <span className="text-xs font-normal text-slate-500">/ {assessmentMaxMarks}</span>
                          </span>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {assessmentTotalPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-black text-xs">
                          {assessmentDistinctionStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          !assessmentHasDeficit
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {!assessmentHasDeficit ? 'Good Standing' : 'Deficit Detected'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Informational Callout: Continuous Assessment vs End-Semester Transcripts */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs text-blue-900 leading-relaxed">
                <p className="font-bold text-sm text-blue-950 mb-1">
                  Distinct Academic Assessment Framework
                </p>
                <p>
                  <strong>Continuous Assessment Marks:</strong> Shown above are internal marks out of 100 representing ongoing quizzes, midterm tests, lab evaluations, and assignments entered directly by faculty members via the Faculty Portal.
                </p>
                <p className="mt-1 text-blue-800">
                  <strong>Official 8-Semester Marksheets:</strong> Tab 3 contains official end-term academic transcripts with credits, grade points, SGPA, and cumulative CGPA across Semesters 1 through 8. Continuous internal assessment marks do not replace end-semester marksheet records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DETAILED FINANCIALS & FEE PAYMENTS */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            {/* High-level fee metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Billed Fees</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  ₹{totalBilledAmount.toLocaleString()}
                </h3>
                <p className="text-xs text-slate-500 mt-2">Academic Year 2026-27 Invoiced Dues</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-emerald-600">Settled & Cleared</p>
                <h3 className="text-3xl font-black text-emerald-700 mt-2">
                  ₹{totalPaidAmount.toLocaleString()}
                </h3>
                <p className="text-xs text-emerald-600 mt-2 font-medium">Verified by Financial Ledger</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-rose-600">Outstanding Dues</p>
                <h3 className="text-3xl font-black text-rose-700 mt-2">
                  ₹{totalOutstandingDues.toLocaleString()}
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  {totalOutstandingDues > 0 ? 'Pay before deadline to avoid late fees' : 'Zero outstanding dues. All cleared!'}
                </p>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Itemized Invoices & Payment Ledger (PostgreSQL Phase 6 Backend)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View official invoice history, make secure online payments with row-level atomic locks, and download PDF receipts.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                  {invoices.length} Invoices Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Invoice ID & Description</th>
                      <th scope="col" className="px-6 py-3.5">Due Date</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Invoice Amount</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Amount Paid</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => {
                      const isPaid = inv.status === 'PAID';
                      const desc =
                        inv.amount >= 50000
                          ? 'Semester 6 Academic Tuition & Development Fee'
                          : inv.amount >= 10000
                          ? 'Specialized AI Lab, Library & Computing Amenities'
                          : 'Semester 6 Examination & Comprehensive Assessment Fee';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{desc}</p>
                            <span className="text-xs text-slate-500 font-mono">Invoice #{inv.id.slice(0, 18)}...</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">
                            {safeFormatDate(inv.dueDate || inv.due_date)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            ₹{parseFloat(inv.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-700">
                            ₹{parseFloat(inv.totalPaid || (isPaid ? inv.amount : 0)).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : inv.status === 'PARTIAL'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPaid ? 'bg-emerald-500' : inv.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isPaid ? (
                              <button
                                type="button"
                                onClick={() => setReceiptModalInvoice({ ...inv, description: desc })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF Receipt</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPayment({ ...inv, description: desc })}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Pay Now</span>
                              </button>
                            )}
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

        {/* TAB 5: CLASS TIMETABLE & SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Weekly Class Schedule & Room Assignments
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Semester 6 • B.Tech Computer Science & Engineering (Section A)
                  </p>
                </div>

                {/* Day selector pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedDay === day
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day's Classes List */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedDay}'s Class Schedule (5 Time Slots)
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Term
                  </span>
                </div>

                {weeklyTimetable[selectedDay].map((slot, sIdx) => {
                  const isLab = slot.type === 'Laboratory' || slot.type === 'Project Lab';
                  return (
                    <div
                      key={sIdx}
                      className="border border-slate-200 rounded-2xl p-4.5 hover:border-indigo-300 transition-all bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-28 py-2 px-2.5 rounded-xl bg-slate-100 text-center shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                          <span className="font-bold text-slate-900 text-xs font-mono">{slot.time}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {slot.code}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900">{slot.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isLab
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {slot.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{slot.room}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{slot.faculty}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                          Period {sIdx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE & DOCUMENT VAULT */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            {/* Feedback notification */}
            {profileSavedToast && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contact details and emergency information updated successfully in student profile!</span>
              </div>
            )}

            {/* Profile Information & Edit Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Personal Profile & Emergency Contact Details
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Academic Identity (Read-only) */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Academic Identity (University Records)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Name</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{profileData.fullName}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Roll Number</span>
                      <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">{profileData.rollNo}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Program / Branch</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{profileData.department}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Batch Period</span>
                      <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{profileData.batch}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Date of Birth</span>
                      <span className="text-xs font-semibold text-slate-900 mt-0.5 block">15 August 2004</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                      <span className="text-xs font-bold text-rose-600 mt-0.5 block">{profileData.bloodGroup}</span>
                    </div>
                  </div>
                </div>

                {/* Editable Contact Details */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Contact & Residential Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Student Phone / Mobile</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Email Address</label>
                      <input
                        type="email"
                        value={profileData.personalEmail}
                        onChange={(e) => setProfileData({ ...profileData, personalEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Street Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Editable Emergency Contact */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Guardian & Emergency Contacts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                      <input
                        type="text"
                        value={profileData.guardianName}
                        onChange={(e) => setProfileData({ ...profileData, guardianName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={profileData.guardianRelation}
                        onChange={(e) => setProfileData({ ...profileData, guardianRelation: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Hotline Phone</label>
                      <input
                        type="text"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile Updates</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Official Document Vault Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-indigo-600" />
                Official Document Vault & Digital ID Credentials
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Instant access to certified institutional credentials, digital smart cards, and academic admission records.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Admission Letter */}
                <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all flex flex-col justify-between bg-slate-50/40">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3">
                      <School className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Official Admission Letter</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Official provisional allotment letter with registration number and institutional seal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptDocument('admission')}
                    className="mt-4 w-full py-2 px-3 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View & Download</span>
                  </button>
                </div>

                {/* 2. Digital Smart ID Card */}
                <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all flex flex-col justify-between bg-slate-50/40">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-3">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Digital Smart ID Card</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Virtual institutional student identity card with cryptographic QR barcode and validity tag.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptDocument('idcard')}
                    className="mt-4 w-full py-2 px-3 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View & Download</span>
                  </button>
                </div>

                {/* 3. Study / Bonafide Certificate */}
                <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all flex flex-col justify-between bg-slate-50/40">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Bonafide Certificate</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Official bonafide certificate for passport, bank education loan, and internship verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptDocument('bonafide')}
                    className="mt-4 w-full py-2 px-3 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View & Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FACULTY ALERTS & AI RISK */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            {/* AI Risk Status Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Predictive AI Academic Risk Assessment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated asynchronously by Python ML Microservice via RabbitMQ queue.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Standing</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-0.5 ${
                        aiRiskData.status === 'High Risk'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : aiRiskData.status === 'Medium Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {aiRiskData.status} (Score: {aiRiskData.score})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Faculty Advisories Inbox */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-600" />
                    Faculty Academic Advisory Inbox ({messages.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Messages and early intervention notifications sent directly by your faculty arrive here live via WebSockets.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all bg-slate-50/40 hover:bg-white shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            FA
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">
                              {msg.sender_name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {msg.sender_email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              msg.priority === 'URGENT'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {msg.priority || 'HIGH'} PRIORITY
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {safeFormatDateTime(msg.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3">
                        <h4 className="font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          {msg.subject}
                        </h4>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No Advisory Messages Yet</p>
                    <p className="text-xs mt-1">
                      If your faculty sends an intervention advisory message, it will pop up on your screen live.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT GATEWAY MODAL (Atomic Transaction with Row-Level SELECT ... FOR UPDATE Lock) */}
        {selectedInvoiceForPayment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Institute Payment Gateway (Phase 6 Atomic Lock)
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Invoice #{selectedInvoiceForPayment.id.slice(0, 16)}...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecutePayment} className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Payable Fee Item</span>
                    <span>Student: Alex Turner</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedInvoiceForPayment.description}</h4>
                  <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-2">
                    <span className="text-xs font-semibold text-slate-600">Total Net Amount</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{parseFloat(selectedInvoiceForPayment.remainingBalance || selectedInvoiceForPayment.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'CARD', 'NETBANKING'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                          paymentMethod === method
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {method === 'UPI' ? 'UPI / QR' : method === 'CARD' ? 'Debit Card' : 'Net Banking'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Secured by PostgreSQL Row-Level Locking (<code className="font-mono font-bold">SELECT FOR UPDATE</code>) & Redis cache invalidation.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForPayment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{processingPayment ? 'Processing Transaction...' : 'Confirm & Settle Payment'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OFFICIAL PDF RECEIPT MODAL */}
        {receiptModalInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <School className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Official E-Fee Receipt & Settlement Record</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptModalInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable receipt card */}
              <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-700 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900 uppercase">Apex Institute of Technology</h3>
                  <p className="text-[10px] text-slate-500">Avinashi Road, Coimbatore, Tamil Nadu - 641048</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">ACADEMIC YEAR 2026-27 FEE VOUCHER</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Student Name:</span>
                    <strong className="text-slate-900">Alex Turner</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Enrollment No:</span>
                    <strong className="text-slate-900">STU-2026-CCF9BC</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Receipt ID:</span>
                    <strong className="text-slate-900">REC-AIT-{receiptModalInvoice.id.slice(0, 8).toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Payment:</span>
                    <strong className="text-slate-900">{new Date().toLocaleDateString()}</strong>
                  </div>
                </div>

                <div className="border-t border-b border-slate-200 py-3">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Particulars</span>
                    <span>Amount Paid</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>{receiptModalInvoice.description || 'Semester Academic Fee'}</span>
                    <span>₹{parseFloat(receiptModalInvoice.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Grand Total Settled:</span>
                  <span className="text-emerald-700 text-lg">₹{parseFloat(receiptModalInvoice.amount).toLocaleString()}</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Status: AUTHORIZED & PAID</span>
                  <span className="font-bold text-indigo-700">Digital Seal Verified</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModalInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL DOCUMENT VAULT PREVIEW MODAL */}
        {receiptDocument && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Official Institutional Credential</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptDocument(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {receiptDocument === 'idcard' ? (
                /* Virtual Student Smart ID Card */
                <div className="mt-6 p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <School className="w-5 h-5 text-indigo-400" />
                      <span className="font-black text-xs tracking-wider">APEX INSTITUTE OF TECHNOLOGY</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">
                      STUDENT ID
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="w-18 h-18 rounded-2xl bg-white/10 border-2 border-indigo-400 flex items-center justify-center font-black text-2xl text-white shadow-md">
                      AT
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">Alex Turner</h3>
                      <p className="text-xs text-indigo-300 font-mono mt-0.5">Roll No: STU-2026-CCF9BC</p>
                      <p className="text-[11px] text-slate-300 mt-1">Computer Science & Engineering</p>
                      <p className="text-[10px] text-slate-400">Valid Till: June 2028</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Blood: O+ | DOB: 15-08-2004</span>
                    <span className="text-emerald-400 font-bold">AUTHENTICATED CREDENTIAL</span>
                  </div>
                </div>
              ) : receiptDocument === 'bonafide' ? (
                /* Bonafide Certificate */
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h3 className="font-black text-sm text-slate-900">APEX INSTITUTE OF TECHNOLOGY</h3>
                    <p className="text-[10px] text-slate-500">Autonomous Institution • Affiliated to Anna University</p>
                    <p className="text-xs font-bold text-slate-900 underline mt-2">BONAFIDE CERTIFICATE</p>
                  </div>
                  <p className="mt-4">
                    This is to certify that <strong>Mr. Alex Turner</strong> (Register No: <strong>STU-2026-CCF9BC</strong>) is a bonafide student of this institution, currently studying in the <strong>VI Semester of B.Tech Computer Science & Engineering</strong> during the academic year 2026 - 2027.
                  </p>
                  <p className="mt-2">
                    His conduct and character during his tenure at this institution have been exemplary. This certificate is issued for official documentation verification.
                  </p>
                  <div className="mt-6 pt-4 flex justify-between items-end border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString()}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">Registrar / Academic Dean</span>
                      <span className="text-[10px] text-slate-400">Apex Institute of Technology</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Admission Letter */
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h3 className="font-black text-sm text-slate-900">APEX INSTITUTE OF TECHNOLOGY</h3>
                    <p className="text-[10px] text-slate-500">Office of Admissions & Academic Allotment</p>
                    <p className="text-xs font-bold text-slate-900 underline mt-2">OFFICIAL ADMISSION ALLOTMENT LETTER</p>
                  </div>
                  <p className="mt-4">
                    Dear <strong>Alex Turner</strong>,
                  </p>
                  <p className="mt-2">
                    We are pleased to confirm your admission into the <strong>Four-Year Bachelor of Technology (B.Tech) program in Computer Science & Engineering</strong> for the academic cycle 2024 - 2028 under Enrolment ID <strong>STU-2026-CCF9BC</strong>.
                  </p>
                  <div className="mt-6 pt-4 flex justify-between items-end border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono">Ref: AIT/ADM/2024-08/42</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">Director of Admissions</span>
                      <span className="text-[10px] text-slate-400">Apex Institute of Technology</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptDocument(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
