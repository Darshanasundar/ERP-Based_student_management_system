import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Award,
  ChevronRight,
  PlusCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { FACULTY_DATA } from '../data/mockData';
import AttendanceManager from './AttendanceManager';
import MarksEntry from './MarksEntry';

export default function FacultyDashboard() {
  const [markedClasses, setMarkedClasses] = useState({});

  const handleMarkAttendance = (id) => {
    setMarkedClasses((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const statCards = [
    {
      title: 'CS Students',
      value: FACULTY_DATA.stats.csStudents.value,
      subtitle: FACULTY_DATA.stats.csStudents.change,
      icon: Users,
      pillBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Assigned Subjects',
      value: FACULTY_DATA.stats.assignedSubjects.value,
      subtitle: FACULTY_DATA.stats.assignedSubjects.change,
      icon: BookOpen,
      pillBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: "Today's Classes",
      value: FACULTY_DATA.stats.todaysClasses.value,
      subtitle: FACULTY_DATA.stats.todaysClasses.change,
      icon: CalendarClock,
      pillBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Attendance Rate',
      value: FACULTY_DATA.stats.attendanceRate.value,
      subtitle: FACULTY_DATA.stats.attendanceRate.change,
      icon: CheckCircle2,
      pillBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Dr. Sarah Johnson's Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            SJ
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {FACULTY_DATA.profile.name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                CSE Department
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {FACULTY_DATA.profile.designation} · {FACULTY_DATA.profile.department}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {FACULTY_DATA.profile.cabin}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600">ID: {FACULTY_DATA.profile.employeeId}</span>
            </div>
          </div>
        </div>

        {/* Quick actions for Faculty */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => alert('Opening Continuous Internal Assessment (CIA) Gradebook...')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-600" />
            <span>Post CIA Marks</span>
          </button>
          <button
            onClick={() => alert('Syllabus tracker updated for the Institution curriculum.')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload Course Material</span>
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
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
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
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Two-Column Layout: Left (Larger) Class Averages | Right (Smaller) Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Class Averages Bar Chart */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Class Performance Averages</h2>
              <p className="text-xs text-slate-500">
                Mean internal exam scores across taught subjects (Max: 100)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Odd Semester 2026
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FACULTY_DATA.classAverages}
                margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-blue-300">{data.subject} ({data.code})</div>
                          <div>Class Mean: <span className="font-bold text-white">{data.average} / 100</span></div>
                          <div className="text-[10px] text-slate-400">Target Benchmark: 75%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="average"
                  name="Class Average"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                >
                  {FACULTY_DATA.classAverages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.average >= 85 ? '#2563eb' : entry.average >= 80 ? '#3b82f6' : '#60a5fa'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Benchmark Footnote */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Highest: Web Technologies (89%)
            </span>
            <span className="text-slate-400">Updated from autonomous CIA-2 evaluations</span>
          </div>
        </div>

        {/* Right Column (4 cols): Upcoming Classes List */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Classes</h2>
                <p className="text-xs text-slate-500">Today's assigned schedule</p>
              </div>
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                2
              </span>
            </div>

            <div className="space-y-3.5">
              {FACULTY_DATA.upcomingClasses.map((item) => {
                const isMarked = markedClasses[item.id];
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">
                          {item.subject}
                        </h3>
                        <span className="text-[11px] font-mono text-blue-600 font-medium">
                          {item.code}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                        {item.type}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.room}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.studentsCount} Students
                      </span>
                      <button
                        onClick={() => handleMarkAttendance(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          isMarked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isMarked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Marked</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Mark Attendance</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
            <span className="font-medium">Need room re-allocation?</span>
            <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
              Contact Dept Admin →
            </span>
          </div>
        </div>
      </div>

      {/* Faculty Tools: Attendance & Marks Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceManager courseId="CS3501" />
        <MarksEntry courseId="CS3501" />
      </div>

      {/* Bottom Section: Recent Activities Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Faculty Activities</h2>
            <p className="text-xs text-slate-500">
              Audit log of attendance, assessments, and curriculum events
            </p>
          </div>
          <button
            onClick={() => alert('Loading complete activity log...')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All Logged Events
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FACULTY_DATA.recentActivities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-start gap-3.5"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{act.title}</h3>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{act.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
