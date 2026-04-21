import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated, token: s.token }),
    },
  )
)
