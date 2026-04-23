import api from './api';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await api.post<User>('/auth/login', { email, password });
    return res.data;
  },

  async register(name: string, email: string, password: string, role: string = 'LEARNER'): Promise<User> {
    const res = await api.post<User>('/auth/register', { name, email, password, role });
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  async updateProfile(name: string, email: string): Promise<User> {
    const res = await api.put<User>('/users/me/profile', { name, email });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const res = await api.put<User>('/users/me/password', { currentPassword, newPassword });
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }
};
