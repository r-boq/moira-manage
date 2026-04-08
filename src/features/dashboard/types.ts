export interface StatCard {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  todayOrders: number
  revenue: string
}
