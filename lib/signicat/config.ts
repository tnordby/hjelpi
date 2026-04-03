/**
 * Signicat eID Hub OIDC — issuer is the "OpenID Connect issuer" from the dashboard
 * (Well-Known URL without /.well-known/...), e.g. https://&lt;your-domain&gt;/auth/open
 *
 * @see https://developer.signicat.com/identity-methods/nbid/integration-guide/oidc-nbid/authorization-nbid/
 */

export type SignicatOidcConfig = {
  issuer: string
  clientId: string
  clientSecret: string
}

export function getSignicatOidcConfig(): SignicatOidcConfig | null {
  const issuer = process.env.SIGNICAT_ISSUER?.trim()
  const clientId = process.env.SIGNICAT_CLIENT_ID?.trim()
  const clientSecret = process.env.SIGNICAT_CLIENT_SECRET?.trim()
  if (!issuer || !clientId || !clientSecret) return null
  return {
    issuer: issuer.replace(/\/$/, ''),
    clientId,
    clientSecret,
  }
}

export function isSignicatOidcConfigured(): boolean {
  return getSignicatOidcConfig() !== null
}

/** For dev UI only: which env names are unset or blank (no secret values). */
export function getSignicatOidcMissingEnvNames(): string[] {
  const missing: string[] = []
  if (!process.env.SIGNICAT_ISSUER?.trim()) missing.push('SIGNICAT_ISSUER')
  if (!process.env.SIGNICAT_CLIENT_ID?.trim()) missing.push('SIGNICAT_CLIENT_ID')
  if (!process.env.SIGNICAT_CLIENT_SECRET?.trim()) missing.push('SIGNICAT_CLIENT_SECRET')
  return missing
}
