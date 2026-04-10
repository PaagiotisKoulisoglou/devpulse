'use client'

import { createClient } from '@/lib/superbase/client'

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8">
        <h1 className="text-2xl font-bold text-white">DevPulse</h1>
        <p className="mt-2 text-gray-400">Sign in to see your developer insights</p>
        <button
          onClick={signInWithGitHub}
          className="mt-8 w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Continue with GitHub
        </button>
      </div>
    </main>
  )
}