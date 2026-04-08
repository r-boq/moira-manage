import type { ApiResponse } from '@shared/types';

import { http } from '@core/lib';

import type { DashboardStats } from '../types';

export const dashboardService = {
  getStats(): Promise<ApiResponse<DashboardStats>> {
    return http.get<ApiResponse<DashboardStats>>('/dashboard/stats').then((res) => res.data);
  },
};
