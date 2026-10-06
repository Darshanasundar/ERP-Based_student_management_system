import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  FileBarChart2,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { COLLEGE_INFO } from '../data/mockData';

export default function DashboardLayout({
  user,
  currentRole,
  activeNav,
  onNavChange,
  onRoleSwitch,
  onLogout,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, title: 'Fee Collection Update', desc: '₹1.2L collected in the last 24h', time: '10m ago', unread: true },
    { id: 2, title: 'Class Schedule Alert', desc: 'Room 204 booked for CS3502 at 2:00 PM', time: '1h ago', unread: true },
    { id: 3, title: 'Autonomous Accreditation', desc: 'NBA Compliance Report uploaded', time: '3h ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Fixed width (w-64), Dark Navy bg-slate-900 */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Section */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  EduManage ERP
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400 block truncate max-w-[130px]">
                  {COLLEGE_INFO.shortName}
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Context Pill */}
          <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-900/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Campus Portal</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud
              </span>
            </div>
            <div className="text-xs text-slate-200 font-semibold truncate mt-0.5">
              {COLLEGE_INFO.name}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Modules
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Active Role Pill & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          {/* Active User Card in Sidebar */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.initials || 'EM'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate capitalize">{currentRole} Portal</div>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
            {['Admin', 'Faculty', 'Student'].map((r) => (
              <button
                key={r}
                onClick={() => onRoleSwitch(r)}
                className={`flex-1 py-1 text-[10px] font-semibold rounded transition cursor-pointer ${
                  currentRole.toLowerCase() === r.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to ${r} view`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Logout Button Pinned to Bottom */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
          {/* Left: Mobile Hamburger & Search Bar */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, faculty, roll no, subjects, fee records..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          {/* Right: Notifications & Profile Pill */}
          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            {/* Quick College Tag (hidden on small screens) */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>GEC Autonomous Campus</span>
            </div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Notifications
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 cursor-pointer hover:underline">
                      Mark all read
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                          n.unread ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20">
                {user?.initials || 'SA'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[11px] font-medium text-blue-600 capitalize">
                  {currentRole}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
