import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, Lock, Mail, ArrowRight, Shield, BookOpen, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Role modes: 'ADMIN' | 'FACULTY' | 'STUDENT'
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roleConfigs = {
    ADMIN: {
      title: 'Administrator',
      email: 'admin@erp.com',
      password: 'admin@123',
      destRoute: '/admin',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      activeTabClass: 'border-rose-500 bg-rose-50/50 text-rose-700 shadow-sm',
      btnGradient: 'from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/20',
      icon: Shield,
      scope: 'Executive Administration (Only Admin has access)',
      description: 'Institutional management, directory oversight, financial pipeline audits.',
    },
    FACULTY: {
      title: 'Faculty',
      email: 'faculty@erp.com',
      password: 'faculty@123',
      destRoute: '/faculty',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      activeTabClass: 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm',
      btnGradient: 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-amber-600/20',
      icon: BookOpen,
      scope: 'Academic & Attendance Portal (Only Faculty has access)',
      description: 'Manage course student rosters, AI risk predictors, and record daily attendance.',
    },
    STUDENT: {
      title: 'Student (Alex Turner)',
      email: 'alex.turner@erp.com',
      password: 'student123',
      destRoute: '/student',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeTabClass: 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm',
      btnGradient: 'from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/20',
      icon: GraduationCap,
      scope: 'Student Academic Portal (Only Alex Turner has access)',
      description: 'View 8-semester marksheets, CGPA progression, and live attendance history.',
    },
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleConfigs[roleKey].email);
    setPassword(roleConfigs[roleKey].password);
    setErrorMessage('');
  };

  const executeLogin = async (loginEmail, loginPass) => {
    setErrorMessage('');
    setLoading(true);

    try {
      const { normalizedRole } = await login(loginEmail, loginPass);

      // Navigate strictly according to authenticated role
      if (normalizedRole === 'ADMIN') {
        navigate('/admin');
      } else if (normalizedRole === 'FACULTY') {
        navigate('/faculty');
      } else if (normalizedRole === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to sign in. Please verify your role credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both campus email and password.');
      return;
    }
    executeLogin(email, password);
  };

  const activeConfig = roleConfigs[selectedRole];
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 lg:p-8 relative">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative z-10">
        {/* Header Institution Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-3">
            <School className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Apex Institute of Technology
          </h1>
          <p className="text-xs text-indigo-600 font-bold tracking-wider uppercase mt-1">
            Role-Based Enterprise Resource Planning (ERP)
          </p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="mt-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Select Portal Access Role:
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.entries(roleConfigs).map(([key, config]) => {
              const Icon = config.icon;
              const isSelected = selectedRole === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                    isSelected
                      ? config.activeTabClass
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? '' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">{config.title}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full font-mono mt-0.5">
                    {config.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Policy Callout Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <ActiveIcon className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{activeConfig.title} Page Access</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeConfig.badgeColor}`}>
                Role-Protected
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">{activeConfig.scope}</p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form id="login-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address ({activeConfig.title})
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeConfig.email}
                required
                disabled={loading}
                autoComplete="username"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 bg-gradient-to-r ${activeConfig.btnGradient} text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50`}
          >
            {loading ? (
              <span>Authenticating with Database...</span>
            ) : (
              <>
                <span>Sign in as {activeConfig.title}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Direct One-Click Prototype Connectors */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Database Connected Prototype Users:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                handleRoleSelect('ADMIN');
                executeLogin('admin@erp.com', 'admin@123');
              }}
              disabled={loading}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-200 flex items-center justify-between text-xs transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="font-bold text-slate-900 block group-hover:text-rose-700">
                    1. Admin Dashboard
                  </span>
                  <span className="text-[10px] text-slate-500">Only Admin page access</span>
                </div>
              </span>
              <span className="font-mono text-slate-600 group-hover:text-rose-700 font-medium">
                admin@erp.com / admin@123
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleRoleSelect('FACULTY');
                executeLogin('faculty@erp.com', 'faculty@123');
              }}
              disabled={loading}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 flex items-center justify-between text-xs transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-900 block group-hover:text-amber-800">
                    2. Faculty Dashboard
                  </span>
                  <span className="text-[10px] text-slate-500">Only Faculty can mark student attendance</span>
                </div>
              </span>
              <span className="font-mono text-slate-600 group-hover:text-amber-800 font-medium">
                faculty@erp.com / faculty@123
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleRoleSelect('STUDENT');
                executeLogin('alex.turner@erp.com', 'student123');
              }}
              disabled={loading}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 flex items-center justify-between text-xs transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block group-hover:text-indigo-700">
                    3. Student Portal (Alex Turner)
                  </span>
                  <span className="text-[10px] text-slate-500">Connected database student prototype</span>
                </div>
              </span>
              <span className="font-mono text-slate-600 group-hover:text-indigo-700 font-medium">
                alex.turner@erp.com / student123
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
