'use client'

import { useState } from 'react'

export default function AISummary() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function generate() {
    setLoading(true)
    setSummary('')
    setDone(false)

    try {
      const res = await fetch('/api/summary', { method: 'POST' })

      if (!res.ok || !res.body) {
        throw new Error('Failed to get response')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const text = decoder.decode(value, { stream: true })

        setSummary((prev) => prev + text)
      }

      setDone(true)
    } catch (err) {
      setSummary('Something went wrong generating your summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-foreground font-semibold">AI Coaching Summary</h2>
          <p className="text-xs text-muted mt-0.5">
            Powered by Llama 3.3 on Groq · free · based on your last 30 days
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating...' : done ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {/* Empty state */}
      {!summary && !loading && (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted">
            Click Generate to get your personalized coaching summary
          </p>
        </div>
      )}

      {/* Streaming text */}
      {summary && (
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {summary}
          {/* Blinking cursor while still streaming */}
          {loading && (
            <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse" />
          )}
        </div>
      )}
    </div>
  )
}