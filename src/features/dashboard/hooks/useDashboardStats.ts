'use client'

import { useState, useEffect } from 'react'
import type { DashboardStats } from '../types'
import { dashboardService } from '../services'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    dashboardService
      .getStats()
      .then((res) => {
        if (!cancelled) setStats(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { stats, loading, error }
}
