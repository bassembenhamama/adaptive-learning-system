import api from './api';
import type { NotificationDTO } from '../types';

export const notificationService = {
  /** GET /api/notifications/my — unread notifications for the current user */
  getMyNotifications: (): Promise<NotificationDTO[]> =>
    api.get<NotificationDTO[]>('/notifications/my').then(r => r.data),

  /** PUT /api/notifications/{id}/read — mark as read */
  markRead: (id: string): Promise<void> =>
    api.put(`/notifications/${id}/read`).then(() => undefined),
};
