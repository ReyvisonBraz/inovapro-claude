import { create } from 'zustand';
import { User, AuditLog } from '../types';
import api from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  auditLogs: AuditLog[];

  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;

  setUsers: (users: User[]) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
}

// O token de sessão vive num cookie httpOnly (inacessível a JS). Guardamos
// apenas o currentUser (não sensível) no localStorage para render imediato no
// reload; o estado é confirmado pelo servidor via GET /api/me no bootstrap.
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem('currentUser'),
  currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null,
  users: [],
  auditLogs: [],

  login: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ isAuthenticated: true, currentUser: user });
  },

  logout: () => {
    // Limpa o cookie no servidor (best-effort) e o estado local.
    api.post('/logout').catch(() => { /* ignore */ });
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
