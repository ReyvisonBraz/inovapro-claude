import { useState, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      await api.post('/api/users', user);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to add user", err);
      return false;
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: number, user: Partial<User>) => {
    try {
      await api.put(`/api/users/${id}`, user);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to update user", err);
      return false;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to delete user", err);
      return false;
    }
  }, [fetchUsers]);

  return { users, fetchUsers, addUser, updateUser, deleteUser };
};
