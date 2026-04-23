import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Props {
  onClick: () => void;
  hasUnread: boolean;
}

/**
 * AITutorFAB — Floating Action Button that opens the AI Chat overlay.
 * Renders in the bottom-right corner; does not overlap the chat panel itself
 * (the panel renders just above / beside it).
 */
export const AITutorFAB: React.FC<Props> = ({ onClick, hasUnread }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        <button
          id="ai-tutor-fab"
          type="button"
          onClick={onClick}
          aria-label="Open AI Tutor"
          className="
            w-14 h-14 rounded-2xl
            bg-gradient-to-br from-emerald-500 to-teal-600
            shadow-lg shadow-emerald-500/30
            flex items-center justify-center
            text-white
            hover:from-emerald-400 hover:to-teal-500
            hover:shadow-xl hover:shadow-emerald-500/40
            hover:scale-105
            active:scale-95
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
          "
        >
          <Sparkles className="w-6 h-6" />
        </button>

        {/* Unread / attention badge */}
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute -top-1.5 -right-1.5
              w-4 h-4 rounded-full
              bg-amber-400 border-2 border-white dark:border-slate-900
            "
            aria-label="Needs attention"
          />
        )}
      </div>
    </motion.div>
  );
};
