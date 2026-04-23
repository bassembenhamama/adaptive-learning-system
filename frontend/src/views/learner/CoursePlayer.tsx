import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle, RotateCcw,
  HelpCircle, Zap, Lock, AlertTriangle, Brain,
  BookOpen, FileText, Video,
} from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AITutorFAB } from '../../components/ui/AITutorFAB';
import { AIChatUI } from '../../components/ui/AIChatUI';
import { AdaptiveAssessmentView } from './AdaptiveAssessmentView';
import { ModuleStatusButton } from '../../components/ui/ModuleStatusButton';
import { useCourse } from '../../hooks/useCourses';
import { useEnrollments, useCompleteModule } from '../../hooks/useEnrollments';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import type { Module, Enrollment, QuizQuestion } from '../../types';

// ── helpers ─────────────────────────────────────────────────────────────────

function getFileUrl(url: string) {
  return url.startsWith('http') ? url : `http://localhost:8080${url}`;
}

function ModuleTypeIcon({ type, className }: { type: Module['type']; className?: string }) {
  switch (type) {
    case 'quiz':  return <HelpCircle className={className} />;
    case 'pdf':   return <FileText   className={className} />;
    case 'video': return <Video      className={className} />;
    default:      return <BookOpen   className={className} />;
  }
}

// ── Task 9-E: Locked placeholder ─────────────────────────────────────────────

function LockedPlaceholder({
  reason,
  onGoBack,
}: {
  reason: string;
  onGoBack: () => void;
}) {
  return (
    <GlassContainer className="p-10 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
        <Lock className="w-7 h-7 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 dark:text-white">This module is locked</h4>
      {reason && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{reason}</p>
      )}
      <ActionButton variant="secondary" onClick={onGoBack}>
        <ChevronLeft className="w-4 h-4" /> Go back
      </ActionButton>
    </GlassContainer>
  );
}

// ── Task 9-F: Remediation-locked CTA ────────────────────────────────────────

function RemediationLockedCTA({
  reason,
  onAskTutor,
  onGoBack,
}: {
  reason: string;
  onAskTutor: () => void;
  onGoBack: () => void;
}) {
  return (
    <GlassContainer className="p-10 flex flex-col items-center text-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-amber-500" />
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">
          This module needs review first
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{reason}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="remediation-locked-ask-tutor-btn"
          type="button"
          onClick={() => {
            console.log('[Phase 11 stub] showAITutor → true (RemediationLockedCTA)');
            onAskTutor();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
            bg-amber-500 hover:bg-amber-600 text-white transition-colors"
        >
          <Brain className="w-4 h-4" />
          Ask AI Tutor for help
        </button>
        <ActionButton variant="secondary" onClick={onGoBack}>
          <ChevronLeft className="w-4 h-4" /> Go back
        </ActionButton>
      </div>
    </GlassContainer>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useCourse(id);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { mutate: completeModule, isPending: completing } = useCompleteModule();

  const enrollment: Enrollment | undefined = enrollments.find(e => e.courseId === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<'select' | 'standard' | 'adaptive'>('select');

  // Phase 11 stub — will open AI tutor overlay
  const [showAITutor, setShowAITutor] = useState(false);

  // Task 9-E/F: fetch access for the currently-viewed module (top-level hook call)
  const modules = (course?.modules || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentModule: Module | undefined = modules[currentIndex];

  const { data: currentAccess } = useModuleAccess(
    enrollment?.id ?? '',
    currentModule?.id ?? '',
  );

  const loading = courseLoading || enrollmentsLoading;

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

  const completedIds = enrollment?.completedModuleIds?.split(',').filter(Boolean) || [];
  const isCurrentCompleted = currentModule ? completedIds.includes(currentModule.id) : false;

  // 9-E/F: is the current module locked?
  const isCurrentLocked = !isCurrentCompleted && currentAccess !== undefined && !currentAccess.canAccess;
  const lockReason = currentAccess?.reason ?? '';
  const isRemediationLocked = isCurrentLocked && lockReason.toLowerCase().includes('tutor');

  const handleModuleComplete = () => {
    if (!enrollment || !currentModule || completing) return;
    completeModule({ enrollmentId: enrollment.id, moduleId: currentModule.id });
  };

  const handleQuizSubmit = () => {
    if (!currentModule?.questionsJson) return;
    let questions: QuizQuestion[];
    try { questions = JSON.parse(currentModule.questionsJson); } catch { return; }
    let correct = 0;
    questions.forEach((q, idx) => { if (quizAnswers[idx] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    if (enrollment && currentModule.threshold !== undefined) {
      completeModule({ enrollmentId: enrollment.id, moduleId: currentModule.id, score, threshold: currentModule.threshold });
    }
  };

  const resetQuiz = () => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); setQuizMode('select'); };

  const switchModule = (idx: number) => { setCurrentIndex(idx); resetQuiz(); };
  const goNext = () => { if (currentIndex < modules.length - 1) switchModule(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) switchModule(currentIndex - 1); };

  // ── render module body ─────────────────────────────────────────────────────

  const renderModuleContent = () => {
    if (!currentModule) return null;

    // 9-F: remediation-locked takes priority over generic locked
    if (isRemediationLocked) {
      return (
        <RemediationLockedCTA
          reason={lockReason}
          onAskTutor={() => setShowAITutor(true)}
          onGoBack={goPrev}
        />
      );
    }

    // 9-E: generic locked placeholder
    if (isCurrentLocked) {
      return <LockedPlaceholder reason={lockReason} onGoBack={goPrev} />;
    }

    // Quiz
    if (currentModule.type === 'quiz') {
      if (quizMode === 'select') {
        return (
          <GlassContainer className="p-8">
            <div className="text-center space-y-2 mb-8">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Choose Assessment Mode</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">How would you like to be assessed?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button id="quiz-mode-standard-btn" type="button" onClick={() => setQuizMode('standard')}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all text-left group">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                  <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Standard Quiz</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Answer all questions, see your score at the end.</p>
                </div>
              </button>
              <button id="quiz-mode-adaptive-btn" type="button" onClick={() => setQuizMode('adaptive')}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:border-violet-400 dark:hover:border-violet-500/40 hover:bg-violet-50 dark:hover:bg-violet-500/5 transition-all text-left group">
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 transition-colors">
                  <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Adaptive Assessment</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI-powered — questions adapt to your level in real time.</p>
                </div>
              </button>
            </div>
          </GlassContainer>
        );
      }

      if (quizMode === 'adaptive' && enrollment) {
        return (
          <AdaptiveAssessmentView
            enrollmentId={enrollment.id}
            moduleId={currentModule.id}
            moduleThreshold={currentModule.threshold ?? 70}
            onComplete={(passed, score) => {
              if (passed) completeModule({ enrollmentId: enrollment.id, moduleId: currentModule.id, score, threshold: currentModule.threshold });
              setQuizMode('select');
            }}
            onBack={() => setQuizMode('select')}
          />
        );
      }

      if (!currentModule.questionsJson) return <p className="text-slate-500 dark:text-slate-400">No questions available yet.</p>;
      let questions: QuizQuestion[];
      try { questions = JSON.parse(currentModule.questionsJson); } catch { return <p className="text-red-500">Invalid quiz data.</p>; }
      const passed = quizScore !== null && currentModule.threshold !== undefined && quizScore >= currentModule.threshold;

      return (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <GlassContainer key={qIdx} className="p-6">
              <p className="font-bold text-slate-900 dark:text-white mb-4">{qIdx + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[qIdx] === oIdx;
                  const isCorrect = quizSubmitted && q.correct === oIdx;
                  const isWrong = quizSubmitted && isSelected && q.correct !== oIdx;
                  return (
                    <button key={oIdx} type="button" disabled={quizSubmitted}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : isWrong ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400'
                        : isSelected ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-500/30'
                      }`}>
                      <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0 border-current opacity-60">
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
            <ActionButton onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < questions.length} className="w-full" size="lg">
              Submit Answers
            </ActionButton>
          ) : (
            <GlassContainer className="p-8 text-center space-y-4">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Score: {quizScore}%</p>
              <p className={`text-sm font-semibold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {passed ? '✓ Passed! Great job.' : `✗ You need ${currentModule.threshold}% to pass.`}
              </p>
              {!passed && <ActionButton variant="secondary" onClick={resetQuiz}><RotateCcw className="w-4 h-4" /> Retry Quiz</ActionButton>}
            </GlassContainer>
          )}
        </div>
      );
    }

    // Video
    if (currentModule.type === 'video' && currentModule.contentUrl) {
      return (
        <GlassContainer className="p-0 overflow-hidden">
          <video key={currentModule.id} controls className="w-full rounded-2xl" style={{ maxHeight: '70vh' }}>
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

    // PDF
    if (currentModule.type === 'pdf' && currentModule.contentUrl) {
      return (
        <GlassContainer className="p-0 overflow-hidden">
          <iframe key={currentModule.id} src={getFileUrl(currentModule.contentUrl)}
            className="w-full rounded-2xl border-0" style={{ height: '75vh' }} title={currentModule.title} />
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

    // Text (default)
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

  // 9-D: next module title for the unlock footer
  const nextModule: Module | undefined = modules[currentIndex + 1];

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
            <p className="text-sm text-slate-500 dark:text-slate-400">Module {currentIndex + 1} of {modules.length}</p>
            <div className="flex-1 max-w-32 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Task 9-C: sidebar uses ModuleStatusButton */}
        <GlassContainer className="p-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 px-2">Modules</h3>
          <div className="space-y-1">
            {modules.map((mod, idx) => (
              <ModuleStatusButton
                key={mod.id}
                module={mod}
                enrollment={enrollment}
                isCurrent={idx === currentIndex}
                isCompleted={completedIds.includes(mod.id)}
                onClick={() => switchModule(idx)}
              />
            ))}
          </div>
        </GlassContainer>

        {/* Content area */}
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

          {/* Task 9-D: unlock footer */}
          {!isCurrentCompleted && !isCurrentLocked && nextModule && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]"
            >
              <ModuleTypeIcon type={nextModule.type} className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete this module to unlock:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{nextModule.title}</span>
              </p>
            </motion.div>
          )}

          {/* Remediation alert (enrollment-level) */}
          {enrollment?.masteryState === 'NEEDS_REMEDIATION' && !isCurrentLocked && (
            <div className="mt-2 px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 flex items-center gap-3">
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">
                You may need extra practice. Ask the AI Tutor for help!
              </span>
              <button
                id="remediation-open-tutor-btn"
                type="button"
                onClick={() => setShowAITutor(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                Ask AI Tutor
              </button>
            </div>
          )}

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

      {/* AI Tutor FAB + Chat Overlay (Phase 11) */}
      {enrollment && currentModule && (
        <AnimatePresence>
          {!showAITutor && (
            <AITutorFAB key="fab" onClick={() => setShowAITutor(true)} hasUnread={enrollment.masteryState === 'NEEDS_REMEDIATION'} />
          )}
          {showAITutor && (
            <AIChatUI key="chat" moduleId={currentModule.id} moduleTitle={currentModule.title} enrollmentId={enrollment.id} onClose={() => setShowAITutor(false)} />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
