import { http } from '@shared/lib'
import type { ApiResponse } from '@shared/types'

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
  roles: string[]
}

export const authService = {
  login(payload: LoginPayload): Promise<ApiResponse<AuthTokens>> {
    return http.post<AuthTokens>('/auth/login', payload)
  },

  logout(): Promise<ApiResponse<void>> {
    return http.post<void>('/auth/logout', {})
  },

  getProfile(): Promise<ApiResponse<UserInfo>> {
    return http.get<UserInfo>('/auth/profile')
  },

  refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return http.post<AuthTokens>('/auth/refresh', { refreshToken })
  },
}
