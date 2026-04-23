'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const router = useRouter()

  async function handleSync() {
    setState('syncing')

    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync failed')

      setState('done')
      router.refresh()

      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const labels = {
    idle: 'Sync GitHub',
    syncing: 'Syncing...',
    done: '✓ Synced',
    error: 'Failed — retry?',
  }

  const styles = {
    idle: 'bg-indigo-600 hover:bg-indigo-500',
    syncing: 'bg-indigo-600 opacity-50 cursor-not-allowed',
    done: 'bg-green-600',
    error: 'bg-red-600 hover:bg-red-500',
  }

  return (
    <button
      onClick={handleSync}
      disabled={state === 'syncing'}
      className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${styles[state]}`}
    >
      {labels[state]}
    </button>
  )
}