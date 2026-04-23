import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../services/moduleService';

export const useCourseModules = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => (courseId ? moduleService.getByCourse(courseId) : Promise.reject('No Course ID provided')),
    enabled: !!courseId,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => moduleService.create(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.courseId] });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, courseId }: { id: string; data: any; courseId?: string }) => moduleService.update(id, data),
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['modules', variables.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['modules'] });
      }
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) => moduleService.remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.courseId] });
    },
  });
};
