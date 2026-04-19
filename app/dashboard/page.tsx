import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SyncButton from '../dashboard/SyncButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: repos } = await supabase
    .from('repos')
    .select('*')
    .eq('user_id', user.id)
    .order('last_pushed_at', { ascending: false })


  const { data: commits } = await supabase
    .from('commits')
    .select('*, repos(name)')
    .eq('user_id', user.id)
    .order('committed_at', { ascending: false })
    .limit(10)

  const languageCounts = repos?.reduce((acc: Record<string, number>, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1
    }
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile?.github_username}
              </h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <SyncButton />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 text-sm">Repositories</p>
            <p className="text-3xl font-bold text-white mt-1">
              {repos?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 text-sm">Recent commits</p>
            <p className="text-3xl font-bold text-white mt-1">
              {commits?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400 text-sm">Top language</p>
            <p className="text-3xl font-bold text-white mt-1">
              {languageCounts
                ? Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
                : '—'}
            </p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-6">

          {/* Recent commits */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-white font-semibold mb-4">Recent commits</h2>
            <div className="flex flex-col gap-3">
              {commits?.map((commit) => (
                <div key={commit.id} className="border-b border-gray-800 pb-3 last:border-0">
                  <p className="text-gray-300 text-sm leading-snug line-clamp-2">
                    {commit.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {(commit.repos as any)?.name} ·{' '}
                    {new Date(commit.committed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {(!commits || commits.length === 0) && (
                <p className="text-gray-500 text-sm">
                  No commits yet — click Sync to load your data
                </p>
              )}
            </div>
          </div>

          {/* Repos list */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-white font-semibold mb-4">Repositories</h2>
            <div className="flex flex-col gap-3">
              {repos?.slice(0, 8).map((repo) => (
                <div key={repo.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{repo.name}</p>
                    <p className="text-gray-500 text-xs">{repo.language ?? 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <span>★</span>
                    <span>{repo.stars}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}