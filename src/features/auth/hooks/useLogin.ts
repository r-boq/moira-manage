'use client';

import { useState, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { authService } from '@core/services';

import type { LoginFormValues } from '../types';

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true);
      setError(null);
      try {
        await authService.login(values);
        router.push('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : '登录失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return { login, loading, error };
}
