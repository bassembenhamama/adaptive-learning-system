import { useQuery, useMutation } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { ChatResponse } from '../types';

/**
 * useChatHistory — fetches existing chat history for a (module, enrollment) pair.
 * Only enabled when both IDs are non-empty strings.
 */
export const useChatHistory = (moduleId: string, enrollmentId: string) => {
  return useQuery({
    queryKey: ['chatHistory', moduleId, enrollmentId],
    queryFn: () => chatService.getHistory(moduleId, enrollmentId),
    enabled: Boolean(moduleId) && Boolean(enrollmentId),
    staleTime: 1000 * 60 * 5, // 5-minute cache
    retry: false,
  });
};

interface SendMessageVars {
  moduleId: string;
  enrollmentId: string;
  query: string;
}

/**
 * useSendMessage — mutation that POSTs a query to the AI and returns the response.
 */
export const useSendMessage = () => {
  return useMutation<ChatResponse, Error, SendMessageVars>({
    mutationFn: ({ moduleId, enrollmentId, query }) =>
      chatService.sendQuery(moduleId, enrollmentId, query),
  });
};
