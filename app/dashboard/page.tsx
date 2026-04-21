import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import StatsRow from '@/components/dashboard/StatsRow'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import CommitChart from '@/components/dashboard/CommitChart'
import RecentCommits from '@/components/dashboard/RecentCommits'
import ReposList from '@/components/dashboard/ReposList'
import { computeStreak, getTopLanguage } from '@/lib/stats'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, reposResult, commitsResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('repos').select('*').eq('user_id', user.id).order('last_pushed_at', { ascending: false }),
    supabase.from('commits').select('*, repos(name)').eq('user_id', user.id).order('committed_at', { ascending: false }).limit(100),
  ])

  const profile = profileResult.data
  const repos = reposResult.data ?? []
  const commits = commitsResult.data ?? []

  const streak = computeStreak(commits)
  const topLanguage = getTopLanguage(repos)

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 py-8">

        <Header
          username={profile?.github_username ?? user.email ?? 'Developer'}
          avatarUrl={profile?.avatar_url ?? null}
          email={user.email ?? ''}
        />

        <StatsRow
          repoCount={repos.length}
          commitCount={commits.length}
          topLanguage={topLanguage}
          currentStreak={streak}
        />

        <div className="mt-6">
          <ActivityHeatmap commits={commits} />
        </div>

        <div className="mt-6">
          <CommitChart commits={commits} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <RecentCommits commits={commits.slice(0, 15) as any} />
          <ReposList repos={repos} />
        </div>

      </div>
    </main>
  )
}