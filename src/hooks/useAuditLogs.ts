import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export const useAuditLogs = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const fetchAuditLogs = async () => {
    const res = await api.get('/audit-logs');
    return res.data;
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
