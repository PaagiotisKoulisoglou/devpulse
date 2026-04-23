'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  title: string
  description: string
  target_days: number
}

export default function GoalSuggestions() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const router = useRouter()

  async function fetchSuggestions() {
    setLoading(true)
    setGoals([])

    try {
      const res = await fetch('/api/goals', { method: 'POST' })
      const data = await res.json()

      if (data.goals && Array.isArray(data.goals)) {
        setGoals(data.goals)
      }
    } catch (err) {
      console.error('Failed to fetch goal suggestions:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveGoal(goal: Goal, index: number) {
    setSaving(index)

    try {
      const supabase = createClient()

      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + goal.target_days)

      await supabase.from('goals').insert({
        title: goal.title,
        target_date: targetDate.toISOString().split('T')[0],
      })

      router.refresh()
    } catch (err) {
      console.error('Failed to save goal:', err)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-foreground font-semibold">AI Goal Suggestions</h2>
          <p className="text-xs text-muted mt-0.5">
            Personalized based on your coding patterns
          </p>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Thinking...' : goals.length > 0 ? 'Refresh' : 'Suggest goals'}
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 && !loading && (
        <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted">
            Click to get AI-powered goal suggestions
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-foreground/10 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Goal cards */}
      {!loading && goals.length > 0 && (
        <div className="flex flex-col gap-3">
          {goals.map((goal, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-foreground/5 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{goal.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {goal.description}
                </p>
                <p className="mt-1 text-xs text-indigo-400">
                  {goal.target_days} day goal
                </p>
              </div>
              <button
                onClick={() => saveGoal(goal, i)}
                disabled={saving === i}
                className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving === i ? 'Saving...' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}