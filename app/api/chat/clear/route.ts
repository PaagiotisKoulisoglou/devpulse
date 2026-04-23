import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await request.json()

  await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', user.id)
    .eq('session_id', sessionId)

  return NextResponse.json({ success: true })
}