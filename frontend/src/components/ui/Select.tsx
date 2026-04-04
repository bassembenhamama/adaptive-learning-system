import React from 'react';

export const Select = ({ label, options, value, onChange }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">{label}</label>}
    <select value={value} onChange={onChange} className="w-full h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white appearance-none transition-all">
      {options.map((opt: any) => <option key={opt.value} value={opt.value} className="text-slate-900">{opt.label}</option>)}
    </select>
  </div>
);
