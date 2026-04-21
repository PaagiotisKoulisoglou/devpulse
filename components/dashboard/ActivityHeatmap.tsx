interface Commit {
    committed_at: string
  }
  
  interface ActivityHeatmapProps {
    commits: Commit[]
  }
  
  export default function ActivityHeatmap({ commits }: ActivityHeatmapProps) {
    const activityMap: Record<string, number> = {}
  
    commits.forEach((commit) => {
      const date = new Date(commit.committed_at).toISOString().split('T')[0]
      activityMap[date] = (activityMap[date] || 0) + 1
    })
  
    const days: { date: string; count: number }[] = []
    for (let i = 104; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({ date: dateStr, count: activityMap[dateStr] || 0 })
    }
  
    function getColor(count: number): string {
      if (count === 0) return 'bg-gray-800'
      if (count === 1) return 'bg-indigo-900'
      if (count <= 3) return 'bg-indigo-700'
      if (count <= 6) return 'bg-indigo-500'
      return 'bg-indigo-400'
    }
  
    const weeks: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
  
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-white font-semibold mb-4">Activity — last 15 weeks</h2>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} commits`}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Less</span>
          {['bg-gray-800', 'bg-indigo-900', 'bg-indigo-700', 'bg-indigo-500', 'bg-indigo-400'].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    )
  }