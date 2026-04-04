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
  instructor?: User;
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
  user: User;
  course: Course;
  completedModuleIds: string;
  score: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
}
