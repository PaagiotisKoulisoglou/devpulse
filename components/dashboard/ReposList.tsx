interface Repo {
    id: string
    name: string
    language: string | null
    stars: number
    last_pushed_at: string | null
  }
  
  interface ReposListProps {
    repos: Repo[]
  }
  
  const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-400',
    Python: 'bg-green-500',
    Rust: 'bg-orange-500',
    Go: 'bg-cyan-400',
    CSS: 'bg-purple-500',
    HTML: 'bg-red-500',
  }
  
  export default function ReposList({ repos }: ReposListProps) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-white font-semibold mb-4">Repositories</h2>
        <div className="flex flex-col divide-y divide-gray-800">
          {repos.slice(0, 10).map((repo) => (
            <div key={repo.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                {repo.language && (
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${LANGUAGE_COLORS[repo.language] ?? 'bg-gray-500'}`}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-gray-300 text-sm font-medium truncate">
                    {repo.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {repo.language ?? 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0 ml-4">
                <span>★</span>
                <span>{repo.stars}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }