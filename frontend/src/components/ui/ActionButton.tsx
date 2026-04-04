import React from 'react';
import { cn } from '../../utils';

export const ActionButton = ({ children, variant = 'primary', size='md', className, disabled, ...props }: any) => {
  const styles = {
    primary: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30',
    secondary: 'bg-white/60 dark:bg-white/5 text-slate-800 dark:text-white hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm',
    danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-emerald-400'
  };
  const sizes = { sm: 'h-9 px-4 text-xs', md: 'h-11 px-5 text-sm', lg: 'h-14 px-8 text-base' };
  return (
    <button disabled={disabled} className={cn('rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all', disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-[0.98]', styles[variant as keyof typeof styles], sizes[size as keyof typeof sizes], className)} {...props}>
      {children}
    </button>
  );
};
