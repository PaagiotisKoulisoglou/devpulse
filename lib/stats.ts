export function computeStreak(commits: { committed_at: string }[]): number {
    if (commits.length === 0) return 0
  
    // Get unique days that had commits
    const days = new Set(
      commits.map((c) => new Date(c.committed_at).toISOString().split('T')[0])
    )
  
    let streak = 0
    const today = new Date()
  
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
  
      if (days.has(dateStr)) {
        streak++
      } else {
        if (i !== 0) break
      }
    }
  
    return streak
  }
  
  export function getTopLanguage(
    repos: { language: string | null }[]
  ): string {
    const counts: Record<string, number> = {}
    repos.forEach((r) => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }