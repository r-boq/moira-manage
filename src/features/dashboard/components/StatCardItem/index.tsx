import type { StatCard } from '../../types'

interface StatCardProps {
  card: StatCard
}

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-500',
  flat: 'text-gray-400',
}

const trendIcons = {
  up: '↑',
  down: '↓',
  flat: '→',
}

export function StatCardItem({ card }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{card.title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {card.value}
        {card.unit && <span className="ml-1 text-lg font-normal text-gray-400">{card.unit}</span>}
      </p>
      {card.trend && (
        <p className={`mt-2 text-sm font-medium ${trendColors[card.trend]}`}>
          {trendIcons[card.trend]} {card.trendValue}
        </p>
      )}
    </div>
  )
}
