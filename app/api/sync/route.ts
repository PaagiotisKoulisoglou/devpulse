import { createClient } from '@/lib/supabase/server'
import { getGitHubRepos, getRepoCommits } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('github_token, github_username')
    .eq('id', user.id)
    .single()

  console.log('PROFILE:', JSON.stringify(profile))

  if (!profile?.github_token) {
    return NextResponse.json({ error: 'No GitHub token' }, { status: 400 })
  }

  const { github_token, github_username } = profile

  try {
    const githubRepos = await getGitHubRepos(github_token)

    console.log('GITHUB REPOS COUNT:', githubRepos.length)

    const reposToInsert = githubRepos.map((repo: any) => ({
      user_id: user.id,
      github_id: repo.id,
      name: repo.name,
      language: repo.language,
      stars: repo.stargazers_count,
      last_pushed_at: repo.pushed_at,
    }))

    const { data: savedRepos, error: reposError } = await supabase
      .from('repos')
      .upsert(reposToInsert, { onConflict: 'github_id' })
      .select()

    console.log('REPOS ERROR:', JSON.stringify(reposError))
    console.log('SAVED REPOS COUNT:', savedRepos?.length)

    if (savedRepos) {
      const recentRepos = savedRepos.slice(0, 5)

      for (const repo of recentRepos) {
        const commits = await getRepoCommits(
          github_token,
          github_username,
          repo.name
        )

        if (commits.length > 0) {
          const commitsToInsert = commits.map((commit: any) => ({
            user_id: user.id,
            repo_id: repo.id,
            message: commit.commit.message,
            committed_at: commit.commit.author.date,
          }))

          await supabase
            .from('commits')
            .upsert(commitsToInsert, { onConflict: 'id' })
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}