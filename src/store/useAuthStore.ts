import { create } from 'zustand';
import { User, AuditLog } from '../types';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
  currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null,
  users: [],
  auditLogs: [],
  
  login: (user) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ isAuthenticated: true, currentUser: user });
  },
  
  logout: () => {
    localStorage.removeItem('isAuthenticated');
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
