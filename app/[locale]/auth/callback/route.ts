import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { routing } from '@/i18n/routing'
import { resolveAuthCallbackNext } from '@/lib/auth/callback-next'
import { captureServerEvent } from '@/lib/posthog-server-capture'

type Params = { params: Promise<{ locale: string }> }

export async function GET(request: Request, { params }: Params) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 404 })
  }

  const url = new URL(request.url)
  const origin = url.origin

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL(`/${locale}/logg-inn`, origin))
  }

  const code = url.searchParams.get('code')
  const nextPath = resolveAuthCallbackNext(url.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/logg-inn`, origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/logg-inn`, origin))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    captureServerEvent(user.email ?? user.id, 'email_verified', { next_path: nextPath })
  }

  return NextResponse.redirect(new URL(`/${locale}${nextPath}`, origin))
}
