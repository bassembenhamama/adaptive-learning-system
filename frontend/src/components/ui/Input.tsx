import React from 'react';
import { cn } from '../../utils';

export const Input = ({ icon: Icon, label, className, error, ...props }: any) => (
  <div className={cn("space-y-1.5 w-full", className)}>
    {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />}
      <input className={cn("w-full h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50", Icon ? "pl-11 pr-4" : "px-4", error && "border-red-500 focus:border-red-500 focus:ring-red-500/20")} {...props} />
    </div>
    {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
  </div>
);
