import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { ADMIN_DATA, COLLEGE_INFO } from '../data/mockData';
import api from '../services/api';
import ExcelUpload from './ExcelUpload';

export default function AdminDashboard() {
  const [stats, setStats] = useState(ADMIN_DATA.stats);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        const data = response.data;
        
        // Update the stats with real data from backend
        setStats({
          totalStudents: { value: data.totalStudents, change: 'Live from DB', label: 'Total Students' },
          totalFaculty: { value: data.totalFaculty, change: 'Live from DB', label: 'Total Faculty' },
          subjects: { value: data.subjects, change: 'Live from DB', label: 'Active Subjects' },
          pendingFees: { value: data.pendingFees, change: 'Live from DB', label: 'Pending Fees' },
        });
      } catch (error) {
        console.warn('Backend not reachable, falling back to mock data.', error.message);
        // Fallback is already the default state (ADMIN_DATA)
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.value,
      subtitle: stats.totalStudents.change,
      icon: GraduationCap,
      pillBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Total Faculty',
      value: stats.totalFaculty.value,
      subtitle: stats.totalFaculty.change,
      icon: Users,
      pillBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Subjects',
      value: stats.subjects.value,
      subtitle: stats.subjects.change,
      icon: BookOpen,
      pillBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Pending Fees',
      value: stats.pendingFees.value,
      subtitle: stats.pendingFees.change,
      icon: IndianRupee,
      pillBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              Central Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            3 departments · 4 years · 2 semesters/year · 60 subjects
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Year 2026-27</span>
          </div>

          <button
            onClick={() => alert('Exporting Institutional Report (PDF / Excel)...')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
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
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                  <span>{card.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Upload Section */}
      <div className="mb-6">
        <ExcelUpload />
      </div>

      {/* Charts Section 1: Side-by-Side Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Students by Department (Solid Blue) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Students by Department</h2>
              <p className="text-xs text-slate-500">Computer, Electronics, and Mechanical cohorts</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              3 Departments
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ADMIN_DATA.departmentData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Bar
                  dataKey="students"
                  name="Enrolled Students"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Students by Year (Solid Green) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Students by Year</h2>
              <p className="text-xs text-slate-500">Distribution across academic levels 1 to 4</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              4 Batches
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ADMIN_DATA.yearData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#86efac' }}
                />
                <Bar
                  dataKey="students"
                  name="Total Students"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section 2: Area Chart & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Institution Enrollment Trend */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institution Enrollment Trend
              </h2>
              <p className="text-xs text-slate-500">Five-year growth vs sanctioned seat capacity</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+33.3% Growth</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={ADMIN_DATA.enrollmentTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="academicYear"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[10, 26]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollment"
                  name="Enrolled Count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#enrollmentGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="capacity"
                  name="Cap Limit"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Average SGPA by Semester */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Average SGPA by Semester</h2>
              <p className="text-xs text-slate-500">Autonomous academic performance benchmarking</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>8.25 Peak Avg</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ADMIN_DATA.sgpaTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="semester"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[7.0, 9.0]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line
                  type="monotone"
                  dataKey="averageSGPA"
                  name="Avg SGPA"
                  stroke="#2563eb"
                  strokeWidth={3}
                  activeDot={{ r: 7, fill: '#2563eb' }}
                  dot={{ r: 4, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Accreditation Target (7.5)"
                  stroke="#16a34a"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institutional Department Oversight Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Department Operations & Curricula
            </h2>
            <p className="text-xs text-slate-500">
              Affiliated programs at the Institution
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">Autonomous Tier-1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Dept Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Head of Department</th>
                <th className="py-3 px-4 text-center">Active Cohort</th>
                <th className="py-3 px-4 text-center">Subjects</th>
                <th className="py-3 px-4 text-center">Labs</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {ADMIN_DATA.departmentsList.map((dept) => (
                <tr key={dept.code} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{dept.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{dept.name}</td>
                  <td className="py-3 px-4 text-slate-600">{dept.head}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{dept.students}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{dept.subjects}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{dept.labs}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
