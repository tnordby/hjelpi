import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import { getSignicatOidcConfig } from '@/lib/signicat/config'
import { exchangeAuthorizationCode, verifyBankIdIdToken } from '@/lib/signicat/oidc'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

const STATE_COOKIE = 'hj_bankid_state'
const VERIFIER_COOKIE = 'hj_bankid_verifier'

type Params = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

function clearPkceCookies(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(VERIFIER_COOKIE, '', { path: '/', maxAge: 0 })
}

export async function GET(request: Request, { params }: Params) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 404 })
  }

  const base = new URL(request.url)
  const bankidPage = `/${locale}/min-side/hjelper/bankid`

  const oidcError = base.searchParams.get('error')
  if (oidcError) {
    const q =
      oidcError === 'access_denied'
        ? 'bankid=cancelled'
        : `bankid=error&bankid_reason=${encodeURIComponent(oidcError)}`
    const res = NextResponse.redirect(new URL(`${bankidPage}?${q}`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const config = getSignicatOidcConfig()
  if (!config) {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=config`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const code = base.searchParams.get('code')
  const state = base.searchParams.get('state')
  const jar = await cookies()
  const expectedState = jar.get(STATE_COOKIE)?.value
  const codeVerifier = jar.get(VERIFIER_COOKIE)?.value

  if (!code || !state || !expectedState || !codeVerifier || state !== expectedState) {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=state`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const redirectUri = `${base.origin}/${locale}/bankid/callback`

  let idToken: string
  try {
    ;({ id_token: idToken } = await exchangeAuthorizationCode(config, {
      code,
      redirectUri,
      codeVerifier,
    }))
    await verifyBankIdIdToken(config, idToken)
  } catch {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=token`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=session`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle()
  if (!profile) {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=profile`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const { data: provider } = await supabase.from('providers').select('id').eq('profile_id', profile.id).maybeSingle()
  if (!provider) {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=noProvider`, base.origin))
    clearPkceCookies(res)
    return res
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const { error } = await admin.from('providers').update({ is_verified: true }).eq('id', provider.id)
    if (error) {
      const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=db`, base.origin))
      clearPkceCookies(res)
      return res
    }
  } catch {
    const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=db`, base.origin))
    clearPkceCookies(res)
    return res
  }

  const res = NextResponse.redirect(new URL(`${bankidPage}?bankid=verified`, base.origin))
  clearPkceCookies(res)
  return res
}
