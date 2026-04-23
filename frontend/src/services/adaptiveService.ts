import api from './api';
import type {
  AdaptiveSessionStart,
  AdaptiveAnswerRequest,
  AdaptiveAnswerResponse,
  AdaptiveStartRequest,
} from '../types';

export const adaptiveService = {
  startSession: async (request: AdaptiveStartRequest): Promise<AdaptiveSessionStart> => {
    const { data } = await api.post('/adaptive/sessions/start', request);
    return data;
  },

  submitAnswer: async (
    sessionId: string,
    request: AdaptiveAnswerRequest
  ): Promise<AdaptiveAnswerResponse> => {
    const { data } = await api.post(`/adaptive/sessions/${sessionId}/answer`, request);
    return data;
  },

  getSession: async (sessionId: string) => {
    const { data } = await api.get(`/adaptive/sessions/${sessionId}`);
    return data;
  },

  checkModuleAccess: async (enrollmentId: string, moduleId: string) => {
    const { data } = await api.get(`/enrollments/${enrollmentId}/access/${moduleId}`);
    return data as { canAccess: boolean; reason: string };
  },
};
