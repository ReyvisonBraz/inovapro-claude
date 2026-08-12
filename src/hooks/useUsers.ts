import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import api from '../lib/api';
import { scheduleInvalidate } from '../lib/query-cache';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/useAuthStore';

export const useUsers = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const fetchUsers = async () => {
    const res = await api.get('/users');
    return res.data;
  };

  const useUsersQuery = () => {
    return useQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
      enabled: isAuthenticated,
    });
  };

  const addUserMutation = useMutation({
    mutationFn: async (user: Omit<User, 'id'>) => {
      const res = await api.post('/users', user);
      return res.data;
    },
    onSuccess: () => {
      scheduleInvalidate(queryClient, 'users');
      showToast('Usuário adicionado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to add user', error);
      showToast(error.response?.data?.error || 'Erro ao adicionar usuário.', 'error');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, user }: { id: number; user: Partial<User> }) => {
      const res = await api.put(`/users/${id}`, user);
      return res.data;
    },
    onSuccess: () => {
      scheduleInvalidate(queryClient, 'users');
      showToast('Usuário atualizado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to update user', error);
      showToast(error.response?.data?.error || 'Erro ao atualizar usuário.', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      scheduleInvalidate(queryClient, 'users');
      showToast('Usuário excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete user', error);
      showToast(error.response?.data?.error || 'Erro ao excluir usuário.', 'error');
    },
  });

  return {
    useUsersQuery,
    addUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
};
