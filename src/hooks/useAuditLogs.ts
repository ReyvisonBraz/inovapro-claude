import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useAuditLogs = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const fetchAuditLogs = async () => {
    const data = await api.get('/api/audit-logs');
    return data;
  };

  const useAuditLogsQuery = () => {
    return useQuery({
      queryKey: ['audit-logs'],
      queryFn: fetchAuditLogs,
    });
  };

  const invalidateAuditLogs = () => {
    queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
  };

  return {
    useAuditLogsQuery,
    fetchAuditLogs: invalidateAuditLogs, // Map fetchAuditLogs to invalidateAuditLogs for backward compatibility
  };
};
