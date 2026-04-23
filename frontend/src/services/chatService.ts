import api from './api';
import type { ChatMessage, ChatResponse } from '../types';

interface RawHistoryEntry {
  userMessage: string;
  aiResponse: string;
  isOutOfContext: boolean;
  timestamp?: string;
}

/**
 * POST /api/chat/query
 * Sends a learner's question to the AI Tutor and returns the response.
 */
export const sendQuery = async (
  moduleId: string,
  enrollmentId: string,
  query: string,
): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>('/chat/query', {
    moduleId,
    enrollmentId,
    query,
  });
  return data;
};

/**
 * GET /api/chat/history/{moduleId}/{enrollmentId}
 * Fetches historical Q&A pairs and maps them to interleaved ChatMessage[].
 */
export const getHistory = async (
  moduleId: string,
  enrollmentId: string,
): Promise<ChatMessage[]> => {
  const { data } = await api.get<RawHistoryEntry[]>(
    `/chat/history/${moduleId}/${enrollmentId}`,
  );

  const messages: ChatMessage[] = [];
  data.forEach((entry, idx) => {
    const base = entry.timestamp ? new Date(entry.timestamp) : new Date();
    messages.push({
      id: `hist-user-${idx}`,
      role: 'user',
      content: entry.userMessage,
      timestamp: base,
    });
    messages.push({
      id: `hist-ai-${idx}`,
      role: 'ai',
      content: entry.aiResponse,
      isOutOfContext: entry.isOutOfContext,
      timestamp: new Date(base.getTime() + 1),
    });
  });
  return messages;
};

export const chatService = { sendQuery, getHistory };
