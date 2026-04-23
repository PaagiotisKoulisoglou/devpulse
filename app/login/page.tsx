'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user user:email repo',
      },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8">
        <h1 className="text-2xl font-bold text-foreground">DevPulse</h1>
        <p className="mt-2 text-muted">Sign in to see your developer insights</p>
        <button
          onClick={signInWithGitHub}
          className="mt-8 w-full rounded-lg bg-foreground px-4 py-3 font-medium text-background hover:opacity-90 transition-colors"
        >
          Continue with GitHub
        </button>
      </div>
    </main>
  )
}