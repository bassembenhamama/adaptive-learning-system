import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("flex flex-col items-center justify-center p-16 space-y-4 text-center", className)}
  >
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
        <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
    )}
    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h2>
    {description && <p className="text-slate-500 dark:text-slate-400 max-w-md">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
  </motion.div>
);
