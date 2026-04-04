import React from 'react';
import { cn } from '../../utils';

export const ALSLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L20 45 L35 45 L35 85 L50 70 L50 15Z" fill="currentColor" opacity="0.9" />
    <path d="M50 15 L80 45 L65 45 L65 85 L50 70 L50 15Z" fill="currentColor" opacity="0.6" />
    <path d="M50 15 L50 70" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.3"/>
  </svg>
);
