'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SavedGoal = {
  id: string
  title: string
  target_date: string
  completed: boolean
}

interface SavedGoalsProps {
  goals: SavedGoal[]
}

export default function SavedGoals({ goals }: SavedGoalsProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function deleteGoal(id: string) {
    setDeletingId(id)

    try {
      const res = await fetch('/api/goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to delete goal')
      }

      router.refresh()
    } catch (err) {
      console.error('Failed to delete goal:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-4">
        <h2 className="text-foreground font-semibold">Saved Goals</h2>
        <p className="text-xs text-muted mt-0.5">Your active goals</p>
      </div>

      {goals.length === 0 ? (
        <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted">No saved goals yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-border bg-foreground/5 p-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                  <p className="mt-1 text-xs text-muted">Target: {goal.target_date}</p>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  disabled={deletingId === goal.id}
                  className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-foreground/10 disabled:opacity-50"
                >
                  {deletingId === goal.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
