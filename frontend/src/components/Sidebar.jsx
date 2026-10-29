import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  DollarSign,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  MessageSquare,
  Shield,
  CreditCard,
  Clock,
  UserCheck,
  Calendar,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();

  const currentPathWithSearch = location.pathname + (location.search || '');

  const adminLinks = [
    { to: '/admin?tab=overview', label: '1. Executive Overview', icon: LayoutDashboard },
    { to: '/admin?tab=students', label: '2. Students Roster', icon: Users },
    { to: '/admin?tab=faculty', label: '3. Faculty Directory', icon: Building2 },
    { to: '/admin?tab=admissions', label: '4. Admissions & Intake', icon: UserCheck },
    { to: '/admin?tab=courses', label: '5. Courses & Curriculum', icon: BookOpen },
    { to: '/admin?tab=exams', label: '6. Examinations & Results', icon: Award },
    { to: '/admin?tab=finance', label: '7. Fee Management', icon: DollarSign },
    { to: '/admin?tab=hr', label: '8. HR, Leaves & Payroll', icon: Briefcase },
  ];

  const facultyLinks = [
    { to: '/faculty?tab=attendance', label: '1. Daily Attendance', icon: CalendarCheck },
    { to: '/faculty?tab=grading', label: '2. Course Grading & Marks', icon: FileSpreadsheet },
    { to: '/faculty?tab=airisk', label: '3. AI Risk & Student Alerts', icon: AlertTriangle },
    { to: '/faculty?tab=schedule', label: '4. Teaching Timetable', icon: Clock },
    { to: '/faculty?tab=leave', label: '5. HR Leave Management', icon: Briefcase },
  ];

  const studentLinks = [
    { to: '/student?tab=overview', label: '1. Academic Overview & CGPA', icon: TrendingUp },
    { to: '/student?tab=attendance', label: '2. Live Attendance Records', icon: CalendarCheck },
    { to: '/student?tab=marks', label: '3. 8-Semester Marksheets', icon: Award },
    { to: '/student?tab=fees', label: '4. Financials & Fee Payments', icon: CreditCard },
    { to: '/student?tab=schedule', label: '5. Class Timetable', icon: Clock },
    { to: '/student?tab=profile', label: '6. Profile & Document Vault', icon: UserCheck },
    { to: '/student?tab=messages', label: '7. AI Risk & Faculty Alerts', icon: MessageSquare },
  ];

  const getLinks = () => {
    switch (role) {
      case 'ADMIN':
        return adminLinks;
      case 'FACULTY':
        return facultyLinks;
      case 'STUDENT':
        return studentLinks;
      default:
        return [
          { to: '/admin?tab=overview', label: 'Admin Dashboard', icon: LayoutDashboard },
          { to: '/faculty?tab=attendance', label: 'Faculty Dashboard', icon: BookOpen },
          { to: '/student?tab=overview', label: 'Student Portal', icon: GraduationCap },
        ];
    }
  };

  const links = getLinks();

  const isLinkActive = (to) => {
    if (to === currentPathWithSearch) return true;
    // Default fallback if query is absent:
    if (to === '/admin?tab=overview' && location.pathname === '/admin' && !location.search) return true;
    if (to === '/faculty?tab=attendance' && location.pathname === '/faculty' && !location.search) return true;
    if (to === '/student?tab=overview' && location.pathname === '/student' && !location.search) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
            {role ? `${role} WORKSPACE` : 'NAVIGATION'}
          </span>
          <nav className="mt-2 space-y-1">
            {links.map((link, idx) => {
              const Icon = link.icon;
              const active = isLinkActive(link.to);
              return (
                <Link
                  key={idx}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Active Role Isolation Information */}
        <div className="pt-4 border-t border-slate-200">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Access Control Policy
            </span>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Strict Role-Based Isolated View.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Session Authenticated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Apex Institute ERP</p>
            <p className="text-[10px] text-slate-500">PostgreSQL Live Sync Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
