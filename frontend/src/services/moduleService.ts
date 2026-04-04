import api from './api';
import type { Module } from '../types';

export const moduleService = {
  async getByCourse(courseId: string): Promise<Module[]> {
    const res = await api.get<Module[]>(`/modules/course/${courseId}`);
    return res.data;
  },

  async create(courseId: string, module: Partial<Module>): Promise<Module> {
    const res = await api.post<Module>(`/modules/${courseId}`, module);
    return res.data;
  },

  async update(moduleId: string, module: Partial<Module>): Promise<Module> {
    const res = await api.put<Module>(`/modules/${moduleId}`, module);
    return res.data;
  },

  async setResource(moduleId: string, contentUrl: string): Promise<Module> {
    const res = await api.put<Module>(`/modules/${moduleId}/resource`, { contentUrl });
    return res.data;
  },

  async setQuiz(moduleId: string, threshold: number, questionsJson: string): Promise<Module> {
    const res = await api.put<Module>(`/modules/${moduleId}/quiz`, { threshold, questionsJson });
    return res.data;
  },

  async remove(moduleId: string): Promise<void> {
    await api.delete(`/modules/${moduleId}`);
  },

  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ filename: string; url: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data.url;
  },
};
