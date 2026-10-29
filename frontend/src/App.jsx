import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
  if (role === 'STUDENT') return <Navigate to="/student" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Admin Dashboard: Strictly for ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Faculty Dashboard: Strictly for FACULTY (only faculty can access and mark attendance) */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['FACULTY', 'TEACHER']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Dashboard: Strictly for STUDENT (only student can access their page) */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root and Fallback Catch-All */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
