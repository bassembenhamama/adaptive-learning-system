import api from './api';
import type { User } from '../types';

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminService = {
  async getAllUsers(page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    const res = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, size }
    });
    return res.data;
  },

  async getStats(): Promise<any> {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async updateUserRole(userId: number, role: string): Promise<User> {
    const res = await api.put<User>(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }
};
