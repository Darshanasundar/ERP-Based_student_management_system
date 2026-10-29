import React from 'react';
import { useAuth } from '../context/AuthContext';
import { School, LogOut, Bell, Shield, BookOpen, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="w-3 h-3 text-rose-600" /> System Admin
          </span>
        );
      case 'FACULTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <BookOpen className="w-3 h-3 text-amber-600" /> Faculty Member
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GraduationCap className="w-3 h-3 text-indigo-600" /> Student
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {role || 'User'}
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
      {/* Institution Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
          <School className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Apex Institute of Technology
            <span className="text-xs px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded">
              ERP
            </span>
          </h1>
          <p className="text-xs text-slate-500">Autonomous Institute • Center of Academic Excellence</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Active Role Tag */}
        {getRoleBadge()}

        {/* User Info */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-800">{user?.email || 'Logged In'}</span>
          <span className="text-xs text-slate-500">Academic Year 2026-27</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all"
          title="Sign out of ERP system"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
