import api from './api';
import type { Enrollment } from '../types';

export const enrollmentService = {
  async getMyEnrollments(): Promise<Enrollment[]> {
    const res = await api.get<Enrollment[]>('/enrollments/me');
    return res.data;
  },

  async enroll(courseId: string): Promise<Enrollment> {
    const res = await api.post<Enrollment>(`/enrollments/enroll/${courseId}`);
    return res.data;
  },

  async completeModule(enrollmentId: string, moduleId: string, score?: number, threshold?: number): Promise<Enrollment> {
    const params = new URLSearchParams({ moduleId });
    if (score !== undefined) params.append('score', score.toString());
    if (threshold !== undefined) params.append('threshold', threshold.toString());
    const res = await api.post<Enrollment>(`/enrollments/${enrollmentId}/complete-module?${params.toString()}`);
    return res.data;
  }
};
