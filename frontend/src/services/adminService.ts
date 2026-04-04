import api from './api';
import type { User } from '../types';

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const res = await api.get<User[]>('/admin/users');
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
