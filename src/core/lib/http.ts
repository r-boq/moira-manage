import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { createHttpClient, HttpError } from '@shared/lib';
import type { ApiResponse } from '@shared/types';

// 延迟导入避免循环依赖（stores → core/lib → stores）
function getToken(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require
  const { getAuthToken } = require('@core/stores') as { getAuthToken: () => string | null };
  return getAuthToken();
}

function signOut(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require
  const { userSignOut } = require('@core/stores') as { userSignOut: () => void };
  userSignOut();
}

// ============================================================================
// 请求拦截器
// ============================================================================

const authRequestInterceptor = {
  onFulfilled(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = getToken();
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
};

// ============================================================================
// 响应拦截器
// ============================================================================

const bizCodeInterceptor = {
  onFulfilled(response: AxiosResponse<ApiResponse<unknown>>): AxiosResponse<ApiResponse<unknown>> {
    const { code, message, data } = response.data;
    if (code !== 0) {
      throw new HttpError(response.status, code, message, data);
    }
    return response;
  },
};

const httpErrorInterceptor = {
  onRejected(error: AxiosError<ApiResponse<unknown>>): Promise<never> {
    const status = error.response?.status ?? 0;
    const bizCode = error.response?.data?.code ?? -1;
    const message = error.response?.data?.message ?? error.message ?? '网络请求失败，请稍后重试';

    if (status === 401) {
      signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new HttpError(status, bizCode, message, error.response?.data));
  },
};

// ============================================================================
// 业务 HTTP 实例
// ============================================================================

export const http = createHttpClient({
  requestInterceptors: [authRequestInterceptor],
  responseInterceptors: [bizCodeInterceptor, httpErrorInterceptor],
});
