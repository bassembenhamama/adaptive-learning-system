import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Zap, TrendingUp, Award, RotateCcw, ChevronRight } from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { adaptiveService } from '../../services/adaptiveService';
import type {
  QuestionResponseForLearner,
  DifficultyLevel,
} from '../../types';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdaptiveAssessmentViewProps {
  enrollmentId: string;
  moduleId: string;
  moduleThreshold?: number;
  onComplete: (passed: boolean, score: number) => void;
  onBack: () => void;
}

// ── Difficulty Indicator ───────────────────────────────────────────────────────

const DIFFICULTY_LEVELS: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD'];

const difficultyConfig = {
  EASY:   { label: 'Easy',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/20', border: 'border-emerald-300 dark:border-emerald-500/40' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/20',     border: 'border-amber-300 dark:border-amber-500/40'     },
  HARD:   { label: 'Hard',   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-500/20',       border: 'border-rose-300 dark:border-rose-500/40'       },
};

function DifficultyBar({ current }: { current: DifficultyLevel }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
        Difficulty
      </span>
      {DIFFICULTY_LEVELS.map((level) => {
        const cfg = difficultyConfig[level];
        const isActive = level === current;
        return (
          <motion.span
            key={level}
            animate={{ scale: isActive ? 1.1 : 1 }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 ${
              isActive
                ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                : 'bg-transparent text-slate-400 dark:text-slate-600 border-transparent'
            }`}
          >
            {cfg.label}
          </motion.span>
        );
      })}
    </div>
  );
}

// ── Answer Feedback Flash ──────────────────────────────────────────────────────

function AnswerFeedback({ correct, onDone }: { correct: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50`}
    >
      <div className={`flex flex-col items-center gap-3 p-8 rounded-3xl shadow-2xl ${
        correct
          ? 'bg-emerald-500/90 text-white'
          : 'bg-rose-500/90 text-white'
      }`}>
        {correct
          ? <CheckCircle className="w-16 h-16" />
          : <XCircle className="w-16 h-16" />
        }
        <span className="text-2xl font-extrabold">
          {correct ? 'Correct!' : 'Incorrect'}
        </span>
      </div>
    </motion.div>
  );
}

// ── Score Screen ───────────────────────────────────────────────────────────────

function ScoreScreen({
  score,
  threshold,
  questionsAnswered,
  onContinue,
}: {
  score: number;
  threshold: number;
  questionsAnswered: number;
  onContinue: () => void;
}) {
  const passed = score >= threshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Score ring */}
      <div className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-xl ${
        passed
          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
          : 'bg-gradient-to-br from-rose-400 to-pink-500'
      }`}>
        <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">score</span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          {passed
            ? <Award className="w-5 h-5 text-emerald-500" />
            : <XCircle className="w-5 h-5 text-rose-500" />
          }
          <h3 className={`text-xl font-extrabold ${
            passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {passed ? 'Assessment Passed!' : 'Keep Practising'}
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {questionsAnswered} questions answered · Pass mark: {threshold}%
        </p>
        {!passed && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Try again or use the AI Tutor to strengthen weak areas.
          </p>
        )}
      </div>

      <ActionButton onClick={onContinue} size="lg">
        {passed ? (
          <><CheckCircle className="w-4 h-4" /> Continue</>
        ) : (
          <><RotateCcw className="w-4 h-4" /> Try Again</>
        )}
      </ActionButton>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const AdaptiveAssessmentView: React.FC<AdaptiveAssessmentViewProps> = ({
  enrollmentId,
  moduleId,
  moduleThreshold = 70,
  onComplete,
  onBack,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponseForLearner | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start session on mount
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        setIsLoading(true);
        const data = await adaptiveService.startSession({ enrollmentId, moduleId });
        if (!cancelled) {
          setSessionId(data.sessionId);
          setCurrentQuestion(data.firstQuestion);
          setCurrentDifficulty(data.currentDifficulty);
          setQuestionsAnswered(0);
          setEstimatedTotal(data.estimatedTotal);
        }
      } catch {
        if (!cancelled) setError('Failed to start assessment. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    start();
    return () => { cancelled = true; };
  }, [enrollmentId, moduleId]);

  const handleAnswer = useCallback(async (optionIndex: number) => {
    if (!sessionId || !currentQuestion || isSubmitting || showFeedback) return;
    setIsSubmitting(true);

    try {
      const response = await adaptiveService.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedAnswer: optionIndex,
      });

      setLastAnswerCorrect(response.lastAnswerCorrect);
      setShowFeedback(true);
      setQuestionsAnswered(response.questionsAnswered);

      // After brief feedback delay (handled by AnswerFeedback component)
      const advance = () => {
        if (response.sessionComplete) {
          setSessionComplete(true);
          setFinalScore(response.finalScore);
          setCurrentQuestion(null);
        } else {
          setCurrentQuestion(response.nextQuestion);
          setCurrentDifficulty(response.newDifficulty);
        }
        setShowFeedback(false);
        setIsSubmitting(false);
      };

      // Store advance callback for the feedback component
      // AnswerFeedback calls onDone after 900 ms
      (window as unknown as Record<string, unknown>).__adaptiveAdvance = advance;
    } catch {
      setError('Failed to submit answer. Please try again.');
      setIsSubmitting(false);
    }
  }, [sessionId, currentQuestion, isSubmitting, showFeedback]);

  const handleFeedbackDone = useCallback(() => {
    const advance = (window as unknown as Record<string, unknown>).__adaptiveAdvance as (() => void) | undefined;
    if (advance) {
      advance();
      delete (window as unknown as Record<string, unknown>).__adaptiveAdvance;
    }
  }, []);

  const handleComplete = () => {
    const passed = (finalScore ?? 0) >= moduleThreshold;
    onComplete(passed, finalScore ?? 0);
  };

  // ── Render States ─────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Starting adaptive assessment…" className="py-16" />;
  }

  if (error) {
    return (
      <GlassContainer className="p-8 text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="text-slate-700 dark:text-slate-300">{error}</p>
        <ActionButton variant="secondary" onClick={onBack}>Go Back</ActionButton>
      </GlassContainer>
    );
  }

  if (sessionComplete && finalScore !== null) {
    return (
      <GlassContainer className="p-8">
        <ScoreScreen
          score={finalScore}
          threshold={moduleThreshold}
          questionsAnswered={questionsAnswered}
          onContinue={handleComplete}
        />
      </GlassContainer>
    );
  }

  if (!currentQuestion) return null;

  const progress = estimatedTotal > 0 ? Math.min((questionsAnswered / estimatedTotal) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Answer feedback overlay */}
      <AnimatePresence>
        {showFeedback && lastAnswerCorrect !== null && (
          <AnswerFeedback correct={lastAnswerCorrect} onDone={handleFeedbackDone} />
        )}
      </AnimatePresence>

      {/* Header bar */}
      <GlassContainer className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <DifficultyBar current={currentDifficulty} />
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {questionsAnswered}
            </span>
            <span>/ ~{estimatedTotal} questions</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </GlassContainer>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
          <GlassContainer className="p-6 space-y-5">
            {/* Adaptive badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2.5 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> Adaptive Assessment
              </span>
            </div>

            {/* Question text */}
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.statement}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <motion.button
                  key={`${currentQuestion.id}-${idx}`}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAnswer(idx)}
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed bg-white/30 dark:bg-slate-900/30 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                      : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full border border-current opacity-50 text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Loading indicator when submitting */}
            {isSubmitting && !showFeedback && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-2">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Evaluating…
              </div>
            )}
          </GlassContainer>
        </motion.div>
      </AnimatePresence>

      {/* Back button */}
      <div className="flex justify-start">
        <ActionButton variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Exit Assessment
        </ActionButton>
      </div>
    </div>
  );
};
