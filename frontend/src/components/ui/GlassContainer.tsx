import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

export const GlassContainer = ({ children, className, hover = false, onClick }: any) => (
  <motion.div 
    onClick={onClick} 
    whileHover={hover ? { y: -2 } : {}} 
    className={cn("glass-panel inner-glow rounded-3xl p-6 transition-all duration-300", hover && "cursor-pointer hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/30", className)}
  >
    {children}
  </motion.div>
);
