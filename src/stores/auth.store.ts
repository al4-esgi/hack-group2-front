import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      setToken: (token) => set({ isAuthenticated: !!token, token }),
      clearToken: () => set({ isAuthenticated: false, token: null }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated, token: s.token }),
    }
  )
)
