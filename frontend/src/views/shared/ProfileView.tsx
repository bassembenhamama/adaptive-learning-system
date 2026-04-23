import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Save, CheckCircle, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { Input } from '../../components/ui/Input';
import { ActionButton } from '../../components/ui/ActionButton';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import api from '../../services/api';

export const ProfileView = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // 6-K: Danger Zone state
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  if (!user) return null;

  const ROLE_COLORS: Record<string, string> = {
    ADMIN:      'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
    INSTRUCTOR: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    LEARNER:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);
    try {
      await authService.updateProfile(name, email);
      await refreshUser();
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (newPassword.length < 6) {
      setPwErr('New password must be at least 6 characters.');
      return;
    }
    setSavingPw(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPwMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwErr(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  // 6-K: account self-deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteErr('');
    try {
      await api.delete('/users/me');
      // Backend cleared the JWT cookie in the response.
      // Hard-redirect forces a full session reset without a second API call.
      window.location.href = '/login';
    } catch (err: any) {
      setDeleteErr(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage your account details and security.</p>
      </div>

      {/* Profile Info Card */}
      <GlassContainer className="p-0 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-end px-8 pb-0 relative">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 flex items-center justify-center font-extrabold text-emerald-600 dark:text-emerald-400 text-xl translate-y-8 shadow-lg">
            {user.initials}
          </div>
        </div>
        <div className="px-8 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
            {/* 6-K: Role badge (colour-coded by role) */}
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${ROLE_COLORS[user.role] || ROLE_COLORS.LEARNER}`}>
              {user.role}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </GlassContainer>

      {/* Edit Profile */}
      <GlassContainer className="p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <Input
            label="Full Name"
            icon={User}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          {profileErr && <p className="text-sm text-red-500 font-medium">{profileErr}</p>}
          {profileMsg && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" /> {profileMsg}
            </div>
          )}
          <ActionButton type="submit" disabled={savingProfile}>
            <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Changes'}
          </ActionButton>
        </form>
      </GlassContainer>

      {/* Change Password */}
      <GlassContainer className="p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <Input
            label="Current Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            icon={Lock}
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            required
          />
          {pwErr && <p className="text-sm text-red-500 font-medium">{pwErr}</p>}
          {pwMsg && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" /> {pwMsg}
            </div>
          )}
          <ActionButton type="submit" variant="secondary" disabled={savingPw}>
            <Lock className="w-4 h-4" /> {savingPw ? 'Updating...' : 'Update Password'}
          </ActionButton>
        </form>
      </GlassContainer>

      {/* 6-K: Danger Zone — collapsible */}
      <GlassContainer className="p-0 overflow-hidden border border-red-200 dark:border-red-500/20">
        <button
          id="danger-zone-toggle"
          onClick={() => setDangerZoneOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">Danger Zone</p>
              <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">Irreversible and destructive actions</p>
            </div>
          </div>
          <motion.div animate={{ rotate: dangerZoneOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-red-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {dangerZoneOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8 pt-0 space-y-5 border-t border-red-100 dark:border-red-500/10">
                <div className="pt-5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Delete Account</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>

                  {deleteErr && (
                    <p className="text-sm text-red-500 font-medium mb-3">{deleteErr}</p>
                  )}

                  {!confirmDelete ? (
                    <ActionButton
                      id="delete-account-btn"
                      variant="danger"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete My Account
                    </ActionButton>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Are you absolutely sure? This cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <ActionButton
                          id="delete-account-confirm-btn"
                          variant="danger"
                          disabled={deleting}
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting ? 'Deleting...' : 'Yes, delete my account'}
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassContainer>
    </motion.div>
  );
};
