import { useState, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      showToast("Erro ao carregar usuários. Verifique sua conexão.", "error");
    }
  }, [showToast]);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      await api.post('/api/users', user);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to add user", err);
      showToast("Erro ao adicionar usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  const updateUser = useCallback(async (id: number, user: Partial<User>) => {
    try {
      await api.put(`/api/users/${id}`, user);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to update user", err);
      showToast("Erro ao atualizar usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to delete user", err);
      showToast("Erro ao excluir usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  return { users, fetchUsers, addUser, updateUser, deleteUser };
};
