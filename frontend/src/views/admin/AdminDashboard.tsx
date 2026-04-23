import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAdminUsers, useAdminStats, useUpdateUserRole, useDeleteUser } from '../../hooks/useAdmin';
import type { User } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
  INSTRUCTOR: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  LEARNER: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
};

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: userData, isLoading: usersLoading } = useAdminUsers(page, size);
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { mutate: updateRole, isPending: changingRole } = useUpdateUserRole();
  const { mutate: deleteUser } = useDeleteUser();

  const users = userData?.content || [];
  const loading = usersLoading || statsLoading;

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole({ userId, role: newRole });
  };

  const handleDelete = (userId: number) => {
    if (userId === currentUser?.id) return;
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading users..." className="mt-32" />;
  }

  const adminsCount = stats?.totalAdmins ?? users.filter(u => u.role === 'ADMIN').length;
  const instructorsCount = stats?.totalInstructors ?? users.filter(u => u.role === 'INSTRUCTOR').length;
  const learnersCount = stats?.totalLearners ?? users.filter(u => u.role === 'LEARNER').length;

  const totalPages = userData?.totalPages || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage accounts and assign roles across the platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{adminsCount}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Administrators</p>
          </div>
        </GlassContainer>

        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{instructorsCount}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Instructors</p>
          </div>
        </GlassContainer>

        <GlassContainer className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{learnersCount}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Learners</p>
          </div>
        </GlassContainer>
      </div>

      {/* User Table */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Users will appear here once they register." />
        ) : (
          <>
            <GlassContainer className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                      <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-white">
                              {u.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-slate-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={u.id === currentUser?.id || changingRole}
                              className={`appearance-none px-3 py-1.5 pr-8 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ROLE_COLORS[u.role] || ROLE_COLORS.LEARNER}`}
                            >
                              <option value="LEARNER">Learner</option>
                              <option value="INSTRUCTOR">Instructor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.id !== currentUser?.id && (
                            <ActionButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(u.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </ActionButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassContainer>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <p className="text-xs text-slate-500 font-medium">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </ActionButton>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </ActionButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
