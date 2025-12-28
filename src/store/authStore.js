import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (loading) => set({ loading }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      clearAuth: () => set({ user: null, isAuthenticated: false, loading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
