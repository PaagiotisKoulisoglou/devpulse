interface Commit {
    id: string
    message: string
    committed_at: string
    repos: { name: string } | null
  }
  
  interface RecentCommitsProps {
    commits: Commit[]
  }
  
  export default function RecentCommits({ commits }: RecentCommitsProps) {
    function timeAgo(dateStr: string): string {
      const diff = Date.now() - new Date(dateStr).getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days === 0) return 'today'
      if (days === 1) return 'yesterday'
      if (days < 30) return `${days}d ago`
      return new Date(dateStr).toLocaleDateString()
    }
  
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-foreground font-semibold mb-4">Recent commits</h2>
        <div className="flex flex-col divide-y divide-border">
          {commits.length === 0 && (
            <p className="text-muted text-sm py-4">
              No commits yet — sync your GitHub data
            </p>
          )}
          {commits.map((commit) => (
            <div key={commit.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-foreground text-sm leading-snug line-clamp-2">
                {commit.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-400 font-medium">
                  {commit.repos?.name}
                </span>
                <span className="text-muted text-xs">·</span>
                <span className="text-xs text-muted">
                  {timeAgo(commit.committed_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }