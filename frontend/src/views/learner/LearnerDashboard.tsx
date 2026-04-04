import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Clock, PlayCircle, ChevronRight } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { enrollmentService } from '../../services/enrollmentService';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from '../../types';

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    enrollmentService.getMyEnrollments()
      .then(setEnrollments)
      .catch(() => setError('Failed to load your courses. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading your dashboard..." className="mt-32" />;
  }

  const getProgress = (enrollment: Enrollment) => {
    const completed = enrollment.completedModuleIds ? enrollment.completedModuleIds.split(',').filter(Boolean).length : 0;
    const total = enrollment.course?.modules?.length || 1;
    return Math.round((completed / total) * 100);
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
                ? Math.round(enrollments.reduce((sum, e) => sum + getProgress(e), 0) / enrollments.length)
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
              {enrollments.filter(e => getProgress(e) === 100).length}
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
              const progress = getProgress(enrollment);
              return (
                <GlassContainer
                  key={enrollment.id}
                  hover
                  onClick={() => navigate(`/course/${enrollment.course?.id}`)}
                  className="p-5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">
                        {enrollment.course?.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {enrollment.course?.category}
                      </p>
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
    </motion.div>
  );
};
