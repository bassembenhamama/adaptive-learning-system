import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { cn } from './utils';

import { LandingPage } from './views/landing/LandingPage';
import { AuthView } from './views/auth/AuthView';
import { ProfileView } from './views/shared/ProfileView';
import { LearnerDashboard } from './views/learner/LearnerDashboard';
import { LearnerCatalog } from './views/learner/LearnerCatalog';
import { CoursePlayer } from './views/learner/CoursePlayer';
import { InstructorDashboard } from './views/instructor/InstructorDashboard';
import { CourseBuilder } from './views/instructor/CourseBuilder';
import { AdminDashboard } from './views/admin/AdminDashboard';

/** Redirect authenticated users away from public pages */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/** Redirect unauthenticated users to the landing page */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthenticatedLayout = () => {
  const { isDark } = useTheme();

  return (
    <div className={cn("min-h-screen flex transition-colors duration-400", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}>
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden max-h-screen">
        <header className="flex justify-between items-center mb-6 shrink-0 relative z-20">
          <button className="lg:hidden w-10 h-10 glass-panel rounded-xl flex items-center justify-center">
            <Menu className="w-5 h-5 text-slate-700 dark:text-white" />
          </button>
          <div className="hidden lg:flex items-center gap-2" />
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-y-auto pb-8 pr-2">
          <DashboardRoutes />
        </div>
      </main>
    </div>
  );
};

const DashboardRoutes = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return (
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    case 'INSTRUCTOR':
      return (
        <Routes>
          <Route path="/dashboard" element={<InstructorDashboard />} />
          <Route path="/course/:id/edit" element={<CourseBuilder />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    default:
      return (
        <Routes>
          <Route path="/dashboard" element={<LearnerDashboard />} />
          <Route path="/catalog" element={<LearnerCatalog />} />
          <Route path="/course/:id" element={<CoursePlayer />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
  }
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}>
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes — only accessible when NOT logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <div className={cn("min-h-screen", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}>
              <LandingPage />
            </div>
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <div className={cn("min-h-screen", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}>
              <AuthView initialMode="login" />
            </div>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <div className={cn("min-h-screen", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}>
              <AuthView initialMode="register" />
            </div>
          </PublicRoute>
        }
      />

      {/* Protected routes — all go through authenticated layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
