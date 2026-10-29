import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'ADMIN', 'FACULTY', or 'STUDENT'
  const [loading, setLoading] = useState(true);

  // Normalize backend roles to UI standards: ADMIN, FACULTY, STUDENT
  const normalizeRole = (rawRole) => {
    if (!rawRole) return null;
    const upper = String(rawRole).toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'ADMIN';
    if (upper === 'TEACHER' || upper === 'FACULTY') return 'FACULTY';
    if (upper === 'STUDENT') return 'STUDENT';
    return upper;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('erp_token');
    const storedUser = localStorage.getItem('erp_user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(normalizeRole(parsed.role));
      } catch (e) {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = res.data;

    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(loggedUser));

    const normalized = normalizeRole(loggedUser.role);
    setUser(loggedUser);
    setRole(normalized);

    return { token, user: loggedUser, normalizedRole: normalized };
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role, // 'ADMIN' | 'FACULTY' | 'STUDENT'
    rawRole: user?.role,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
