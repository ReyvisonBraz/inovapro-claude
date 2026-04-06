import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useUsers = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const fetchUsers = async () => {
    const data = await api.get('/api/users');
    return data;
  };

  const useUsersQuery = () => {
    return useQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
    });
  };

  const addUserMutation = useMutation({
    mutationFn: async (user: Omit<User, 'id'>) => {
      return await api.post('/api/users', user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuário adicionado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to add user', error);
      showToast('Erro ao adicionar usuário.', 'error');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, user }: { id: number; user: Partial<User> }) => {
      return await api.put(`/api/users/${id}`, user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuário atualizado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to update user', error);
      showToast('Erro ao atualizar usuário.', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuário excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete user', error);
      showToast('Erro ao excluir usuário.', 'error');
    },
  });

  return {
    useUsersQuery,
    addUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
};
