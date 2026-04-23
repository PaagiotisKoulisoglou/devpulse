import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type SaveGoalBody = {
  title?: string
  target_days?: number
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('goals')
    .delete()
    .eq('user_id', user.id)
    .eq('completed', false)
    .lt('target_date', today)

  const body = (await req.json().catch(() => ({}))) as SaveGoalBody
  const title = body.title?.trim()
  const targetDays = body.target_days

  if (
    !title ||
    typeof targetDays !== 'number' ||
    !Number.isFinite(targetDays) ||
    targetDays <= 0
  ) {
    return NextResponse.json({ error: 'Invalid goal payload' }, { status: 400 })
  }

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + targetDays)

  const { data: activeGoals, error: activeGoalsError } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('completed', false)

  if (activeGoalsError) {
    console.error('Failed loading active goals:', activeGoalsError)
    return NextResponse.json({ error: 'Could not validate goal limits' }, { status: 500 })
  }

  const normalizedTitle = title.toLowerCase()
  const hasDuplicate = (activeGoals ?? []).some(
    (goal) => goal.title?.trim().toLowerCase() === normalizedTitle
  )

  if (hasDuplicate) {
    return NextResponse.json({ error: 'Goal already exists' }, { status: 409 })
  }

  if ((activeGoals ?? []).length >= 5) {
    return NextResponse.json({ error: 'Maximum of 5 active goals' }, { status: 400 })
  }

  const { error } = await supabase.from('goals').insert({
    user_id: user.id,
    title,
    target_date: targetDate.toISOString().split('T')[0],
  })

  if (error) {
    console.error('Failed inserting goal:', error)
    return NextResponse.json({ error: 'Could not save goal' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
