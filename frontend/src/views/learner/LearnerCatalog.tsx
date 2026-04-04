import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, CheckCircle, PlayCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { Badge } from '../../components/ui/Badge';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import type { Course, Enrollment } from '../../types';

export const LearnerCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      courseService.getAll(),
      enrollmentService.getMyEnrollments()
    ])
      .then(([coursesData, enrollmentsData]) => {
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      await enrollmentService.enroll(courseId);
      navigate(`/course/${courseId}`);
    } catch {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading courses..." className="mt-32" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Course Catalog</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Browse and enroll in available courses.</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            icon={Search}
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map(c => {
          const isEnrolled = enrollments.some(e => e.course?.id === c.id);
          return (
            <GlassContainer
              key={c.id}
              className="flex flex-col h-full p-0 overflow-hidden group border-slate-200 dark:border-white/10"
            >
              <div className={`h-36 w-full bg-gradient-to-br relative p-5 flex flex-col justify-between transition-transform duration-500 group-hover:scale-[1.03] ${c.gradient || 'from-emerald-600 to-teal-700'}`}>
                <div className="flex justify-between items-start">
                  <Badge
                    color="slate"
                    className="bg-white/20 text-white border-white/30 backdrop-blur-md shadow-sm"
                  >
                    {c.category}
                  </Badge>
                  {isEnrolled && (
                    <div className="bg-emerald-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <BookOpen className="w-12 h-12 text-white/30 absolute bottom-4 right-4" />
              </div>
              <div className="p-6 flex-1 flex flex-col bg-white/40 dark:bg-slate-900/40 z-10 relative">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{c.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-6">{c.description}</p>
                {isEnrolled ? (
                  <ActionButton className="w-full" onClick={() => navigate(`/course/${c.id}`)}>
                    Resume Learning <PlayCircle className="w-4 h-4 ml-2" />
                  </ActionButton>
                ) : (
                  <ActionButton
                    variant="secondary"
                    className="w-full border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    onClick={() => enroll(c.id)}
                    disabled={enrollingId === c.id}
                  >
                    {enrollingId === c.id ? 'Enrolling...' : 'Enroll in Course'}
                  </ActionButton>
                )}
              </div>
            </GlassContainer>
          );
        })}
        {filteredCourses.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={Search}
              title="No courses found"
              description="Try adjusting your search terms."
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
