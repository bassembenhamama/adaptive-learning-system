import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, BarChart3, BookOpen, MessageCircle, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { ALSLogo } from '../../components/ui/ALSLogo';
import { ActionButton } from '../../components/ui/ActionButton';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const features = [
  {
    icon: Brain,
    title: 'Adaptive Learning Paths',
    description: 'The system dynamically adjusts content difficulty based on each learner\'s performance, ensuring an optimal challenge level at every step.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Instructors get live dashboards showing cohort progress, module completion rates, and individual learner mastery levels.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: MessageCircle,
    title: 'AI Tutoring Assistant',
    description: 'A context-aware chatbot grounded in course materials provides instant, factually accurate answers to learner questions.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BookOpen,
    title: 'Modular Course Builder',
    description: 'Create rich courses with text lessons, document resources, and interactive quizzes — all with a visual drag-and-drop editor.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Secure, granular permissions for Learners, Instructors, and Administrators — each with their own tailored workspace.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Proactive Remediation',
    description: 'When a learner struggles, the system automatically generates simplified explanations and recommends review materials.',
    gradient: 'from-cyan-500 to-sky-600',
  },
];

const stats = [
  { value: '3', label: 'User Roles' },
  { value: '∞', label: 'Courses' },
  { value: 'AI', label: 'Powered' },
  { value: '24/7', label: 'Available' },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Navigation ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <GlassContainer className="px-6 py-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm border border-white/20">
                <ALSLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">ALS</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-wider hidden sm:inline">Adaptive Learning System</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ActionButton variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log In
              </ActionButton>
              <ActionButton size="sm" onClick={() => navigate('/register')}>
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </ActionButton>
            </div>
          </GlassContainer>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-emerald-400/15 dark:bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-400/15 dark:bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">AI-Powered Education Platform</span>
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
          >
            Personalized education,{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              powered by intelligence
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A modular learning management system that dynamically adapts to each
            learner's pace, powered by AI tutoring and real-time performance analytics.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ActionButton size="lg" onClick={() => navigate('/register')} className="px-10 shadow-lg shadow-emerald-500/25">
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </ActionButton>
            <ActionButton variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Log In to Dashboard
            </ActionButton>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <GlassContainer className="p-0 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 dark:divide-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 sm:p-8 text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </GlassContainer>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                modern education
              </span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built on a Software Product Line architecture, combining a robust LMS core with intelligent, adaptive extensions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <GlassContainer hover className="h-full p-8 flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{feature.description}</p>
                </GlassContainer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to transform your learning experience?
              </h2>
              <p className="text-lg text-white/80 max-w-lg mx-auto mb-8">
                Join the platform that adapts to you. Start building courses or learning at your own pace — for free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ActionButton
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-white text-emerald-700 hover:bg-white/90 shadow-xl shadow-black/10 px-10"
                >
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </ActionButton>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 pb-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <ALSLogo className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Adaptive Learning System</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            University of Constantine 2 · NTIC Department · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};
