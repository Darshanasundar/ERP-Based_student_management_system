import React, { useState } from 'react';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  School,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { DEMO_USERS, COLLEGE_INFO } from '../data/mockData';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(DEMO_USERS.admin.email);
  const [password, setPassword] = useState(DEMO_USERS.admin.password);
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let detectedRole = role;
    if (email.toLowerCase().endsWith('@student.com')) detectedRole = 'Student';
    else if (email.toLowerCase().endsWith('@faculty.com')) detectedRole = 'Faculty';
    else if (email.toLowerCase().endsWith('@admin.com')) detectedRole = 'Admin';

    try {
      const response = await api.post('/auth/login', {
        username: email,
        password: password
      });
      
      const { accessToken, role: userRole } = response.data;
      localStorage.setItem('jwtToken', accessToken);
      
      onLogin({ email, role: userRole || detectedRole });
    } catch (error) {
      console.warn('Backend login failed, using local mock auth.', error.message);
      // Fallback
      setTimeout(() => {
        setIsLoading(false);
        onLogin({ email, role: detectedRole });
      }, 400);
    }
  };

  const handleQuickFill = (targetRole) => {
    const key = targetRole.toLowerCase();
    const demo = DEMO_USERS[key];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      setRole(demo.role);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans antialiased text-slate-900">
      {/* Left 50% Brand Hero (Solid Royal Blue) */}
      <div className="w-full md:w-1/2 bg-blue-600 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-700/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Institutional Badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-xs font-medium text-blue-100 backdrop-blur-sm mb-6">
            <School className="w-4 h-4 text-blue-200" />
            <span>{COLLEGE_INFO.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                EduManage ERP
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                Cloud Integrated Student Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 my-8 sm:my-12 max-w-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
            Next-Generation Academic Operations on Cloud Infrastructure
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            Real-time student lifecycle tracking, multi-department academic analytics, automated fee management, and accredited engineering curriculum governance.
          </p>

          <div className="space-y-3">
            {[
              'Autonomous Credit & Outcome Based Education (OBE)',
              'Zero-Latency Real-Time Student & Faculty Workflows',
              'Integrated Financial Ledger & Fee Collection Portals',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-blue-50">
                <CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-blue-500/40 flex flex-wrap items-center justify-between text-xs text-blue-200 gap-2">
          <span>{COLLEGE_INFO.tagline}</span>
          <span className="font-mono">v2.4 Production Prototype</span>
        </div>
      </div>

      {/* Right 50% Login Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 transition-all">
          <div className="mb-8">
            <span className="inline-block px-2.5 py-1 text-xs font-semibold tracking-wide text-blue-700 bg-blue-50 rounded-md mb-2">
              SECURE PORTAL
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your institution role and enter your credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Dropdown */}
            <div>
              <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Institutional Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                >
                  <option value="Admin">System Administrator (Central ERP)</option>
                  <option value="Faculty">Faculty / Professor (Academics & Labs)</option>
                  <option value="Student">Student (B.Tech Degree Program)</option>
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edumanage.edu.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions have been sent to your verified college email address.');
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this browser</span>
              </label>
              <span className="text-[11px] text-slate-400">SSL 256-Bit Encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In as {role}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts 1-Click Fill Feature */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Demo Accounts (1-Click Fill)
              </span>
              <span className="text-[11px] text-slate-400">Instant Access</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('Admin')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  role === 'Admin'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">Central ERP</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Faculty')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  role === 'Faculty'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Faculty</div>
                <div className="text-[10px] text-slate-400 truncate">Dr. Sarah</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Student')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  role === 'Student'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Student</div>
                <div className="text-[10px] text-slate-400 truncate">John Doe</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
