import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn("border-2 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full", sizes[size])}
      />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
};
