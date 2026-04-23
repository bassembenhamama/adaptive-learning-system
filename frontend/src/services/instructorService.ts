import api from './api';
import type { CourseAnalytics } from '../types';

export const instructorService = {
  /**
   * Fetches cohort analytics for a specific course.
   * Requires the caller to be the course owner (or ADMIN).
   */
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const res = await api.get<CourseAnalytics>(`/instructor/courses/${courseId}/analytics`);
    return res.data;
  },
};
