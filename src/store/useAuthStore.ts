import { create } from 'zustand';
import { User, AuditLog } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  auditLogs: AuditLog[];

  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;

  setUsers: (users: User[]) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null,
  users: [],
  auditLogs: [],

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ isAuthenticated: true, currentUser: user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    set({ isAuthenticated: false, currentUser: null });
  },

  hasPermission: (permission) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    return currentUser.permissions?.includes(permission) || false;
  },

  setUsers: (users) => set({ users }),
  setAuditLogs: (logs) => set({ auditLogs: logs }),
}));
