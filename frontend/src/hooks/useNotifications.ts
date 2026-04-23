import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationDTO } from '../types';

/**
 * Task 12-K — useNotifications
 *
 * Polls every 60 seconds so new REMEDIATION notifications surface without a
 * manual page refresh. Relies on React Query's background refetch.
 */
export const useNotifications = () => {
  return useQuery<NotificationDTO[]>({
    queryKey: ['notifications'],
    queryFn: notificationService.getMyNotifications,
    staleTime: 0,           // always re-fetch on focus or interval
    refetchInterval: 60_000, // 60-second polling
    retry: false,
  });
};

/**
 * Optimistically removes the notification from the cached list when
 * the PUT /read call is fired so the badge count drops immediately.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationDTO[]>(['notifications']);
      queryClient.setQueryData<NotificationDTO[]>(
        ['notifications'],
        (old = []) => old.filter(n => n.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      // Roll back on network failure
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
