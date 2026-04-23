'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function handleInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstallEvent(null)
  }

  if (!installEvent || dismissed) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-gray-700 bg-gray-900 px-6 py-4 shadow-2xl">
      <div>
        <p className="text-sm font-semibold text-white">Install DevPulse</p>
        <p className="text-xs text-gray-400 mt-0.5">Add to your home screen</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Not now
        </button>
        <button
          onClick={install}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  )
}