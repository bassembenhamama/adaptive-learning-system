import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, BrainCircuit, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotifications';
import type { NotificationDTO } from '../../types';
import { cn } from '../../utils';
import { useNavigate } from 'react-router-dom';

/** Task 12-L — Notification Bell with dropdown panel for the Sidebar */
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDismiss = (id: string) => {
    markRead(id);
  };

  const handleViewInAiTutor = (notification: NotificationDTO) => {
    markRead(notification.id);
    setOpen(false);
    if (notification.enrollmentId && notification.moduleId) {
      // Navigate to course — CoursePlayer uses enrollmentId to find courseId
      // We navigate to /dashboard so the learner can open the course from there
      navigate('/dashboard');
    }
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all relative',
          open
            ? 'text-violet-700 dark:text-violet-400'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Active background */}
        {open && (
          <motion.div
            layoutId="navbg-bell"
            className="absolute inset-0 bg-violet-50 dark:bg-violet-500/10 rounded-xl"
          />
        )}

        {/* Icon + badge */}
        <div className="relative z-10 shrink-0">
          <Bell className="w-4 h-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-white dark:border-slate-900 leading-none"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <span className="relative z-10">Notifications</span>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 ml-3 w-80 z-[60] rounded-2xl border border-white/30 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-300/40 dark:shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-center px-6">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-400">No new notifications.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onDismiss={() => handleDismiss(n.id)}
                    onView={() => handleViewInAiTutor(n)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Notification Card ─────────────────────────────────────────────────────────

interface CardProps {
  notification: NotificationDTO;
  onDismiss: () => void;
  onView: () => void;
}

const NotificationCard: React.FC<CardProps> = ({ notification, onDismiss, onView }) => {
  const isRemediation = notification.type === 'REMEDIATION';
  const preview = notification.content.replace(/[#*`_]/g, '').slice(0, 150);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'px-4 py-3 group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors',
        !notification.readStatus && 'bg-violet-50/50 dark:bg-violet-500/5',
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {isRemediation ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {notification.moduleTitle ?? (isRemediation ? 'Remediation' : 'Recommendation')}
          </span>
        </div>
        <button
          onClick={onDismiss}
          title="Dismiss"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-red-500"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content preview */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-2.5">
        {preview}{preview.length === 150 ? '…' : ''}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isRemediation && notification.enrollmentId && (
          <button
            onClick={onView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            View in AI Tutor
          </button>
        )}
        <button
          onClick={onDismiss}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
};
