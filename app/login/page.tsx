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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-2xl border border-border/70 bg-background/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <p className="inline-flex rounded-full border border-border/70 px-3 py-1 text-xs text-muted">
            AI-powered developer insights
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Welcome to DevPulse
          </h1>
          <p className="mt-2 text-sm text-muted">
            Connect GitHub and see your coding activity, goals, and AI suggestions.
          </p>
        </div>
        <button
          onClick={signInWithGitHub}
          className="group mt-2 w-full rounded-xl border border-border bg-transparent px-4 py-3 font-medium text-foreground transition-all hover:bg-foreground/5 active:scale-[0.99]"
        >
          Continue with GitHub
        </button>
        <p className="mt-4 text-center text-xs text-muted">
          Secure OAuth login. No password required.
        </p>
      </div>
    </main>
  )
}