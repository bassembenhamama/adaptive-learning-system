import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { ModuleAccessResult } from '../types';

/**
 * Task 9-A — useModuleAccess
 * Fetches access state for a single module within an enrollment.
 *
 * QueryKey: ['module-access', enrollmentId, moduleId]
 * Enabled:  only when both IDs are non-empty strings
 * staleTime: 30 s — access changes when a module is completed
 */
export const useModuleAccess = (enrollmentId: string, moduleId: string) => {
  return useQuery<ModuleAccessResult>({
    queryKey: ['module-access', enrollmentId, moduleId],
    queryFn: async () => {
      const res = await api.get<ModuleAccessResult>(
        `/enrollments/${enrollmentId}/module-access/${moduleId}`
      );
      return res.data;
    },
    enabled: Boolean(enrollmentId) && Boolean(moduleId),
    staleTime: 30_000,
  });
};
