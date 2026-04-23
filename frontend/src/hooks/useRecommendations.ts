import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '../services/recommendationService';
import type { Course } from '../types';

/**
 * Task 12-M — useRecommendations
 *
 * 10-minute staleTime: recommendations are expensive to compute (LLM call)
 * and change infrequently within a session.
 */
export const useRecommendations = () => {
  return useQuery<Course[]>({
    queryKey: ['recommendations'],
    queryFn: recommendationService.getMyRecommendations,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });
};
