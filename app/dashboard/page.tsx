import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import StatsRow from '@/components/dashboard/StatsRow'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import CommitChart from '@/components/dashboard/CommitChart'
import RecentCommits from '@/components/dashboard/RecentCommits'
import ReposList from '@/components/dashboard/ReposList'
import { computeStreak, getTopLanguage } from '@/lib/stats'
import AISummary from '@/components/dashboard/AISummary'
import GoalSuggestions from '@/components/dashboard/GoalSuggestion'
import ChatInterface from '@/components/dashboard/ChatInterface'
import SavedGoals from '@/components/dashboard/SavedGoals'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Delete expired goals
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('goals')
    .delete()
    .eq('user_id', user.id)
    .eq('completed', false)
    .lt('target_date', today)

  const [profileResult, reposResult, commitsResult, chatResult, goalsResult] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('repos')
      .select('*')
      .eq('user_id', user.id)
      .order('last_pushed_at', { ascending: false }),
    supabase
      .from('commits')
      .select('*, repos(name)')
      .eq('user_id', user.id)
      .order('committed_at', { ascending: false })
      .limit(100),

    // ✅ Fixed: includes session_id, expires_at, and filters out expired messages
    supabase
      .from('chat_messages')
      .select('role, content, session_id, expires_at')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(20),

    supabase
      .from('goals')
      .select('id, title, target_date, completed')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('target_date', { ascending: true }),
  ])

  const profile = profileResult.data
  const repos = reposResult.data ?? []
  const commits = commitsResult.data ?? []
  const goals = goalsResult.data ?? []

  const chatMessages = chatResult.data ?? []
  const currentSessionId = chatMessages.length > 0
    ? chatMessages[0].session_id
    : null
  const sessionExpiresAt = chatMessages.length > 0
    ? chatMessages[chatMessages.length - 1].expires_at
    : null

  const streak = computeStreak(commits)
  const topLanguage = getTopLanguage(repos)

  return (
    <main className="min-h-screen bg-background">
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

        <div className="mt-6">
          <AISummary />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <GoalSuggestions />
          <SavedGoals goals={goals as any} />
        </div>

        <div className="mt-6">
          <ChatInterface
            initialMessages={chatMessages as any}
            initialSessionId={currentSessionId}
            initialExpiresAt={sessionExpiresAt}
          />
        </div>

      </div>
    </main>
  )
}