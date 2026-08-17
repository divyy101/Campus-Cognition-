import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import StudyAgent from './pages/StudyAgent';
import CodeLab from './pages/CodeLab';
import InternshipAgent from './pages/InternshipAgent';
import ScholarshipAgent from './pages/ScholarshipAgent';
import OpportunityAgent from './pages/OpportunityAgent';
import Profile from './pages/Profile';
import ActivityLog from './pages/ActivityLog';
import NotFound from './pages/NotFound';
import Background from './components/Background';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component to handle route changes, set page theme, and manage AnimatePresence
const RouteManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract page name from pathname
    let page = location.pathname.substring(1).split('/')[0];
    if (!page) page = 'dashboard';
    
    // Map routes to theme names
    const pageMapping = {
      'login': 'login',
      'register': 'register',
      'dashboard': 'dashboard',
      'study': 'study',
      'code-lab': 'code',
      'internships': 'internship',
      'scholarships': 'scholarship',
      'opportunities': 'opportunity',
      'profile': 'profile',
      'activity': 'activity',
    };
    
    const themeName = pageMapping[page] || 'dashboard';
    document.documentElement.setAttribute('data-page', themeName);
  }, [location.pathname]);

  return (
    <>
      <Background location={location} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Application Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><StudyAgent /></ProtectedRoute>} />
          <Route path="/code-lab" element={<ProtectedRoute><CodeLab /></ProtectedRoute>} />
          <Route path="/internships" element={<ProtectedRoute><InternshipAgent /></ProtectedRoute>} />
          <Route path="/scholarships" element={<ProtectedRoute><ScholarshipAgent /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><OpportunityAgent /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouteManager />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
