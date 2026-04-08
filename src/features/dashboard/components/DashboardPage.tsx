import { StatCardItem } from './StatCardItem'
import { useDashboardStats } from '../hooks/useDashboardStats'
import type { StatCard } from '../types'

function buildCards(stats: NonNullable<ReturnType<typeof useDashboardStats>['stats']>): StatCard[] {
  return [
    { title: '总用户数', value: stats.totalUsers, unit: '人', trend: 'up', trendValue: '较上月 +12%' },
    { title: '活跃用户', value: stats.activeUsers, unit: '人', trend: 'up', trendValue: '较上月 +8%' },
    { title: '今日订单', value: stats.todayOrders, unit: '单', trend: 'flat', trendValue: '持平' },
    { title: '营收', value: stats.revenue, trend: 'down', trendValue: '较上月 -3%' },
  ]
}

export function DashboardPage() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-gray-400">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        数据加载失败：{error.message}
      </div>
    )
  }

  const cards = stats ? buildCards(stats) : []

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">数据概览</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCardItem key={card.title} card={card} />
        ))}
      </div>
    </section>
  )
}
