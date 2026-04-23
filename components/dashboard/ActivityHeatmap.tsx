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
      if (count === 0) return 'bg-transparent ring-1 ring-border/70'
      if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900'
      if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700'
      if (count <= 6) return 'bg-emerald-500 dark:bg-emerald-600'
      return 'bg-emerald-600 dark:bg-emerald-500'
    }
  
    const weeks: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
  
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-foreground font-semibold mb-4">Activity — last 15 weeks</h2>
        <div className="overflow-x-auto py-1">
          <div className="mx-auto w-max rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
            <div className="flex w-max gap-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} commits`}
                  className={`h-4 w-4 rounded-[3px] ${getColor(day.count)}`}
                />
              ))}
            </div>
          ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted">Less</span>
          {[
            'bg-foreground/10',
            'bg-emerald-200 dark:bg-emerald-900',
            'bg-emerald-400 dark:bg-emerald-700',
            'bg-emerald-500 dark:bg-emerald-600',
            'bg-emerald-600 dark:bg-emerald-500',
          ].map((c) => (
            <div
              key={c}
              className={`h-4 w-4 rounded-[3px] ${c === 'bg-foreground/10' ? 'bg-transparent ring-1 ring-border/70' : c}`}
            />
          ))}
          <span className="text-xs text-muted">More</span>
        </div>
      </div>
    )
  }