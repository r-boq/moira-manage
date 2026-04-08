import type { ApiResponse } from '@shared/types';

import { http } from '@core/lib';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[];
}

export const authService = {
  login(payload: LoginPayload): Promise<ApiResponse<AuthTokens>> {
    return http.post<ApiResponse<AuthTokens>>('/auth/login', payload).then((res) => res.data);
  },

  logout(): Promise<ApiResponse<void>> {
    return http.post<ApiResponse<void>>('/auth/logout', {}).then((res) => res.data);
  },

  getProfile(): Promise<ApiResponse<UserInfo>> {
    return http.get<ApiResponse<UserInfo>>('/auth/profile').then((res) => res.data);
  },

  refreshToken(token: string): Promise<ApiResponse<AuthTokens>> {
    return http
      .post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken: token })
      .then((res) => res.data);
  },
};
