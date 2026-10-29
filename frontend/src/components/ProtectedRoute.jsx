import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, verify access
  if (allowedRoles && allowedRoles.length > 0) {
    // Both normalized roles ('ADMIN', 'FACULTY', 'STUDENT') and raw roles ('SUPER_ADMIN', 'TEACHER')
    const roleMatches =
      allowedRoles.includes(role) ||
      (role === 'ADMIN' && allowedRoles.includes('SUPER_ADMIN')) ||
      (role === 'FACULTY' && allowedRoles.includes('TEACHER'));

    if (!roleMatches) {
      if (role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
      if (role === 'STUDENT') return <Navigate to="/student" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
