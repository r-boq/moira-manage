import { http } from '@shared/lib'
import type { ApiResponse } from '@shared/types'
import type { DashboardStats } from '../types'

export const dashboardService = {
  getStats(): Promise<ApiResponse<DashboardStats>> {
    return http.get<DashboardStats>('/dashboard/stats')
  },
}
