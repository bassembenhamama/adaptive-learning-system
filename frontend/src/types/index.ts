export interface User {
  id: number;
  email: string;
  name: string;
  initials: string;
  role: 'LEARNER' | 'INSTRUCTOR' | 'ADMIN';
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  gradient: string;
  instructorId?: number;
  instructorName?: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  type: 'text' | 'pdf' | 'video' | 'quiz';
  order: number;
  contentUrl?: string;
  threshold?: number;
  questionsJson?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseGradient: string;
  courseModules?: Module[];
  completedModuleIds: string;
  score: number;
  masteryState: 'IN_PROGRESS' | 'MASTERED' | 'NEEDS_REMEDIATION';
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
}

export interface Question extends QuizQuestion {
  id: string;
  moduleId: string;
  timesAnswered?: number;
  timesCorrect?: number;
  successRate?: number;
  discriminationIndex?: number;
}

export interface QuestionRequest {
  statement: string;
  options: string[];
  correctAnswer: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
}

// ── Analytics types (Phase 6) ─────────────────────────────────────────────────

export interface ModuleAnalytics {
  moduleId: string;
  moduleTitle: string;
  totalEnrollments: number;
  averageScore: number;
  failCount: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  overallAverageScore: number;
  modules: ModuleAnalytics[];
}

// ── Chat / AI Tutor types (Phase 11) ─────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isOutOfContext?: boolean;
  timestamp: Date;
}

/** Matches the backend ChatResponseDTO */
export interface ChatResponse {
  response: string;   // was 'answer' — backend field is 'response'
  isOutOfContext: boolean;
  retrievedChunkCount?: number;
  processingTimeMs?: number;
}

// ── Notification types (Phase 12) ────────────────────────────────────────────

export type NotificationType = 'REMEDIATION' | 'RECOMMENDATION';

export interface NotificationDTO {
  id: string;
  enrollmentId: string | null;
  moduleId: string | null;
  moduleTitle: string | null;
  content: string;
  type: NotificationType;
  readStatus: boolean;
  createdAt: string; // ISO instant from backend
}

// ── Adaptive Engine types (Phase 8) ─────────────────────────────────────────

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

/** Learner-safe question view — correctAnswer is never included */
export interface QuestionResponseForLearner {
  id: string;
  statement: string;
  options: string[];
  difficultyLevel: DifficultyLevel;
}

export interface AdaptiveSessionStart {
  sessionId: string;
  firstQuestion: QuestionResponseForLearner;
  currentDifficulty: DifficultyLevel;
  questionsAnswered: number;
  estimatedTotal: number;
}

export interface AdaptiveStartRequest {
  enrollmentId: string;
  moduleId: string;
}

export interface AdaptiveAnswerRequest {
  questionId: string;
  selectedAnswer: number;
}

export interface AdaptiveAnswerResponse {
  nextQuestion: QuestionResponseForLearner | null;
  newDifficulty: DifficultyLevel;
  sessionComplete: boolean;
  finalScore: number | null;
  lastAnswerCorrect: boolean;
  questionsAnswered: number;
}

export interface ModuleAccessResult {
  canAccess: boolean;
  reason: string;
}
