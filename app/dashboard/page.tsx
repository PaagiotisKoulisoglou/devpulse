import { createClient } from '@/lib/superbase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-gray-400">
          Signed in as {user.email}
        </p>
      </div>
    </main>
  )
}