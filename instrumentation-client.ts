import posthog from 'posthog-js'

const DEFAULT_EU_API_HOST = 'https://eu.i.posthog.com'
const EU_ASSETS_ORIGIN = 'https://eu-assets.i.posthog.com'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()

const apiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_EU_API_HOST

function inferUiHost(host: string): string {
  const h = host.toLowerCase()
  if (h.startsWith('/')) return 'https://eu.posthog.com'
  if (h.includes('eu.i.posthog.com')) return 'https://eu.posthog.com'
  if (
    h.includes('us.i.posthog.com') ||
    h.includes('app.posthog.com')
  ) {
    return 'https://us.posthog.com'
  }
  return 'https://eu.posthog.com'
}

const uiHost =
  process.env.NEXT_PUBLIC_POSTHOG_UI_HOST?.trim() || inferUiHost(apiHost)

// Same-origin proxy (e.g. /ingest) forwards every Cookie header; large auth cookies → HTTP 431.
// Default to direct EU ingestion so captures stay small. Override with NEXT_PUBLIC_POSTHOG_HOST=/ingest if you proxy.
const useIngestProxy = apiHost.startsWith('/')

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: apiHost,
    ui_host: uiHost,
    defaults: '2026-01-30',
    capture_exceptions: true,
    advanced_disable_flags:
      process.env.NEXT_PUBLIC_POSTHOG_DISABLE_FLAGS === '1',
    debug: process.env.NODE_ENV === 'development',
    ...(useIngestProxy
      ? {
          prepare_external_dependency_script: (script: HTMLScriptElement) => {
            if (typeof window === 'undefined') return script
            try {
              const parsed = new URL(script.src, window.location.origin)
              if (parsed.pathname.startsWith(`${apiHost}/static/`)) {
                const path = parsed.pathname.slice(apiHost.length)
                script.src = `${EU_ASSETS_ORIGIN}${path}${parsed.search}`
              }
            } catch {
              /* keep default */
            }
            return script
          },
        }
      : {}),
  })
}
