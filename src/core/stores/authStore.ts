import { createImmerStore } from '@shared/store-factory'
import type { User } from '@core/models'
import { STORAGE_KEYS } from '@shared/constants'

// ============================================================================
// State
// ============================================================================

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = createImmerStore({
  state: initialState,

  actions: {
    setUser(user: User, token: string) {
      this.set({ user, token, isAuthenticated: true, isLoading: false, error: null })

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
      }
    },

    updateUser(updates: Partial<User>) {
      const current = this.get().user
      if (current) {
        this.set({ user: { ...current, ...updates } })
      }
    },

    setToken(token: string) {
      this.set({ token })
    },

    setLoading(isLoading: boolean) {
      this.set({ isLoading })
    },

    setError(error: string | null) {
      this.set({ error, isLoading: false })
    },

    clearError() {
      this.set({ error: null })
    },

    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      }
      this.set({ ...initialState })
    },
  },

  devtools: { name: 'AuthStore' },

  persist: {
    name: 'auth-storage',
    partialize: (state) => ({
      token: state.token,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  },
})

// ============================================================================
// Selectors (Hook 形式，精确订阅，避免多余渲染)
// ============================================================================

export const useCurrentUser        = () => useAuthStore((s) => s.user)
export const useIsAuthenticated    = () => useAuthStore((s) => s.isAuthenticated)
export const useAuthLoading        = () => useAuthStore((s) => s.isLoading)
export const useAuthError          = () => useAuthStore((s) => s.error)
export const useAuthToken          = () => useAuthStore((s) => s.token)

// ============================================================================
// 非 Hook 形式（可在 service / middleware / 非组件代码中使用）
// ============================================================================

export const getAuthToken      = ()              => useAuthStore.getState().token
export const getCurrentUser    = ()              => useAuthStore.getState().user
export const isAuthenticated   = ()              => useAuthStore.getState().isAuthenticated
export const getAuthState      = ()              => useAuthStore.getState()
export const setAuthToken      = (token: string) => useAuthStore.getState().setToken(token)
export const userSignOut       = ()              => useAuthStore.getState().logout()
