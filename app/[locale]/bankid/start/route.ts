import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import { getSignicatOidcConfig } from '@/lib/signicat/config'
import { buildBankIdAuthorizeUrl } from '@/lib/signicat/oidc'
import { generateOidcState, generatePkcePair } from '@/lib/signicat/pkce'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const STATE_COOKIE = 'hj_bankid_state'
const VERIFIER_COOKIE = 'hj_bankid_verifier'
const COOKIE_MAX_AGE = 600

type Params = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: Params) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 404 })
  }

  const config = getSignicatOidcConfig()
  if (!config) {
    return NextResponse.redirect(new URL(`/${locale}/min-side/hjelper/bankid?bankid=config`, request.url))
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/logg-inn`, request.url))
  }

  const { data: profile } = await supabase.from('profiles').select('id, role').eq('user_id', user.id).maybeSingle()
  if (!profile || profile.role !== 'seller') {
    return NextResponse.redirect(new URL(`/${locale}/min-side/hjelper/bankid?bankid=notSeller`, request.url))
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id, is_verified')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (!provider) {
    return NextResponse.redirect(new URL(`/${locale}/min-side/hjelper/bankid?bankid=noProvider`, request.url))
  }

  if (provider.is_verified) {
    return NextResponse.redirect(new URL(`/${locale}/min-side/hjelper/bankid?bankid=already`, request.url))
  }

  const url = new URL(request.url)
  const redirectUri = `${url.origin}/${locale}/bankid/callback`
  const state = generateOidcState()
  const { codeVerifier, codeChallenge } = generatePkcePair()

  const authorizeUrl = await buildBankIdAuthorizeUrl(config, {
    redirectUri,
    state,
    codeChallenge,
  })

  const cookieBase = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  }

  const jar = await cookies()
  jar.set(STATE_COOKIE, state, cookieBase)
  jar.set(VERIFIER_COOKIE, codeVerifier, cookieBase)

  return NextResponse.redirect(authorizeUrl)
}
