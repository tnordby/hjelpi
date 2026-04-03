import * as jose from 'jose'
import type { SignicatOidcConfig } from '@/lib/signicat/config'

type OidcDiscovery = {
  authorization_endpoint: string
  token_endpoint: string
  jwks_uri: string
}

let discoveryCache: { issuer: string; doc: OidcDiscovery; at: number } | null = null
const DISCOVERY_TTL_MS = 60 * 60 * 1000

async function fetchDiscovery(config: SignicatOidcConfig): Promise<OidcDiscovery> {
  const now = Date.now()
  if (discoveryCache && discoveryCache.issuer === config.issuer && now - discoveryCache.at < DISCOVERY_TTL_MS) {
    return discoveryCache.doc
  }
  const wellKnown = new URL('.well-known/openid-configuration', `${config.issuer}/`)
  const res = await fetch(wellKnown.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Signicat OIDC discovery failed: ${res.status}`)
  }
  const doc = (await res.json()) as OidcDiscovery
  if (!doc.authorization_endpoint || !doc.token_endpoint || !doc.jwks_uri) {
    throw new Error('Signicat OIDC discovery response missing endpoints')
  }
  discoveryCache = { issuer: config.issuer, doc, at: now }
  return doc
}

export async function buildBankIdAuthorizeUrl(
  config: SignicatOidcConfig,
  params: {
    redirectUri: string
    state: string
    codeChallenge: string
    scope?: string
  },
): Promise<string> {
  const d = await fetchDiscovery(config)
  const scope = params.scope ?? 'openid profile idp-id'
  const u = new URL(d.authorization_endpoint)
  u.searchParams.set('client_id', config.clientId)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('scope', scope)
  u.searchParams.set('redirect_uri', params.redirectUri)
  u.searchParams.set('state', params.state)
  u.searchParams.set('prompt', 'login')
  u.searchParams.set('acr_values', 'idp:nbid')
  u.searchParams.set('code_challenge', params.codeChallenge)
  u.searchParams.set('code_challenge_method', 'S256')
  u.searchParams.set('response_mode', 'query')
  return u.toString()
}

export async function exchangeAuthorizationCode(
  config: SignicatOidcConfig,
  params: { code: string; redirectUri: string; codeVerifier: string },
): Promise<{ id_token: string }> {
  const d = await fetchDiscovery(config)
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  })
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const res = await fetch(d.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
  })
  const json = (await res.json()) as { id_token?: string; error?: string; error_description?: string }
  if (!res.ok || !json.id_token) {
    const msg = json.error_description ?? json.error ?? res.statusText
    throw new Error(`Signicat token exchange failed: ${msg}`)
  }
  return { id_token: json.id_token }
}

export async function verifyBankIdIdToken(
  config: SignicatOidcConfig,
  idToken: string,
): Promise<jose.JWTPayload> {
  const d = await fetchDiscovery(config)
  const JWKS = jose.createRemoteJWKSet(new URL(d.jwks_uri))
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: config.issuer,
    audience: config.clientId,
  })
  if (payload.idp !== 'nbid') {
    throw new Error('Signicat session is not Norwegian BankID')
  }
  return payload
}
