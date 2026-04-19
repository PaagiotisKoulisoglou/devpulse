import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('CALLBACK HIT, code:', code)

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('CALLBACK ERROR:', JSON.stringify(error))
    console.log('PROVIDER TOKEN:', data?.session?.provider_token)
    console.log('USER ID:', data?.session?.user?.id)

    if (!error && data.session) {
      const providerToken = data.session.provider_token
      const user = data.session.user

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          github_username: user.user_metadata.user_name,
          github_token: providerToken,
          avatar_url: user.user_metadata.avatar_url,
        }, { onConflict: 'id' })

      console.log('UPSERT ERROR:', JSON.stringify(upsertError))
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}