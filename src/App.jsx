import React, { useState } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import UserProfile from './components/UserProfile';
import StudentManagement from './components/StudentManagement';
import FacultyManagement from './components/FacultyManagement';
import SubjectManagement from './components/SubjectManagement';
import FeeManagement from './components/FeeManagement';
import ReportsModule from './components/ReportsModule';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AttendanceMarks from './components/AttendanceMarks';
import MyClasses from './components/MyClasses';
import FacultySettings from './components/FacultySettings';
import { DEMO_USERS } from './data/mockData';

// A simple protected route wrapper
const ProtectedRoute = ({ isAllowed, redirectPath, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState('Admin'); // 'Admin' | 'Faculty' | 'Student'
  
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = DEMO_USERS[currentRole.toLowerCase()] || DEMO_USERS.admin;

  const handleLogin = ({ email, role }) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    if (role === 'Faculty') {
      navigate('/faculty/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'Faculty') {
      navigate('/faculty/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      user={currentUser}
      currentRole={currentRole}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      <Routes>
        {/* Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute isAllowed={currentRole !== 'Faculty'} redirectPath="/faculty/dashboard">
            {currentRole === 'Admin' ? <AdminDashboard /> : <StudentDashboard />}
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute isAllowed={currentRole === 'Admin'} redirectPath="/faculty/dashboard">
            <StudentManagement />
          </ProtectedRoute>
        } />
        <Route path="/faculty" element={
          <ProtectedRoute isAllowed={currentRole === 'Admin'} redirectPath="/faculty/dashboard">
            <FacultyManagement />
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute isAllowed={currentRole === 'Admin'} redirectPath="/faculty/dashboard">
            <SubjectManagement />
          </ProtectedRoute>
        } />
        <Route path="/fees" element={
          <ProtectedRoute isAllowed={currentRole === 'Admin'} redirectPath="/faculty/dashboard">
            <FeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute isAllowed={currentRole === 'Admin'} redirectPath="/faculty/dashboard">
            <ReportsModule />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute isAllowed={currentRole !== 'Faculty'} redirectPath="/faculty/dashboard">
            <div className="space-y-6">
              <UserProfile userId={currentRole === 'Student' ? 'STU001' : 'ADM001'} role={currentRole} />
            </div>
          </ProtectedRoute>
        } />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={
          <ProtectedRoute isAllowed={currentRole === 'Faculty'} redirectPath="/dashboard">
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/classes" element={
          <ProtectedRoute isAllowed={currentRole === 'Faculty'} redirectPath="/dashboard">
            <MyClasses />
          </ProtectedRoute>
        } />
        <Route path="/faculty/grading" element={
          <ProtectedRoute isAllowed={currentRole === 'Faculty'} redirectPath="/dashboard">
            <AttendanceMarks />
          </ProtectedRoute>
        } />
        <Route path="/faculty/settings" element={
          <ProtectedRoute isAllowed={currentRole === 'Faculty'} redirectPath="/dashboard">
            <FacultySettings user={currentUser} />
          </ProtectedRoute>
        } />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to={currentRole === 'Faculty' ? '/faculty/dashboard' : '/dashboard'} replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}


