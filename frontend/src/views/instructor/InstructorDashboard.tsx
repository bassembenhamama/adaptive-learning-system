import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Users, Trash2, Edit, AlertCircle, X } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { courseService } from '../../services/courseService';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types';

const GRADIENTS = [
  'from-emerald-600 to-teal-700',
  'from-blue-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-cyan-600 to-sky-700',
];

export const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCourses = () => {
    courseService.getInstructorCourses()
      .then(setCourses)
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTitle.trim()) {
      setError('Course title is required.');
      return;
    }
    setCreating(true);
    try {
      const gradient = GRADIENTS[courses.length % GRADIENTS.length];
      await courseService.create({
        title: newTitle,
        category: newCategory || 'General',
        description: newDesc,
        gradient,
      });
      setNewTitle('');
      setNewCategory('');
      setNewDesc('');
      setShowCreate(false);
      fetchCourses();
    } catch {
      setError('Failed to create course. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await courseService.remove(id);
      setCourses(courses.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('Failed to delete course.');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading your courses..." className="mt-32" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Courses</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Create, manage, and monitor your courses.</p>
        </div>
        <ActionButton onClick={() => { setShowCreate(!showCreate); setError(''); }}>
          <Plus className="w-4 h-4" /> Create Course
        </ActionButton>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Course Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassContainer className="p-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">New Course</h3>
              <form onSubmit={handleCreate} className="space-y-5">
                <Input
                  label="Course Title"
                  placeholder="e.g., Software Architecture Fundamentals"
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  required
                />
                <Input
                  label="Category"
                  placeholder="e.g., Software Engineering"
                  value={newCategory}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Description</label>
                  <textarea
                    className="w-full h-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                    placeholder="A brief description of what learners will gain..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <ActionButton type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Course'}
                  </ActionButton>
                  <ActionButton type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                    Cancel
                  </ActionButton>
                </div>
              </form>
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start building content for your learners."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <GlassContainer key={course.id} className="flex flex-col h-full p-0 overflow-hidden group">
              <div className={`h-28 w-full bg-gradient-to-br relative p-5 flex flex-col justify-between ${course.gradient || 'from-emerald-600 to-teal-700'}`}>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-md">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1 text-white/70 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" /> {course.modules?.length || 0} modules
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col bg-white/40 dark:bg-slate-900/40 z-10 relative">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">{course.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex gap-2">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/course/${course.id}/edit`)}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </ActionButton>
                  {deleteConfirm === course.id ? (
                    <div className="flex gap-1">
                      <ActionButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        Confirm
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        No
                      </ActionButton>
                    </div>
                  ) : (
                    <ActionButton
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirm(course.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </ActionButton>
                  )}
                </div>
              </div>
            </GlassContainer>
          ))}
        </div>
      )}
    </motion.div>
  );
};
