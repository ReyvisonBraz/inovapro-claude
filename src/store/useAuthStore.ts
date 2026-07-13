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

function getInitialUser(): User | null {
  try {
    const stored = localStorage.getItem('currentUser');
    if (stored) return JSON.parse(stored) as User;
  } catch { /* silently ignore corrupted data */ }
  return null;
}

// O token de sessão vive num cookie httpOnly (inacessível a JS). Guardamos
// apenas o currentUser (não sensível) no localStorage para render imediato no
// reload; o estado é confirmado pelo servidor via GET /api/me no bootstrap.
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!getInitialUser(),
  currentUser: getInitialUser(),
  users: [],
  auditLogs: [],

  login: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ isAuthenticated: true, currentUser: user });
  },

  logout: () => {
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
