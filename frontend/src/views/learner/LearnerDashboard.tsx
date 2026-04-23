import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, TrendingUp, Clock, PlayCircle, ChevronRight,
  CheckCircle, AlertTriangle, Compass, Sparkles,
} from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { RemediationAlert } from '../../components/ui/RemediationAlert';
import { useAuth } from '../../context/AuthContext';
import { useEnrollments } from '../../hooks/useEnrollments';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from '../../types';

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const { data: enrollments = [], isLoading: loading, error: queryError } = useEnrollments();
  const { data: recommendations = [] } = useRecommendations();
  // 6-I: track dismissed alert IDs in component state (session-only)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const error = queryError ? 'Failed to load your courses. Please refresh.' : '';

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading your dashboard..." className="mt-32" />;
  }

  const getModuleProgress = (enrollment: Enrollment) => {
    const completed = enrollment.completedModuleIds
      ? enrollment.completedModuleIds.split(',').filter(Boolean).length
      : 0;
    const total = enrollment.courseModules?.length || 0;
    return { completed, total };
  };

  const getProgressPct = (enrollment: Enrollment) => {
    const { completed, total } = getModuleProgress(enrollment);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // 6-I: find first enrollment needing remediation that hasn't been dismissed
  const remediationEnrollment = enrollments.find(
    e =>
      e.masteryState === 'NEEDS_REMEDIATION' &&
      !dismissedAlertIds.includes(e.id),
  );

  const handleDismiss = (enrollmentId: string) => {
    setDismissedAlertIds(prev => [...prev, enrollmentId]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Track your learning progress and continue where you left off.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 6-I: Remediation Alert */}
      <AnimatePresence>
        {remediationEnrollment && (
          <RemediationAlert
            key={remediationEnrollment.id}
            courseName={remediationEnrollment.courseTitle}
            moduleName="this module"
            onDismiss={() => handleDismiss(remediationEnrollment.id)}
            onStudy={() => {
              // Stub — will navigate to AI Tutor in Phase 11
              handleDismiss(remediationEnrollment.id);
            }}
          />
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{enrollments.length}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Enrolled Courses</p>
          </div>
        </GlassContainer>

        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {enrollments.length > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + getProgressPct(e), 0) / enrollments.length)
                : 0}%
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg. Progress</p>
          </div>
        </GlassContainer>

        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {enrollments.filter(e => getProgressPct(e) === 100).length}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Completed</p>
          </div>
        </GlassContainer>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Courses</h3>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Browse the catalog to find courses and start learning."
          >
            <ActionButton onClick={() => navigate('/catalog')}>Browse Catalog</ActionButton>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {enrollments.map(enrollment => {
              const progress = getProgressPct(enrollment);
              const { completed, total } = getModuleProgress(enrollment);
              const mastery = enrollment.masteryState;

              return (
                <GlassContainer
                  key={enrollment.id}
                  hover
                  onClick={() => navigate(`/course/${enrollment.courseId}`)}
                  className="p-5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 6-J: course name + mastery badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">
                          {enrollment.courseTitle}
                        </h4>
                        {mastery === 'MASTERED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Mastered
                          </span>
                        )}
                        {mastery === 'NEEDS_REMEDIATION' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Needs Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {enrollment.courseCategory}
                      </p>
                      {/* 6-J: progress bar + X of Y modules text */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-10 text-right">
                          {progress}%
                        </span>
                      </div>
                      {/* X of Y modules complete */}
                      {total > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1.5">
                          {completed} of {total} module{total !== 1 ? 's' : ''} complete
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        {progress === 100 ? (
                          <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </GlassContainer>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations Section — FR-V07 */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recommended for you</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(course => (
              <GlassContainer
                key={course.id}
                hover
                className="p-5 cursor-pointer group overflow-hidden relative"
                onClick={() => navigate('/catalog')}
              >
                {/* Decorative gradient orb */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 blur-2xl"
                  style={{ background: course.gradient ?? 'linear-gradient(135deg,#10b981,#0ea5e9)' }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: course.gradient ?? 'linear-gradient(135deg,#10b981,#0ea5e9)' }}
                    >
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    {course.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-3 line-clamp-2">
                    {course.title}
                  </h4>
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/catalog'); }}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group-hover:underline"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Explore
                  </button>
                </div>
              </GlassContainer>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
