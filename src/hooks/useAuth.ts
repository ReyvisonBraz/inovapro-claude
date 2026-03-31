import { useCallback } from 'react';
import { User, AuditLog } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    isAuthenticated, 
    currentUser, 
    users, 
    auditLogs, 
    login, 
    logout, 
    hasPermission,
    setUsers,
    setAuditLogs
  } = useAuthStore();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      showToast('Erro ao carregar usuários.', 'error');
    }
  }, [showToast, setUsers]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      showToast('Erro ao carregar logs de auditoria.', 'error');
    }
  }, [showToast, setAuditLogs]);

  const saveUserAPI = useCallback(async (user: Partial<User>, id?: number) => {
    const url = id ? `/api/users/${id}` : '/api/users';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to save user');
    }
    
    return await res.json();
  }, []);

  const deleteUserAPI = useCallback(async (id: number) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
  }, []);

  return {
    isAuthenticated,
    currentUser,
    users,
    auditLogs,
    login,
    logout,
    hasPermission,
    fetchUsers,
    fetchAuditLogs,
    saveUserAPI,
    deleteUserAPI
  };
}
