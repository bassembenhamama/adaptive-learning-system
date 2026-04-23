import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, TrendingUp, AlertTriangle, BarChart2, Loader2 } from 'lucide-react';
import { GlassContainer } from './GlassContainer';
import { useCourseAnalytics } from '../../utils/useCourseAnalytics';

interface Props {
  courseId: string;
  onClose: () => void;
}

/**
 * Colour-codes a score percentage using three tiers:
 *  green  ≥ 70  •  amber ≥ 50  •  red < 50
 */
function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function StatBox({ icon: Icon, label, value, colorClass }: {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div>
        <p className={`text-xl font-extrabold ${colorClass}`}>{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

export const CourseAnalyticsPanel: React.FC<Props> = ({ courseId, onClose }) => {
  const { data, loading, error } = useCourseAnalytics(courseId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <GlassContainer className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {data ? data.courseTitle : 'Cohort Analytics'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Real-time learner performance overview
                </p>
              </div>
            </div>
            <button
              id="analytics-panel-close"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="Close analytics panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading analytics…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Content */}
          {data && !loading && (
            <>
              {/* Stat boxes */}
              <div className="flex gap-4 flex-wrap">
                <StatBox
                  icon={Users}
                  label="Total Enrolled"
                  value={String(data.totalEnrollments)}
                  colorClass="text-indigo-600 dark:text-indigo-400"
                />
                <StatBox
                  icon={TrendingUp}
                  label="Overall Avg Score"
                  value={`${data.overallAverageScore}%`}
                  colorClass={scoreColor(data.overallAverageScore)}
                />
              </div>

              {/* Module rows */}
              {data.modules.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No modules found for this course.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Per-Module Breakdown
                  </p>
                  {data.modules.map((mod, idx) => {
                    const pct = Math.min(100, Math.max(0, mod.averageScore));
                    const isStruggling =
                      mod.totalEnrollments > 0 &&
                      mod.failCount / mod.totalEnrollments > 0.5;

                    return (
                      <motion.div
                        key={mod.moduleId}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-white/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {mod.moduleTitle}
                            </span>
                            {isStruggling && (
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Struggling
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {mod.totalEnrollments} learners
                            </span>
                            <span className={`text-sm font-extrabold w-12 text-right ${scoreColor(mod.averageScore)}`}>
                              {mod.averageScore}%
                            </span>
                          </div>
                        </div>
                        {/* Score bar */}
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.05 }}
                            className={`h-full rounded-full ${scoreBg(mod.averageScore)}`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </GlassContainer>
      </motion.div>
    </AnimatePresence>
  );
};
