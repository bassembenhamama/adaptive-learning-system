import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, LogIn, User, ArrowLeft } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { Input } from '../../components/ui/Input';
import { ActionButton } from '../../components/ui/ActionButton';
import { ALSLogo } from '../../components/ui/ALSLogo';
import { useAuth } from '../../context/AuthContext';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
}

export const AuthView = ({ initialMode = 'login' }: AuthViewProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data;
      if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError(mode === 'login' ? 'Invalid email or password.' : 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-400/10 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-20"
      >
        {/* Back to Landing */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5 border border-white/20">
            <ALSLogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">
            {mode === 'login'
              ? 'Log in to continue your learning journey.'
              : 'Join the Adaptive Learning System for free.'
            }
          </p>
        </div>

        <GlassContainer className="p-8 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    label="Full Name"
                    icon={User}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email"
              icon={Mail}
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setError(''); }}
              error={error}
              required
            />

            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />

            <ActionButton
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </ActionButton>
          </form>
        </GlassContainer>
      </motion.div>
    </div>
  );
};
