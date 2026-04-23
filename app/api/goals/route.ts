import { groq, FAST_MODEL } from '@/lib/groq'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [reposResult, commitsResult, existingGoalsResult] = await Promise.all([
    supabase
      .from('repos')
      .select('name, language')
      .eq('user_id', user.id),
    supabase
      .from('commits')
      .select('committed_at')
      .eq('user_id', user.id),
    supabase
      .from('goals')
      .select('title')
      .eq('user_id', user.id)
      .eq('completed', false),
  ])

  const repos = reposResult.data ?? []
  const commits = commitsResult.data ?? []
  const existingGoals = existingGoalsResult.data ?? []
  
  const last7Days = commits.filter(
    (c) =>
      new Date(c.committed_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  const last30Days = commits.filter(
    (c) =>
      new Date(c.committed_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length

  const languages = [
    ...new Set(repos.map((r) => r.language).filter(Boolean)),
  ]

  const prompt = `You are a developer coach creating personalized goals.

Developer stats:
- Commits last 7 days: ${last7Days}
- Commits last 30 days: ${last30Days}
- Languages used: ${languages.join(', ') || 'unknown'}
- Total repos: ${repos.length}
- Current open goals: ${existingGoals.map((g) => g.title).join(', ') || 'none'}

Generate exactly 3 specific, achievable goals for the next 2 weeks.

IMPORTANT: Respond with ONLY a valid JSON array. No explanation, no markdown, no code fences. Just the raw JSON.

[
  {
    "title": "Goal title in 8 words or less",
    "description": "One sentence explaining why this matters for them",
    "target_days": 14
  }
]

Rules:
- Base goals on the actual data — low commits = consistency goals
- Many languages = suggest deepening one specific language
- Never repeat existing goals
- Goals must be specific and measurable, not vague like "code more"`

  const response = await groq.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 512,
    stream: false,
    messages: [
      {
        role: 'system',
        content: 'You are a JSON API. You respond only with valid JSON. Never include explanation or markdown.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '[]'

  try {
    const clean = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const goals = JSON.parse(clean)
    return NextResponse.json({ goals })
  } catch {
    console.error('Failed to parse goals JSON:', raw)
    return NextResponse.json({ error: 'Failed to parse goals' }, { status: 500 })
  }
}