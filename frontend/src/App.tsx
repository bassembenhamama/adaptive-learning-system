import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { ErrorBoundary } from 'react-error-boundary';
import { FallbackUI } from './components/ui/FallbackUI';
import { cn } from './utils';

// Lazy load views for code splitting
const LandingPage = lazy(() => import('./views/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthView = lazy(() => import('./views/auth/AuthView').then(m => ({ default: m.AuthView })));
const ProfileView = lazy(() => import('./views/shared/ProfileView').then(m => ({ default: m.ProfileView })));
const LearnerDashboard = lazy(() => import('./views/learner/LearnerDashboard').then(m => ({ default: m.LearnerDashboard })));
const LearnerCatalog = lazy(() => import('./views/learner/LearnerCatalog').then(m => ({ default: m.LearnerCatalog })));
const CoursePlayer = lazy(() => import('./views/learner/CoursePlayer').then(m => ({ default: m.CoursePlayer })));
const InstructorDashboard = lazy(() => import('./views/instructor/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })));
const CourseBuilder = lazy(() => import('./views/instructor/CourseBuilder').then(m => ({ default: m.CourseBuilder })));
const AdminDashboard = lazy(() => import('./views/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

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
          <ErrorBoundary FallbackComponent={FallbackUI}>
            <DashboardRoutes />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

const DashboardRoutes = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Suspense fallback={<LoadingSpinner size="lg" label="Loading..." className="mt-32" />}>
      {user.role === 'ADMIN' ? (
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      ) : user.role === 'INSTRUCTOR' ? (
        <Routes>
          <Route path="/dashboard" element={<InstructorDashboard />} />
          <Route path="/course/:id/edit" element={<CourseBuilder />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/dashboard" element={<LearnerDashboard />} />
          <Route path="/catalog" element={<LearnerCatalog />} />
          <Route path="/course/:id" element={<CoursePlayer />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </Suspense>
  );
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
    <Suspense fallback={<div className={cn("min-h-screen", isDark ? "bg-mesh-dark dark" : "bg-mesh-light")}><LoadingSpinner size="lg" label="Loading..." className="pt-32" /></div>}>
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
    </Suspense>
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
