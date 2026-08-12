import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { SystemError } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function useSystemErrors() {
  const queryClient = useQueryClient();
  const { isAuthenticated, currentUser } = useAuthStore();

  const query = useQuery<SystemError[]>({
    queryKey: ['system-errors'],
    enabled: isAuthenticated && currentUser?.role === 'owner',
    queryFn: async () => (await api.get('/system-errors')).data,
    refetchInterval: 60_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/system-errors/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-errors'] }),
  });

  return { errors: query.data || [], isLoading: query.isLoading, resolveError: resolveMutation.mutate };
}
