import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, BookOpen, Bot } from 'lucide-react';

interface Props {
  courseName: string;
  moduleName: string;
  onDismiss: () => void;
  /** Non-functional stub until Phase 11 (AI Tutor integration). */
  onStudy: () => void;
}

/**
 * RemediationAlert — dismissible notification card shown on the learner
 * dashboard when a course has masteryState === 'NEEDS_REMEDIATION'.
 *
 * The "Ask AI Tutor" button is a non-functional stub until Phase 11.
 */
export const RemediationAlert: React.FC<Props> = ({
  courseName,
  moduleName,
  onDismiss,
  onStudy,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="alert"
      aria-live="polite"
      className="relative rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5 flex gap-4 shadow-sm"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
          You need to review a module
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5 leading-snug">
          You're struggling with{' '}
          <span className="font-semibold">{moduleName}</span> in{' '}
          <span className="font-semibold">{courseName}</span>.
          Getting some extra help can improve your mastery.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            id="remediation-ask-tutor-btn"
            onClick={onStudy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            Ask AI Tutor
          </button>
          <button
            id="remediation-course-link-btn"
            onClick={onDismiss}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Dismiss
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        id="remediation-dismiss-btn"
        onClick={onDismiss}
        aria-label="Dismiss remediation alert"
        className="shrink-0 self-start w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
