import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { prepareSupabaseSession } from '@/lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const applySession = await prepareSupabaseSession(request)
  const response = intlMiddleware(request)
  applySession(response)
  return response
}

export const config = {
  // Exclude PostHog proxy so /ingest/* hits next.config rewrites (not locale prefix /no/ingest).
  matcher: ['/((?!api|ingest|_next|_vercel|.*\\..*).*)'],
}
