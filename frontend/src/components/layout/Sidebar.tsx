import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';
import { LayoutDashboard, User, Search, BarChart3, LogOut, BookOpen, Shield } from 'lucide-react';
import { ALSLogo } from '../ui/ALSLogo';
import { GlassContainer } from '../ui/GlassContainer';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { id: '/dashboard', icon: Shield, label: 'User Management' },
          { id: '/profile', icon: User, label: 'Profile' },
        ];
      case 'INSTRUCTOR':
        return [
          { id: '/dashboard', icon: BarChart3, label: 'My Courses' },
          { id: '/profile', icon: User, label: 'Profile' },
        ];
      default:
        return [
          { id: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: '/catalog', icon: Search, label: 'Catalog' },
          { id: '/profile', icon: User, label: 'Profile' },
        ];
    }
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed lg:static inset-y-0 left-0 w-[260px] z-50 p-4 sm:p-6 transition-transform duration-500 lg:translate-x-0">
      <GlassContainer className="h-full flex flex-col p-5 bg-white/80 dark:bg-slate-900/80">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm border border-white/20">
            <ALSLogo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">ALS</h1>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">Learning System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <LayoutGroup>
            {navItems.map(item => {
              const active = isActive(item.id);
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all relative",
                    active
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="navbg"
                      className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
                    />
                  )}
                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </LayoutGroup>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.initials}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </GlassContainer>
    </aside>
  );
};
