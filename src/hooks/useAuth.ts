import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const { 
    isAuthenticated, 
    currentUser, 
    login, 
    logout, 
    hasPermission
  } = useAuthStore();

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    hasPermission
  };
}
