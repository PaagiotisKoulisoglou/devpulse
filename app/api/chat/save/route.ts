import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role, content } = await request.json()

  const { error } = await supabase.from('chat_messages').insert({
    user_id: user.id,
    role,
    content,
  })

  if (error) {
    console.error('Failed to save message:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}