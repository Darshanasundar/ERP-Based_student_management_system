import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  BookOpen,
  Filter,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  Mail,
  ShieldCheck,
  Check,
  X,
  Zap,
  Calendar,
  Download,
  Plus,
  PlusCircle,
  Edit3,
  Trash2,
  Award,
  UserCheck,
  Briefcase,
  FileSpreadsheet,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  CreditCard,
  Printer,
  Sparkles,
  Phone,
} from 'lucide-react';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================
  // 1. STUDENTS ROSTER STATE & CRUD
  // ==========================================
  const initialStudentRoster = [
    {
      id: '0937df8b-2b8f-49a7-bfee-84eace226eec',
      rollNo: 'STU-2026-CCF9BC',
      name: 'Alex Turner',
      email: 'alex.turner@erp.com',
      department: 'Computer Science & Engineering',
      semester: 'Sem 6',
      year: '3rd Year (Sem 6)',
      cgpa: '9.15',
      riskStatus: 'Low Risk',
      riskScore: 0.12,
      riskReason: 'Excellent academic standing & 94% overall attendance',
      status: 'Active',
      isLive: true,
    },
    {
      id: 'stu-101',
      rollNo: 'AIT-2024-CS101',
      name: 'Aarav Sharma',
      email: 'aarav.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      semester: 'Sem 6',
      year: '3rd Year (Sem 6)',
      cgpa: '8.85',
      riskStatus: 'Low Risk',
      riskScore: 0.14,
      riskReason: 'Consistent performance in continuous internal assessments',
      status: 'Active',
      isLive: false,
    },
    {
      id: 'stu-102',
      rollNo: 'AIT-2024-AI102',
      name: 'Bhavya Patel',
      email: 'bhavya.ai24@apextech.ac.in',
      department: 'Artificial Intelligence & Data Science',
      semester: 'Sem 4',
      year: '2nd Year (Sem 4)',
      cgpa: '6.40',
      riskStatus: 'High Risk',
      riskScore: 0.84,
      riskReason: 'Critical: Low attendance (62%) and multiple internal assessment scores below 45%',
      status: 'Active',
      isLive: false,
    },
    {
      id: 'stu-103',
      rollNo: 'AIT-2024-EC103',
      name: 'Chetan Verma',
      email: 'chetan.ec24@apextech.ac.in',
      department: 'Electronics & Communication',
      semester: 'Sem 6',
      year: '3rd Year (Sem 6)',
      cgpa: '7.25',
      riskStatus: 'Medium Risk',
      riskScore: 0.58,
      riskReason: 'Borderline attendance (74%) in Digital Signal Processing & lab backlogs',
      status: 'Active',
      isLive: false,
    },
    {
      id: 'stu-104',
      rollNo: 'AIT-2024-IT104',
      name: 'Divya Sundaram',
      email: 'divya.it24@apextech.ac.in',
      department: 'Information Technology',
      semester: 'Sem 8',
      year: '4th Year (Sem 8)',
      cgpa: '9.42',
      riskStatus: 'Low Risk',
      riskScore: 0.08,
      riskReason: 'Top percentile candidate with 96% attendance',
      status: 'Graduating',
      isLive: false,
    },
    {
      id: 'stu-105',
      rollNo: 'AIT-2024-ME105',
      name: 'Eashwar Pillai',
      email: 'eashwar.me24@apextech.ac.in',
      department: 'Mechanical Engineering',
      semester: 'Sem 2',
      year: '1st Year (Sem 2)',
      cgpa: '7.10',
      riskStatus: 'Medium Risk',
      riskScore: 0.52,
      riskReason: 'Declining test scores in Engineering Mechanics & Calculus',
      status: 'Active',
      isLive: false,
    },
    {
      id: 'stu-106',
      rollNo: 'AIT-2024-CS108',
      name: 'Vikramaditya Rathore',
      email: 'vikram.cs24@apextech.ac.in',
      department: 'Computer Science & Engineering',
      semester: 'Sem 6',
      year: '3rd Year (Sem 6)',
      cgpa: '9.35',
      riskStatus: 'Low Risk',
      riskScore: 0.10,
      riskReason: 'Satisfactory standing across all core subjects',
      status: 'Active',
      isLive: false,
    },
  ];

  const [studentList, setStudentList] = useState(initialStudentRoster);
  const [studentFilterDept, setStudentFilterDept] = useState('ALL');
  const [studentFilterSemester, setStudentFilterSemester] = useState('ALL');
  const [studentFilterRisk, setStudentFilterRisk] = useState('ALL');
  const [studentFilterStatus, setStudentFilterStatus] = useState('ALL');

  // Student Modals & Counseling Referral State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [interventionActionType, setInterventionActionType] = useState('ACADEMIC_MENTOR');

  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: 'Sem 1',
    year: '1st Year (Sem 1)',
    cgpa: '8.50',
    riskStatus: 'Low Risk',
    status: 'Active',
    rollNo: '',
  });

  // ==========================================
  // 2. FACULTY DIRECTORY STATE & CRUD
  // ==========================================
  const initialFacultyMembers = [
    {
      id: 1,
      name: 'Dr. Subramanian Ramanujan',
      email: 'faculty@erp.com',
      department: 'Computer Science & Engineering',
      designation: 'Professor & Academic Head',
      courses: 'Data Structures (CS301), Algorithm Design',
      cabin: 'CS-402, Ramanujan Academic Block',
      status: 'Active',
      isLive: true,
    },
    {
      id: 2,
      name: 'Dr. Anandhi Murugesan',
      email: 'anandhi.m@apextech.ac.in',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      courses: 'Database Systems (CS302), Cloud Computing',
      cabin: 'CS-408, Ramanujan Academic Block',
      status: 'Active',
      isLive: false,
    },
    {
      id: 3,
      name: 'Prof. Rajesh Kothari',
      email: 'rajesh.k@apextech.ac.in',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Assistant Professor',
      courses: 'Deep Learning, NLP & LLMs',
      cabin: 'AI-201, Turing Innovation Hub',
      status: 'Active',
      isLive: false,
    },
    {
      id: 4,
      name: 'Dr. Meenakshi Venkat',
      email: 'meenakshi.v@apextech.ac.in',
      department: 'Electronics & Communication',
      designation: 'Professor',
      courses: 'Digital Signal Processing, VLSI Design',
      cabin: 'EC-305, Bose Electronics Center',
      status: 'Active',
      isLive: false,
    },
    {
      id: 5,
      name: 'Prof. Suresh Kumar',
      email: 'suresh.k@apextech.ac.in',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      courses: 'Computer Networks, Cyber Security',
      cabin: 'IT-102, Shannon Block',
      status: 'Active',
      isLive: false,
    },
    {
      id: 6,
      name: 'Dr. Kavitha Balan',
      email: 'kavitha.b@apextech.ac.in',
      department: 'Mechanical Engineering',
      designation: 'Associate Professor',
      courses: 'Thermodynamics, CAD/CAM Systems',
      cabin: 'ME-204, Visvesvaraya Block',
      status: 'Active',
      isLive: false,
    },
  ];

  const [facultyList, setFacultyList] = useState(initialFacultyMembers);
  const [facultyFilterDept, setFacultyFilterDept] = useState('ALL');

  // Faculty Modals
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    courses: '',
    cabin: '',
    status: 'Active',
  });

  // ==========================================
  // 3. FEE MANAGEMENT & INVOICES STATE
  // ==========================================
  const initialFinanceInvoices = [
    {
      id: 'INV-2026-001',
      student: 'Alex Turner',
      rollNo: 'STU-2026-CCF9BC',
      semester: 'Semester 6',
      amount: '₹65,000',
      paid: '₹65,000',
      status: 'PAID',
      date: '2026-08-15',
    },
    {
      id: 'INV-2026-002',
      student: 'Aarav Sharma',
      rollNo: 'AIT-2024-CS101',
      semester: 'Semester 6',
      amount: '₹65,000',
      paid: '₹65,000',
      status: 'PAID',
      date: '2026-08-14',
    },
    {
      id: 'INV-2026-003',
      student: 'Bhavya Patel',
      rollNo: 'AIT-2024-AI102',
      semester: 'Semester 4',
      amount: '₹60,000',
      paid: '₹30,000',
      status: 'PARTIAL',
      date: '2026-08-20',
    },
    {
      id: 'INV-2026-004',
      student: 'Chetan Verma',
      rollNo: 'AIT-2024-EC103',
      semester: 'Semester 6',
      amount: '₹65,000',
      paid: '₹0',
      status: 'PENDING',
      date: '2026-08-28',
    },
  ];

  const [invoicesList, setInvoicesList] = useState(initialFinanceInvoices);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    studentId: '0937df8b-2b8f-49a7-bfee-84eace226eec',
    invoiceId: 'INV-2026-005',
    category: 'Semester Tuition & Academic Fee',
    amount: '65000',
    semester: 'Semester 6 (Spring 2026)',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  // ==========================================
  // 4. ADMISSIONS & ENROLLMENT WORKFLOW STATE
  // ==========================================
  const initialAdmissionsQueue = [
    {
      id: 'APP-2026-091',
      name: 'Karthik Sundar',
      email: 'karthik.sundar@gmail.com',
      phone: '+91 98401 23456',
      department: 'Computer Science & Engineering',
      deptCode: 'CS',
      dob: '2005-04-12',
      gender: 'Male',
      score: '96.4% (TNEA Rank #342)',
      docs: { ssc: true, hsc: true, tc: true, idProof: true },
      docStatus: 'VERIFIED',
      enrollmentStatus: 'READY_FOR_ENROLLMENT',
      rollNo: null,
    },
    {
      id: 'APP-2026-092',
      name: 'Meera Krishnan',
      email: 'meera.krishnan@gmail.com',
      phone: '+91 94432 78901',
      department: 'Artificial Intelligence & Data Science',
      deptCode: 'AI',
      dob: '2005-08-19',
      gender: 'Female',
      score: '93.8% (TNEA Rank #612)',
      docs: { ssc: true, hsc: true, tc: true, idProof: false },
      docStatus: 'PENDING_DOCS',
      enrollmentStatus: 'UNDER_REVIEW',
      rollNo: null,
    },
    {
      id: 'APP-2026-093',
      name: 'Rohan Nambiar',
      email: 'rohan.nambiar@gmail.com',
      phone: '+91 97890 45678',
      department: 'Electronics & Communication',
      deptCode: 'EC',
      dob: '2005-02-28',
      gender: 'Male',
      score: '89.5% (TNEA Rank #1140)',
      docs: { ssc: true, hsc: true, tc: true, idProof: true },
      docStatus: 'VERIFIED',
      enrollmentStatus: 'READY_FOR_ENROLLMENT',
      rollNo: null,
    },
    {
      id: 'APP-2026-094',
      name: 'Sanjana Reddy',
      email: 'sanjana.reddy@gmail.com',
      phone: '+91 98840 98765',
      department: 'Information Technology',
      deptCode: 'IT',
      dob: '2005-11-04',
      gender: 'Female',
      score: '97.2% (TNEA Rank #180)',
      docs: { ssc: true, hsc: true, tc: true, idProof: true },
      docStatus: 'VERIFIED',
      enrollmentStatus: 'ENROLLED',
      rollNo: 'AIT-2026-IT105',
    },
  ];

  const [admissionsQueue, setAdmissionsQueue] = useState(initialAdmissionsQueue);
  const [showNewIntakeModal, setShowNewIntakeModal] = useState(false);
  const [intakeFormData, setIntakeFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    deptCode: 'CS',
    dob: '2005-06-15',
    gender: 'Male',
    score: '92.5%',
    ssc: true,
    hsc: true,
    tc: true,
    idProof: true,
  });

  // ==========================================
  // 5. COURSE & DEPARTMENT MANAGEMENT STATE
  // ==========================================
  const initialDepartments = [
    { id: 'dept-1', name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Subramanian Ramanujan', facultyCount: 24, studentCount: 420, maxCredits: 26 },
    { id: 'dept-2', name: 'Artificial Intelligence & Data Science', code: 'AIDS', hod: 'Dr. Rajesh Kothari', facultyCount: 16, studentCount: 280, maxCredits: 26 },
    { id: 'dept-3', name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Meenakshi Venkat', facultyCount: 18, studentCount: 310, maxCredits: 26 },
    { id: 'dept-4', name: 'Information Technology', code: 'IT', hod: 'Prof. Suresh Kumar', facultyCount: 14, studentCount: 240, maxCredits: 26 },
    { id: 'dept-5', name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Kavitha Balan', facultyCount: 15, studentCount: 220, maxCredits: 25 },
    { id: 'dept-6', name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. R. Sengottuvel', facultyCount: 11, studentCount: 160, maxCredits: 25 },
    { id: 'dept-7', name: 'Electrical & Electronics', code: 'EEE', hod: 'Dr. P. Sundaram', facultyCount: 12, studentCount: 180, maxCredits: 25 },
    { id: 'dept-8', name: 'Biomedical Engineering', code: 'BME', hod: 'Dr. Deepa Chandran', facultyCount: 10, studentCount: 140, maxCredits: 25 },
  ];

  const initialCourses = [
    { id: 'c-1', code: 'CS301', name: 'Data Structures & Algorithms', dept: 'Computer Science & Engineering', credits: 4, semester: 3, type: 'Core Theory', faculty: 'Dr. Subramanian Ramanujan', enrolled: 64 },
    { id: 'c-2', code: 'CS302', name: 'Introduction to Databases', dept: 'Computer Science & Engineering', credits: 3, semester: 4, type: 'Core Theory', faculty: 'Dr. Anandhi Murugesan', enrolled: 58 },
    { id: 'c-3', code: 'CS301P', name: 'Advanced Algorithms Laboratory', dept: 'Computer Science & Engineering', credits: 2, semester: 3, type: 'Practical Lab', faculty: 'Dr. Subramanian Ramanujan', enrolled: 64 },
    { id: 'c-4', code: 'AI201', name: 'Deep Learning & Neural Architectures', dept: 'Artificial Intelligence & Data Science', credits: 4, semester: 4, type: 'Core Theory', faculty: 'Prof. Rajesh Kothari', enrolled: 62 },
    { id: 'c-5', code: 'EC301', name: 'Digital Signal Processing & Architectures', dept: 'Electronics & Communication', credits: 4, semester: 5, type: 'Core Theory', faculty: 'Dr. Meenakshi Venkat', enrolled: 55 },
    { id: 'c-6', code: 'IT401', name: 'Cloud Infrastructure & DevOps Engineering', dept: 'Information Technology', credits: 3, semester: 6, type: 'Professional Elective', faculty: 'Prof. Suresh Kumar', enrolled: 48 },
  ];

  const [departmentsList, setDepartmentsList] = useState(initialDepartments);
  const [coursesList, setCoursesList] = useState(initialCourses);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    code: '',
    name: '',
    dept: 'Computer Science & Engineering',
    credits: 4,
    semester: 3,
    type: 'Core Theory',
    faculty: 'Dr. Subramanian Ramanujan',
  });
  const [mappingCourse, setMappingCourse] = useState(null);
  const [selectedFacultyForMap, setSelectedFacultyForMap] = useState('Dr. Subramanian Ramanujan');

  // ==========================================
  // 6. EXAMINATION ADMINISTRATION STATE
  // ==========================================
  const initialExams = [
    { id: 'ex-1', title: 'Spring 2026 End-Semester Theory Examination', courseCode: 'CS301', courseName: 'Data Structures & Algorithms', date: '2026-11-12', session: 'Morning (09:30 AM - 12:30 PM)', hall: 'Exam Hall 1, Main Block', chiefInvigilator: 'Dr. Subramanian Ramanujan', maxMarks: 100 },
    { id: 'ex-2', title: 'Spring 2026 End-Semester Theory Examination', courseCode: 'CS302', courseName: 'Introduction to Databases', date: '2026-11-14', session: 'Morning (09:30 AM - 12:30 PM)', hall: 'Exam Hall 2, Main Block', chiefInvigilator: 'Dr. Anandhi Murugesan', maxMarks: 100 },
    { id: 'ex-3', title: 'End-Semester Practical Evaluation', courseCode: 'CS301P', courseName: 'Advanced Algorithms Lab', date: '2026-11-17', session: 'Afternoon (01:30 PM - 04:30 PM)', hall: 'Systems Computing Lab 3', chiefInvigilator: 'Dr. Subramanian Ramanujan', maxMarks: 100 },
    { id: 'ex-4', title: 'Spring 2026 End-Semester Theory Examination', courseCode: 'AI201', courseName: 'Deep Learning Foundations', date: '2026-11-19', session: 'Morning (09:30 AM - 12:30 PM)', hall: 'Turing Auditorium A', chiefInvigilator: 'Prof. Rajesh Kothari', maxMarks: 100 },
  ];

  const initialGradingScales = [
    { grade: 'O', label: 'Outstanding', min: 90, max: 100, points: 10, description: 'Exemplary mastery of curriculum competencies' },
    { grade: 'A+', label: 'Excellent', min: 80, max: 89, points: 9, description: 'High distinction in subject matter' },
    { grade: 'A', label: 'Very Good', min: 70, max: 79, points: 8, description: 'Commendable conceptual understanding' },
    { grade: 'B+', label: 'Good', min: 60, max: 69, points: 7, description: 'Above average performance' },
    { grade: 'B', label: 'Average', min: 55, max: 59, points: 6, description: 'Meets benchmark passing criteria' },
    { grade: 'C', label: 'Satisfactory', min: 50, max: 54, points: 5, description: 'Minimum passing grade' },
    { grade: 'RA', label: 'Re-Appear', min: 0, max: 49, points: 0, description: 'Below minimum passing threshold' },
  ];

  const [examSchedules, setExamSchedules] = useState(initialExams);
  const [gradingScales, setGradingScales] = useState(initialGradingScales);
  const [resultsPublished, setResultsPublished] = useState(true);
  const [showScheduleExamModal, setShowScheduleExamModal] = useState(false);
  const [examFormData, setExamFormData] = useState({
    title: 'Spring 2026 End-Semester Theory Examination',
    courseCode: 'CS303',
    courseName: 'Computer Networks & Security',
    date: '2026-11-22',
    session: 'Morning (09:30 AM - 12:30 PM)',
    hall: 'Exam Hall 3, Bose Block',
    chiefInvigilator: 'Prof. Suresh Kumar',
    maxMarks: 100,
  });

  // ==========================================
  // 7. HR, LEAVES & PAYROLL MANAGEMENT STATE
  // ==========================================
  const [hrSubTab, setHrSubTab] = useState('leaves'); // 'leaves' | 'attendance' | 'payroll'
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  const initialFacultyAttendance = [
    { id: 'att-1', name: 'Dr. Subramanian Ramanujan', dept: 'Computer Science', clockIn: '08:32 AM', clockOut: '04:45 PM', scanner: 'Bio-Reader #01 (Academic Block)', status: 'PRESENT' },
    { id: 'att-2', name: 'Dr. Anandhi Murugesan', dept: 'Computer Science', clockIn: '08:45 AM', clockOut: '04:50 PM', scanner: 'Bio-Reader #01 (Academic Block)', status: 'PRESENT' },
    { id: 'att-3', name: 'Prof. Rajesh Kothari', dept: 'AI & Data Science', clockIn: '09:12 AM', clockOut: '--:--', scanner: 'Bio-Reader #02 (Turing Hub)', status: 'LATE_ARRIVAL' },
    { id: 'att-4', name: 'Dr. Meenakshi Venkat', dept: 'Electronics & Comm.', clockIn: '--:--', clockOut: '--:--', scanner: 'University External Duty', status: 'ON_DUTY' },
    { id: 'att-5', name: 'Prof. Suresh Kumar', dept: 'Information Technology', clockIn: '08:40 AM', clockOut: '04:30 PM', scanner: 'Bio-Reader #03 (Shannon Block)', status: 'PRESENT' },
    { id: 'att-6', name: 'Dr. Kavitha Balan', dept: 'Mechanical Engineering', clockIn: '--:--', clockOut: '--:--', scanner: 'Sanctioned Casual Leave', status: 'ON_LEAVE' },
  ];

  const [staffAttendanceList, setStaffAttendanceList] = useState(initialFacultyAttendance);

  const initialPayrollRecords = [
    { id: 'pay-1', name: 'Dr. Subramanian Ramanujan', designation: 'Professor & Head', dept: 'CSE', basic: 145000, hra: 34800, allowances: 22000, deductions: 18500, net: 183300, status: 'DISBURSED', date: '01 Oct 2026' },
    { id: 'pay-2', name: 'Dr. Anandhi Murugesan', designation: 'Associate Professor', dept: 'CSE', basic: 115000, hra: 27600, allowances: 18000, deductions: 14200, net: 146400, status: 'DISBURSED', date: '01 Oct 2026' },
    { id: 'pay-3', name: 'Prof. Rajesh Kothari', designation: 'Assistant Professor', dept: 'AIDS', basic: 85000, hra: 20400, allowances: 14000, deductions: 11000, net: 108400, status: 'DISBURSED', date: '01 Oct 2026' },
    { id: 'pay-4', name: 'Dr. Meenakshi Venkat', designation: 'Professor', dept: 'ECE', basic: 135000, hra: 32400, allowances: 20000, deductions: 17000, net: 170400, status: 'DISBURSED', date: '01 Oct 2026' },
    { id: 'pay-5', name: 'Prof. Suresh Kumar', designation: 'Assistant Professor', dept: 'IT', basic: 82000, hra: 19680, allowances: 13500, deductions: 10500, net: 104680, status: 'DISBURSED', date: '01 Oct 2026' },
    { id: 'pay-6', name: 'Dr. Kavitha Balan', designation: 'Associate Professor', dept: 'MECH', basic: 112000, hra: 26880, allowances: 17500, deductions: 13800, net: 142580, status: 'DISBURSED', date: '01 Oct 2026' },
  ];

  const [payrollRecords, setPayrollRecords] = useState(initialPayrollRecords);
  const [payrollDisbursed, setPayrollDisbursed] = useState(true);

  // ==========================================
  // RECENT ACTIVITIES AUDIT TRAIL
  // ==========================================
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'Student Enrolled', details: 'Sanjana Reddy (AIT-2026-IT105)', actor: 'Admissions Office', role: 'SUPER_ADMIN', time: '10 mins ago', status: 'SUCCESS' },
    { id: 2, action: 'Fee Invoice Generated', details: '₹65,000 for Alex Turner (INV-2026-001)', actor: 'Finance Gateway', role: 'FINANCE', time: '34 mins ago', status: 'PAID' },
    { id: 3, action: 'Course Registered', details: 'Introduction to Databases (3 Credits)', actor: 'HOD Computer Science', role: 'FACULTY', time: '2 hours ago', status: 'ACTIVE' },
    { id: 4, action: 'Exam Timetable Published', details: 'Spring 2026 End-Semester Examinations (CS301/CS302)', actor: 'Controller of Examinations', role: 'EXAM_CELL', time: '3 hours ago', status: 'PUBLISHED' },
  ]);

  // ==========================================
  // INITIAL FETCH & BACKEND SYNC
  // ==========================================
  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await api.get('/leaves');
      if (res.data?.leaves) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      console.warn('Could not fetch leaves in admin portal:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const fetchBackendInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      if (res.data?.invoices && res.data.invoices.length > 0) {
        // Map backend invoices to table format
        const mapped = res.data.invoices.map((inv, idx) => ({
          id: `INV-2026-${String(idx + 1).padStart(3, '0')}`,
          backendId: inv.id,
          student: inv.enrollmentNumber === 'STU-2026-CCF9BC' ? 'Alex Turner' : inv.studentEmail.split('@')[0],
          rollNo: inv.enrollmentNumber,
          semester: 'Semester 6',
          amount: `₹${Number(inv.amount).toLocaleString()}`,
          paid: `₹${Number(inv.totalPaid).toLocaleString()}`,
          status: inv.status,
          date: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '2026-11-15',
        }));
        // Merge with initial invoices
        setInvoicesList(mapped);
      }
    } catch (err) {
      console.warn('Could not load backend invoices:', err);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/students');
        if (res.data?.students && res.data.students.length > 0) {
          // If backend has students, merge them with studentList
        }
      } catch (err) {
        console.warn('Could not load live student stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchLeaves();
    fetchBackendInvoices();
  }, []);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Helper for CSV export
  const exportToCSV = (filename, data, headers, columnKeys) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = (columnKeys || headers).map((key) => {
        const val = row[key] !== undefined && row[key] !== null ? row[key] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setToastMessage(`✓ Exported ${filename} successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // STUDENT CRUD HANDLERS
  // ==========================================
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (editingStudent) {
      setStudentList((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...studentFormData } : s))
      );
      setToastMessage(`✓ Updated student record for ${studentFormData.name}!`);
      setEditingStudent(null);
    } else {
      const roll = studentFormData.rollNo || `AIT-2024-CS${Math.floor(106 + Math.random() * 800)}`;
      const newStudent = {
        id: `stu-${Date.now()}`,
        ...studentFormData,
        rollNo: roll,
        isLive: false,
      };
      setStudentList([newStudent, ...studentList]);
      setToastMessage(`✓ Student ${newStudent.name} (${roll}) added to roster!`);
      setShowAddStudentModal(false);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteStudent = (id, name) => {
    if (window.confirm(`Are you sure you want to archive student ${name}?`)) {
      setStudentList((prev) => prev.filter((s) => s.id !== id));
      setToastMessage(`✓ Student ${name} archived from active roster.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ==========================================
  // FACULTY CRUD HANDLERS
  // ==========================================
  const handleSaveFaculty = (e) => {
    e.preventDefault();
    if (editingFaculty) {
      setFacultyList((prev) =>
        prev.map((f) => (f.id === editingFaculty.id ? { ...f, ...facultyFormData } : f))
      );
      setToastMessage(`✓ Updated faculty profile for ${facultyFormData.name}!`);
      setEditingFaculty(null);
    } else {
      const newFac = {
        id: Date.now(),
        ...facultyFormData,
        isLive: false,
      };
      setFacultyList([...facultyList, newFac]);
      setToastMessage(`✓ Faculty member ${newFac.name} added to directory!`);
      setShowAddFacultyModal(false);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteFaculty = (id, name) => {
    if (window.confirm(`Are you sure you want to remove faculty member ${name}?`)) {
      setFacultyList((prev) => prev.filter((f) => f.id !== id));
      setToastMessage(`✓ Faculty member ${name} removed from active directory.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ==========================================
  // INVOICE CREATION HANDLER
  // ==========================================
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSavingInvoice(true);
    try {
      const student = studentList.find((s) => s.id === invoiceFormData.studentId) || studentList[0];

      // If database connected student, call backend POST /api/invoices
      if (student.isLive || student.id === '0937df8b-2b8f-49a7-bfee-84eace226eec') {
        try {
          await api.post('/invoices', {
            student_id: student.id,
            amount: parseFloat(invoiceFormData.amount),
            due_date: invoiceFormData.dueDate,
          });
        } catch (apiErr) {
          console.warn('Backend invoice creation notice:', apiErr);
        }
      }

      const newInv = {
        id: invoiceFormData.invoiceId,
        student: student.name,
        rollNo: student.rollNo,
        semester: invoiceFormData.semester,
        amount: `₹${Number(invoiceFormData.amount).toLocaleString()}`,
        paid: '₹0',
        status: 'PENDING',
        date: invoiceFormData.dueDate,
      };

      setInvoicesList([newInv, ...invoicesList]);
      setShowCreateInvoiceModal(false);
      setToastMessage(`✓ Fee Invoice ${newInv.id} for ${student.name} generated successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Invoice creation error:', err);
      setToastMessage(`Error generating invoice: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleUpdateInvoiceStatus = (invId, newStatus) => {
    setInvoicesList((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: newStatus,
              paid: newStatus === 'PAID' ? inv.amount : newStatus === 'PENDING' ? '₹0' : inv.paid,
            }
          : inv
      )
    );
    setToastMessage(`✓ Invoice ${invId} marked as ${newStatus}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // ADMISSIONS INTAKE & ENROLLMENT HANDLERS
  // ==========================================
  const handleSaveIntakeApplicant = (e) => {
    e.preventDefault();
    const newApp = {
      id: `APP-2026-0${admissionsQueue.length + 90}`,
      name: intakeFormData.name,
      email: intakeFormData.email,
      phone: intakeFormData.phone,
      department: intakeFormData.department,
      deptCode: intakeFormData.deptCode,
      dob: intakeFormData.dob,
      gender: intakeFormData.gender,
      score: intakeFormData.score,
      docs: {
        ssc: intakeFormData.ssc,
        hsc: intakeFormData.hsc,
        tc: intakeFormData.tc,
        idProof: intakeFormData.idProof,
      },
      docStatus: intakeFormData.ssc && intakeFormData.hsc && intakeFormData.tc && intakeFormData.idProof ? 'VERIFIED' : 'PENDING_DOCS',
      enrollmentStatus: intakeFormData.ssc && intakeFormData.hsc && intakeFormData.tc && intakeFormData.idProof ? 'READY_FOR_ENROLLMENT' : 'UNDER_REVIEW',
      rollNo: null,
    };

    setAdmissionsQueue([newApp, ...admissionsQueue]);
    setShowNewIntakeModal(false);
    setToastMessage(`✓ Applicant ${newApp.name} (${newApp.id}) added to Admissions Intake Queue!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveAndEnrollApplicant = (applicant) => {
    const deptCode = applicant.deptCode || 'CS';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedRoll = `AIT-2026-${deptCode}${randomSuffix}`;

    // Update applicant in queue
    setAdmissionsQueue((prev) =>
      prev.map((a) =>
        a.id === applicant.id ? { ...a, enrollmentStatus: 'ENROLLED', rollNo: generatedRoll } : a
      )
    );

    // Add into active student roster!
    const newStudent = {
      id: `stu-enrolled-${Date.now()}`,
      rollNo: generatedRoll,
      name: applicant.name,
      email: applicant.email,
      department: applicant.department,
      year: '1st Year (Sem 1)',
      cgpa: 'N/A (New Intake)',
      status: 'Active',
      isLive: false,
    };

    setStudentList([newStudent, ...studentList]);
    setToastMessage(`✓ Officially Enrolled ${applicant.name}! Roll No ${generatedRoll} assigned & synced to Students Roster.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ==========================================
  // COURSES & CURRICULUM HANDLERS
  // ==========================================
  const handleAddCourse = (e) => {
    e.preventDefault();
    const newCourse = {
      id: `c-${Date.now()}`,
      ...courseFormData,
      enrolled: 60,
    };
    setCoursesList([...coursesList, newCourse]);
    setShowAddCourseModal(false);
    setToastMessage(`✓ Course ${newCourse.code} (${newCourse.name}) added to academic curriculum!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveMapProfessor = () => {
    if (!mappingCourse) return;
    setCoursesList((prev) =>
      prev.map((c) => (c.id === mappingCourse.id ? { ...c, faculty: selectedFacultyForMap } : c))
    );
    setToastMessage(`✓ Course ${mappingCourse.code} successfully mapped to ${selectedFacultyForMap}!`);
    setMappingCourse(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ==========================================
  // EXAM ADMINISTRATION HANDLERS
  // ==========================================
  const handleScheduleExam = (e) => {
    e.preventDefault();
    const newExam = {
      id: `ex-${Date.now()}`,
      ...examFormData,
    };
    setExamSchedules([...examSchedules, newExam]);
    setShowScheduleExamModal(false);
    setToastMessage(`✓ Examination scheduled for ${newExam.courseCode} on ${newExam.date} (${newExam.session})!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTogglePublishResults = () => {
    const nextState = !resultsPublished;
    setResultsPublished(nextState);
    if (nextState) {
      setToastMessage('✓ Semester 6 Examination Results Officially Published to all Student Portals!');
      setRecentActivities([
        {
          id: Date.now(),
          action: 'Semester Results Published',
          details: 'Controller of Examinations published Spring 2026 results',
          actor: 'Office of Controller of Exams',
          role: 'ADMIN',
          time: 'Just now',
          status: 'PUBLISHED',
        },
        ...recentActivities,
      ]);
    } else {
      setToastMessage('Semester Results reverted to DRAFT mode (hidden from student portals).');
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ==========================================
  // HR LEAVE APPROVALS HANDLERS
  // ==========================================
  const handleUpdateLeaveStatus = async (leaveId, newStatus) => {
    setProcessingLeaveId(leaveId);
    try {
      const defaultRemarks =
        newStatus === 'APPROVED'
          ? 'Approved by Dean & Academic Registrar'
          : 'Disapproved due to essential scheduled teaching hours';

      await api.patch(`/leaves/${leaveId}/status`, {
        status: newStatus,
        admin_remarks: defaultRemarks,
      });

      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus, admin_remarks: defaultRemarks } : l))
      );

      setToastMessage(`✓ Leave application marked as ${newStatus}! Updated in live PostgreSQL database.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error updating leave status:', err);
      setToastMessage(`Failed to update leave status: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const handleDisbursePayroll = () => {
    setPayrollDisbursed(true);
    setPayrollRecords((prev) => prev.map((r) => ({ ...r, status: 'DISBURSED' })));
    setToastMessage('✓ Monthly Payroll Disbursed! Bank transaction reference TXN-HDFC-20261010-098 generated for 114 staff members.');
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered Students & Faculty
  const filteredStudents = studentList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = studentFilterDept === 'ALL' || s.department === studentFilterDept;
    const matchesSemester =
      studentFilterSemester === 'ALL' ||
      s.semester === studentFilterSemester ||
      (s.year && s.year.includes(studentFilterSemester));
    const matchesRisk = studentFilterRisk === 'ALL' || s.riskStatus === studentFilterRisk;
    const matchesStatus = studentFilterStatus === 'ALL' || s.status === studentFilterStatus;
    return matchesSearch && matchesDept && matchesSemester && matchesRisk && matchesStatus;
  });

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.courses.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = facultyFilterDept === 'ALL' || f.department === facultyFilterDept;
    return matchesSearch && matchesDept;
  });

  const totalStudentsCount = 1842 + studentList.length - initialStudentRoster.length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Institutional Administration • Apex Institute of Technology
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Authorized
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Executive Governance & Operations Console
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive institutional management: Admissions, Roster, Faculty, Examinations, Finance & HR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
              Academic Year: 2026 - 2027
            </span>
          </div>
        </div>

        {/* Tab Ribbon Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { key: 'overview', label: '1. Executive Overview', icon: Activity },
            { key: 'students', label: '2. Students Roster', icon: Users },
            { key: 'faculty', label: '3. Faculty Directory', icon: Building2 },
            { key: 'admissions', label: '4. Admissions & Intake', icon: UserCheck },
            { key: 'courses', label: '5. Courses & Curriculum', icon: BookOpen },
            { key: 'exams', label: '6. Examinations & Results', icon: Award },
            { key: 'finance', label: '7. Fee Management', icon: DollarSign },
            { key: 'hr', label: '8. HR, Leaves & Payroll', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.key || (tab.key === 'hr' && currentTab === 'leaves');
            const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.key === 'hr' && pendingLeavesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                    {pendingLeavesCount}
                  </span>
                )}
              </button>
            );
          })}
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

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* ========================================================================= */}
        {currentTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrolled Students</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{totalStudentsCount.toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +8.4%
                  </span>
                  <span>across 8 engineering programs</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Faculty & Staff</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">114</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                  </span>
                  <span>UGC Staffing Ratio Compliant</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fee Collection Settlement</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      ₹4.85 <span className="text-lg font-bold text-slate-500">/ 5.20 Cr</span>
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '93.2%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>93.2% Collected</span>
                    <span className="text-emerald-600 font-semibold">₹35 Lakhs Pending</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Semester 6 Exam Status</p>
                    <h3 className="text-2xl font-black text-purple-900 mt-2">
                      {resultsPublished ? 'RESULTS LIVE' : 'DRAFT MODE'}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className={`inline-flex items-center font-semibold gap-1 ${resultsPublished ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> {resultsPublished ? 'Visible on Student Portals' : 'Under Committee Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Fast Operational Workflows</span>
                <h3 className="text-xl font-extrabold mt-1">Institutional Quick Launch</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Quickly enroll applicants, issue tuition fee invoices, map professors to courses, or schedule end-semester evaluations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('admissions');
                    setShowNewIntakeModal(true);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>New Student Intake</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('finance');
                    setShowCreateInvoiceModal(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Generate Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('courses');
                    setShowAddCourseModal(true);
                  }}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>
            </div>

            {/* Audit Activity Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    System Overview & Administrative Audit Activity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time operational events across Admissions, Courses, Fees, and HR.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Activity</th>
                      <th scope="col" className="px-6 py-3.5">Target Record / Details</th>
                      <th scope="col" className="px-6 py-3.5">Initiated By</th>
                      <th scope="col" className="px-6 py-3.5">Time</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{act.action}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{act.details}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700">{act.actor}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{act.time}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENTS ROSTER WITH AI RISK VISIBILITY & ADVANCED FILTERS */}
        {/* ========================================================================= */}
        {currentTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            {/* Macro Executive AI Academic Risk Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setStudentFilterRisk('ALL')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studentFilterRisk === 'ALL'
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institution AI Monitored</span>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{studentList.length}</span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    100% Monitored
                  </span>
                </div>
              </div>

              <div
                onClick={() => setStudentFilterRisk(studentFilterRisk === 'High Risk' ? 'ALL' : 'High Risk')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studentFilterRisk === 'High Risk'
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-rose-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    High Risk (Critical Intervention)
                  </span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-rose-700">
                    {studentList.filter((s) => s.riskStatus === 'High Risk').length}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                    Urgent Counseling
                  </span>
                </div>
              </div>

              <div
                onClick={() => setStudentFilterRisk(studentFilterRisk === 'Medium Risk' ? 'ALL' : 'Medium Risk')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studentFilterRisk === 'Medium Risk'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Medium Risk (Academic Advisory)
                  </span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-700">
                    {studentList.filter((s) => s.riskStatus === 'Medium Risk').length}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Remedial Support
                  </span>
                </div>
              </div>

              <div
                onClick={() => setStudentFilterRisk(studentFilterRisk === 'Low Risk' ? 'ALL' : 'Low Risk')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studentFilterRisk === 'Low Risk'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Low Risk (Satisfactory Standing)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-700">
                    {studentList.filter((s) => s.riskStatus === 'Low Risk').length}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    On Track
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    Enrolled Students Directory & AI Academic Risk Monitor
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Institution-wide student roster with live AI predictive risk scoring for proactive counseling and intervention.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      exportToCSV(
                        'students_roster.csv',
                        studentList,
                        ['Roll No', 'Name', 'Email', 'Department', 'Semester', 'Year', 'CGPA', 'AI Risk Status', 'Status'],
                        ['rollNo', 'name', 'email', 'department', 'semester', 'year', 'cgpa', 'riskStatus', 'status']
                      )
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudentFormData({
                        name: '',
                        email: '',
                        department: 'Computer Science & Engineering',
                        semester: 'Sem 1',
                        year: '1st Year (Sem 1)',
                        cgpa: '8.50',
                        riskStatus: 'Low Risk',
                        status: 'Active',
                        rollNo: `AIT-2024-CS${Math.floor(106 + Math.random() * 800)}`,
                      });
                      setShowAddStudentModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar with Department, Semester, AI Risk and Status Dropdowns */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name, roll number, or email..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Department Filter */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <Filter className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-slate-500 font-medium">Dept:</span>
                    <select
                      value={studentFilterDept}
                      onChange={(e) => setStudentFilterDept(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Departments</option>
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Artificial Intelligence & Data Science">AI&DS</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Information Technology">IT</option>
                      <option value="Mechanical Engineering">MECH</option>
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-slate-500 font-medium">Semester:</span>
                    <select
                      value={studentFilterSemester}
                      onChange={(e) => setStudentFilterSemester(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Sem 1">Semester 1</option>
                      <option value="Sem 2">Semester 2</option>
                      <option value="Sem 3">Semester 3</option>
                      <option value="Sem 4">Semester 4</option>
                      <option value="Sem 5">Semester 5</option>
                      <option value="Sem 6">Semester 6</option>
                      <option value="Sem 7">Semester 7</option>
                      <option value="Sem 8">Semester 8</option>
                    </select>
                  </div>

                  {/* AI Risk Status Filter */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-slate-500 font-medium">AI Risk:</span>
                    <select
                      value={studentFilterRisk}
                      onChange={(e) => setStudentFilterRisk(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Risk Levels</option>
                      <option value="High Risk">High Risk (Red)</option>
                      <option value="Medium Risk">Medium Risk (Yellow)</option>
                      <option value="Low Risk">Low Risk (Green)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <select
                      value={studentFilterStatus}
                      onChange={(e) => setStudentFilterStatus(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Graduating">Graduating</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {(studentFilterDept !== 'ALL' || studentFilterSemester !== 'ALL' || studentFilterRisk !== 'ALL' || studentFilterStatus !== 'ALL' || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentFilterDept('ALL');
                        setStudentFilterSemester('ALL');
                        setStudentFilterRisk('ALL');
                        setStudentFilterStatus('ALL');
                        setSearchQuery('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 font-semibold transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Students Datagrid with AI Risk Status Column */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Student Information</th>
                      <th scope="col" className="px-6 py-3.5">Roll / Registration</th>
                      <th scope="col" className="px-6 py-3.5">Department</th>
                      <th scope="col" className="px-6 py-3.5">Semester & Term</th>
                      <th scope="col" className="px-6 py-3.5">CGPA</th>
                      <th scope="col" className="px-6 py-3.5">AI Risk Predictor</th>
                      <th scope="col" className="px-6 py-3.5">Standing</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                              {stu.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{stu.name}</span>
                                {stu.isLive && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    LIVE DB
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500">{stu.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                          {stu.rollNo}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {stu.department}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-700 font-semibold">
                          <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {stu.semester || stu.year.split('(')[1]?.replace(')', '') || 'Sem 6'}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-normal mt-0.5">{stu.year}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono font-extrabold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded">
                            {stu.cgpa}
                          </span>
                        </td>

                        {/* AI Risk Predictor Column (Red / Yellow / Green badges with pulse on High Risk) */}
                        <td className="px-6 py-4">
                          <div>
                            {stu.riskStatus === 'High Risk' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForIntervention(stu)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs group"
                                title="Click to trigger Academic Counseling & Intervention"
                              >
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                <span>High Risk</span>
                                <ChevronRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            ) : stu.riskStatus === 'Medium Risk' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForIntervention(stu)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs group"
                                title="Click to review Academic Advisory Diagnosis"
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>Medium Risk</span>
                                <ChevronRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>Low Risk</span>
                              </span>
                            )}
                            {stu.riskReason && (
                              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate" title={stu.riskReason}>
                                {stu.riskReason}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              stu.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : stu.status === 'Graduating'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {stu.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(stu.riskStatus === 'High Risk' || stu.riskStatus === 'Medium Risk') && (
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForIntervention(stu)}
                                className="px-2 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center gap-1"
                                title="Macro Counseling & Dean Intervention"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                <span>Counsel</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(stu);
                                setStudentFormData(stu);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Student Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(stu.id, stu.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Archive Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FACULTY DIRECTORY WITH ACTIONABLE CRUD & EXPORT */}
        {/* ========================================================================= */}
        {currentTab === 'faculty' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Teaching Faculty & Department Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Maintain staff records, manage academic designations, office allocations, and export faculty dockets.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      exportToCSV(
                        'faculty_directory.csv',
                        facultyList,
                        ['Name', 'Email', 'Department', 'Designation', 'Courses', 'Cabin', 'Status'],
                        ['name', 'email', 'department', 'designation', 'courses', 'cabin', 'status']
                      )
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFacultyFormData({
                        name: '',
                        email: '',
                        department: 'Computer Science & Engineering',
                        designation: 'Assistant Professor',
                        courses: '',
                        cabin: 'CS-405, Ramanujan Block',
                        status: 'Active',
                      });
                      setShowAddFacultyModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Faculty</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by faculty name, course, or department..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Department:</span>
                  <select
                    value={facultyFilterDept}
                    onChange={(e) => setFacultyFilterDept(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & Data Science">AI&DS</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Mechanical Engineering">MECH</option>
                  </select>
                </div>
              </div>

              {/* Faculty Datagrid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Faculty Member</th>
                      <th scope="col" className="px-6 py-3.5">Department</th>
                      <th scope="col" className="px-6 py-3.5">Designation</th>
                      <th scope="col" className="px-6 py-3.5">Assigned Courses</th>
                      <th scope="col" className="px-6 py-3.5">Office / Cabin</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFaculty.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs">
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{member.name}</span>
                                {member.isLive && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                    TEACHER PORTAL
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {member.department}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {member.designation}
                        </td>

                        <td className="px-6 py-4 text-xs text-indigo-700 font-medium">
                          {member.courses}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                          {member.cabin}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {member.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaculty(member);
                                setFacultyFormData(member);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Faculty Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFaculty(member.id, member.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Faculty Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ADMISSIONS & ENROLLMENT WORKFLOW */}
        {/* ========================================================================= */}
        {currentTab === 'admissions' && (
          <div className="space-y-6 animate-fade-in">
            {/* Admissions Summary Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Applications</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">142 Candidates</h3>
                <p className="text-xs text-slate-500 mt-1">Fall 2026 Intake Batch</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-emerald-600">Documents Verified</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">
                  {admissionsQueue.filter((a) => a.docStatus === 'VERIFIED').length} Ready
                </h3>
                <p className="text-xs text-slate-500 mt-1">10th, 12th & ID Validated</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-indigo-600">Enrolled & Roll Numbers Issued</p>
                <h3 className="text-2xl font-black text-indigo-700 mt-1">
                  {admissionsQueue.filter((a) => a.enrollmentStatus === 'ENROLLED').length} Students
                </h3>
                <p className="text-xs text-slate-500 mt-1">Integrated into Roster</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-semibold uppercase text-amber-600">Pending Intake Review</p>
                <h3 className="text-2xl font-black text-amber-700 mt-1">
                  {admissionsQueue.filter((a) => a.enrollmentStatus !== 'ENROLLED').length} Pending
                </h3>
                <p className="text-xs text-slate-500 mt-1">Awaiting admin sign-off</p>
              </div>
            </div>

            {/* Admissions Queue Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Admissions Intake Queue & Document Verification
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review demographic credentials, verify documents, and generate institutional roll numbers that populate the Enrolled Students Directory.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewIntakeModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Applicant Intake</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Candidate Details</th>
                      <th scope="col" className="px-6 py-3.5">Applied Program</th>
                      <th scope="col" className="px-6 py-3.5">Merit Score</th>
                      <th scope="col" className="px-6 py-3.5">Document Checklist</th>
                      <th scope="col" className="px-6 py-3.5">Enrolled Roll No</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Admissions Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissionsQueue.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-900">{app.name}</span>
                            <span className="text-[11px] font-mono text-indigo-600 block">{app.id}</span>
                            <span className="text-xs text-slate-500">{app.email} • {app.phone}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {app.department}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {app.score}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                            <span className={`px-2 py-0.5 rounded border ${app.docs.ssc ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              10th {app.docs.ssc ? '✓' : '✗'}
                            </span>
                            <span className={`px-2 py-0.5 rounded border ${app.docs.hsc ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              12th {app.docs.hsc ? '✓' : '✗'}
                            </span>
                            <span className={`px-2 py-0.5 rounded border ${app.docs.tc ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              TC {app.docs.tc ? '✓' : '✗'}
                            </span>
                            <span className={`px-2 py-0.5 rounded border ${app.docs.idProof ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              ID {app.docs.idProof ? '✓' : '✗'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {app.rollNo ? (
                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                              {app.rollNo}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-mono">Not Assigned</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {app.enrollmentStatus === 'ENROLLED' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApproveAndEnrollApplicant(app)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Enroll</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: COURSE & DEPARTMENT MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'courses' && (
          <div className="space-y-6 animate-fade-in">
            {/* Departments Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Engineering Departments & Semester Credit Limits
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Governs department heads, faculty quotas, and maximum student credit enrollments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departmentsList.map((dept) => (
                  <div key={dept.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {dept.code}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Max: {dept.maxCredits} Credits
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{dept.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">HOD: <span className="font-semibold text-slate-700">{dept.hod}</span></p>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>{dept.facultyCount} Faculty</span>
                      <span>{dept.studentCount} Students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses Table with Add & Map Professor */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Active Courses & Faculty Mapping
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure curriculum subjects, set credit weights, and assign teaching professors.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Course</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Course Code & Name</th>
                      <th scope="col" className="px-6 py-3.5">Department</th>
                      <th scope="col" className="px-6 py-3.5">Credits</th>
                      <th scope="col" className="px-6 py-3.5">Term</th>
                      <th scope="col" className="px-6 py-3.5">Type</th>
                      <th scope="col" className="px-6 py-3.5">Assigned Professor</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coursesList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mr-2">
                              {c.code}
                            </span>
                            <span className="font-bold text-slate-900">{c.name}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">{c.dept}</td>

                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">{c.credits} Credits</td>

                        <td className="px-6 py-4 text-xs text-slate-600">Semester {c.semester}</td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${c.type === 'Practical Lab' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {c.type}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs font-bold text-slate-900">
                          {c.faculty}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setMappingCourse(c);
                              setSelectedFacultyForMap(c.faculty);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          >
                            Map Professor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: EXAMINATION ADMINISTRATION */}
        {/* ========================================================================= */}
        {currentTab === 'exams' && (
          <div className="space-y-6 animate-fade-in">
            {/* Results Publication Banner */}
            <div className={`p-6 rounded-3xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${resultsPublished ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/70 border-amber-300'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${resultsPublished ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Semester 6 Finalized Examination Results Publication
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {resultsPublished
                      ? 'Status: PUBLISHED LIVE. Grades, SGPA, and cumulative marksheets are currently visible on all student dashboards.'
                      : 'Status: DRAFT MODE. Results are held in staging. Faculty marks entries are finalized but withheld from student portals.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTogglePublishResults}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${resultsPublished ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'}`}
              >
                {resultsPublished ? 'Unpublish Results (Revert to Draft)' : 'Publish Results to Portals'}
              </button>
            </div>

            {/* Exam Timetable Scheduler Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Institution-Wide Examination Timetable
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Schedule internal mid-terms, practical assessments, and end-semester examinations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowScheduleExamModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Examination</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Examination Event</th>
                      <th scope="col" className="px-6 py-3.5">Course / Subject</th>
                      <th scope="col" className="px-6 py-3.5">Date & Timing</th>
                      <th scope="col" className="px-6 py-3.5">Venue / Hall</th>
                      <th scope="col" className="px-6 py-3.5">Chief Invigilator</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examSchedules.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                          {ex.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mr-2">
                            {ex.courseCode}
                          </span>
                          <span className="text-xs font-medium text-slate-800">{ex.courseName}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {ex.date} <span className="block text-[11px] text-slate-500 font-normal">{ex.session}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-indigo-700 font-medium">{ex.hall}</td>
                        <td className="px-6 py-4 text-xs text-slate-700">{ex.chiefInvigilator}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-xs">{ex.maxMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UGC 10-Point Grading Scale Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Institutional UGC 10-Point Absolute Grading Rubric
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Governs grade point averages, semester GPA calculation, and minimum graduation thresholds.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Letter Grade</th>
                      <th scope="col" className="px-6 py-3.5">Performance Descriptor</th>
                      <th scope="col" className="px-6 py-3.5">Percentage Threshold</th>
                      <th scope="col" className="px-6 py-3.5">Grade Points</th>
                      <th scope="col" className="px-6 py-3.5">Rubric Standards</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {gradingScales.map((scale) => (
                      <tr key={scale.grade} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-black text-sm text-indigo-700 font-mono">{scale.grade}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">{scale.label}</td>
                        <td className="px-6 py-3.5 font-mono">{scale.min}% - {scale.max}%</td>
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{scale.points}</td>
                        <td className="px-6 py-3.5 text-slate-500">{scale.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: FEE MANAGEMENT WITH GENERATE INVOICE & EXPORT */}
        {/* ========================================================================= */}
        {currentTab === 'finance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Fee Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Billed</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">₹5.20 Cr</h3>
                <p className="text-xs text-slate-500 mt-2">Academic Year 2026-27 Invoices</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-emerald-600">Settled & Cleared</p>
                <h3 className="text-3xl font-black text-emerald-700 mt-2">₹4.85 Cr</h3>
                <p className="text-xs text-slate-500 mt-2">93.2% Total Settlement Rate</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-amber-600">Pending Receivables</p>
                <h3 className="text-3xl font-black text-amber-700 mt-2">₹35 Lakhs</h3>
                <p className="text-xs text-slate-500 mt-2">Due date within 15 days</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Fee Invoices & Settlement Ledger
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate fee invoices for students, track payment settlements, and export financial audit logs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      exportToCSV(
                        'fee_invoices_ledger.csv',
                        invoicesList,
                        ['Invoice ID', 'Student', 'Roll No', 'Semester', 'Amount', 'Paid', 'Status', 'Due Date'],
                        ['id', 'student', 'rollNo', 'semester', 'amount', 'paid', 'status', 'date']
                      )
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate New Invoice</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Invoice ID</th>
                      <th scope="col" className="px-6 py-3.5">Student</th>
                      <th scope="col" className="px-6 py-3.5">Term</th>
                      <th scope="col" className="px-6 py-3.5">Billed Amount</th>
                      <th scope="col" className="px-6 py-3.5">Amount Paid</th>
                      <th scope="col" className="px-6 py-3.5">Payment Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Quick Status Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoicesList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                          {inv.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{inv.student}</p>
                          <p className="text-xs text-slate-500 font-mono">{inv.rollNo}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {inv.semester}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {inv.amount}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {inv.paid}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : inv.status === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'PAID' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateInvoiceStatus(inv.id, 'PAID')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateInvoiceStatus(inv.id, 'PENDING')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                              >
                                Mark Pending
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: HR, LEAVES & PAYROLL CONSOLE */}
        {/* ========================================================================= */}
        {(currentTab === 'hr' || currentTab === 'leaves') && (
          <div className="space-y-6 animate-fade-in">
            {/* HR Sub-navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setHrSubTab('leaves')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  hrSubTab === 'leaves'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>1. Staff Leave Approvals</span>
                {leaves.filter((l) => l.status === 'PENDING').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                    {leaves.filter((l) => l.status === 'PENDING').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setHrSubTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  hrSubTab === 'attendance'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>2. Faculty Biometric Attendance</span>
              </button>

              <button
                type="button"
                onClick={() => setHrSubTab('payroll')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  hrSubTab === 'payroll'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>3. Staff Monthly Payroll & Salary</span>
              </button>
            </div>

            {/* HR SUB-TAB 1: LEAVE APPROVALS */}
            {hrSubTab === 'leaves' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">Total Applications</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{leaves.length}</h3>
                    <p className="text-xs text-slate-500 mt-2">Faculty HR Leave Dossier</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-amber-600">Pending Review</p>
                    <h3 className="text-3xl font-black text-amber-700 mt-2">
                      {leaves.filter((l) => l.status === 'PENDING').length}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Requires Dean / Admin sign-off</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-emerald-600">Approved Leaves</p>
                    <h3 className="text-3xl font-black text-emerald-700 mt-2">
                      {leaves.filter((l) => l.status === 'APPROVED').length}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Sanctioned for academic year</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-rose-600">Disapproved</p>
                    <h3 className="text-3xl font-black text-rose-700 mt-2">
                      {leaves.filter((l) => l.status === 'REJECTED').length}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Conflict with academic dockets</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        Faculty Leave Authorization Console
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sanction casual, medical, on-duty, and earned leaves submitted by teaching staff.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchLeaves}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-2"
                    >
                      <span>Refresh Queue</span>
                    </button>
                  </div>

                  {loadingLeaves ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading leave requests...</div>
                  ) : leaves.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No faculty leave applications found in the system.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                          <tr>
                            <th scope="col" className="px-6 py-3.5">Faculty Member</th>
                            <th scope="col" className="px-6 py-3.5">Leave Type</th>
                            <th scope="col" className="px-6 py-3.5">Dates / Span</th>
                            <th scope="col" className="px-6 py-3.5">Days</th>
                            <th scope="col" className="px-6 py-3.5">Stated Purpose</th>
                            <th scope="col" className="px-6 py-3.5">Status</th>
                            <th scope="col" className="px-6 py-3.5 text-right">Administrative Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaves.map((lv) => {
                            const isProcessing = processingLeaveId === lv.id;
                            return (
                              <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-900">{lv.faculty_name}</p>
                                  <p className="text-xs text-slate-500 font-mono">{lv.faculty_email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                    {lv.leave_type} LEAVE
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                  {new Date(lv.start_date).toLocaleDateString()} to {new Date(lv.end_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-900">
                                  {lv.days_count} {lv.days_count === 1 ? 'Day' : 'Days'}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                                  <p className="truncate">{lv.reason}</p>
                                  {lv.admin_remarks && (
                                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                                      Remarks: {lv.admin_remarks}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
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
                                <td className="px-6 py-4 text-right">
                                  {lv.status === 'PENDING' ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleUpdateLeaveStatus(lv.id, 'APPROVED')}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleUpdateLeaveStatus(lv.id, 'REJECTED')}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-xs flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-xs text-slate-400 font-medium mr-2">Decided</span>
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() =>
                                          handleUpdateLeaveStatus(
                                            lv.id,
                                            lv.status === 'APPROVED' ? 'REJECTED' : 'APPROVED'
                                          )
                                        }
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                                        title="Toggle Approval Status"
                                      >
                                        Reverse
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HR SUB-TAB 2: BIOMETRIC ATTENDANCE TRACKER */}
            {hrSubTab === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        Staff Biometric Attendance & Shift Logs
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Live biometric punch-in events synchronized across campus academic scanner terminals.
                      </p>
                    </div>

                    <div className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                      Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-3.5">Teaching Faculty</th>
                          <th scope="col" className="px-6 py-3.5">Department</th>
                          <th scope="col" className="px-6 py-3.5">Clock In</th>
                          <th scope="col" className="px-6 py-3.5">Clock Out</th>
                          <th scope="col" className="px-6 py-3.5">Biometric Terminal</th>
                          <th scope="col" className="px-6 py-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffAttendanceList.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-xs">{st.name}</td>
                            <td className="px-6 py-4 text-xs text-slate-600 font-medium">{st.dept}</td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{st.clockIn}</td>
                            <td className="px-6 py-4 font-mono text-slate-600 text-xs">{st.clockOut}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">{st.scanner}</td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                  st.status === 'PRESENT'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : st.status === 'ON_DUTY'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : st.status === 'LATE_ARRIVAL'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {st.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* HR SUB-TAB 3: MONTHLY PAYROLL & SALARY DISBURSAL */}
            {hrSubTab === 'payroll' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">Total Monthly Payroll</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">₹1.18 Cr</h3>
                    <p className="text-xs text-slate-500 mt-2">Gross Faculty & Staff Compensation</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-emerald-600">Disbursal Status</p>
                    <h3 className="text-3xl font-black text-emerald-700 mt-2">
                      {payrollDisbursed ? 'DISBURSED' : 'PENDING'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Via Direct HDFC Corporate Gateway</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-indigo-600">Statutory Tax & PF Deductions</p>
                    <h3 className="text-3xl font-black text-indigo-700 mt-2">₹18.4 Lakhs</h3>
                    <p className="text-xs text-slate-500 mt-2">Remitted to EPFO & Income Tax Cell</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-teal-600" />
                        Staff Salary Register • October 2026
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Itemized breakdown of basic pay, house rent allowance, statutory deductions, and net compensation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDisbursePayroll}
                      className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{payrollDisbursed ? 'Re-Verify Disbursal Ledger' : 'Process Monthly Disbursal'}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-3.5">Staff Member</th>
                          <th scope="col" className="px-6 py-3.5">Designation & Dept</th>
                          <th scope="col" className="px-6 py-3.5">Basic Pay</th>
                          <th scope="col" className="px-6 py-3.5">HRA & Allowances</th>
                          <th scope="col" className="px-6 py-3.5">PF & Tax Deductions</th>
                          <th scope="col" className="px-6 py-3.5">Net Disbursed</th>
                          <th scope="col" className="px-6 py-3.5 text-right">Payslip Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrollRecords.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-xs">{pr.name}</td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              <span className="font-semibold text-slate-800 block">{pr.designation}</span>
                              <span className="text-slate-400 font-mono">{pr.dept}</span>
                            </td>
                            <td className="px-6 py-4 font-mono font-semibold text-xs text-slate-900">₹{pr.basic.toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono text-xs text-emerald-700">+₹{(pr.hra + pr.allowances).toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono text-xs text-rose-700">-₹{pr.deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono font-black text-xs text-indigo-700">₹{pr.net.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setToastMessage(`✓ Generating official payslip PDF for ${pr.name}...`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                  window.print();
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 inline-flex items-center gap-1"
                              >
                                <Download className="w-3 h-3 text-slate-500" />
                                <span>Payslip</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ADD / EDIT STUDENT MODAL */}
        {/* ========================================================================= */}
        {(showAddStudentModal || editingStudent) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingStudent ? 'Edit Student Record' : 'Add New Student to Roster'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editingStudent ? `Editing: ${editingStudent.name} (${editingStudent.rollNo})` : 'Create credentials & academic enrolment record'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditingStudent(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Rathore"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={studentFormData.email}
                      onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                      placeholder="vikram.cs24@apextech.ac.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / Registration No</label>
                    <input
                      type="text"
                      required
                      value={studentFormData.rollNo}
                      onChange={(e) => setStudentFormData({ ...studentFormData, rollNo: e.target.value })}
                      placeholder="AIT-2024-CS108"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={studentFormData.department}
                      onChange={(e) => setStudentFormData({ ...studentFormData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engg</option>
                      <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                      <option value="Electronics & Communication">Electronics & Comm</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year / Term</label>
                    <select
                      value={studentFormData.year}
                      onChange={(e) => setStudentFormData({ ...studentFormData, year: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="1st Year (Sem 1)">1st Year (Sem 1)</option>
                      <option value="1st Year (Sem 2)">1st Year (Sem 2)</option>
                      <option value="2nd Year (Sem 3)">2nd Year (Sem 3)</option>
                      <option value="2nd Year (Sem 4)">2nd Year (Sem 4)</option>
                      <option value="3rd Year (Sem 5)">3rd Year (Sem 5)</option>
                      <option value="3rd Year (Sem 6)">3rd Year (Sem 6)</option>
                      <option value="4th Year (Sem 7)">4th Year (Sem 7)</option>
                      <option value="4th Year (Sem 8)">4th Year (Sem 8)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={studentFormData.cgpa}
                      onChange={(e) => setStudentFormData({ ...studentFormData, cgpa: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Status</label>
                    <select
                      value={studentFormData.status}
                      onChange={(e) => setStudentFormData({ ...studentFormData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Graduating">Graduating</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={studentFormData.semester || 'Sem 1'}
                      onChange={(e) => setStudentFormData({ ...studentFormData, semester: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Sem 1">Semester 1</option>
                      <option value="Sem 2">Semester 2</option>
                      <option value="Sem 3">Semester 3</option>
                      <option value="Sem 4">Semester 4</option>
                      <option value="Sem 5">Semester 5</option>
                      <option value="Sem 6">Semester 6</option>
                      <option value="Sem 7">Semester 7</option>
                      <option value="Sem 8">Semester 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">AI Risk Predictor Status</label>
                    <select
                      value={studentFormData.riskStatus || 'Low Risk'}
                      onChange={(e) => setStudentFormData({ ...studentFormData, riskStatus: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Low Risk">🟢 Low Risk (Good Standing)</option>
                      <option value="Medium Risk">🟡 Medium Risk (Advisory)</option>
                      <option value="High Risk">🔴 High Risk (Urgent Action)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStudentModal(false);
                      setEditingStudent(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingStudent ? 'Save Changes' : 'Enroll Student'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1B: EXECUTIVE COUNSELING & INTERVENTION MODAL */}
        {/* ========================================================================= */}
        {selectedStudentForIntervention && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedStudentForIntervention.riskStatus === 'High Risk'
                      ? 'bg-rose-50 border border-rose-200 text-rose-600'
                      : selectedStudentForIntervention.riskStatus === 'Medium Risk'
                      ? 'bg-amber-50 border border-amber-200 text-amber-600'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Macro-Level Counseling & Academic Intervention
                    </h3>
                    <p className="text-xs text-slate-500">
                      Institution-wide AI Risk Protocol • Administrative Oversight
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudentForIntervention(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Risk Dossier */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedStudentForIntervention.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {selectedStudentForIntervention.rollNo} • {selectedStudentForIntervention.department}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedStudentForIntervention.riskStatus === 'High Risk'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : selectedStudentForIntervention.riskStatus === 'Medium Risk'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      selectedStudentForIntervention.riskStatus === 'High Risk'
                        ? 'bg-rose-500 animate-ping'
                        : selectedStudentForIntervention.riskStatus === 'Medium Risk'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`} />
                    {selectedStudentForIntervention.riskStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Semester</span>
                    <span className="text-xs font-bold text-slate-800">{selectedStudentForIntervention.semester || 'Sem 6'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">CGPA</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{selectedStudentForIntervention.cgpa}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">AI Risk Index</span>
                    <span className={`text-xs font-bold font-mono ${
                      selectedStudentForIntervention.riskStatus === 'High Risk' ? 'text-rose-600' : 'text-slate-800'
                    }`}>
                      {selectedStudentForIntervention.riskScore ? `${Math.round(selectedStudentForIntervention.riskScore * 100)}%` : (selectedStudentForIntervention.riskStatus === 'High Risk' ? '86%' : '14%')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Predictor Root Cause: </span>
                  {selectedStudentForIntervention.riskReason || 'Consistent academic performance, low attrition risk metrics.'}
                </div>
              </div>

              {/* Intervention Action Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStudentList((prev) =>
                    prev.map((s) =>
                      s.id === selectedStudentForIntervention.id
                        ? {
                            ...s,
                            interventionLogged: true,
                            lastIntervention: interventionActionType,
                            riskReason: `${s.riskReason || ''} [Intervention scheduled: ${interventionActionType}]`,
                          }
                        : s
                    )
                  );
                  setToastMessage(`✓ Intervention authorized for ${selectedStudentForIntervention.name}. Faculty Mentor and Academic Counseling Office alerted.`);
                  setSelectedStudentForIntervention(null);
                  setInterventionNote('');
                  setTimeout(() => setToastMessage(null), 4500);
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Institutional Action</label>
                  <select
                    value={interventionActionType}
                    onChange={(e) => setInterventionActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="ACADEMIC_MENTOR">Assign Dedicated Senior Faculty Mentor (Weekly Check-ins)</option>
                    <option value="DEAN_CONFERENCE">Schedule Dean of Academics & Parent Counseling Conference</option>
                    <option value="REMEDIAL_COACHING">Enroll into Mandatory Remedial Labs & Attendance Recovery Plan</option>
                    <option value="STUDENT_WELLNESS">Refer to Institutional Student Wellness & Guidance Cell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Directives & Notes</label>
                  <textarea
                    rows={3}
                    value={interventionNote}
                    onChange={(e) => setInterventionNote(e.target.value)}
                    placeholder="Enter specific instructions for HOD, class counselor, and student advisor..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForIntervention(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize Intervention</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: ADD / EDIT FACULTY MODAL */}
        {/* ========================================================================= */}
        {(showAddFacultyModal || editingFaculty) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingFaculty ? 'Edit Faculty Profile' : 'Add Teaching Faculty Member'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure designation, cabin office, and course assignments
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddFacultyModal(false);
                    setEditingFaculty(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFaculty} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Name</label>
                  <input
                    type="text"
                    required
                    value={facultyFormData.name}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                    placeholder="e.g. Dr. Harishankar Murugan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={facultyFormData.email}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, email: e.target.value })}
                      placeholder="harishankar.m@apextech.ac.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Designation</label>
                    <select
                      value={facultyFormData.designation}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, designation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={facultyFormData.department}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engg</option>
                      <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                      <option value="Electronics & Communication">Electronics & Comm</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cabin Location</label>
                    <input
                      type="text"
                      required
                      value={facultyFormData.cabin}
                      onChange={(e) => setFacultyFormData({ ...facultyFormData, cabin: e.target.value })}
                      placeholder="CS-405, Ramanujan Block"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Courses</label>
                  <input
                    type="text"
                    required
                    value={facultyFormData.courses}
                    onChange={(e) => setFacultyFormData({ ...facultyFormData, courses: e.target.value })}
                    placeholder="e.g. Distributed Computing, Cloud Architectures"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFacultyModal(false);
                      setEditingFaculty(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingFaculty ? 'Update Profile' : 'Add to Directory'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: GENERATE NEW FEE INVOICE MODAL */}
        {/* ========================================================================= */}
        {showCreateInvoiceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Generate Student Fee Invoice</h3>
                    <p className="text-xs text-slate-500">
                      Creates official billing record with atomic lock protection
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                  <select
                    value={invoiceFormData.studentId}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, studentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    {studentList.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.name} ({stu.rollNo}) - {stu.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice ID Reference</label>
                    <input
                      type="text"
                      required
                      value={invoiceFormData.invoiceId}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={invoiceFormData.amount}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
                      placeholder="65000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Term / Semester</label>
                    <input
                      type="text"
                      required
                      value={invoiceFormData.semester}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, semester: e.target.value })}
                      placeholder="Semester 6 (Spring 2026)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceFormData.dueDate}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingInvoice}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingInvoice ? 'Processing...' : 'Generate & Issue Invoice'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: NEW APPLICANT INTAKE MODAL */}
        {/* ========================================================================= */}
        {showNewIntakeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">New Student Intake Registration</h3>
                    <p className="text-xs text-slate-500">Record candidate demographics and verify documents</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewIntakeModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveIntakeApplicant} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Full Name</label>
                  <input
                    type="text"
                    required
                    value={intakeFormData.name}
                    onChange={(e) => setIntakeFormData({ ...intakeFormData, name: e.target.value })}
                    placeholder="e.g. Shalini Subramaniam"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={intakeFormData.email}
                      onChange={(e) => setIntakeFormData({ ...intakeFormData, email: e.target.value })}
                      placeholder="shalini.s@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={intakeFormData.phone}
                      onChange={(e) => setIntakeFormData({ ...intakeFormData, phone: e.target.value })}
                      placeholder="+91 98402 33445"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Selected Department</label>
                    <select
                      value={intakeFormData.department}
                      onChange={(e) => {
                        const dept = e.target.value;
                        const code = dept.includes('Computer') ? 'CS' : dept.includes('Artificial') ? 'AI' : dept.includes('Electronics') ? 'EC' : dept.includes('Information') ? 'IT' : 'ME';
                        setIntakeFormData({ ...intakeFormData, department: dept, deptCode: code });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engg</option>
                      <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                      <option value="Electronics & Communication">Electronics & Comm</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Merit / Cutoff Score</label>
                    <input
                      type="text"
                      required
                      value={intakeFormData.score}
                      onChange={(e) => setIntakeFormData({ ...intakeFormData, score: e.target.value })}
                      placeholder="95.5% (TNEA Rank #410)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Document Verification Checkboxes */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Document Verification Checklist
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeFormData.ssc}
                        onChange={(e) => setIntakeFormData({ ...intakeFormData, ssc: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>10th Marksheet</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeFormData.hsc}
                        onChange={(e) => setIntakeFormData({ ...intakeFormData, hsc: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>12th / HSC Marksheet</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeFormData.tc}
                        onChange={(e) => setIntakeFormData({ ...intakeFormData, tc: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>Transfer Certificate (TC)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeFormData.idProof}
                        onChange={(e) => setIntakeFormData({ ...intakeFormData, idProof: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>Govt ID Proof (Aadhaar)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewIntakeModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Intake Record</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: ADD NEW COURSE MODAL */}
        {/* ========================================================================= */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Academic Course</h3>
                    <p className="text-xs text-slate-500">Define course code, credits, and map faculty</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="mt-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      value={courseFormData.code}
                      onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                      placeholder="CS303"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      required
                      value={courseFormData.name}
                      onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                      placeholder="Computer Networks & Protocols"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={courseFormData.dept}
                      onChange={(e) => setCourseFormData({ ...courseFormData, dept: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Artificial Intelligence & Data Science">AI&DS</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Information Technology">IT</option>
                      <option value="Mechanical Engineering">MECH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Faculty</label>
                    <select
                      value={courseFormData.faculty}
                      onChange={(e) => setCourseFormData({ ...courseFormData, faculty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      {facultyList.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} ({f.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      value={courseFormData.credits}
                      onChange={(e) => setCourseFormData({ ...courseFormData, credits: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={courseFormData.semester}
                      onChange={(e) => setCourseFormData({ ...courseFormData, semester: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Type</label>
                    <select
                      value={courseFormData.type}
                      onChange={(e) => setCourseFormData({ ...courseFormData, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="Core Theory">Core Theory</option>
                      <option value="Practical Lab">Practical Lab</option>
                      <option value="Professional Elective">Elective</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Create Course</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 6: MAP PROFESSOR MODAL */}
        {/* ========================================================================= */}
        {mappingCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Map Course Professor</h3>
                  <p className="text-xs text-slate-500">
                    Subject: <strong>{mappingCourse.code}</strong> ({mappingCourse.name})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMappingCourse(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Teaching Faculty</label>
                  <select
                    value={selectedFacultyForMap}
                    onChange={(e) => setSelectedFacultyForMap(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} - {f.designation} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMappingCourse(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveMapProfessor}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Mapping</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 7: SCHEDULE EXAMINATION MODAL */}
        {/* ========================================================================= */}
        {showScheduleExamModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Schedule Examination Session</h3>
                    <p className="text-xs text-slate-500">Allocate exam date, session slot, hall, and invigilator</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowScheduleExamModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleExam} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Title</label>
                  <input
                    type="text"
                    required
                    value={examFormData.title}
                    onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      value={examFormData.courseCode}
                      onChange={(e) => setExamFormData({ ...examFormData, courseCode: e.target.value })}
                      placeholder="CS303"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      required
                      value={examFormData.courseName}
                      onChange={(e) => setExamFormData({ ...examFormData, courseName: e.target.value })}
                      placeholder="Computer Networks"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date</label>
                    <input
                      type="date"
                      required
                      value={examFormData.date}
                      onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Session Timing</label>
                    <select
                      value={examFormData.session}
                      onChange={(e) => setExamFormData({ ...examFormData, session: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    >
                      <option value="Morning (09:30 AM - 12:30 PM)">Morning (09:30 AM - 12:30 PM)</option>
                      <option value="Afternoon (01:30 PM - 04:30 PM)">Afternoon (01:30 PM - 04:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Hall / Venue</label>
                    <input
                      type="text"
                      required
                      value={examFormData.hall}
                      onChange={(e) => setExamFormData({ ...examFormData, hall: e.target.value })}
                      placeholder="Exam Hall 1, Main Block"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Invigilator</label>
                    <select
                      value={examFormData.chiefInvigilator}
                      onChange={(e) => setExamFormData({ ...examFormData, chiefInvigilator: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    >
                      {facultyList.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowScheduleExamModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Publish to Schedule</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
