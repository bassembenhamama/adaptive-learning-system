import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 glass-panel rounded-xl flex items-center justify-center hover:scale-105 transition-transform ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun className="w-4 h-4 text-slate-400 hover:text-amber-400" />
        : <Moon className="w-4 h-4 text-slate-500" />
      }
    </button>
  );
};
