'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <p className="text-2xl">⚠️</p>
        <h2 className="mt-4 text-lg font-semibold text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  )
}