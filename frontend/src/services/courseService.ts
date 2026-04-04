import api from './api';
import type { Course } from '../types';

export const courseService = {
  async getAll(): Promise<Course[]> {
    const res = await api.get<Course[]>('/courses');
    return res.data;
  },

  async getById(id: string): Promise<Course> {
    const res = await api.get<Course>(`/courses/${id}`);
    return res.data;
  },

  async getInstructorCourses(): Promise<Course[]> {
    const res = await api.get<Course[]>('/courses/instructor');
    return res.data;
  },

  async create(course: Partial<Course>): Promise<Course> {
    const res = await api.post<Course>('/courses', course);
    return res.data;
  },

  async update(id: string, course: Partial<Course>): Promise<Course> {
    const res = await api.put<Course>(`/courses/${id}`, course);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }
};
