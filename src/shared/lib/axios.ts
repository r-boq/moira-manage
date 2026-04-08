import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// 拦截器类型
// ============================================================================

export interface RequestInterceptor {
  onFulfilled?: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRejected?: (error: unknown) => unknown;
}

export interface ResponseInterceptor<T = unknown> {
  onFulfilled?: (response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
  onRejected?: (error: AxiosError) => unknown;
}

// ============================================================================
// createHttpClient 配置项
// ============================================================================

export interface HttpClientOptions {
  /** 请求基础地址，默认读取 NEXT_PUBLIC_API_BASE_URL */
  baseURL?: string;
  /** 超时时间（ms），默认 15000 */
  timeout?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 请求拦截器列表（按数组顺序执行） */
  requestInterceptors?: RequestInterceptor[];
  /** 响应拦截器列表（按数组顺序执行） */
  responseInterceptors?: ResponseInterceptor[];
}

// ============================================================================
// createHttpClient 工厂函数
// ============================================================================

/**
 * 创建一个配置好的 Axios 实例。
 * 本函数不包含任何业务逻辑，仅做通用的实例初始化与拦截器注册。
 * 业务相关拦截器（鉴权、跳转登录等）通过 options 传入。
 *
 * @example
 * ```ts
 * const client = createHttpClient({
 *   baseURL: 'https://api.example.com',
 *   requestInterceptors: [{ onFulfilled: addAuthHeader }],
 *   responseInterceptors: [{ onRejected: handleUnauthorized }],
 * });
 * ```
 */
export function createHttpClient(options: HttpClientOptions = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    timeout: options.timeout ?? 15_000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  options.requestInterceptors?.forEach(({ onFulfilled, onRejected }) => {
    instance.interceptors.request.use(onFulfilled, onRejected);
  });

  options.responseInterceptors?.forEach(({ onFulfilled, onRejected }) => {
    instance.interceptors.response.use(
      onFulfilled as (res: AxiosResponse) => AxiosResponse,
      onRejected as (err: AxiosError) => unknown,
    );
  });

  return instance;
}
