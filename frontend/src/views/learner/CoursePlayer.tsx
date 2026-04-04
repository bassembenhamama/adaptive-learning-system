import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, FileText, HelpCircle, RotateCcw, Video } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import type { Course, Module, Enrollment, QuizQuestion } from '../../types';

export const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [courseData, enrollments] = await Promise.all([
        courseService.getById(id),
        enrollmentService.getMyEnrollments()
      ]);
      setCourse(courseData);
      const myEnrollment = enrollments.find(e => e.course?.id === id);
      setEnrollment(myEnrollment || null);
    } catch {} finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading course..." className="mt-32" />;
  }

  if (!course) {
    return (
      <div className="text-center p-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Course not found.</p>
        <ActionButton className="mt-4" onClick={() => navigate('/dashboard')}>Go Back</ActionButton>
      </div>
    );
  }

  const modules = (course.modules || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentModule: Module | undefined = modules[currentIndex];
  const completedIds = enrollment?.completedModuleIds?.split(',').filter(Boolean) || [];
  const isCurrentCompleted = currentModule ? completedIds.includes(currentModule.id) : false;

  const handleModuleComplete = async () => {
    if (!enrollment || !currentModule || completing) return;
    setCompleting(true);
    try {
      const updated = await enrollmentService.completeModule(enrollment.id, currentModule.id);
      setEnrollment(updated);
    } catch {} finally {
      setCompleting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentModule?.questionsJson) return;
    let questions: QuizQuestion[];
    try {
      questions = JSON.parse(currentModule.questionsJson);
    } catch {
      return;
    }
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (enrollment && currentModule.threshold !== undefined) {
      try {
        const updated = await enrollmentService.completeModule(
          enrollment.id,
          currentModule.id,
          score,
          currentModule.threshold
        );
        setEnrollment(updated);
      } catch {}
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const switchModule = (idx: number) => {
    setCurrentIndex(idx);
    resetQuiz();
  };

  const goNext = () => {
    if (currentIndex < modules.length - 1) switchModule(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) switchModule(currentIndex - 1);
  };

  const getFileUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  };

  const renderModuleContent = () => {
    if (!currentModule) return null;

    // Quiz content
    if (currentModule.type === 'quiz' && currentModule.questionsJson) {
      let questions: QuizQuestion[];
      try {
        questions = JSON.parse(currentModule.questionsJson);
      } catch {
        return <p className="text-red-500">Invalid quiz data.</p>;
      }
      const passed = quizScore !== null && currentModule.threshold !== undefined && quizScore >= currentModule.threshold;

      return (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <GlassContainer key={qIdx} className="p-6">
              <p className="font-bold text-slate-900 dark:text-white mb-4">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[qIdx] === oIdx;
                  const isCorrect = quizSubmitted && q.correct === oIdx;
                  const isWrong = quizSubmitted && isSelected && q.correct !== oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : isWrong
                            ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400'
                            : isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-500/30'
                      }`}
                    >
                      <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0
                        border-current opacity-60">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </GlassContainer>
          ))}

          {!quizSubmitted ? (
            <ActionButton
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < questions.length}
              className="w-full"
              size="lg"
            >
              Submit Answers
            </ActionButton>
          ) : (
            <GlassContainer className="p-8 text-center space-y-4">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Score: {quizScore}%
              </p>
              <p className={`text-sm font-semibold ${passed
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
              }`}>
                {passed
                  ? '✓ Passed! Great job.'
                  : `✗ You need ${currentModule.threshold}% to pass.`
                }
              </p>
              {!passed && (
                <ActionButton variant="secondary" onClick={resetQuiz}>
                  <RotateCcw className="w-4 h-4" /> Retry Quiz
                </ActionButton>
              )}
            </GlassContainer>
          )}
        </div>
      );
    }

    // Video content
    if (currentModule.type === 'video' && currentModule.contentUrl) {
      return (
        <GlassContainer className="p-0 overflow-hidden">
          <video
            key={currentModule.id}
            controls
            className="w-full rounded-2xl"
            style={{ maxHeight: '70vh' }}
          >
            <source src={getFileUrl(currentModule.contentUrl)} />
            Your browser does not support the video tag.
          </video>
          {!isCurrentCompleted && (
            <div className="p-6">
              <ActionButton onClick={handleModuleComplete} disabled={completing}>
                <CheckCircle className="w-4 h-4" /> {completing ? 'Saving...' : 'Mark as Complete'}
              </ActionButton>
            </div>
          )}
        </GlassContainer>
      );
    }

    // PDF content
    if (currentModule.type === 'pdf' && currentModule.contentUrl) {
      return (
        <GlassContainer className="p-0 overflow-hidden">
          <iframe
            key={currentModule.id}
            src={getFileUrl(currentModule.contentUrl)}
            className="w-full rounded-2xl border-0"
            style={{ height: '75vh' }}
            title={currentModule.title}
          />
          {!isCurrentCompleted && (
            <div className="p-6">
              <ActionButton onClick={handleModuleComplete} disabled={completing}>
                <CheckCircle className="w-4 h-4" /> {completing ? 'Saving...' : 'Mark as Complete'}
              </ActionButton>
            </div>
          )}
        </GlassContainer>
      );
    }

    // Text content (default)
    return (
      <GlassContainer className="p-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {currentModule.contentUrl || 'No content available for this module yet.'}
          </p>
        </div>
        {!isCurrentCompleted && (
          <div className="mt-8">
            <ActionButton onClick={handleModuleComplete} disabled={completing}>
              <CheckCircle className="w-4 h-4" /> {completing ? 'Saving...' : 'Mark as Complete'}
            </ActionButton>
          </div>
        )}
      </GlassContainer>
    );
  };

  const overallProgress = modules.length > 0
    ? Math.round((completedIds.length / modules.length) * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ActionButton variant="ghost" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="w-4 h-4" /> Back
        </ActionButton>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{course.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Module {currentIndex + 1} of {modules.length}
            </p>
            <div className="flex-1 max-w-32 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Module Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Module List */}
        <GlassContainer className="p-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 px-2">Modules</h3>
          <div className="space-y-1">
            {modules.map((mod, idx) => {
              const isComplete = completedIds.includes(mod.id);
              const isCurrent = idx === currentIndex;
              const ModIcon = mod.type === 'quiz' ? HelpCircle : mod.type === 'pdf' ? FileText : mod.type === 'video' ? Video : BookOpen;
              return (
                <button
                  key={mod.id}
                  onClick={() => switchModule(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ModIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{mod.title}</span>
                </button>
              );
            })}
          </div>
        </GlassContainer>

        {/* Content Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentModule?.title}</h3>
            {isCurrentCompleted && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </div>
          {renderModuleContent()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <ActionButton variant="secondary" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </ActionButton>
            <ActionButton variant="secondary" onClick={goNext} disabled={currentIndex === modules.length - 1}>
              Next <ChevronRight className="w-4 h-4" />
            </ActionButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
