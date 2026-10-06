import React, { useState } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import UserProfile from './components/UserProfile';
import { StudentsListView, GenericModuleView } from './components/OtherViews';
import { DEMO_USERS } from './data/mockData';
import { Users, BookOpen, CreditCard, FileBarChart2, Settings } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentRole, setCurrentRole] = useState('Admin'); // 'Admin' | 'Faculty' | 'Student'
  const [activeNav, setActiveNav] = useState('dashboard');

  const currentUser = DEMO_USERS[currentRole.toLowerCase()] || DEMO_USERS.admin;

  const handleLogin = ({ email, role }) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    setActiveNav('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
  };

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    setActiveNav('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Render content based on active navigation tab & role
  const renderContent = () => {
    if (activeNav === 'dashboard') {
      switch (currentRole) {
        case 'Admin':
          return <AdminDashboard />;
        case 'Faculty':
          return <FacultyDashboard />;
        case 'Student':
          return <StudentDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    if (activeNav === 'students') {
      return <StudentsListView />;
    }

    if (activeNav === 'faculty') {
      return (
        <GenericModuleView
          title="Faculty Directory & Workload Allocation"
          description="Manage professorship profiles, teaching assignments, and laboratory mentorship schedules."
          icon={Users}
          tag="Staff Registry"
        />
      );
    }

    if (activeNav === 'subjects') {
      return (
        <GenericModuleView
          title="Curriculum & Course Syllabus Management"
          description="60 Autonomous accredited subjects mapped to Anna University OBE credit guidelines."
          icon={BookOpen}
          tag="Curriculum Board"
        />
      );
    }

    if (activeNav === 'fees') {
      return (
        <GenericModuleView
          title="Central Fee Accounting & Payment Ledger"
          description="Audit fee reconciliations, pending installment collections, and scholarship subsidies."
          icon={CreditCard}
          tag="Finance Office"
        />
      );
    }

    if (activeNav === 'reports') {
      return (
        <GenericModuleView
          title="Institutional Analytics & Accreditation Reports"
          description="Generate NBA Tier-1 accreditation metrics, NAAC cycle portfolios, and NIRF disclosures."
          icon={FileBarChart2}
          tag="Quality Assurance"
        />
      );
    }

    if (activeNav === 'settings') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              Account Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage your profile, avatar, and security preferences.</p>
          </div>
          <UserProfile userId={currentRole === 'Student' ? 'STU001' : currentRole === 'Faculty' ? 'FAC001' : 'ADM001'} role={currentRole} />
        </div>
      );
    }

    return <AdminDashboard />;
  };

  return (
    <DashboardLayout
      user={currentUser}
      currentRole={currentRole}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
