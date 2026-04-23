import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type DeleteGoalBody = {
  id?: string
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as DeleteGoalBody
  const id = body.id?.trim()

  if (!id) {
    return NextResponse.json({ error: 'Goal id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed deleting goal:', error)
    return NextResponse.json({ error: 'Could not delete goal' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
