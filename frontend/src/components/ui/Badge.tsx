import React from 'react';
import { cn } from '../../utils';

export const Badge = ({ children, color = 'emerald', className }: any) => (
  <span className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border', 
    `bg-${color}-50 text-${color}-700 dark:bg-${color}-500/10 dark:text-${color}-400 border-${color}-200 dark:border-${color}-500/20`, className)}>
    {children}
  </span>
);
