import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role, content, sessionId } = await request.json()

  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('session_id', sessionId)

  if (count && count >= 20) {
    return NextResponse.json(
      { error: 'Session limit reached', limitReached: true },
      { status: 429 }
    )
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role,
    content,
    session_id: sessionId,
    expires_at: expiresAt,
  })

  await supabase
    .from('chat_messages')
    .update({ expires_at: expiresAt })
    .eq('user_id', user.id)
    .eq('session_id', sessionId)

  return NextResponse.json({ success: true })
}