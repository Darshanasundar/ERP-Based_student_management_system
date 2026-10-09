import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  Award,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  BookOpen,
  IndianRupee,
  Download,
  CreditCard,
  ChevronRight,
  Sparkles,
  GraduationCap,
  FileCheck,
  Loader,
} from 'lucide-react';
import api from '../services/api';
import { STUDENT_DATA, COLLEGE_INFO } from '../data/mockData';

export default function StudentDashboard() {
  const [payingFee, setPayingFee] = useState(false);
  const [feePaidSuccess, setFeePaidSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "John Doe",
    studentId: STUDENT_DATA.profile.studentId,
    course: STUDENT_DATA.profile.course,
    feeTotal: 85000,
    feePaid: 0
  });

  const [academicData, setAcademicData] = useState({
    attendancePercentage: parseFloat(STUDENT_DATA.stats.attendance.value),
    currentCgpa: parseFloat(STUDENT_DATA.stats.cgpa.value),
    recentMarks: STUDENT_DATA.latestResults.map(r => ({
      examName: 'Midterm',
      score: r.score,
      maxScore: r.maxScore,
      courseId: r.code
    }))
  });
  
  const [detailedAttendance, setDetailedAttendance] = useState([]);
  const [detailedMarks, setDetailedMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAcademics = async () => {
      try {
        const [academicsRes, attendanceRes, marksRes] = await Promise.all([
          api.get('/student/my-academics'),
          api.get('/student/attendance/detailed'),
          api.get('/student/marks')
        ]);

        if (academicsRes.data) {
          setAcademicData({
            attendancePercentage: academicsRes.data.attendancePercentage,
            currentCgpa: academicsRes.data.currentCgpa,
            recentMarks: academicsRes.data.recentMarks || []
          });
          setProfileData({
            name: academicsRes.data.name || "Student",
            studentId: academicsRes.data.studentId || "STU001",
            course: `${academicsRes.data.department} - Year ${academicsRes.data.year}`,
            feeTotal: academicsRes.data.feeTotal || 85000,
            feePaid: academicsRes.data.feePaid || 0,
            feeLedger: academicsRes.data.feeLedger || []
          });
          
          if (academicsRes.data.feeTotal && academicsRes.data.feePaid && academicsRes.data.feeTotal === academicsRes.data.feePaid) {
            setFeePaidSuccess(true);
          }
        }

        if (attendanceRes.data) {
          setDetailedAttendance(attendanceRes.data);
        }
        if (marksRes.data) {
          setDetailedMarks(marksRes.data);
        }
      } catch (error) {
        console.warn('Backend not reachable, falling back to mock academic data.', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademics();
  }, []);

  const handlePayFee = () => {
    setPayingFee(true);
    setTimeout(() => {
      setPayingFee(false);
      setFeePaidSuccess(true);
    }, 800);
  };

  const handleDownloadTranscript = async () => {
    try {
      const response = await api.get('/reports/transcript/STU001', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transcript.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
      alert('Could not download transcript. Backend might not be running.');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await api.get('/reports/fee-receipt/STU001', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fee-receipt.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
      alert('Could not download receipt. Backend might not be running.');
    }
  };

  const statCards = [
    {
      title: 'Attendance',
      value: `${academicData.attendancePercentage}%`,
      subtitle: STUDENT_DATA.stats.attendance.status,
      icon: CheckCircle2,
      pillBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Current Semester',
      value: STUDENT_DATA.stats.currentSemester.value,
      subtitle: STUDENT_DATA.stats.currentSemester.change,
      icon: Calendar,
      pillBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'CGPA',
      value: academicData.currentCgpa.toFixed(2),
      subtitle: STUDENT_DATA.stats.cgpa.change,
      icon: Award,
      pillBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Fee Status',
      value: feePaidSuccess ? 'Fully Cleared' : `₹${profileData.feeTotal - profileData.feePaid} Due`,
      subtitle: feePaidSuccess ? 'Zero Balance' : `Paid ₹${profileData.feePaid} of ₹${profileData.feeTotal}`,
      icon: feePaidSuccess ? CheckCircle2 : AlertTriangle,
      pillBg: feePaidSuccess ? 'bg-emerald-100' : 'bg-amber-100',
      iconColor: feePaidSuccess ? 'text-emerald-600' : 'text-amber-600',
      isWarning: !feePaidSuccess,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {profileData.name}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              Student Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Roll No: <span className="font-mono font-semibold text-slate-700">{profileData.studentId}</span> · {profileData.course}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Downloading official Grade Card (PDF)...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Hall Ticket</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${
                card.isWarning ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl ${card.pillBg} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-3">
                <div
                  className={`text-3xl font-extrabold tracking-tight ${
                    card.isWarning ? 'text-amber-700' : 'text-slate-900'
                  }`}
                >
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
                  {card.isWarning && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <span>{card.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Four-Section Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Profile Summary Card (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Profile Summary
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Enrolled
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-semibold text-slate-900">{STUDENT_DATA.profile.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Register / Roll ID</span>
                <span className="font-mono font-bold text-blue-600">{STUDENT_DATA.profile.studentId}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Program & Dept</span>
                <span className="font-semibold text-slate-800 text-right">{STUDENT_DATA.profile.course}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Academic Mentor</span>
                <span className="font-semibold text-slate-800">{STUDENT_DATA.profile.advisor}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Latest SGPA</span>
                <span className="font-bold text-emerald-600">{STUDENT_DATA.profile.latestSGPA} / 10.0</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 font-medium">Credits Earned</span>
                <span className="font-bold text-slate-800">
                  {STUDENT_DATA.profile.creditsEarned} / {STUDENT_DATA.profile.totalCredits}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Autonomous Curriculum v2022</span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
              View Transcript →
            </span>
          </div>
        </div>

        {/* 2. Upcoming Classes Card (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Upcoming Classes & Labs
              </h2>
              <p className="text-xs text-slate-500">Today's schedule according to course timetable</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              3 Sessions
            </span>
          </div>

          <div className="space-y-3">
            {STUDENT_DATA.upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{cls.subject}</span>
                    <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {cls.code}
                    </span>
                    {cls.isLive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">
                        Next Up
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">Instructor: {cls.faculty}</div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{cls.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Latest Result Card (Col Span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Latest Assessment Results
              </h2>
              <p className="text-xs text-slate-500">Continuous Assessment Exam 2 (CA-II) Performance</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Mean: 85.8%
              </span>
              <button onClick={handleDownloadTranscript} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition shadow-sm">
                <Download className="w-3.5 h-3.5" />
                Transcript (PDF)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : academicData.recentMarks.length > 0 ? (
              academicData.recentMarks.map((res, index) => {
                // If it's from backend, we might not have 'subject' or 'grade', so we fallback
                const scorePercent = (res.score / res.maxScore) * 100;
                return (
                  <div key={res.id || index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{res.examName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{res.courseId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{res.score}/{res.maxScore}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">
                          {scorePercent >= 90 ? 'Grade O' : scorePercent >= 80 ? 'Grade A+' : 'Grade A'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar out of 100 */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          scorePercent >= 90
                            ? 'bg-blue-600'
                            : scorePercent >= 80
                            ? 'bg-emerald-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 text-xs py-4">No recent marks available.</div>
            )}
          </div>
        </div>

        {/* 4. Detailed Fee Status Card (Col Span 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                  Detailed Fee Status
                </h2>
                <p className="text-xs text-slate-500">Academic Year 2026-27 Ledger & Dues</p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  feePaidSuccess
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {feePaidSuccess ? 'All Dues Cleared' : 'Partially Paid'}
              </span>
            </div>

            {/* Total / Paid / Remaining Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 block">
                  ₹{(profileData.feeTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Paid</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5 block">
                  ₹{feePaidSuccess ? (profileData.feeTotal || 0).toLocaleString('en-IN') : (profileData.feePaid || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  feePaidSuccess
                    ? 'bg-slate-50 border-slate-100'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold block ${
                    feePaidSuccess ? 'text-slate-400' : 'text-amber-700'
                  }`}
                >
                  Remaining
                </span>
                <span
                  className={`text-sm sm:text-base font-extrabold mt-0.5 block ${
                    feePaidSuccess ? 'text-slate-400' : 'text-amber-700'
                  }`}
                >
                  ₹{feePaidSuccess ? '0' : ((profileData.feeTotal || 0) - (profileData.feePaid || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Installment breakdown */}
            <div className="space-y-2 text-xs">
              {profileData.feeLedger && profileData.feeLedger.length > 0 ? profileData.feeLedger.map((rec) => {
                const isPaid = rec.status === 'PAID' || feePaidSuccess;
                return (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between bg-slate-50/50"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{rec.feeStructure.feeType}</span>
                      <span className="text-[10px] text-slate-400">Assigned: {rec.assignedDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        ₹{rec.feeStructure.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isPaid ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isPaid ? 'Cleared ✓' : `Due: ${rec.dueDate}`}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-slate-400 py-2">No detailed fee records found.</p>
              )}
            </div>
          </div>

          {/* Pay Button / Receipt footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {feePaidSuccess
                ? 'Payment successful. Receipt available.'
                : `Due date: ${STUDENT_DATA.feeDetails.dueDate}`}
            </span>

            {!feePaidSuccess ? (
              <button
                onClick={handlePayFee}
                disabled={payingFee}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {payingFee ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Remaining ₹60,000</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Fee Receipt</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Academics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold">Subject-wise Attendance</h2>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto max-h-64">
            {detailedAttendance.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No detailed attendance records found.</p>
            ) : (
              <div className="space-y-3">
                {detailedAttendance.map((rec, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-white">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{rec.courseId}</p>
                      <p className="text-xs text-slate-400">{rec.date}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Marks Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <Award className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold">Subject-wise Marks</h2>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto max-h-64">
            {detailedMarks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No published marks found.</p>
            ) : (
              <div className="space-y-3">
                {detailedMarks.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-white">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{m.courseId}</p>
                      <p className="text-xs text-slate-400">{m.examName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{m.score} / {m.maxScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
