import StatCard from './StatCard'

interface StatsRowProps {
  repoCount: number
  commitCount: number
  topLanguage: string
  currentStreak: number
}

export default function StatsRow({
  repoCount,
  commitCount,
  topLanguage,
  currentStreak,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        label="Repositories"
        value={repoCount}
      />
      <StatCard
        label="Commits synced"
        value={commitCount}
      />
      <StatCard
        label="Top language"
        value={topLanguage || '—'}
      />
      <StatCard
        label="Day streak"
        value={currentStreak}
        sub="consecutive days"
      />
    </div>
  )
}