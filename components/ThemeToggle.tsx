'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg border border-border p-2 text-muted hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}