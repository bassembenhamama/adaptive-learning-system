import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { GlassContainer } from './GlassContainer';
import { ActionButton } from './ActionButton';

interface FallbackUIProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const FallbackUI: React.FC<FallbackUIProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <GlassContainer className="max-w-md w-full p-8 text-center space-y-6 border-red-200 dark:border-red-500/20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Error Details</p>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-words line-clamp-3">
            {error.message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton onClick={resetErrorBoundary} className="flex-1">
            <RefreshCcw className="w-4 h-4" /> Try Again
          </ActionButton>
          <ActionButton 
            variant="ghost" 
            onClick={() => window.location.href = '/'} 
            className="flex-1"
          >
            <Home className="w-4 h-4" /> Go Home
          </ActionButton>
        </div>
      </GlassContainer>
    </div>
  );
};
