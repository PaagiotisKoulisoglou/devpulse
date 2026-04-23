import { groq, FAST_MODEL } from '@/lib/groq'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await request.json()

  const [profileResult, reposResult, commitsResult] = await Promise.all([
    supabase.from('users').select('github_username').eq('id', user.id).single(),
    supabase.from('repos').select('name, language').eq('user_id', user.id).limit(10),
    supabase
      .from('commits')
      .select('message, committed_at, repos(name)')
      .eq('user_id', user.id)
      .order('committed_at', { ascending: false })
      .limit(20),
  ])

  const username = profileResult.data?.github_username ?? 'the developer'
  const repos = reposResult.data ?? []
  const commits = commitsResult.data ?? []

  const repoList = repos.map((r) => `${r.name} (${r.language ?? 'unknown'})`).join(', ')
  const recentWork = commits
    .slice(0, 8)
    .map((c) => `${(c.repos as any)?.name}: ${c.message}`)
    .join('\n')

  const systemPrompt = `You are DevPulse AI, a personal coding coach for ${username}.

You have real data about their recent GitHub activity:
Repos: ${repoList || 'none synced yet'}

Recent commits:
${recentWork || 'No recent commits synced yet'}

Your personality:
- Direct and honest — give real opinions, not vague encouragement
- Specific — always reference their actual repos, languages, and commit patterns
- Concise — this is a chat, not an essay. Keep responses under 150 words unless they ask for detail
- Encouraging but truthful — if their activity is low, say so with kindness

When asked about their work, use the specific data above.
When asked general coding questions, answer from your knowledge as a senior developer.`

  const stream = await groq.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}