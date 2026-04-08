import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseAsyncOptions {
  immediate?: boolean
}

export interface UseAsyncReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  run: (...args: unknown[]) => Promise<void>
}

/** 统一处理异步函数的 loading / error / data 状态 */
export function useAsync<T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const run = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      try {
        const result = await asyncFn(...args)
        if (mountedRef.current) setData(result)
      } catch (err) {
        if (mountedRef.current) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [asyncFn]
  )

  useEffect(() => {
    if (immediate) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate])

  return { data, loading, error, run }
}
