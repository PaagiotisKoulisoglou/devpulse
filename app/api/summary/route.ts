import { groq, FAST_MODEL } from '@/lib/groq'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [profileResult, reposResult, commitsResult] = await Promise.all([
    supabase
      .from('users')
      .select('github_username')
      .eq('id', user.id)
      .single(),
    supabase
      .from('repos')
      .select('name, language, stars')
      .eq('user_id', user.id),
    supabase
      .from('commits')
      .select('message, committed_at, repos(name)')
      .eq('user_id', user.id)
      .gte(
        'committed_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('committed_at', { ascending: false }),
  ])

  const profile = profileResult.data
  const repos = reposResult.data ?? []
  const commits = commitsResult.data ?? []

  const languageCounts: Record<string, number> = {}
  repos.forEach((r) => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1
    }
  })
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang, count]) => `${lang} (${Math.round((count / repos.length) * 100)}%)`)
    .join(', ')

  const repoCounts: Record<string, number> = {}
  commits.forEach((c) => {
    const name = (c.repos as any)?.name
    if (name) repoCounts[name] = (repoCounts[name] || 0) + 1
  })
  const mostActiveRepo = Object.entries(repoCounts)
    .sort((a, b) => b[1] - a[1])[0]

  const dayCounts: Record<string, number> = {}
  commits.forEach((c) => {
    const day = new Date(c.committed_at).toLocaleDateString('en-US', {
      weekday: 'long',
    })
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })
  const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]

  const recentWork = commits
    .slice(0, 15)
    .map((c) => `- ${(c.repos as any)?.name}: ${c.message}`)
    .join('\n')

  const prompt = `You are a developer productivity coach analyzing GitHub data for ${profile?.github_username ?? 'a developer'}.

Last 30 days of activity:
- Total commits: ${commits.length}
- Repositories worked on: ${repos.length}
- Most active repo: ${mostActiveRepo ? `${mostActiveRepo[0]} (${mostActiveRepo[1]} commits)` : 'none yet'}
- Top languages: ${topLanguages || 'none recorded yet'}
- Most productive day: ${bestDay ? `${bestDay[0]} (${bestDay[1]} commits)` : 'no clear pattern yet'}

Recent commits (what they actually worked on):
${recentWork || 'No commits yet'}

Write exactly 3 paragraphs:
1. A specific celebration of what they accomplished — use real repo names and numbers
2. One interesting pattern you notice in how or when they work
3. One concrete, actionable suggestion for the next week based on the data

Rules:
- Be specific — use the actual data, names, and numbers provided
- Encouraging but honest — if activity is low, acknowledge it gently
- No bullet points, no headers — flowing paragraphs only
- Maximum 200 words total
- Do not start with "Great job" or generic filler — be original`

  const stream = await groq.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }

      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
