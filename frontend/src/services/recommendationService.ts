import api from './api';
import type { Course } from '../types';

export const recommendationService = {
  /** GET /api/recommendations/my — up to 3 recommended courses */
  getMyRecommendations: (): Promise<Course[]> =>
    api.get<Course[]>('/recommendations/my').then(r => r.data),
};
